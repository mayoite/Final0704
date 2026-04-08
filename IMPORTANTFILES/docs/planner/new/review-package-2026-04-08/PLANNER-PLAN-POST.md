# PLANNER PLAN POST

Generated: 2026-04-07

## Purpose

This document is the working plan for the planner only.

It does not cover the full site.
It does not cover unrelated marketing pages, CRM, or admin work except where those areas directly affect planner delivery.

## Executive Decision

The planner should be consolidated in the CAD Suite planner app (`apps/cad-suite`).

That is the only codebase in this repo that is already aligned with:

- the public route model
- catalog-backed planning
- quote-cart handoff
- the intended Cloudflare deployment model

The archived donor planner snapshot (`07docs/Backupcad`) should not become the primary planner product.
It should be used as a donor codebase for:

- saved plan persistence
- clearer planner store separation
- optional future 3D viewer capability

The old root planner family described in historical docs should be treated as reference material only.

## Naming Rule

Use app-role names first in this document.

- `CAD Suite planner app` means `apps/cad-suite`
- `Archived donor planner snapshot` means `07docs/Backupcad`
- `Historical planner docs` means planner material under `IMPORTANTFILES/docs/planner/old`

## Current Truth

### Live planner runtime

- `apps/cad-suite/src/app/planner/page.tsx`
- `apps/cad-suite/src/app/draw/page.tsx`
- `apps/cad-suite/src/components/draw/SmartdrawPlanner.tsx`

### Live planner-adjacent route

- `apps/cad-suite/src/app/configurator/page.tsx`

Current status:

- `/planner` and `/draw` run the same planner runtime
- `/configurator` is an honest interim 3D preview, not a finished configurator

### Archived donor planner snapshot

- `07docs/Backupcad/*`

Current status:

- separate app model preserved as an archival donor
- better persistence structure
- better 3D scaffolding
- wrong product boundary for the public planner
- no longer duplicated in live-looking locations, which is better

### Historical docs

- `IMPORTANTFILES/docs/planner/HANDOVER.md`
- `IMPORTANTFILES/docs/planner/PLANNER-FLOW-AND-STRUCTURE.md`
- `IMPORTANTFILES/docs/planner/architecture_matrix.md`
- `IMPORTANTFILES/docs/planner/architecture_matrix_wide.md`
- these now live under `IMPORTANTFILES/docs/planner/old/`

Current status:

- useful for historical intent
- not reliable as a map of live code

## Planner North Star

Build one planner system with these properties:

1. One canonical public entry: `/planner`
2. One planner code boundary: CAD Suite planner app (`apps/cad-suite`)
3. Real catalog integration
4. Real quote-cart handoff
5. One canonical Supabase-backed saved-plan store
6. Easy import support
7. One admin login model and general user logins in the same auth system
8. Admin should be able to access Supabase from browser surfaces safely
9. Measurement accuracy and consistency as a core requirement
10. Planner theme should broadly match the main site
11. Optional 3D mode inside the same product boundary
12. Clean deployment on Cloudflare
13. Accurate docs that match the repo
14. Existing site product data remains the legacy read-only source
15. Planner documents can use a separate new write-side store for now
16. Newly added planner-managed products should go to the new store only

## Non-Negotiable Rules

### Product rules

- `/planner` is the primary public route
- planner must end in quote generation, not just canvas interaction
- planner must be catalog-aware, not a generic drawing toy
- 3D is secondary to a stable 2D and quote flow
- saved plans should have one source of truth in Supabase
- product reads should stay on the legacy read-only site product data source
- planner writes can stay in a separate new write-side store for now
- newly added planner-managed products should go only to the new store
- import should be easy enough to use from the planner itself
- admin and general users should share one auth system with role-based permissions
- admin browser access should use the normal Supabase browser client plus RLS, not service-role exposure
- measurement must come from one canonical unit model and survive save/load/import correctly
- planner UI should broadly match the site's colors, typography, surfaces, and interaction tone

## Current Status

The planner is in an interim transition state.

| Area | Status | Rough completion |
|---|---|---|
| Planner direction and docs | Established | 85% |
| Theme alignment | Site CSS and typography reuse wired in | 65% |
| Phase 1 refactor | Session, panel, measurement, and quote boundaries extracted | 70% |
| Phase 2 document/save/load/import foundation | Core document/session flow is live, measurement persistence is normalized, planner save schema/RLS hardening is in repo, and the planner-managed product write store plus merged catalog adapter are implemented; admin browser workflow proof remains open | 90% |
| Phase 3 2D/3D document bridge | Document-driven 3D viewer and honest preview route are live | 85% |
| Session/cache behavior | Sticky error state plus 24-hour local draft cache implemented | 100% |
| Build and deploy stability | Not solved yet | 20% |
| Final production hardening | Not done | 15% |

### Recheck corrections

- planner saves are real and Supabase-backed
- legacy catalog normalization for planner reads is real
- separate planner-managed product storage is implemented through `planner_managed_products`
- the merged old-read/new-write product adapter is implemented in the planner catalog layer
- import normalization is implemented through the planner document model and saved-row restoration now routes through canonical normalization
- planner-specific admin RLS is implemented in repo through a `planner_saves` reconciliation migration
- admin browser access without service-role exposure is an architectural rule, not yet a proven planner workflow
- `planner_saves` migrations drifted; a reconciliation migration is now in repo, but it still needs environment application and verification

### Engineering rules

- no more duplicate planner app trees
- no more route names that imply functionality that does not exist
- no more historical docs presented as if they were live system truth
- no more planner package sprawl without actual usage or a scheduled phase
- build and deploy gates must pass before feature expansion

## What We Keep

### Canonical runtime

- `apps/cad-suite/src/app/planner/page.tsx`
- `apps/cad-suite/src/components/draw/SmartdrawPlanner.tsx`
- `apps/cad-suite/src/components/draw/PlannerCanvas.tsx`
- `apps/cad-suite/src/components/draw/*Panels.tsx`
- `apps/cad-suite/src/lib/getProducts.ts`
- `apps/cad-suite/src/lib/store/quoteCart.ts`
- `apps/cad-suite/src/lib/cloudflareBackupCatalog.ts`

### Why we keep it

- already tied to public planner routes
- already tied to catalog
- already tied to quote cart
- already aligned with current deployment model

## Interim Data Split

For now, the planner can read and write through different data stores.

This is interim architecture, not the final intended end-state.

That means:

- read products from the legacy read-only site product source
- write planner saves, imports, planner session records, and newly added planner-managed products to a dedicated new planner store
- resolve BOQ and quote items back to the normalized catalog contract by stable `id` and `slug`
- keep local drafts only as a 24-hour browser cache, never as a second canonical store

This is acceptable as an interim state because it keeps product ownership clean and avoids duplicating catalog rows into planner persistence.

What is live today:

- `planner_saves` as the saved-plan write store
- legacy catalog reads through the planner catalog adapter
- local draft cache as a non-canonical fallback

What is not live today:

- a proven browser admin workflow over the planner-managed product and planner save surfaces
- environment-by-environment confirmation that the planner RLS rules match the current repo migrations

## What We Port

### From the archived donor planner snapshot (`07docs/Backupcad`)

- persistence model
- save/load plan flow
- more explicit planner store structure
- optional 3D viewer shell

### Specific donor areas

- `07docs/Backupcad/lib/store.ts`
- `07docs/Backupcad/components/floor-planner/editor.tsx`
- `07docs/Backupcad/components/floor-planner/viewer-3d.tsx`
- related types and data adapters only if they fit the public planner model

### What we do not port blindly

- dashboard product shell
- auth-first app structure
- generic furniture-block editor assumptions
- duplicate route architecture

## What We Remove Or Collapse

1. Keep the archived donor planner snapshot (`07docs/Backupcad`) as the only donor snapshot
2. One public alias between `/planner` and `/draw`
3. misleading planner docs once replaced
4. placeholder route claims that imply `/configurator` is already a finished tool

## Immediate risks

1. `planner_saves` reconciliation migration still needs to be applied and verified
2. planner build/deploy still not clean
3. planner admin browser workflow not yet verified end-to-end
4. import and measurement normalization not fully closed across reload and editor restore

## Target Planner Architecture

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
            plannerMetrics.ts
          data/
            catalogAdapter.ts
            productMap.ts
            backupCatalogAdapter.ts
          state/
            plannerStore.ts
            plannerSession.ts
            quoteBridge.ts
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
          three-d/
            Viewer3D.tsx
            sceneAdapter.ts
            modelAdapter.ts
```

## Package Direction

The planner package set should be smaller and more intentional than the full app-wide dependency list.

### Keep as canonical planner packages

| Package | Reason |
|---|---|
| `tldraw` | Canonical 2D planner engine |
| `zustand` | Planner-side state and quote bridge |
| `@supabase/ssr` | Shared browser/server auth session model |
| `@supabase/supabase-js` | Planner persistence and admin browser data access |
| `vaul` | Mobile planner drawer behavior |
| `zod` | Import and planner document validation |

### Keep for scheduled future phases

| Package | Reason |
|---|---|
| `@react-three/fiber` | Unified 3D mode later |
| `@react-three/drei` | Unified 3D mode later |
| `three` | Unified 3D mode later |
| `openai` | Planner assistant and planner-adjacent AI flows |

### Keep as shared site-shell support

| Package | Reason |
|---|---|
| `framer-motion` | Planner motion should feel like the site |
| `clsx` and `tailwind-merge` | Keep styling composition consistent |
| `@radix-ui/*` | Reuse existing UI primitives instead of inventing planner-only primitives |

### Reserved for planned planner work

| Package | Current signal | Planned use |
|---|---|---|
| `react-konva` and `konva` | No live usage found in the CAD Suite planner app source (`apps/cad-suite/src`) | Secondary 2D canvas tooling or overlays if Tldraw is not the right fit for a sub-surface |
| `@thi.ng/geom-hull` | No live usage found in the CAD Suite planner app source (`apps/cad-suite/src`) | Polygon hull generation and room-outline cleanup |
| `alpha-shape` | No live usage found in the CAD Suite planner app source (`apps/cad-suite/src`) | Polygon boundary and enclosure calculations |
| `bezier-js` | No live usage found in the CAD Suite planner app source (`apps/cad-suite/src`) | Curves, rounded corners, and wall-path calculations |
| `line-intersect` | No live usage found in the CAD Suite planner app source (`apps/cad-suite/src`) | Wall joins, segment intersections, and measurement rules |
| `@tanstack/react-query` | No live planner usage found in the CAD Suite planner app source (`apps/cad-suite/src`) | Planner async data synchronization if persistence surfaces grow |
| `html2canvas` | No live usage found in the CAD Suite planner app source (`apps/cad-suite/src`) | Planner image snapshots and raster export capture |
| `jspdf` | No live usage found in the CAD Suite planner app source (`apps/cad-suite/src`) | PDF export, quote summaries, and printable planner output |
| `jszip` | No live usage found in the CAD Suite planner app source (`apps/cad-suite/src`) | Bundled export packages and planner asset archives |
| `axios` | No live usage found in the CAD Suite planner app source (`apps/cad-suite/src`) | External planner API integration if native `fetch` is not enough |
| `point-in-polygon` | No live usage found in the CAD Suite planner app source (`apps/cad-suite/src`) | Polygon containment checks and layout validation rules |

## Workstreams

## 1. Build And Deployment Stabilization

### Goal

Make the CAD Suite planner app build, Cloudflare-build, and deploy consistently.

### Current blocker

The planner concept is acceptable.
The build plumbing is not.

The current failure pattern points to workspace and Turbopack resolution problems in the CAD Suite planner app.

### Deliverables

- `npm -w cad-suite run build` passes
- `npm -w cad-suite run cf:build` passes
- required packages resolve correctly in the app boundary
- route rewrites to planner are production-safe

### Exit criteria

- planner build is green
- planner Cloudflare build is green
- planner route can be deployed without manual hacks

## 2. Planner Runtime Extraction

### Goal

Split `SmartdrawPlanner.tsx` into maintainable planner modules.

### Problem

The current public planner is too monolithic.
It mixes:

- routing expectations
- room state
- geometry behavior
- AI suggestions
- quote extraction
- UI composition
- canvas lifecycle

### Deliverables

- planner shell component
- planner core logic modules
- separate quote bridge
- separate planner state module
- thinner route entrypoints
- planner shell tokens aligned with the site's visual system
- planner panels and actions feel branded rather than generic

### Exit criteria

- `SmartdrawPlanner.tsx` is no longer the single owner of everything
- feature logic can be changed without editing one giant file
- planner broadly matches the site without losing tool usability

## 3. Persistence

### Goal

Add save/load and drafts to the canonical planner.

### Source

Port selectively from the archived donor planner snapshot.

### Deliverables

- planner save draft
- planner load existing plan
- plan repository abstraction
- local draft fallback if remote save is unavailable
- one canonical Supabase plan store
- import flow that maps external plan data into the canonical planner document
- planner permissions tied to one shared auth model for admin and general users
- secure admin browser access to planner data through Supabase client and RLS
- centralized measurement and unit handling

### Exit criteria

- planner sessions survive refresh or return visit
- saved plans belong to the canonical planner, not the donor app
- import is available without forcing users into a technical workflow
- admin and general users do not require separate planner auth stacks
- admin can operate on planner data from browser surfaces without exposing service-role credentials
- measurements stay correct across canvas, saved plans, imports, and quote outputs

## 4. Quote And Catalog Hardening

### Goal

Strengthen the planner-to-quote path.

### Deliverables

- stable BOQ extraction from planner objects
- product mapping reliability
- clear cart payload contract
- error handling when product data is missing

### Exit criteria

- planner always produces a quote-cart payload or a clear user-facing failure
- no silent mismatch between planner items and cart items

## 5. Optional 3D Mode

### Goal

Add 3D only after 2D planning and quote flow are stable.

### Source

Reuse only the useful parts from the archived donor planner snapshot.

### Deliverables

- optional viewer mode inside the canonical planner product
- same plan data feeds both 2D and 3D
- no separate 3D app boundary

### Exit criteria

- 3D works from the same saved planner document
- 3D does not fork the planner architecture again

## 6. Cleanup And Documentation

### Goal

Remove planner ambiguity from the repo.

### Deliverables

- keep the archived donor planner snapshot as the only donor snapshot
- define canonical route naming
- replace stale planner docs
- add a live architecture doc that matches actual code
- remove planner packages that do not serve the canonical planner path

### Exit criteria

- new engineer can identify the real planner in under five minutes
- no planner doc claims live code that does not exist

## Delivery Phases

## Phase 0

### Name

Stabilize the planner build

### Scope

- fix workspace resolution
- fix CAD build
- fix CAD Cloudflare build
- keep feature work frozen except build-critical fixes

### Success

- deployable planner baseline

## Phase 1

### Name

Make the public planner maintainable

### Scope

- split `SmartdrawPlanner.tsx`
- establish planner feature modules
- keep public behavior stable

### Success

- same planner UX, better code shape

## Phase 2

### Name

Add persistence

### Scope

- port persistence from donor app
- add saved plan routes
- add plan repository abstraction

### Success

- users can save and return to plans

## Phase 3

### Name

Add unified 3D

### Scope

- reuse donor viewer concepts
- keep same planner document
- avoid creating a second planner codebase

### Success

- one planner, optional 3D

## Phase 4

### Name

Collapse duplicates and rewrite docs

### Scope

- archive duplicate donor copy
- declare canonical route strategy
- clean planner documentation

### Success

- repo structure matches product reality

## Route Strategy

### Canonical

- `/planner`

### Temporary compatibility

- `/draw` may stay as an alias until redirects are safe

### Deferred

- `/configurator` remains secondary until it has real delivered capability

### Forbidden

- introducing another planner route family before consolidation is complete

## Risk Register

| Risk | Why It Matters | Response |
|---|---|---|
| CAD build remains unstable | Blocks delivery regardless of feature quality | Fix build before new planner scope |
| Donor app port becomes a rewrite trap | Can waste time copying the wrong abstractions | Port capability, not app structure |
| 3D work starts too early | Splits focus before 2D quote flow is stable | Lock 3D behind Phase 3 |
| Docs keep drifting from code | Causes repeated bad decisions | Replace stale docs after consolidation |
| Duplicate planners remain in repo | Confuses ownership and onboarding | Archive duplicates explicitly |

## Testing And Gates

The planner is not done until these are true:

1. CAD Suite planner app production build passes
2. CAD Suite planner app Cloudflare build passes
3. `/planner` loads with catalog data
4. planner can create quote-cart payloads
5. save/load works after persistence lands
6. route aliases and docs are explicit, not ambiguous
7. planner shell broadly matches the site's visual system

## What Not To Do

1. Do not revive root historical planner docs as if they were live software.
2. Do not promote the archived donor planner snapshot wholesale into production.
3. Do not build a separate 3D planner app.
4. Do not keep multiple planner trees indefinitely.
5. Do not add features to `/configurator` before the main planner is stable.

## Final Recommendation

The correct planner path is:

- stabilize the CAD Suite planner app
- extract and harden the public planner there
- align the planner shell with the site's visual system
- keep only the packages that serve the canonical planner path
- port persistence and 3D selectively from the archived donor planner snapshot
- remove duplication
- rewrite docs to match the live system

That gives one planner, one route strategy, one deployment path, and one code ownership model.
