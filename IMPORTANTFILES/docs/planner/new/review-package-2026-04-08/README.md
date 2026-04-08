# Review Package 2026-04-08

## Purpose

This folder is the single handoff package for planner and repo review.

It bundles the current plan, checklist, walkthrough, audit material, and the 3 core architecture SVGs in one place.

## Included Files

- `PLANNER-DETAILED-PLAN.md`
- `PLANNER-CHECKLIST.md`
- `PLANNER-MASTER-WALKTHROUGH-AND-CODE-PLAN.md`
- `PLANNER-PACKAGE-MATRIX.md`
- `PLANNER-PLAN-POST.md`
- `REPO-AUDIT-2026-04-08.md`
- `planner-old-vs-new-architecture.svg`
- `planner-architecture-landscape.svg`
- `planner-architecture-executive.svg`

## SVG Rule

This package intentionally keeps 3 SVGs only:

- `planner-old-vs-new-architecture.svg`
- `planner-architecture-landscape.svg`
- `planner-architecture-executive.svg`

The `planner-data-auth-flow.svg` source remains in the parent `new` docs folder and is not duplicated here.

## Security Priority Order

1. Remove admin-token storage from browser `localStorage`.
   Current risk: `src/app/ops/customer-queries/CustomerQueriesOpsClient.tsx` stores `customer_queries_admin_token` locally.
   Safer direction: move this to real admin auth plus server-validated session or HttpOnly cookie.

2. Tighten CSP in `next.config.js`.
   Current risk: `script-src` still allows `'unsafe-inline'` and `'unsafe-eval'`.
   Safer direction: reduce legacy dependencies, then remove these allowances.

3. Quarantine or retire legacy vendor bundles that rely on unsafe dynamic code.
   Current risk: legacy bundles under `apps/cad-suite/public/vendors` and `apps/cad-suite/public/smartdraw/vendor` contain `new Function`, `innerHTML`, and similar patterns.
   Safer direction: keep them off critical surfaces or replace them with maintained first-party code paths.

4. Keep service-role keys server-only.
   Current state: browser-exposed service-role keys were not found in this audit.
   Next check: verify runtime secrets are set as secrets, not plain vars, in each deployed environment.

5. Re-verify Supabase RLS in the live environment.
   Current state: planner admin browser paths and RLS-oriented migrations exist in repo.
   Next check: test real admin and non-admin browser sessions against deployed Supabase.

## Next Steps

1. Run clean root and CAD builds outside the current sandbox.
   The code audit is clean, but this session hit `EPERM` on fresh build proof.

2. Run live browser checks on the current planner branch.
   Focus on toolbar height, clickability of room presets, and canvas centering with pinned panels.

3. Commit the review-prep fixes together.
   This includes the planner toolbar/layout corrections, lint cleanup, and repo audit docs.

4. Deploy to preview first, then rerun route and security probes.
   Check `/`, `/planner`, `/draw`, `/configurator`, `/planner-saved/[id]`, admin entry points, and response headers.

5. Close the remaining security review items before production sign-off.
   The most important ones are the admin-token flow and CSP hardening.
