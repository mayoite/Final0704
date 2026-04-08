# Planner Repo Audit, Plan, and Checklist

Generated: 2026-04-09
Status: final repo-side closeout

## Purpose

This document is the final repo-side reviewer package for the planner-related codebase as of this pass.

It combines:

- the final repo audit
- the remediation status
- the remaining checklist

This version reflects these locked clarifications:

- `/ops/customer-queries` is a temporary internal tool
- `2100 mm` is the canonical planner wall height
- the planner handoff is BOQ-only, not quote pricing

## Scope

Audited surfaces:

- root app
- `apps/cad-suite`
- planner-adjacent ops and handoff flows
- release and validation tooling
- deploy-facing repo configuration

Current repo note:

- the repo-side remediation work in this package is complete
- remaining blockers are platform-side, not compile/test failures in the codebase

## Commands Run

```powershell
npm run lint
npm -w cad-suite run lint
npm test
npm run test:planner
npm run build
npm -w cad-suite run build
npm run release:gate
npm run audit:emails:com
vercel list oneandonly-cad-suite
vercel inspect https://oneandonly-cad-suite-d5wafr3q0-ayushs-projects-1.vercel.app
```

## Executive Summary

The repo is now reviewable and materially cleaner than the original audit state.

The codebase itself is no longer blocked by broken lint, broken planner tests, stale planner BOQ wording, or the planner server-data crash path that could take down `/planner`.

The major remaining issues are outside the repo:

1. Vercel project collaboration and access policy block normal Git-triggered deploys
2. CAD Vercel root-directory setup is still awkward
3. Cloudflare CAD deploy is blocked by Worker size limits on the current plan
4. architectural duplication between root and `apps/cad-suite` still exists

## Final Findings

### Resolved

1. Release validation is materially stronger.
   Root and CAD lint/build/test flows now pass, and the release gate is no longer a blind smoke-only path.

2. CAD lint is fixed.
   `npm -w cad-suite run lint` now passes.

3. Root test runner is fixed.
   `npm test` now uses the active Vitest model instead of the broken Jest path.

4. Planner test drift was corrected.
   The planner suite now reflects the shipped `Space / Catalog / Measure / Review` workflow and the canonical `2100 mm` wall height.

5. Planner BOQ wording drift was reduced.
   Active planner UI and handler naming were moved away from quote-era wording in the live planner surface.

6. CAD build blockers were fixed.
   The missing asset path and local font-path issues were resolved and CAD builds cleanly.

7. Planner server-data loading is more deploy-safe.
   Optional planner catalog and planner-managed-product loading now fail soft instead of taking down the whole `/planner` route.

8. Repo cleanup was completed materially.
   Unused CAD files were archived, dead Nhost/Jest-era tooling was removed, and a reusable `.com` email audit command was added.

### Still Open

9. `/ops/customer-queries` remains weakly protected for a privileged temporary internal tool.
   It still uses browser token persistence and a shared header-token boundary for service-role operations.

10. The root and CAD code trees still contain duplicated live implementations.
    This remains the main maintainability risk inside the repo.

11. Planner workflow gating is still too weak.
    Step unlock logic still depends too heavily on one boolean gate.

12. BOQ persistence and route naming are not fully normalized.
    `/quote-cart` remains as compatibility debt and the root/CAD persisted handoff stores still drift.

13. AI-backed public routes are still protected inconsistently.
    Rate limiting is not yet consistent across all relevant endpoints.

14. Observability remains light.
    Several fallback-heavy paths rely mainly on logs rather than explicit operational signals.

### Platform Blockers

15. Vercel Git-triggered production deploys are blocked by project collaboration policy.
   The project rejected commits first for invalid commit attribution and then because the GitHub user associated with the commit does not have contributing access to the Vercel project.

16. Cloudflare CAD deploys are blocked by Worker size limits.
   The generated OpenNext Worker exceeds the current 3 MiB limit for the active plan.

## 30 Review Parameters

| # | Parameter | Status | Evidence / note |
|---|---|---|---|
| 1 | Repo topology | Warn | Root app plus CAD workspace still creates drift pressure. |
| 2 | Root build | Pass | `npm run build` passes. |
| 3 | CAD build | Pass | `npm -w cad-suite run build` passes. |
| 4 | Release gate | Pass | `npm run release:gate` passes. |
| 5 | CI presence | Pass | CI workflow coverage was added in the repo. |
| 6 | Root lint | Pass | `npm run lint` passes. |
| 7 | CAD lint | Pass | `npm -w cad-suite run lint` passes. |
| 8 | Root unit-test runner | Pass | `npm test` now uses the active Vitest path. |
| 9 | Planner Vitest suite | Pass | `npm run test:planner` passes. |
| 10 | Coverage/reporting confidence | Warn | Baseline confidence improved, but coverage governance is still not deep. |
| 11 | Type-safety verification | Warn | TypeScript runs inside build successfully, but no standalone `tsc --noEmit` proof is captured here. |
| 12 | Workspace boundary clarity | Warn | Split root/CAD runtime structure still exists. |
| 13 | Code duplication | Fail | Root and CAD still duplicate live code paths. |
| 14 | Persistence model | Warn | Planner handoff state still exists in more than one place. |
| 15 | Persistence schema compatibility | Warn | Same BOQ/quote-era store lineage still carries schema-drift risk. |
| 16 | Planner workflow correctness | Warn | Step gating remains weaker than desired. |
| 17 | Planner UI/test contract | Pass | Active planner tests now align with shipped UI. |
| 18 | 3D geometry contract | Pass | Runtime and tests align on `2100 mm`. |
| 19 | Authentication | Mixed | `/admin` is stronger; temporary ops tooling still bypasses that model. |
| 20 | Authorization | Warn | Shared token authorization remains for the internal tool. |
| 21 | 2FA coverage | Mixed | Admin shell includes it; temporary ops tooling does not. |
| 22 | Secret handling | Warn | Internal admin token persistence remains in browser storage. |
| 23 | Service-role usage | Warn | Service-role access is still reachable through a temporary weak boundary. |
| 24 | API input validation | Mixed | Some normalization exists, but security boundaries need more work. |
| 25 | Abuse protection | Warn | AI route protection is still inconsistent. |
| 26 | Database resilience | Pass with warning | Fallback chains are resilient, but visibility is still light. |
| 27 | Observability | Warn | Failure handling is still log-centric in several paths. |
| 28 | SEO metadata | Pass | CAD metadata base was added. |
| 29 | Product wording consistency | Pass with warning | Active planner BOQ wording is improved, but compatibility route debt remains. |
| 30 | Maintainability / deployment readiness | Warn | Repo is healthier, but deploy governance is not fully normalized. |

## File Evidence

### Release and validation

- `package.json`
- `.github/workflows/ci.yml`
- `apps/cad-suite/package.json`
- `apps/cad-suite/eslint.config.mjs`
- `apps/cad-suite/next.config.ts`

### Planner contract and workflow

- `apps/cad-suite/src/features/planner/hooks/usePlannerWorkspace.ts`
- `apps/cad-suite/src/components/draw/SmartdrawPlanner.tsx`
- `apps/cad-suite/src/components/draw/SmartdrawPlanner.test.tsx`
- `apps/cad-suite/src/features/planner/ui/StepBar.tsx`
- `apps/cad-suite/src/features/planner/3d/types.ts`
- `apps/cad-suite/src/features/planner/3d/types.test.ts`
- `apps/cad-suite/src/features/planner/data/plannerCatalog.ts`
- `apps/cad-suite/src/features/planner/data/plannerManagedProducts.ts`
- `apps/cad-suite/src/app/quote-cart/page.tsx`
- `apps/cad-suite/src/lib/store/quoteCart.ts`
- `src/lib/store/quoteCart.ts`

### Internal ops and auth boundary

- `apps/cad-suite/src/app/ops/customer-queries/CustomerQueriesOpsClient.tsx`
- `apps/cad-suite/src/app/ops/customer-queries/page.tsx`
- `apps/cad-suite/src/app/api/customer-queries/manage/route.ts`
- `apps/cad-suite/src/lib/supabaseAdmin.ts`
- `apps/cad-suite/src/app/admin/layout.tsx`

### Deploy and platform evidence

- `.vercel/project.json`
- `apps/cad-suite/.vercel/project.json`
- `apps/cad-suite/wrangler.jsonc`

## Plan Status

### Phase 0: validation and release gates

Status:
completed on the repo side

Completed:

1. root lint passes
2. CAD lint passes
3. root tests pass
4. planner tests pass
5. release gate passes
6. CI workflow coverage was added

### Phase 1: BOQ contract cleanup

Status:
partially completed

Completed:

1. active planner BOQ wording was cleaned up
2. stale planner tests were updated
3. canonical `2100 mm` contract was locked into tests

Still open:

1. decide whether `/quote-cart` stays as a compatibility route
2. remove remaining price/schema debt from persisted planner handoff state
3. normalize BOQ terminology in surrounding docs and compatibility surfaces

### Phase 2: temporary internal tool hardening

Status:
not completed

Open:

1. move `/ops/customer-queries` behind stronger access control or internal-only delivery
2. remove browser token persistence
3. replace shared token auth if the tool remains
4. define a removal owner and deadline

### Phase 3: planner workflow correctness

Status:
partially completed

Completed:

1. stale planner UI/test contract was fixed
2. planner server-data loading was hardened against optional-data failures

Still open:

1. replace weak step gating with real stage prerequisites
2. consolidate or isolate duplicated BOQ handoff state
3. reduce duplicated root/CAD live implementations

### Phase 4: production hygiene

Status:
partially completed

Completed:

1. `metadataBase` was added to the CAD app
2. CAD Vercel manual production deploy succeeded

Still open:

1. add consistent rate limiting to remaining AI-backed routes
2. improve fallback observability
3. normalize Vercel project access and root-directory configuration
4. resolve Cloudflare Worker size-limit blockage

### Phase 5: consolidate CAD into the root app

Status:
planned, not started as a dedicated migration

Reason:

- this is still a real architectural improvement path
- it was intentionally not mixed into cleanup and deploy repair work

## Final Checklist

### Completed repo-side items

- [x] Fix root lint
- [x] Fix CAD lint
- [x] Replace broken root test path with the active runner model
- [x] Make planner tests pass
- [x] Strengthen repo release gate
- [x] Add CI workflow coverage
- [x] Fix CAD build blockers
- [x] Clean active planner BOQ wording in the shipped planner surface
- [x] Fix stale planner tests and wall-height contract drift
- [x] Harden planner catalog loading against deploy-time optional-data failures
- [x] Add `metadataBase` to the CAD app
- [x] Archive significant unused CAD files
- [x] Remove dead Nhost/Jest-era tooling
- [x] Add a reusable `.com` email audit script
- [x] Push both GitHub repos

### Remaining repo/platform items

- [ ] Put `/ops/customer-queries` behind stronger access control or remove it
- [ ] Remove `customer_queries_admin_token` browser persistence
- [ ] Replace shared token header auth if the tool remains
- [ ] Replace weak planner stage unlock logic
- [ ] Consolidate duplicated BOQ handoff state
- [ ] Decide whether `/quote-cart` remains as a compatibility route
- [ ] Add rate limiting to remaining AI-backed endpoints
- [ ] Improve runtime fallback observability
- [ ] Fix Vercel project contributor/access rules for normal Git-triggered deploys
- [ ] Normalize the CAD Vercel root-directory setup
- [ ] Resolve Cloudflare Worker size-limit blockage
- [ ] Execute the CAD-to-root migration only as a dedicated follow-up phase

## Honest Notes For Review

- The repo-side plan is complete enough for a serious engineering review.
- The repo is no longer blocked by the broken validation state described in the original audit.
- The current blocker profile is now mostly platform governance and long-term architecture, not immediate code health.
- The successful manual Vercel deploy proves the CAD app can be built and deployed from the current repo, but the normal Git-based deploy path is still not healthy.
- Cloudflare is currently a plan/size problem, not a source-code build problem.
