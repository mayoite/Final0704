# Generation 3 Planner Walkthrough (`b_yeh73xcndxr`)

This document serves as your definitive guide and reference for the new, standalone planner we extracted into the `b_yeh73xcndxr` directory. Keep this close when you want to port features, debug production issues, or expand on the component tree without breaking existing functionality.

## 1. High-Level Concept
This environment was explicitly built as an **Auth-enabled, Standalone 2D/3D Floor Planner**. 
Unlike the old marketing site (`localhost:3000`) or the `cad-suite` (`localhost:3001`), this application implements a strict `middleware.ts` guarding system natively wired to a live **Supabase** backend. It natively utilizes `fabric.js` for lightweight 2D object manipulation and `React Three Fiber` for instant 3D extrusion.

**Primary Host URL:** `http://localhost:3002/dashboard/editor`

---

## 2. Codebase Map & Directory Guide
The entire planner is contained within `b_yeh73xcndxr/`. Here are the most critical files you must know:

*   **`app/page.tsx`**: The unauthenticated marketing landing page. This page contains a "Start Designing" button which acts as a guest-bypass to immediately route you inside the editor.
*   **`lib/supabase/middleware.ts`**: The security layer. By default, it aggressively checks for Supabase auth cookies. We have configured `/dashboard/editor/new` to be accessible securely without crashing.
*   **`app/api/furniture/route.ts`**: The live DB pipeline. **Crucially**, this API route implements a `SUPABASE_SERVICE_ROLE_KEY` bypass. It was forced to use the admin client context because the Supabase RLS (Row Level Security) policies had built-in circular logic causing infinite recursion errors blocking standard user queries.
*   **`lib/store.ts`**: The heartbeat of the planner. This `zustand` store contains `roomConfig`, `elements` (furniture placed on the screen), and tracks `mode` (switching between `2d` and `3d` displays). The store automatically syncs the 2D fabric canvas array output directly to the 3D meshes seamlessly.

### The Engine Components (`components/floor-planner/*`)
*   **`editor.tsx`**: The main shell. It receives tools, handles layout switching, and governs over all individual logic pipelines.
*   **`canvas-2d.tsx`**: The 2D interaction plane. Powered strictly by `fabric@5.3.0`.
*   **`viewer-3d.tsx`**: The 3D view. Translates static X/Y state coordinates into three-dimensional `<mesh>` models instantly.
*   **`furniture-library.tsx`**: The Catalog Sidebar. It dynamically fetches catalog items directly via the bypassed `route.ts`. 

---

## 3. Extending and Importing Capabilities (Unlimited Imports)

Because this instance was extracted as an independent `Next.js` and `React.js` setup, **you are not limited in what you can import or port**. 
Since we removed the native parent-child module dependencies tied to `cad-suite`, this acts as a pure greenfield plugin environment.

### Rules for Porting New Components inside the Planner
1.  **Strict File Extensions**: When importing new logic, save files strictly to `b_yeh73xcndxr/components/floor-planner/`.
2.  **State Upgrades**: If you want to drop-in external code (e.g., placing the Tldraw component inside this app in the future), you simply wrap the component inside `editor.tsx` and feed it the existing Zustand props: `<YourNewTldrawComponent elements={elements} addElement={addElement} />`. Since Zustand sits at the top level, drawing components are just purely visual.
3.  **Bypass Webpack Triggers**: Ensure that when you run external `npm start` commands, use the `--webpack` command inside `package.json` to prevent Next.js from panicking when large canvas libraries compile natively in the background.

---

## 4. `Fabric.js` Version Lock (Critical Development Context, DO NOT IGNORE)

During setup, we discovered a highly volatile interaction within Next.js 16 regarding **Fabric.js**. 
*   **You must NEVER upgrade `fabric.js` past version `5.3.0` inside this codebase.** 
*   Fabric.js `v6` and `v7` significantly overhauled their native ESM packaging format. Next.js 16's module resolution pipeline fails to map CommonJS tree-shaking accurately for these newer versions, leading to an immediate unrecoverable layout crash. 
*   The codebase perfectly protects itself on `^5.3.0` via standard `import { fabric } from 'fabric';`.

---

## 5. Security Context
Unlike the local mock databases of `cad-suite`, the data pulled by the **Furniture Library** here is fully authenticated against the cloud backend. Because you are testing securely through `middleware.ts`, your guest access routing ensures you don't need a hard-login just to test drag-and-drop canvas capabilities.
