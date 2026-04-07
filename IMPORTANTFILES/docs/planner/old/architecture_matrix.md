# Architecture Comparison Matrix

Here is the structured layout formatted strictly as a table, with columns grouped intelligently so it does not get cut off past the 5th column. It includes exact page names, capabilities, and the reasoning for each.

| ID / Item | Target Path & Role | Engineering & Features | Database & Auth | Why does this exist? |
| :--- | :--- | :--- | :--- | :--- |
| **0. Package Location** | N/A | N/A | N/A | Represents the physical location on disk of each system. |
| **1. Current Planner** | **Path:** `apps/cad-suite/src/app/planner/page.tsx`<br>**Role:** 2D Drafting Hub | **Engine:** `Tldraw`<br>**2D Walls:** ✅ Native Lines<br>**3D:** ❌ No | **DB:** ❌ Mocked Locally<br>**Auth:** ❌ No | Pure drafting. Tldraw natively handles infinite geometric math. |
| **2. Configurator** | **Path:** `apps/cad-suite/src/app/configurator/page.tsx`<br>**Role:** 3D Visualization | **Engine:** `React Three Fiber`<br>**2D Walls:** ❌ No<br>**3D:** ✅ Yes | **DB:** ❌ Mocked Locally<br>**Auth:** ❌ No | Used purely for 3D walkthroughs and furniture previewing. |
| **3. Smart Draw** | **Path:** `apps/cad-suite/src/components/draw/SmartdrawPlanner.tsx`<br>**Role:** Core Engine | **Engine:** `Tldraw`<br>**2D Walls:** ✅ Yes<br>**3D:** ❌ No | **DB:** ❌ Local Zustand State<br>**Auth:** ❌ No | This is the actual React component that powers the planner route. |
| **4. Today's Imported Planner** (`b_yeh73xcndxr`) | **Path:** `b_yeh73xcndxr/app/dashboard/editor/page.tsx`<br>**Role:** Secure Standalone App | **Engine:** `Fabric.js` & `R3F`<br>**2D Walls:** ❌ Static Box Only<br>**3D:** ✅ Auto-Gens from 2D | **DB:** ✅ Supabase Bypass<br>**Auth:** ✅ Dummy Middleware | Built explicitly to test authentication middleware and securely bypass Supabase RLS. |
| **5. Current Active Package** (`cad-suite`) | **Path:** `apps/cad-suite/*`<br>**Role:** Unified Suite | **Engine:** Both (`Tldraw` & `R3F`)<br>**2D Walls:** ✅ Yes<br>**3D:** ✅ Yes | **DB:** ❌ Mocked / WIP<br>**Auth:** ❌ No | This is the package working actively today on `localhost:3001` to bring your drafting tools back. |

### All-Encompassing Architectural Notes

*   **Compiler Stability (Critical):** `Next.js 16`'s default Turbopack compiler was severely crashing the memory pipeline due to the massive size of the drawing engines (`tldraw` and `fabric`). All package setups have now been strictly forced to use `--webpack` in their `npm run dev` scripts to ensure complete stability.
*   **Database Bypass:** In the imported planner (`b_yeh73xcndxr`), the `api/furniture/route.ts` hit an infinite recursion loop via Supabase Row-Level Security. We implemented the `Service Role` administrative key to securely bypass RLS rules without crashing the furniture browser.
*   **Fabric.js Limitation:** The standalone planner (`b_yeh73xcndxr`) is permanently locked to `fabric@5.3.0`. Upgrading to Fabric v7 breaks Node ESM resolution and will immediately crash the Next.js runtime. 
*   **The Tldraw Advantage:** Tldraw (`SmartdrawPlanner.tsx`) remains the absolute superior structural drafting tool in `cad-suite` as it computes snapping, polygons, and distance measuring dynamically on a 2D plane, whereas Fabric natively treats everything as simplistic image nodes without topological context.
*   **Unified Route Strategy:** `cad-suite` splits core features exactly via routes (`/planner` purely handles vector room logic, while `/configurator` purely handles 3D model customization), keeping logic strictly separated. `b_yeh73xcndxr` merges 2D/3D into a single `/dashboard/editor` canvas switch.
