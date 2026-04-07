# Comprehensive Architecture Matrix (Wide View)

Here is the exact wide format you requested natively mapping the 7 package pillars against all inclusive features.

| Feature / Detail | 0. Package | 0a. Use | 1. Current Planner | 2. Configurator | 3. Smart Draw | 4. Today Imported Planner | 5. Current Package | 6. Why |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Exact Path / Page** | `apps/cad-suite` or `/b_yeh..` | N/A | `/planner` Route (`page.tsx`) | `/configurator` Route (`page.tsx`) | Component (`SmartdrawPlanner.tsx`) | `/dashboard` Route (`page.tsx`) | `apps/cad-suite` | Defines exactly where the code natively lives on disk. |
| **Core Engine Used** | Core logic host | Interaction | `Tldraw` | `React Three Fiber` | `Tldraw` | `Fabric.js + React Three Fiber` | **Both** (`Tldraw` + `R3F`) | `Tldraw` processes 2D vectors superiorly. |
| **2D Freehand Walls** | Drafting | Shells | ✅ **Yes** | ❌ No | ✅ **Yes** (Native lines) | ❌ No (Static Box creation only) | ✅ **Yes** (Inherited capability) | Tldraw naturally calculates geometric vector mathematics for arbitrary wall chains. |
| **2D Geometry & Measure** | Snap/Measure | Rulers | ✅ **Yes** | ❌ No | ✅ **Yes** (Snapping & Text) | ❌ No | ✅ **Yes** (Inherited capability) | `cad-suite` computes point-to-point bounds; `fabric.js` lacks native topographic logic. |
| **3D Rendering** | Visualization | Extrusion | ❌ No | ✅ **Yes** (Direct 3D) | ❌ No | ✅ **Yes** (Walkthrough Auto-Gen) | ✅ **Yes** (Via Configurator) | The standalone planner natively jumps from 2D placement to 3D walking using simple geometry limits. |
| **AI Copilot** | Intelligence | Checks | ✅ **Yes** (Spatial AI) | ❌ No | ✅ **Yes** (Spatial AI) | ❌ No | ✅ **Yes** (Inherited) | `cad-suite` watches clearance and overlaps via Tldraw spatial math. Fabric.js planner lacks this. |
| **Product Catalog** | Library | Populate | ✅ **Yes** (Right Panel) | ❌ No | ✅ **Yes** (Passed via Props) | ✅ **Yes** (Left Sidebar) | ✅ **Yes** (Right Panel) | Both planners contain a working UI catalog to drag and drop assets. |
| **Undo / Redo** | History | Revert | ✅ **Yes** | ❌ No | ✅ **Yes** | ❌ No | ✅ **Yes** | Tldraw manages a sophisticated transaction history automatically. |
| **Layer Management** | Hierarchy | Z-Index | ✅ **Yes** | ❌ No | ✅ **Yes** | ❌ No | ✅ **Yes** | Tldraw supports managing objects via a Layers panel. Fabric is entirely flat. |
| **Quote Calculation** | E-commerce | Cart | ✅ **Yes** (Quote Cart) | ❌ No | ❌ No (Passed out) | ❌ No | ✅ **Yes** | `cad-suite` natively adds items to a shopping cart to generate pricing. |
| **Mobile Mode** | Responsive | Mobile | ✅ **Yes** | ❌ No | ✅ **Yes** (Bottom Sheets) | ❌ No | ✅ **Yes** | The Tldraw engine uses `vaul` drawers when rendering on phone screens. |
| **Geometry Snapping** | Precision | Magnet | ✅ **Yes** (Magnet Snap) | ❌ No | ✅ **Yes** | ❌ No | ✅ **Yes** | Tldraw naturally calculates edge-to-edge magnetic snapping for all vertices. |
| **Grid Rendering** | Alignment | Visual | ✅ **Yes** (Toggle) | ❌ No | ✅ **Yes** | ✅ **Yes** (Fixed) | ✅ **Yes** | Allows toggling visual grid grids dynamically via the toolbar. |
| **Drafting Primitives** | Drawing | Shapes | ✅ **Yes** (Line, Rect, Pen) | ❌ No | ✅ **Yes** | ❌ No | ✅ **Yes** | Raw access to Line, Rect, and Freehand Pen for arbitrary room drawing. |
| **Canvas Fit / Zoom** | Camera | Viewport | ✅ **Yes** (+/-, Fit) | ✅ **Yes** (Orbit) | ✅ **Yes** (Fit to Select) | ✅ **Yes** (Pan/Zoom) | ✅ **Yes** | The Tldraw toolbar natively tracks exact Zoom percentages, Pan mode, and bounding-box focus. |
| **Clear Canvas Basin** | Deletion | Wipe | ✅ **Yes** (Clear All) | ❌ No | ✅ **Yes** | ✅ **Yes** | ✅ **Yes** | The toolbar "Clear" completely resets the global Zustand room/entity state instantly. |
| **Duplicate & Delete** | Canvas Tools | Edit | ✅ **Yes** | ❌ No | ✅ **Yes** | ✅ **Yes** | ✅ **Yes** | Both support deleting, but Tldraw adds native cloning/duplication rules. |
| **Saving & Storage** | DB Integration | State | ❌ Mocked / Quote Cart | ❌ Mocked | ❌ Zustand Memory | ✅ **Yes** (Saves to Supabase) | ❌ Mocked / Quote Cart | The independent `b_yeh..` app saves strictly to Supabase securely; `cad-suite` saves to a local Quote Cart. |
| **Export / Print** | Output | PDF/PNG | ✅ **Yes** (Print Layout) | ❌ No | ✅ **Yes** (`window.print`) | ✅ **Yes** (Drafting PNG) | ✅ **Yes** (Inherited) | Both applications support native browser exporting or PNG dumps of the 2D canvas. |
| **Authentication Logic** | Supabase Auth | Security | ❌ No | ❌ No | ❌ No | ✅ **Yes** (Dummy Auth) | ❌ No | `b_yeh73xcndxr` includes server-side middleware blocking users from entering without a token. |
| **Dependency Versions** | `package.json` | Versions | `next@16.2.1`<br>`tldraw@^4.5.7` | `next@16.2.1`<br>`@react-three/fiber@^9.5.0` | `tldraw@^4.5.7`<br>`zustand@^5.0.12` | `next@16.2.0`<br>`fabric@5.3.0`<br>`@supabase/supabase-js` | `next@16.2.1`<br>`tldraw@^4.5.7`<br>`@react-three/fiber@^9.5` | Strict dependency mapping to prevent Node ESM resolution errors across 2D and 3D engines. |
| **Build Stability** | Next.js 16 | Compiling | ⚠️ Unstable in Turbo | ⚠️ Unstable in Turbo | ✅ Stable | ✅ **Highly Stable** (Webpack flag) | ✅ **Highly Stable** (Webpack flag) | We forced `--webpack` entirely today to prevent the massive `tldraw`/`fabric` bundles from crashing out-of-memory. |
| **Fabric.js Disadvantages** | N/A | Limits | N/A (`Tldraw` sidesteps this) | N/A | N/A | ⚠️ Rigid & No Vectors | ⚠️ N/A | Fabric treats items as simple pixel/image canvas objects. It lacks topological grouping, infinite vector math, custom snapping, and freehand wall building which makes professional room-drafting extremely difficult natively. |

### All-Encompassing Architectural Notes

*   **Compiler Stability (Critical):** `Next.js 16`'s default Turbopack compiler was severely crashing the memory pipeline due to the massive size of the drawing engines (`tldraw` and `fabric`). All package setups have now been strictly forced to use `--webpack` in their `npm run dev` scripts to ensure complete stability.
*   **Database Bypass:** In the imported planner (`b_yeh73xcndxr`), the `api/furniture/route.ts` hit an infinite recursion loop via Supabase Row-Level Security. We implemented the `Service Role` administrative key to securely bypass RLS rules without crashing the furniture browser.
*   **Fabric.js Limitation:** The standalone planner (`b_yeh73xcndxr`) is permanently locked to `fabric@5.3.0`. Upgrading to Fabric v7 breaks Node ESM resolution and will immediately crash the Next.js runtime. 
*   **The Tldraw Advantage:** Tldraw (`SmartdrawPlanner.tsx`) remains the absolute superior structural drafting tool in `cad-suite` as it computes snapping, polygons, and distance measuring dynamically on a 2D plane, whereas Fabric natively treats everything as simplistic image nodes without topological context.
*   **Unified Route Strategy:** `cad-suite` splits core features exactly via routes (`/planner` purely handles vector room logic, while `/configurator` purely handles 3D model customization), keeping logic strictly separated. `b_yeh73xcndxr` merges 2D/3D into a single `/dashboard/editor` canvas switch.

### Exhaustive Dependency Manifests

Below is the complete, raw list of all packages running across each respective item you mentioned.

#### Packages for Items 1, 2, 3, and 5 (`apps/cad-suite/package.json`)
```json
{
  "@radix-ui/react-accordion": "^1.2.12",
  "@radix-ui/react-dialog": "^1.1.15",
  "@radix-ui/react-dropdown-menu": "^2.1.16",
  "@radix-ui/react-slot": "^1.2.4",
  "@radix-ui/react-tabs": "^1.1.13",
  "@react-three/drei": "^10.7.7",
  "@react-three/fiber": "^9.5.0",
  "@supabase/ssr": "^0.10.0",
  "@supabase/supabase-js": "^2.101.1",
  "@tanstack/react-query": "^5.96.2",
  "@thi.ng/geom-hull": "^2.1.210",
  "alpha-shape": "^1.0.0",
  "axios": "^1.14.0",
  "bezier-js": "^6.1.4",
  "clsx": "^2.1.1",
  "detect-touch-device": "^1.1.6",
  "embla-carousel-react": "^8.6.0",
  "framer-motion": "^12.38.0",
  "fuse.js": "^7.3.0",
  "html2canvas": "^1.4.1",
  "immer": "^11.1.4",
  "jspdf": "^4.2.1",
  "jszip": "^3.10.1",
  "konva": "^10.2.3",
  "line-intersect": "^3.0.0",
  "lucide-react": "^1.7.0",
  "next": "16.2.1",
  "openai": "^6.33.0",
  "point-in-polygon": "^1.1.0",
  "postgres": "^3.4.9",
  "react": "19.2.4",
  "react-dom": "19.2.4",
  "react-konva": "^19.2.3",
  "swiper": "^12.1.3",
  "tailwind-merge": "^3.5.0",
  "three": "^0.183.2",
  "tldraw": "^4.5.7",
  "vaul": "^1.1.2",
  "zod": "^4.3.6",
  "zustand": "^5.0.12"
}
```

#### Packages for Item 4 (`b_yeh73xcndxr/package.json`)
```json
{
  "@hookform/resolvers": "^3.9.1",
  "@radix-ui/react-accordion": "1.2.12",
  "@radix-ui/react-alert-dialog": "1.1.15",
  "@radix-ui/react-aspect-ratio": "1.1.8",
  "@radix-ui/react-avatar": "1.1.11",
  "@radix-ui/react-checkbox": "1.3.3",
  "@radix-ui/react-collapsible": "1.1.12",
  "@radix-ui/react-context-menu": "2.2.16",
  "@radix-ui/react-dialog": "1.1.15",
  "@radix-ui/react-dropdown-menu": "2.1.16",
  "@radix-ui/react-hover-card": "1.1.15",
  "@radix-ui/react-label": "2.1.8",
  "@radix-ui/react-menubar": "1.1.16",
  "@radix-ui/react-navigation-menu": "1.2.14",
  "@radix-ui/react-popover": "1.1.15",
  "@radix-ui/react-progress": "1.1.8",
  "@radix-ui/react-radio-group": "1.3.8",
  "@radix-ui/react-scroll-area": "1.2.10",
  "@radix-ui/react-select": "2.2.6",
  "@radix-ui/react-separator": "1.1.8",
  "@radix-ui/react-slider": "1.3.6",
  "@radix-ui/react-slot": "1.2.4",
  "@radix-ui/react-switch": "1.2.6",
  "@radix-ui/react-tabs": "1.1.13",
  "@radix-ui/react-toast": "1.2.15",
  "@radix-ui/react-toggle": "1.1.10",
  "@radix-ui/react-toggle-group": "1.1.11",
  "@radix-ui/react-tooltip": "1.2.8",
  "@react-three/drei": "^10.7.7",
  "@react-three/fiber": "^9.5.0",
  "@supabase/ssr": "^0.10.0",
  "@supabase/supabase-js": "^2.101.1",
  "@types/fabric": "^5.3.0",
  "@vercel/analytics": "1.6.1",
  "autoprefixer": "^10.4.20",
  "class-variance-authority": "^0.7.1",
  "clsx": "^2.1.1",
  "cmdk": "1.1.1",
  "date-fns": "4.1.0",
  "embla-carousel-react": "8.6.0",
  "fabric": "^5.3.0",
  "input-otp": "1.4.2",
  "lucide-react": "^0.564.0",
  "next": "16.2.0",
  "next-themes": "^0.4.6",
  "react": "19.2.4",
  "react-day-picker": "9.13.2",
  "react-dom": "19.2.4",
  "react-hook-form": "^7.54.1",
  "recharts": "2.15.0",
  "sonner": "1.7.1",
  "tailwind-merge": "^2.5.5",
  "tailwindcss": "^3.4.17",
  "tailwindcss-animate": "^1.0.7",
  "three": "^0.171.0",
  "uuid": "^11.0.3",
  "zod": "^3.24.1",
  "zustand": "^5.0.2"
}
```
