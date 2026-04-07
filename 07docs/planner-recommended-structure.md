# Planner Recommended Structure

Generated: 2026-04-07

## Recommended Direction

Use `apps/cad-suite` as the single planner product boundary and reorganize it so public planning, persistence, and future 3D all live under one clear module tree.

## Target Architecture Chart

```mermaid
flowchart TD
  A[/planner] --> B[apps/cad-suite]
  B --> C[planner-core]
  B --> D[planner-ui]
  B --> E[planner-data]
  B --> F[planner-persistence]
  B --> G[planner-3d optional]

  C --> C1[geometry]
  C --> C2[boq]
  C --> C3[compliance]
  C --> C4[room-state]

  D --> D1[shell]
  D --> D2[canvas]
  D --> D3[panels]
  D --> D4[quote actions]

  E --> E1[catalog adapters]
  E --> E2[product mapping]

  F --> F1[save/load plans]
  F --> F2[drafts]
  F --> F3[history]

  G --> G1[viewer]
  G --> G2[model adapters]
```

## Recommended Repo Shape

```text
apps/
  cad-suite/
    src/
      app/
        planner/
          page.tsx
        planner-saved/
          [id]/
            page.tsx
        configurator/
          page.tsx
        quote-cart/
          page.tsx
      features/
        planner/
          core/
            geometry.ts
            boq.ts
            compliance.ts
            roomState.ts
          data/
            catalogAdapter.ts
            productMap.ts
          persistence/
            planRepository.ts
            draftRepository.ts
          ui/
            PlannerShell.tsx
            PlannerCanvas.tsx
            PlannerToolbar.tsx
            PlannerDesktopPanels.tsx
            PlannerMobilePanels.tsx
            CatalogPanel.tsx
            InspectorPanel.tsx
            LayersPanel.tsx
            StepBar.tsx
            AiCopilot.tsx
          3d/
            Viewer3D.tsx
            sceneAdapters.ts
          state/
            plannerStore.ts
            quoteBridge.ts
          index.ts
      lib/
        catalog/
        cloudflare/
        db/
```

## Recommended Ownership Rules

| Concern | Recommended Home | Source Today |
|---|---|---|
| Public planner route | `apps/cad-suite/src/app/planner/page.tsx` | Already there |
| Planner shell and UI | `apps/cad-suite/src/features/planner/ui/*` | Split from `components/draw/*` |
| Geometry and planner logic | `apps/cad-suite/src/features/planner/core/*` | Extract from `SmartdrawPlanner.tsx` |
| Planner state | `apps/cad-suite/src/features/planner/state/plannerStore.ts` | Borrow ideas from `b_yeh73xcndxr/lib/store.ts` |
| Save/load plans | `apps/cad-suite/src/features/planner/persistence/*` | Port from `b_yeh73xcndxr/components/floor-planner/editor.tsx` |
| 3D viewer | `apps/cad-suite/src/features/planner/3d/*` | Port from `b_yeh73xcndxr/components/floor-planner/viewer-3d.tsx` |
| Catalog bridge | `apps/cad-suite/src/features/planner/data/*` | Wrap `getProducts.ts` and backup catalog logic |
| Quote-cart handoff | `apps/cad-suite/src/features/planner/state/quoteBridge.ts` | Extract from current `SmartdrawPlanner.tsx` |

## What To Keep, Port, Remove

### Keep As Canonical

- `apps/cad-suite/src/app/planner/page.tsx`
- `apps/cad-suite/src/components/draw/SmartdrawPlanner.tsx`
- `apps/cad-suite/src/lib/getProducts.ts`
- `apps/cad-suite/src/lib/store/quoteCart.ts`

### Port Into CAD-Suite

- `b_yeh73xcndxr/lib/store.ts`
- `b_yeh73xcndxr/components/floor-planner/editor.tsx`
- `b_yeh73xcndxr/components/floor-planner/viewer-3d.tsx`

### Collapse Or Remove

- One of the two `b_yeh73xcndxr` copies
- One of `/planner` or `/draw` as a user-facing route
- Historical docs that claim missing root planners are live

## Migration Sequence

| Phase | Goal | Outcome |
|---|---|---|
| 0 | Fix CAD-suite build and Cloudflare build | Deployable baseline |
| 1 | Split `SmartdrawPlanner.tsx` into `features/planner/ui` and `features/planner/core` | Maintainable public planner |
| 2 | Port persistence from `b_yeh73xcndxr` | Save/load and draft support |
| 3 | Port viewer from `b_yeh73xcndxr` | Optional 3D mode under same planner boundary |
| 4 | Consolidate routes and archive duplicates | Cleaner repo and clearer product story |
| 5 | Rewrite planner docs to match live code | Accurate onboarding |

## Final Recommendation

- One planner product boundary: `apps/cad-suite`
- One canonical public route: `/planner`
- One donor app: `b_yeh73xcndxr`, used only for extraction
- Zero reliance on root historical planner docs as runtime truth
