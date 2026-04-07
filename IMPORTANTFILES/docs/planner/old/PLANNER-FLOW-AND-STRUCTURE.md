# Planner Flow and Coding Structure

## Purpose

This document is the current architecture reference for the live planner.

Use it for:
- understanding the planner entry flow
- locating responsibility by file
- tracing data from catalog to canvas to quote cart
- deciding where new code should live

This file describes the current implementation, not an idealized future state.

---

## System Overview

The planner is a client-rendered `tldraw` workspace wrapped in a small route layer.

High-level flow:

```text
Route
  -> fetch products
  -> PlannerClient
  -> SmartdrawPlanner
  -> toolbar + canvas + panels + copilot
  -> shape metadata becomes BOQ
  -> BOQ becomes quote-cart payload
```

Core rule:
- `SmartdrawPlanner.tsx` owns planner state and side effects.
- Child components render isolated UI slices.

---

## Entry Flow

### Route entrypoints

- `src/app/planner/page.tsx`
  - main planner route
  - fetches products with `getProducts()`
  - redirects mobile user agents to `/planner/mobile`

- `src/app/planner/mobile/page.tsx`
  - dedicated mobile route
  - fetches products with `getProducts()`
  - renders planner with `mode="mobile"`

- `src/app/smartdraw/page.tsx`
  - legacy route
  - currently redirects to `/planner`

### Client bootstrap

- `src/app/planner/PlannerClient.tsx`
  - dynamic client-only import boundary
  - loads `SmartdrawPlanner` with `ssr: false`
  - passes `catalogProducts` and `mode`

Route flow:

```text
/planner
  -> page.tsx
  -> getProducts()
  -> if mobile: redirect("/planner/mobile")
  -> PlannerClient
  -> SmartdrawPlanner(mode="desktop")

/planner/mobile
  -> mobile/page.tsx
  -> getProducts()
  -> PlannerClient
  -> SmartdrawPlanner(mode="mobile")
```

---

## File Map

### Route layer

- `src/app/planner/page.tsx`
- `src/app/planner/mobile/page.tsx`
- `src/app/planner/PlannerClient.tsx`
- `src/app/smartdraw/page.tsx`

### Planner orchestration

- `src/components/smartdraw/SmartdrawPlanner.tsx`

### Render composition

- `src/components/smartdraw/PlannerToolbar.tsx`
- `src/components/smartdraw/PlannerCanvas.tsx`
- `src/components/smartdraw/PlannerDesktopPanels.tsx`
- `src/components/smartdraw/PlannerMobilePanels.tsx`

### Planner UI blocks

- `src/components/smartdraw/CatalogPanel.tsx`
- `src/components/smartdraw/InspectorPanel.tsx`
- `src/components/smartdraw/WorkspacePanel.tsx`
- `src/components/smartdraw/MobileDrawerSheet.tsx`
- `src/components/smartdraw/StepBar.tsx`
- `src/components/smartdraw/AiCopilot.tsx`
- `src/components/smartdraw/types.ts`

### Data and shared state

- `src/lib/getProducts.ts`
- `src/lib/store/quoteCart.ts`

---

## Component Tree

### Desktop

```text
PlannerClient
  -> SmartdrawPlanner(mode="desktop")
     -> PlannerToolbar
        -> StepBar
     -> PlannerCanvas
        -> Tldraw
     -> PlannerDesktopPanels
        -> WorkspacePanel(left)
           -> CatalogPanel
        -> WorkspacePanel(right)
           -> InspectorPanel
     -> AiCopilot
```

### Mobile

```text
PlannerClient
  -> SmartdrawPlanner(mode="mobile")
     -> PlannerToolbar
        -> StepBar
     -> PlannerCanvas
        -> Tldraw
     -> PlannerMobilePanels
        -> MobileDrawerSheet(catalog)
           -> CatalogPanel
        -> MobileDrawerSheet(inspector)
           -> InspectorPanel
     -> AiCopilot
```

---

## Responsibility by File

### `SmartdrawPlanner.tsx`

This is the planner orchestrator.

Owns:
- planner mode
- `Editor` instance
- step state
- desktop panel visibility
- pinned vs floating state
- mobile drawer state
- snap state
- grid state
- zoom display state
- BOQ state
- AI suggestion state
- quote-cart bridge

Allowed responsibilities:
- lifecycle and mount logic
- effects and subscriptions
- cross-component state
- planner actions
- high-level composition

Should not contain:
- large presentational markup for toolbar
- detailed panel markup
- mobile sheet markup

### `PlannerToolbar.tsx`

Renders toolbar controls only.

Contains:
- step switcher
- snap toggle
- grid toggle
- zoom controls
- desktop panel toggles
- mobile drawer buttons
- clear action
- export action

Does not own planner business logic.

### `PlannerCanvas.tsx`

Renders the canvas shell only.

Contains:
- step status pill
- `Tldraw`

Receives:
- current step
- persistence key
- asset URL config
- `onMount`

### `PlannerDesktopPanels.tsx`

Desktop panel composition only.

Contains:
- left `WorkspacePanel` + `CatalogPanel`
- right `WorkspacePanel` + `InspectorPanel`

### `PlannerMobilePanels.tsx`

Mobile sheet composition only.

Contains:
- catalog drawer
- inspector drawer

### `CatalogPanel.tsx`

Catalog UI only.

Owns local UI state:
- search text
- expanded section state

Emits actions:
- drop furniture
- close panel
- pin or dock panel
- set structural drawing tools on the editor

### `InspectorPanel.tsx`

Inspector UI only.

Owns local UI state:
- active tab

Renders:
- selected items list
- total
- quote CTA
- settings tab

### `WorkspacePanel.tsx`

Desktop floating panel shell.

Owns:
- drag behavior
- docked vs floating frame
- focus elevation
- drag-handle restriction

Important behavior:
- drag starts only from `data-panel-drag-handle="true"`
- drag starts only on left click
- right click should not trigger drag

### `AiCopilot.tsx`

Passive overlay for AI planner feedback.

Renders:
- warning suggestions
- tips
- action suggestions
- default idle message

---

## State Ownership

### `SmartdrawPlanner`

- `editor`
- `boqItems`
- `currentStep`
- `showCatalog`
- `showInspector`
- `catalogPinned`
- `inspectorPinned`
- `isSnapMode`
- `isGridVisible`
- `zoomPercent`
- `activePanel`
- `aiSuggestions`
- `showAi`
- `mobileCatalogOpen`
- `mobileInspectorOpen`

### `CatalogPanel`

- `search`
- `expanded`

### `InspectorPanel`

- `tab`

### `WorkspacePanel`

- local z-index fallback

---

## Data Flow

### 1. Product data into planner

```text
getProducts()
  -> route page
  -> PlannerClient
  -> SmartdrawPlanner(catalogProducts)
  -> CatalogPanel
```

Source file:
- `src/lib/getProducts.ts`

Current behavior:
- fetches product records from Supabase
- falls back to Nhost catalog fetch if needed
- normalizes image paths

### 2. Product click into canvas shape

```text
CatalogPanel
  -> onDropFurniture(product)
  -> SmartdrawPlanner.handleDropFurniture()
  -> create image shape or geo shape
  -> write planner metadata into shape.meta
```

Current metadata written into planner shapes:
- `text`
- `isPlannerItem`
- `price`
- `category`
- `dimensions`

### 3. Canvas state into BOQ

```text
editor.store.listen(...)
  -> syncBoq()
  -> get current page shapes
  -> filter planner items
  -> map to BoqItem[]
  -> setBoqItems()
  -> runComplianceCheck()
  -> buildAiSuggestions()
```

### 4. BOQ into quote cart

```text
InspectorPanel
  -> Generate Final Quote
  -> SmartdrawPlanner.handleGenerateQuote()
  -> group items by name
  -> quoteCart.addItem(...)
  -> router.push("/quote-cart")
```

Quote cart source:
- `src/lib/store/quoteCart.ts`

Planner quote payload:
- `id`
- `name`
- `qty`
- `source: "planner"`
- `plannerFamily`

---

## Canvas Lifecycle

### Mount path

`PlannerCanvas` calls `SmartdrawPlanner.handleMount`.

On mount:
- store the `Editor` instance
- enable grid mode
- enable snap mode
- ensure room boundary exists
- fit camera to room boundary

Current constants:
- room boundary shape id: `room-boundary`
- persistence key: `one-and-only-planner-v2`

Current default room boundary:
- type: `geo`
- geometry: rectangle
- width: `900`
- height: `650`
- position: `x: 200`, `y: 100`

### Runtime effects

Snap effect:
- syncs `isSnapMode` to `editor.user.updateUserPreferences`

Grid effect:
- syncs `isGridVisible` to `editor.updateInstanceState`

Zoom effect:
- polls camera zoom every `200ms`
- updates toolbar zoom label

BOQ effect:
- performs initial sync
- subscribes to `editor.store.listen(...)`
- rebuilds BOQ and AI suggestions on document changes

---

## Interaction Flow

### Step change

```text
StepBar
  -> PlannerToolbar
  -> setCurrentStep()
```

Current steps:
- `room`
- `layout`
- `review`

### Grid toggle

```text
Grid button
  -> PlannerToolbar
  -> setIsGridVisible()
```

### Snap toggle

Two inputs write to the same state:
- toolbar snap button
- inspector settings toggle

### Add furniture

```text
CatalogPanel product button
  -> onDropFurniture(product)
```

Behavior:
- reads `product.specs.dimensions`
- derives planner width and height
- creates image shape when an image exists
- creates geo rectangle otherwise
- attaches planner metadata

### Structural tools

`CatalogPanel` can set:
- `editor.setCurrentTool("draw")`
- `editor.setCurrentTool("line")`

### Clear canvas

```text
Clear button
  -> handleClearAll()
  -> delete all shapes except room boundary
```

### Export

```text
Export button
  -> window.print()
```

### Generate quote

```text
Generate Final Quote
  -> handleGenerateQuote()
  -> quoteCart.addItem(...)
  -> router.push("/quote-cart")
```

---

## Persistence and Dependencies

### Persistence

Canvas persistence:
- `Tldraw` uses `persistenceKey="one-and-only-planner-v2"`

Quote persistence:
- `zustand` persist middleware stores quote cart state in local storage

### Direct dependencies used by planner

- `tldraw`
  - editor, canvas, camera, assets, store listeners

- `framer-motion`
  - floating desktop panels

- `vaul`
  - mobile bottom sheets

- `zustand`
  - quote cart state

### Local tldraw assets

Served from:
- `/cdn/tldraw/fonts/...`
- `/cdn/tldraw/translations/en.json`

---

## Type Contracts

Defined in:
- `src/components/smartdraw/types.ts`

Current shared types:

```ts
type PlannerStep = "room" | "layout" | "review"

interface BoqItem {
  id: string
  name: string
  category: string
  price: number
  dimensions?: string
}

interface CatalogProduct {
  name: string
  category?: string
  price?: number
  flagship_image?: string
  images?: string[]
  specs?: { dimensions?: string; [k: string]: any }
  [k: string]: any
}
```

---

## Change Placement Rules

Use these rules when editing planner code.

Put the change in `SmartdrawPlanner.tsx` when it affects:
- shared planner state
- editor lifecycle
- subscriptions
- BOQ generation
- quote-cart bridge
- AI suggestion generation
- desktop vs mobile orchestration

Put the change in `PlannerToolbar.tsx` when it affects:
- toolbar layout
- toolbar button order
- control visibility
- zoom control display

Put the change in `PlannerCanvas.tsx` when it affects:
- canvas wrapper layout
- status pill
- tldraw mounting shell

Put the change in `PlannerDesktopPanels.tsx` when it affects:
- desktop panel composition
- desktop panel placement

Put the change in `PlannerMobilePanels.tsx` when it affects:
- mobile drawer composition
- mobile drawer open and close flow

Put the change in `CatalogPanel.tsx` when it affects:
- search
- product grid
- structural tools
- catalog section behavior

Put the change in `InspectorPanel.tsx` when it affects:
- items list
- total block
- settings tab
- quote CTA

Put the change in `WorkspacePanel.tsx` when it affects:
- drag behavior
- focus layering
- dock vs float behavior

---

## Current Constraints

These are the main architectural limits in the current implementation:

- zoom display is polling-based, not event-based
- quote grouping uses item name, not a stronger product identity
- planner metadata is stored through `shape.meta` without a strict shared interface
- room boundary is injected on mount if missing
- inspector and catalog still own some view logic locally
- `SmartdrawPlanner` is cleaner now but still carries all planner behavior in one file

---

## Recommended Next Refactors

If planner work continues, the next clean refactors should be:

1. Move editor bootstrap, BOQ sync, and compliance logic into a dedicated hook such as `usePlannerEditor`.
2. Replace zoom polling with an event-based camera sync if the `tldraw` API supports it reliably.
3. Use a stable product id in planner shape metadata and quote aggregation.
4. Split `InspectorPanel` into item-list and settings subcomponents.
5. Split `CatalogPanel` into product-grid and structural-tools subcomponents.
6. Replace `meta as any` access with a typed planner metadata contract.

---

## Quick Mental Model

```text
Route fetches products
  -> PlannerClient hydrates the client app
  -> SmartdrawPlanner owns state and side effects
  -> child components render isolated UI slices
  -> tldraw holds the document
  -> planner shape metadata becomes BOQ
  -> BOQ becomes quote-cart payload
```
