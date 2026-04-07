# Planner Audit Report

Generated: 2026-04-07

## Executive Verdict

- Canonical public planner should be `apps/cad-suite`.
- Root planner family under `src/app/planner` and `src/app/planner2` is not live code in this repo.
- `b_yeh73xcndxr` is useful as a donor codebase for persistence and future 3D, not as the primary public planner.
- Current blocker is build and workspace resolution in `apps/cad-suite`, not product direction.

## Comparison Chart

| Planner Surface | Lives Where | Engine | State Model | Quote / Catalog Fit | 3D | Deployability Now | Verdict |
|---|---|---|---|---|---|---|---|
| Legacy `/planner` | Docs only, no live `src/app/planner` code | Documented old planner shell | Documented old planner store | Documented only | Documented only | No | Archive reference only |
| Planned `/planner2` | Docs and ops page only, no live route | Documented newer unified planner | Documented Zustand + Immer + Persist | Intended fit, not implemented here | Intended | No | Target architecture only |
| `/ops/planner-overhaul` | `src/app/ops/planner-overhaul/page.tsx` | Ops dashboard | N/A | N/A | N/A | Yes, but not a planner | Reference only |
| `apps/cad-suite` `/planner` | `apps/cad-suite/src/app/planner/page.tsx` | Tldraw | Local React + Tldraw state | Strong | No | Blocked by build plumbing | Best current public planner |
| `apps/cad-suite` `/draw` | `apps/cad-suite/src/app/draw/page.tsx` | Tldraw | Same as `/planner` | Strong | No | Blocked by build plumbing | Alias, duplicates `/planner` |
| `apps/cad-suite` `/configurator` | `apps/cad-suite/src/app/configurator/page.tsx` | Placeholder page | N/A | Weak | Not wired | Yes as a page, no as a tool | Not a planner today |
| `b_yeh73xcndxr` root app | `b_yeh73xcndxr/*` | Fabric 2D + R3F 3D | Explicit planner store | Weak for public quote flow | Yes | Standalone app, not integrated | Donor only |
| `apps/cad-suite/b_yeh73xcndxr` | Duplicate copy | Fabric 2D + R3F 3D | Same as root copy | Weak | Yes | Adds confusion | Remove or archive |

## Top Findings

### 1. Root planner docs are stale

- `IMPORTANTFILES/docs/planner/HANDOVER.md` describes live routes and files under `src/app/planner`, `src/app/planner2`, `src/components/planner`, and `src/lib/planner`.
- Those paths do not exist in the current root app.
- Internal admin and ops pages still point to planner routes that are not backed by live root code.

### 2. `apps/cad-suite` is the only real public planner runtime

- `/planner` and `/draw` both load `SmartdrawPlanner`.
- `SmartdrawPlanner` already pulls catalog data, creates room-shell geometry, derives BOQ-like quote items, and sends them to the quote cart.
- This is the only implementation aligned with the current public site funnel.

### 3. `b_yeh73xcndxr` is better structured internally, but it is the wrong product shape

- It is a separate authenticated dashboard application.
- It has persistence, editor/store separation, and a real 3D viewer scaffold.
- It does not match the public quote-cart flow and uses a different app model.

### 4. CAD-suite is blocked by build setup, not by concept

- `apps/cad-suite` fails production build because required packages resolve at repo root but not inside the app-level install context used by its current Turbopack setup.
- This looks like workspace and resolution plumbing, not a planner architecture dead end.

### 5. There is unnecessary planner duplication

- `b_yeh73xcndxr` exists at repo root and again under `apps/cad-suite/b_yeh73xcndxr`.
- `/planner` and `/draw` in `apps/cad-suite` are also duplicate public entrypoints to the same runtime.

## Current Risks

| Severity | Risk | Impact |
|---|---|---|
| High | CAD-suite build currently fails | Public planner cannot be deployed safely |
| High | Root planner docs describe non-existent live code | Planning decisions can be made on false assumptions |
| Medium | Two `b_yeh73xcndxr` copies exist | Maintenance drift and team confusion |
| Medium | `/planner` and `/draw` duplicate the same implementation | Route ambiguity and redundant QA |
| Medium | `SmartdrawPlanner` is monolithic | Harder maintenance and slower iteration |
| Medium | `/configurator` name implies functionality not yet implemented | Product confusion |

## Decision

### Keep

- `apps/cad-suite/src/app/planner/page.tsx`
- `apps/cad-suite/src/components/draw/*`
- `apps/cad-suite/src/lib/store/quoteCart.ts`
- `apps/cad-suite/src/lib/getProducts.ts`
- `apps/cad-suite/src/lib/cloudflareBackupCatalog.ts`

### Borrow

- Persistence patterns from `b_yeh73xcndxr/lib/store.ts`
- Save/load flow from `b_yeh73xcndxr/components/floor-planner/editor.tsx`
- Future 3D viewer ideas from `b_yeh73xcndxr/components/floor-planner/viewer-3d.tsx`

### Do Not Promote

- Root planner docs as if they were live product code
- `b_yeh73xcndxr` as the primary public planner
- `/configurator` as a production planner until it has real functionality

## Recommended Next Moves

1. Stabilize `apps/cad-suite` build and Cloudflare build.
2. Declare `/planner` as the single canonical public planner route.
3. Treat `/draw` as an alias or remove it later.
4. Port persistence from `b_yeh73xcndxr` into CAD-suite.
5. Archive one duplicate `b_yeh73xcndxr` copy.
6. Rewrite planner docs so they describe the live repo, not historical structure.
