# Planner Current Structure

Generated: 2026-04-07

## Live Structure Chart

```mermaid
flowchart TD
  A[Main Site] --> B[/planner]
  A --> C[/draw]
  A --> D[/configurator]

  B --> E[apps/cad-suite/src/app/planner/page.tsx]
  C --> F[apps/cad-suite/src/app/draw/page.tsx]
  D --> G[apps/cad-suite/src/app/configurator/page.tsx]

  E --> H[SmartdrawPlanner]
  F --> H
  H --> I[Tldraw Canvas]
  H --> J[Catalog Fetch]
  H --> K[Quote Cart]

  L[b_yeh73xcndxr root app] --> M[Dashboard Editor]
  M --> N[Fabric 2D]
  M --> O[R3F 3D]
  M --> P[Supabase Save/Load]

  Q[Root docs and ops pages] --> R[Historical planner docs]
  Q --> S[Missing planner routes]
```

## Repo Reality

| Area | Status | Meaning |
|---|---|---|
| `src/app/planner` | Missing | Root legacy planner is not live |
| `src/app/planner2` | Missing | Root planner v2 is not live |
| `src/components/planner` | Missing | Old planner shell is gone from active source |
| `src/lib/planner` | Missing | Old/new planner engine docs do not match live root app |
| `src/app/ops/planner-overhaul/page.tsx` | Present | Planning dashboard only |
| `apps/cad-suite/src/app/planner/page.tsx` | Present | Live public planner entry |
| `apps/cad-suite/src/app/draw/page.tsx` | Present | Duplicate public planner entry |
| `apps/cad-suite/src/app/configurator/page.tsx` | Present | Placeholder page, not a real configurator |
| `b_yeh73xcndxr` | Present | Standalone floor-planner app |
| `apps/cad-suite/b_yeh73xcndxr` | Present | Duplicate copy of the same app |

## Current Planner Ownership Map

| Concern | Current Owner | Notes |
|---|---|---|
| Public planner route | `apps/cad-suite/src/app/planner/page.tsx` | Should remain canonical |
| Duplicate public route | `apps/cad-suite/src/app/draw/page.tsx` | Same runtime as `/planner` |
| Planner runtime | `apps/cad-suite/src/components/draw/SmartdrawPlanner.tsx` | Core public planner implementation |
| Canvas engine | `apps/cad-suite/src/components/draw/PlannerCanvas.tsx` | Tldraw wrapper |
| Quote integration | `apps/cad-suite/src/lib/store/quoteCart.ts` | Already wired into planner flow |
| Catalog integration | `apps/cad-suite/src/lib/getProducts.ts` | Catalog source for planner |
| Backup catalog fallback | `apps/cad-suite/src/lib/cloudflareBackupCatalog.ts` | Cloudflare D1-aware fallback |
| Persistence reference | `b_yeh73xcndxr/components/floor-planner/editor.tsx` | Save/load donor |
| 3D viewer reference | `b_yeh73xcndxr/components/floor-planner/viewer-3d.tsx` | Future donor |
| Historical planning docs | `IMPORTANTFILES/docs/planner/*` | Useful, but not authoritative for current code |

## Current File Tree

```text
src/
  app/
    ops/
      planner-overhaul/
        page.tsx

apps/
  cad-suite/
    src/
      app/
        planner/
          page.tsx
        draw/
          page.tsx
        configurator/
          page.tsx
        quote-cart/
          page.tsx
      components/
        draw/
          SmartdrawPlanner.tsx
          PlannerCanvas.tsx
          PlannerDesktopPanels.tsx
          PlannerMobilePanels.tsx
          PlannerToolbar.tsx
          CatalogPanel.tsx
          InspectorPanel.tsx
          LayersPanel.tsx
          WorkspacePanel.tsx
          StepBar.tsx
          AiCopilot.tsx
          types.ts
      lib/
        getProducts.ts
        cloudflareBackupCatalog.ts
        store/
          quoteCart.ts
          productCompare.ts
    b_yeh73xcndxr/
      app/
      components/floor-planner/
      lib/

b_yeh73xcndxr/
  app/
    dashboard/
      editor/[id]/page.tsx
  components/
    floor-planner/
      editor.tsx
      canvas-2d.tsx
      viewer-3d.tsx
  lib/
    store.ts
```

## What Is Wrong With The Current Structure

| Problem | Where | Why It Hurts |
|---|---|---|
| Dead planner docs point to missing code | `IMPORTANTFILES/docs/planner/*` | Misleads planning and onboarding |
| Canonical public planner is mixed with deployment plumbing issues | `apps/cad-suite` | Slows deployment and confidence |
| Duplicate planner routes | `/planner` and `/draw` | Ambiguous canonical entry |
| Duplicate standalone planner apps | `b_yeh73xcndxr` and `apps/cad-suite/b_yeh73xcndxr` | Drift and clutter |
| 3D is in the donor app, not the public planner | `b_yeh73xcndxr` | Feature split across apps |
| `SmartdrawPlanner` is too large | `apps/cad-suite/src/components/draw/SmartdrawPlanner.tsx` | Hard to extend safely |

## Current Conclusion

- Public planner runtime exists only in `apps/cad-suite`.
- Root planner family is mostly documentation, not software.
- `b_yeh73xcndxr` contains useful planner capabilities, but in the wrong app boundary.
