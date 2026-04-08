# Planner Master Walkthrough And Code Plan

Generated: 2026-04-08

## Purpose

This is the single high-signal walkthrough for the planner.

Use it when you need to:

- understand what the planner is
- understand where the code lives
- run the planner locally
- trace save, load, import, quote, and 3D flows
- deploy the planner
- continue implementation without re-auditing the whole repo first

This document complements, but does not replace:

- `PLANNER-DETAILED-PLAN.md`
- `PLANNER-CHECKLIST.md`
- `PLANNER-PACKAGE-MATRIX.md`

## Canonical Decisions

- Canonical planner base: `apps/cad-suite`
- Canonical public planner route: `/planner`
- Compatibility route: `/draw` redirects to `/planner` in the CAD Suite app
- Archived donor snapshot: `07docs/Backupcad`
- Historical planner docs: `IMPORTANTFILES/docs/planner/old`
- Canonical internal measurement unit: `mm`
- Canonical save store: Supabase `planner_saves`
- Legacy product reads stay read-only
- Planner-managed product writes go to the new write-side store
- Admin browser data access must use the normal Supabase client plus RLS

## Repo Walkthrough

### Planner runtime

- Route entry: `apps/cad-suite/src/app/planner/page.tsx`
- Saved-plan reopen route: `apps/cad-suite/src/app/planner-saved/[id]/page.tsx`
- 3D preview route: `apps/cad-suite/src/app/configurator/page.tsx`
- Compatibility redirect: `apps/cad-suite/src/app/draw/page.tsx`
- Route-facing shell: `apps/cad-suite/src/components/draw/SmartdrawPlanner.tsx`

### Planner feature boundary

- Hooks: `apps/cad-suite/src/features/planner/hooks`
- UI: `apps/cad-suite/src/features/planner/ui`
- Data: `apps/cad-suite/src/features/planner/data`
- Model: `apps/cad-suite/src/features/planner/model`
- Logic: `apps/cad-suite/src/features/planner/lib`
- 3D: `apps/cad-suite/src/features/planner/3d`

### Shared sinks outside planner feature

- Quote cart store: `apps/cad-suite/src/lib/store/quoteCart.ts`
- Supabase browser client: `apps/cad-suite/src/lib/supabase/client.ts`
- Root placeholder planner compatibility surface: `src/app/planner`

## How The Planner Works

### Route flow

1. User opens `/planner`.
2. Route loads planner catalog data.
3. `SmartdrawPlanner.tsx` mounts the planner shell.
4. `usePlannerWorkspace.ts` owns editor orchestration and planner actions.
5. `usePlannerSession.ts` owns auth-aware save, load, import, export, and admin workflow.
6. Planner UI bodies render from `features/planner/ui`.
7. Quote output is built through `features/planner/lib/quoteBridge.ts`.
8. 3D preview reads the same planner document model through `/configurator`.

### State ownership

- Route/shell composition: `SmartdrawPlanner.tsx`
- UI shell state: `usePlannerUiState.ts`
- Editor and workspace orchestration: `usePlannerWorkspace.ts`
- Session/auth/persistence state: `usePlannerSession.ts`
- Planner document normalization: `plannerDocument.ts`

### User workflow

1. Define room shell.
2. Place catalog products.
3. Inspect measurements and alignment.
4. Save draft locally or save to cloud.
5. Import/export planner JSON if needed.
6. Open the same document in 3D preview.
7. Send grouped BOQ output into the quote cart.

## Code Walkthrough

### Shell and route composition

`SmartdrawPlanner.tsx` should stay thin.

Its job is:

- wire router, quote cart, and Supabase client
- hydrate initial planner documents
- connect workspace hook to session hook
- pass composed props into toolbar, panels, canvas, and dialog

It should not grow back into the old monolith.

### Workspace hook

`usePlannerWorkspace.ts` is the main planner runtime hook.

It currently handles:

- Tldraw editor mount and synchronization
- room shell and product placement actions
- wall segment and door opening actions
- wall join resolution
- selection alignment and distribution
- selection dimension editing
- document building and application
- BOQ derivation and measurement state

If more work is added here, prefer extracting editor-specific submodules rather than expanding the hook indefinitely.

### UI state hook

`usePlannerUiState.ts` owns planner shell UI state:

- active step
- drawing tool
- panel visibility and pinning
- grid/snap toggles
- unit display mode
- mobile drawer state

This is the current boundary proving UI state is no longer embedded ad hoc inside the main planner shell.

### Session hook

`usePlannerSession.ts` owns:

- auth user lookup
- role lookup from `profiles`
- cloud save/load/list
- local draft save/load/delete
- import/export handlers
- admin save oversight list
- planner-managed product admin workflow
- sticky status and error state

This is also the current browser-side admin workflow entrypoint.

### Planner data layer

Main files:

- `plannerSaves.ts`
- `plannerCatalog.ts`
- `plannerManagedProducts.ts`
- `plannerManagedProducts.client.ts`
- `plannerManagedProductsShared.ts`
- `plannerDraft.ts`
- `plannerImport.ts`

Important current rules:

- `plannerSaves.ts` supports `owner` and `admin` access modes
- admin save updates preserve original `user_id`
- admin browser delete is intentionally blocked
- planner catalog reads merge legacy catalog data and planner-managed products
- tolerant planner-managed-product normalization exists for older schema shapes

### Planner model

Main file:

- `apps/cad-suite/src/features/planner/model/plannerDocument.ts`

This is the canonical document contract for:

- save/load
- import/export
- measurement normalization
- 2D to 3D bridging

If planner state needs to persist, it should map through this model rather than bypass it.

### Planner UI surfaces

Main files:

- `PlannerToolbar.tsx`
- `StepBar.tsx`
- `PlannerCanvas.tsx`
- `PlannerDesktopPanels.tsx`
- `PlannerMobilePanels.tsx`
- `CatalogPanel.tsx`
- `LayersPanel.tsx`
- `InspectorPanel.tsx`
- `PlannerSessionDialog.tsx`
- `WorkspacePanel.tsx`
- `MobileDrawerSheet.tsx`

Current intent:

- toolbar handles top-level actions and session entry
- step bar handles planning progression
- desktop/mobile panels render the same planner capability in different shells
- session dialog is the owner save/admin oversight/import-export hub

### 3D bridge

Main file:

- `apps/cad-suite/src/features/planner/3d/Planner3DViewer.tsx`

Current status:

- reads canonical planner document geometry
- supports orbit mode
- supports walkthrough mode
- ports donor viewer concepts from `07docs/Backupcad`

## Data And Auth Walkthrough

### Planner saves

- Table: `planner_saves`
- Canonical save repository: `plannerSaves.ts`
- Local fallback: browser draft cache only
- Admin save oversight: browser-safe through RLS-backed read/update path

### Planner-managed products

- Table: `planner_managed_products`
- Migration reconciliation file:
  - `supabase/migrations/20260407200000_reconcile_planner_managed_products_schema.sql`
- Browser admin helpers:
  - `plannerManagedProducts.client.ts`

### Auth

- Provider: Supabase Auth
- Role source: `profiles.role`
- Expected roles in planner code today:
  - `customer`
  - `admin`

### Security rule

Never expose service-role credentials in browser code.

The planner admin path must stay:

- browser Supabase client
- authenticated user session
- RLS enforcement

## Measurement Walkthrough

Canonical rule:

- store planner geometry in `mm`

Display rule:

- render in `mm` or `ft-in`
- convert at the presentation layer

Import rule:

- normalize incoming geometry into canonical `mm`

Quote rule:

- planner-derived dimensions must come from the same normalized planner geometry path

Files to trust:

- `features/planner/lib/measurements.ts`
- `features/planner/model/plannerDocument.ts`
- `features/planner/lib/quoteBridge.ts`

## Local Development

### CAD Suite only

Run:

```bash
npm -w cad-suite run dev
```

Default URL:

- `http://127.0.0.1:3001/planner`

Use only this server if you are working on planner/CAD functionality.

### Root app

Run:

```bash
npm run dev
```

Use this only when you also need to test the main site, homepage, or root `/planner` placeholder route.

### Do we need separate servers?

- Local development: only if you need both apps at once
- Deployment: yes, treat them as separate apps

## Verification Commands

Planner verification:

```bash
npm run test:planner
npm -w cad-suite run lint
npm -w cad-suite run build
npm -w cad-suite run cf:build
```

Root app verification:

```bash
npm run build
```

Known current issue outside planner:

- root app lint is blocked by an ESLint plugin/version compatibility problem

## Deployment Walkthrough

### CAD Suite

Build:

```bash
npm -w cad-suite run build
```

Cloudflare build:

```bash
npm -w cad-suite run cf:build
```

Cloudflare deploy:

```bash
npm -w cad-suite run cf:deploy
```

Current worker name:

- `oneandonly-cad-suite`

### Root app

Build:

```bash
npm run build
```

Vercel deploy:

```bash
vercel deploy --prod --yes
```

Current linked Vercel project:

- `final-oando-0504`

### CAD subdomain strategy

Recommended:

- keep root site on primary domain
- map CAD Suite to a dedicated subdomain such as `cad.<domain>`

Reason:

- separate app boundary
- separate deploy cadence
- no confusion between root site and planner runtime

## What Was Recently Landed

- planner UI bodies moved under `features/planner/ui`
- `SmartdrawPlanner.tsx` slimmed down
- workspace logic moved into `usePlannerWorkspace.ts`
- UI state moved into `usePlannerUiState.ts`
- admin-capable planner save repository paths added
- browser admin workflow added in session dialog
- planner-managed-product browser helpers added
- planner-managed-product reconciliation migration added
- planner-grade Tldraw behaviors added
- donor 3D viewer concepts ported into planner 3D mode
- quote bridge tests and save repository tests added
- homepage dead links removed from root app

## Master Code Plan

### Phase A: Keep stable

- keep planner tests green
- keep CAD build green
- keep Cloudflare build green
- avoid growing `SmartdrawPlanner.tsx`

### Phase B: Finish production proof

- prove admin browser workflow end-to-end in a live session
- verify save/load/import/quote measurement continuity in browser
- verify `/draw` redirect behavior in deployed CAD environment

### Phase C: Clean ownership

- continue shrinking `components/draw`
- decide whether `AiCopilot.tsx` and shared draw types move under `features/planner`
- publish final package cleanup decisions

### Phase D: Hardening

- remove truly unused planner packages after final assignment
- verify migration rollout order in real environments
- attach CAD app to its dedicated subdomain
- complete deployment docs with exact environment ownership

## Immediate Next Steps

1. Deploy CAD Suite to its own subdomain.
2. Prove planner admin browser workflow in a live environment.
3. Verify save/load/import/quote measurement continuity with browser evidence.
4. Finish package cleanup only after implementation scope is frozen.
5. Keep this document updated whenever planner ownership or deployment truth changes.

