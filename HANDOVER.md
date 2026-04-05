# Planner Upgrade — Handover Document
_Created: 2026-04-02 | Author: GitHub Copilot session_

---

## 1. Project Overview

This is a Next.js 16.2.1 workspace planning tool for **One&Only** branded furniture. The project has two live planner implementations that need to be unified into one superior product.

**Root:** `e:\claude0104`  
**Stack:** Next.js 16.2.1 (App Router), React 19, TypeScript (`strict: false`), Tailwind v4, Zustand, React-Konva, Three.js / @react-three/fiber  
**Node:** `C:\Program Files\nodejs` — always prepend to PATH: `$env:PATH = "C:\Program Files\nodejs;$env:PATH"`  
**Dev server:** `npm run dev` (uses `--webpack` flag — NOT turbopack for dev)  
**Build:** `npm run build`  
**Tests:** `npm test` (Jest) | `npm run test:planner` (Vitest — engine only)

---

## 2. Two Planner Systems — Critical Context

### System A — Old Planner (`/planner`) ← PRIMARY
**Route:** `src/app/planner/page.tsx`  
**Shell:** `src/components/planner/BlueprintPlanner.tsx` (1120 lines)  
**Store:** `src/lib/planner/store.ts` (Zustand, NO immer/persist)  
**Data model:** Document-based, **cm units**, `PlannerDocument { rooms[], items[], walls[] }`

**Why it's primary:**
- Polished, production-quality UI
- Proper toolbar with 2D/3D toggle
- Full 3D view (Three.js)
- PDF export (jsPDF + html2canvas)
- BOQ (bill of quantities) generation
- Blueprint serialization (import/export JSON)
- Fuzzy catalog search (Fuse.js)
- CSS design token system (`planner.tokens.css`, `planner.components.css`)
- Keyboard shortcuts (Ctrl+Z, Ctrl+Y, Delete, Escape)
- Analytics tracking on all actions
- Session persistence hooks

**Old store state shape:**
```ts
{
  engineMode: "blueprint-bridge" | "react-canvas"
  status: string
  currentView: "2.5d" | "3d"
  activeTool: "move" | "draw"
  selectedCatalogItemId: string | null
  sceneSelection: PlannerSceneSelection | null
  history: PlannerHistoryState<PlannerDocument>
}
// history.present = current PlannerDocument
```

**Old document model (`PlannerDocument`):**
```ts
{
  rooms: PlannerRoom[]          // outline: PlannerPoint2D[] (cm)
  items: PlannerPlacedItem[]    // position: {x,y,z} cm, widthCm, depthCm, heightCm
  walls: PlannerWall[]          // start/end: PlannerPoint2D (cm)
}
```

**Key old lib files:**
| File | Purpose |
|---|---|
| `src/lib/planner/store.ts` | Zustand store (document-based) |
| `src/lib/planner/document.ts` | Mutation functions (move/rotate/duplicate/remove items, resize room, move walls) |
| `src/lib/planner/history.ts` | Undo/redo stack |
| `src/lib/planner/serializer.ts` | Import/export blueprint JSON |
| `src/lib/planner/boq.ts` | Bill of quantities calculation |
| `src/lib/planner/importExport.ts` | File import/export helpers |
| `src/lib/planner/units.ts` | `formatLengthPair()` and unit conversions |
| `src/lib/planner/planner.config.ts` | Config (e.g. `minimumWallGapCm`) |
| `src/lib/planner/roomOutline.ts` | Room polygon from walls |
| `src/lib/planner/rendering.ts` | CSS color/var resolution for canvas |

**Key old hooks:**
| Hook | Purpose |
|---|---|
| `src/hooks/planner/useRoomLayout.ts` | Item place/move/rotate/delete/duplicate, wall/room resize |
| `src/hooks/planner/useUndoRedo.ts` | Binds undo/redo to store |
| `src/hooks/planner/usePlannerUI.ts` | Sidebar/inspector/clientbar open state |

**Old component tree:**
```
PlannerViewportGate
  └─ BlueprintPlanner
       ├─ PlannerToolbar         (2D/3D toggle, tools, export PDF, undo/redo)
       ├─ PlannerStatusBar       (live status pill)
       ├─ PlannerCatalogGrid     (fuzzy search, category tabs, 973 lines)
       ├─ PlannerCanvas2D        (2D canvas, 515 lines)
       │    ├─ PlannerGrid
       │    ├─ PlannerRoomLayer
       │    ├─ PlannerItemsLayer  (item rendering + drag, 556 lines)
       │    └─ PlannerSelectionLayer
       ├─ PlannerCanvas3D        (Three.js 3D view)
       │    ├─ PlannerItemMesh
       │    ├─ PlannerWallMesh
       │    └─ PlannerRoomMesh
       ├─ PlannerInspector       (selected item details, 342 lines)
       ├─ PlannerClientBar       (save/BOQ/export, 295 lines)
       └─ PlannerAiPanel         (AI suggestions, 255 lines)
```

---

### System B — New Planner (`/planner2`) ← FEATURES TO PORT FROM
**Route:** `src/app/planner2/page.tsx`  
**Store:** `src/lib/planner/store/plannerStore.ts` (Zustand + Immer + Persist + Devtools)  
**Data model:** Item-based, **mm units**, `PlannerItem { xMm, yMm, widthMm, depthMm, rotationDeg }`

**Features to port into old planner:**
| Feature | Source file | Priority |
|---|---|---|
| Compliance checks (aisle, fire exit, desk spacing, accessibility) | `src/lib/planner/engine/compliance.ts` | HIGH |
| Product substitution / "Find alternatives" | `src/lib/planner/engine/substitution.ts` | HIGH |
| 12 Room templates | `src/lib/planner/templates.ts` | HIGH |
| Rotation handles on canvas | `PlannerCanvasEnhanced.tsx` | MEDIUM |
| Rubber-band multi-select | `PlannerCanvasEnhanced.tsx` | MEDIUM |
| Minimap | `PlannerCanvasEnhanced.tsx` | MEDIUM |
| Ruler / measurement tool | `PlannerCanvasEnhanced.tsx` | MEDIUM |
| Drag-from-catalog to canvas | `CatalogPanel.tsx` + `PlannerCanvasEnhanced.tsx` | MEDIUM |
| Area stats in status bar (m², density) | `ActionBar.tsx` | LOW |

**New store state (for reference when adapting):**
```ts
{
  room: RoomState               // widthMm, depthMm, clearanceMm
  items: PlannerItem[]          // xMm, yMm, widthMm, depthMm, rotationDeg
  selectedItemId: string | null
  selectedItemIds: Set<string>  // multi-select
  activeTool: PlannerTool
  showDimensions: boolean
  zoomLevel: number
  measurementStart/End: {xMm, yMm} | null
  aiSuggestions, aiLoading, aiError
  history: HistoryState<SceneSnapshot>
}
```

---

## 3. Port Plan (Ordered)

### Step 1: Compliance Engine (adapt for cm model)
The compliance engine in new planner uses mm. The old document model uses cm.  
**Adapter needed:** multiply distances by 10 when comparing, or create `compliance-v1.ts` using cm thresholds.

Files to create/modify:
- Create `src/lib/planner/engine/compliance-v1.ts` (cm-based version)
- Modify `src/components/planner/PlannerInspector.tsx` — add `<CompliancePanel warnings={warnings}>`
- Modify `src/components/planner/BlueprintPlanner.tsx` — run checks on document change

### Step 2: Substitution Engine  
- Create `src/lib/planner/engine/substitution-v1.ts` (uses cm footprints)
- Modify `PlannerInspector.tsx` — add "Find alternatives" button + popover with top 3 swaps

### Step 3: Room Templates
- Create `src/lib/planner/templates-v1.ts` — 12 templates using `PlannerDocument` shape (cm units)
- Add `<TemplatePickerPanel>` as collapsible section in `BlueprintPlanner.tsx` sidebar

### Step 4: Canvas UX (in `PlannerCanvas2D.tsx` / `PlannerItemsLayer.tsx`)
- **Rotation handles:** render handle circle above selected item; mouse drag → `handleRotateItem()`
- **Rubber-band:** track mousedown/mousemove on empty canvas; compute rect; select all items intersecting
- **Minimap:** small `<canvas>` overlay in corner; redraw simplified scene on each render
- **Ruler tool:** add `"ruler"` to `PlannerToolMode`; click-drag draws measurement line with label

---

## 4. Data Model Translation Reference

When porting, translate between the two models:

| Concept | Old (cm) | New (mm) |
|---|---|---|
| Item position X | `item.position.x` cm | `item.xMm` → divide by 10 |
| Item position Z (depth) | `item.position.z` cm | `item.yMm` → divide by 10 |
| Item width | `item.widthCm` | `item.widthMm` → divide by 10 |
| Item depth | `item.depthCm` | `item.depthMm` → divide by 10 |
| Item rotation | `item.rotationDeg` | `item.rotationDeg` (same) |
| Room width | `room.outline[].x` range, cm | `room.widthMm` → divide by 10 |
| Room depth | `room.outline[].y` range, cm | `room.depthMm` → divide by 10 |

---

## 5. File Locations Quick Reference

```
e:\claude0104/
├── src/
│   ├── app/
│   │   ├── planner/           ← OLD primary route
│   │   │   ├── layout.tsx     (loads planner.tokens.css + planner.components.css)
│   │   │   └── page.tsx       (renders PlannerViewportGate)
│   │   └── planner2/          ← NEW route (keep for reference, not primary)
│   │       ├── layout.tsx
│   │       └── page.tsx
│   ├── components/planner/    ← OLD component tree
│   │   ├── BlueprintPlanner.tsx   ← MAIN SHELL (1120 lines)
│   │   ├── PlannerCanvas2D.tsx    ← 2D canvas (515 lines)
│   │   ├── PlannerItemsLayer.tsx  ← item rendering (556 lines)
│   │   ├── PlannerCatalogGrid.tsx ← catalog (973 lines)
│   │   ├── PlannerInspector.tsx   ← inspector (342 lines) ← ADD compliance here
│   │   ├── PlannerClientBar.tsx   ← BOQ/export (295 lines)
│   │   ├── PlannerToolbar.tsx     ← toolbar (359 lines)
│   │   ├── PlannerAiPanel.tsx     ← AI (255 lines)
│   │   ├── PlannerCanvas3D.tsx    ← 3D (141 lines)
│   │   └── canvas/
│   │       └── PlannerCanvasEnhanced.tsx ← NEW canvas (reference only)
│   ├── lib/planner/
│   │   ├── store.ts           ← OLD store (document model, cm)
│   │   ├── document.ts        ← mutation API
│   │   ├── history.ts         ← undo/redo
│   │   ├── boq.ts             ← BOQ
│   │   ├── serializer.ts      ← import/export
│   │   ├── units.ts           ← formatLengthPair()
│   │   ├── types.ts           ← PlannerDocument, PlannerPlacedItem, etc.
│   │   ├── engine/
│   │   │   ├── compliance.ts  ← NEW compliance (mm-based, adapt for cm)
│   │   │   ├── substitution.ts← NEW substitution (adapt for cm)
│   │   │   ├── geometry.ts    ← geometry helpers
│   │   │   ├── snap.ts        ← snapping
│   │   │   ├── history.ts     ← NEW history (different from old)
│   │   │   └── serialization.ts← NEW serialization
│   │   ├── templates.ts       ← NEW templates (mm-based, adapt for cm)
│   │   └── store/
│   │       └── plannerStore.ts← NEW store (item model, mm)
│   └── hooks/planner/
│       ├── useRoomLayout.ts   ← item CRUD + room ops
│       ├── useUndoRedo.ts     ← undo/redo
│       └── usePlannerUI.ts    ← sidebar/panel open state
├── docs0204/
│   ├── TODO.md                ← Active todo list
│   └── SESSION-LOG.md         ← Activity log
└── 0204backup/                ← Archived old files (safe to ignore)
```

---

## 6. Build & Test Commands

```powershell
# Always run first:
$env:PATH = "C:\Program Files\nodejs;$env:PATH"
cd e:\claude0104

# Dev server (webpack mode, NOT turbopack):
npm run dev

# Production build:
npm run build

# Jest tests (full suite):
npm test

# Vitest tests (planner engine only):
npm run test:planner

# Check errors:
npm run build 2>&1 | Select-Object -Last 30
```

---

## 7. Known Issues & Watch-outs

1. **Build was failing** as of session start — fixed (vitest.config.ts excluded from tsconfig)
2. **Tailwind v4** — use `@import "tailwindcss"` NOT `@tailwind base/components/utilities`
3. **Two `usePlannerStore` exports** — `lib/planner/store.ts` (old) and `lib/planner/store/plannerStore.ts` (new). Never mix them.
4. **Two `PlannerToolbar` components** — `components/planner/PlannerToolbar.tsx` (old, use this) and `components/configurator/canvas/PlannerToolbar.tsx` (new, for planner2 only)
5. **`PlannerPresets.tsx`** — dead code, imported nowhere, safe to delete
6. **`postcss.config.js` AND `postcss.config.mjs`** both exist at root — potential conflict
7. **`src/app/tmp-access/page.tsx`** — temp page from 2026-03-24, may want to remove

---

## 8. Immediate Next Actions

1. Read `BlueprintPlanner.tsx` lines 200–500 to understand catalog load + render logic
2. Read `PlannerInspector.tsx` fully to know where to add compliance panel
3. Create `src/lib/planner/engine/compliance-v1.ts` adapted for cm
4. Add compliance panel to `PlannerInspector.tsx`
5. Run build to confirm no regressions
6. Repeat for substitution, templates, canvas upgrades

---

_For full session history see `docs0204/SESSION-LOG.md`_  
_For detailed task checklist see `docs0204/TODO.md`_
