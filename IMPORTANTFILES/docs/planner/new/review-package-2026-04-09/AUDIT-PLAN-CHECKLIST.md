# Planner Repo Audit, Plan, and Checklist

Generated: 2026-04-09

## Purpose

This document is the current reviewer package for the planner-related codebase.

It combines:

- a repo audit
- a remediation plan
- an execution checklist

This version reflects the current working tree and these locked clarifications:

- `/ops/customer-queries` is a temporary internal tool
- `2100 mm` is the intended canonical planner wall height
- the planner handoff is BOQ-only, not quote pricing

## Scope

Audited surfaces:

- root app
- `apps/cad-suite`
- planner-adjacent ops and handoff flows
- release and validation tooling

Current working-tree note:

- the worktree is not clean
- local uncommitted CAD changes are present in:
  - `apps/cad-suite/src/app/portfolio/page.tsx`
  - `apps/cad-suite/src/app/social/page.tsx`
  - `apps/cad-suite/src/data/site/routeCopy.ts`
  - `apps/cad-suite/src/lib/fonts.ts`

## Commands Run

```powershell
npm run lint
npm test
npm run test:planner
npm -w cad-suite run lint
npm run build
npm -w cad-suite run build
rg -n "Room Shell - Walls and basic shapes|Stage 2 Catalog|Stage 3 Measure|Stage 4 Review|Space|Catalog|Measure|Review" apps/cad-suite/src/components/draw/SmartdrawPlanner.test.tsx apps/cad-suite/src/features/planner/ui/StepBar.tsx
rg -n "DEFAULT_WALL_HEIGHT_MM|DEFAULT_ROOM_HEIGHT_MM|wallHeightMm: 3000|wallHeightMm: 2100|wallHeightMm" apps/cad-suite/src/features/planner/3d/types.ts apps/cad-suite/src/features/planner/lib/documentBridge.ts apps/cad-suite/src/features/planner/3d/types.test.ts
rg -n "quote-cart-v1|plannerDimensions|price\\?|plannerFamily" apps/cad-suite/src/lib/store/quoteCart.ts src/lib/store/quoteCart.ts
rg -n "rateLimit|OPENAI_API_KEY|OPENROUTER_API_KEY|createSupabaseAdminClient\\(|export async function POST|export async function GET" apps/cad-suite/src/app/api/filter/route.ts apps/cad-suite/src/app/api/generate-alt/route.ts apps/cad-suite/src/app/api/ai-advisor/route.ts apps/cad-suite/src/app/api/nav-search/route.ts
```

## Executive Summary

The repo is buildable, but it is not review-clean.

The biggest problems are not visual polish or isolated test failures. They are:

1. broken release signal
2. weak or temporary privilege boundaries for internal ops tooling
3. planner contract drift between BOQ intent, route naming, UI wording, and persisted state
4. duplicated live code paths that are still easy to drift apart

## Findings

### High

1. Production deploy gating is materially too weak.
   `vercel:prod` only depends on one Playwright smoke test in `package.json`.
   It does not require root tests, planner tests, root build, or CAD lint.
   There is also no `.github/workflows` directory in the repo.

2. Root lint produces a false green.
   `npm run lint` only targets `src/app`, `src/components`, and `src/lib`.
   It does not cover `apps/cad-suite`, which is currently the canonical planner runtime.

3. CAD lint is broken.
   `npm -w cad-suite run lint` crashes while linting `apps/cad-suite/next.config.ts`.
   That means there is no trustworthy static-analysis signal for the planner workspace.

4. Root Jest is effectively unconfigured.
   `jest.config.cjs` contains only `passWithNoTests: true`.
   `npm test` fails from test-runner collection/configuration issues rather than from a clean, trustworthy unit-test pass/fail model.

### Medium

5. `/ops/customer-queries` is still a weakly protected privileged tool even after clarifying it is temporary internal-only.
   The page stores an admin token in browser `localStorage`, sends it via `x-admin-token`, and reaches Supabase service-role access through that boundary.
   If this route is public internet reachable, severity returns to high immediately.

6. Planner wording and route naming still carry quote-era residue, even though product intent is BOQ-only.
   The active planner surface has been moved to BOQ wording, but the compatibility route remains `/quote-cart` and several ops/docs references still describe a quote-era flow.
   The product is cleaner than before, but naming debt remains until the route model and surrounding docs are normalized.

7. The quote-cart state contract is forked across root and CAD while sharing the same persistence key.
   Both stores persist to `quote-cart-v1`, but they do not share the same item shape.
   This is an avoidable drift trap even if the planner is now BOQ-only.

8. Planner stage gating is too weak.
   `canEnterCatalog`, `canEnterMeasure`, and `canEnterReview` all collapse to `hasRoomShellDraft`.
   Measure and Review unlock as soon as a room shell exists, not when the stage prerequisites are actually complete.

9. Planner UI tests are stale relative to the shipped UI.
   Tests still expect the older "Room Shell" and "Stage 2/3/4" copy while the actual step bar is `Space`, `Catalog`, `Measure`, `Review`.

10. The 3D wall-height issue is test drift, not implementation drift.
    `2100 mm` is the intended canonical wall height and the implementation already reflects that.
    The failing Vitest expectation is the stale artifact.

11. AI-backed public routes are inconsistently protected.
    `nav-search` has explicit rate limiting.
    `filter`, `generate-alt`, and `ai-advisor` do not.

12. The repo still maintains duplicated live implementations across root and CAD.
    This is not theoretical.
    Identical copies of API routes and shared libs exist in both code trees, which keeps future divergence cheap and likely.

### Low / Watchlist

13. CAD metadata is still incomplete for production SEO.
    `metadataBase` is not set in the CAD app layout even though the root helper supports it.

14. Business-stats fallback behavior is resilient but quiet.
    The fallback chain prevents hard failure, but it can mask data freshness problems if nobody is watching logs.

## 30 Review Parameters

| # | Parameter | Status | Evidence / note |
|---|---|---|---|
| 1 | Repo topology | Warn | Root app plus CAD workspace plus archive/docs creates drift pressure. |
| 2 | Root build | Pass | `npm run build` passed in this session. |
| 3 | CAD build | Pass | `npm -w cad-suite run build` passed on the current dirty worktree. |
| 4 | Release gate | Fail | `vercel:prod` is not gated by the full validation stack. |
| 5 | CI presence | Warn | No `.github/workflows` directory found. |
| 6 | Root lint | Mixed | Passes, but scope excludes the CAD planner workspace. |
| 7 | CAD lint | Fail | Crashes before completing. |
| 8 | Root unit-test runner | Fail | Jest config is not adequate for the collected test surface. |
| 9 | Planner Vitest suite | Pass | `npm run test:planner` passes after stale contract fixes. |
| 10 | Coverage reporting | Fail | Coverage depends on the same broken Jest path. |
| 11 | Type-safety verification | Unknown | No standalone `tsc --noEmit` proof was collected in this pass. |
| 12 | Workspace boundary clarity | Warn | Root rewrites hide a split app boundary behind a single public route model. |
| 13 | Code duplication | Fail | Identical live implementations exist in root and CAD. |
| 14 | Persistence model | Warn | Planner handoff state is duplicated. |
| 15 | Persistence schema compatibility | Fail | Same storage key, different item shapes. |
| 16 | Planner workflow correctness | Fail | Stage unlock logic is too weak. |
| 17 | Planner UI/test contract | Fail | Tests target stale copy and behavior assumptions. |
| 18 | 3D geometry contract | Warn | Runtime is correct at `2100 mm`; tests/spec are stale. |
| 19 | Authentication | Mixed | `/admin` is protected correctly; temporary ops tooling is not aligned to the same model. |
| 20 | Authorization | Warn | Internal tool relies on shared token header instead of user-role authorization. |
| 21 | 2FA coverage | Mixed | Admin shell includes it; temporary ops tool bypasses that shell. |
| 22 | Secret handling | Warn | Internal admin token is persisted in browser storage. |
| 23 | Service-role usage | Warn | Server-side only, but reachable through a temporary weak boundary. |
| 24 | API input validation | Mixed | Normalization exists, but privilege boundaries are still weaker than they should be. |
| 25 | Abuse protection | Warn | AI routes are not protected consistently. |
| 26 | Database resilience | Pass with warning | Business-stats fallback chain is robust but can hide freshness issues. |
| 27 | Observability | Warn | Failure handling is log-centric and limited. |
| 28 | SEO metadata | Warn | CAD layout still lacks `metadataBase`. |
| 29 | Product wording consistency | Fail | Quote terminology remains in a BOQ-only product path. |
| 30 | Maintainability / review readiness | Fail | Review can happen, but repo governance and validation signal are not head-programmer clean. |

## File Evidence

### Release and validation

- `package.json`
- `jest.config.cjs`
- `apps/cad-suite/package.json`
- `apps/cad-suite/eslint.config.mjs`
- `apps/cad-suite/next.config.ts`

### Planner contract and workflow

- `apps/cad-suite/src/features/planner/hooks/usePlannerWorkspace.ts`
- `apps/cad-suite/src/components/draw/SmartdrawPlanner.test.tsx`
- `apps/cad-suite/src/features/planner/ui/StepBar.tsx`
- `apps/cad-suite/src/features/planner/3d/types.ts`
- `apps/cad-suite/src/features/planner/lib/documentBridge.ts`
- `apps/cad-suite/src/features/planner/3d/types.test.ts`
- `apps/cad-suite/src/features/planner/lib/quoteBridge.test.ts`
- `apps/cad-suite/src/app/quote-cart/page.tsx`
- `apps/cad-suite/src/lib/store/quoteCart.ts`
- `src/lib/store/quoteCart.ts`

### Internal ops and auth boundary

- `apps/cad-suite/src/app/ops/customer-queries/CustomerQueriesOpsClient.tsx`
- `apps/cad-suite/src/app/ops/customer-queries/page.tsx`
- `apps/cad-suite/src/app/api/customer-queries/manage/route.ts`
- `apps/cad-suite/src/lib/supabaseAdmin.ts`
- `apps/cad-suite/src/app/admin/layout.tsx`
- `apps/cad-suite/src/app/admin/(protected)/layout.tsx`

### API abuse protection

- `apps/cad-suite/src/app/api/filter/route.ts`
- `apps/cad-suite/src/app/api/generate-alt/route.ts`
- `apps/cad-suite/src/app/api/ai-advisor/route.ts`
- `apps/cad-suite/src/app/api/nav-search/route.ts`

## Remediation Plan

## Phase 0: Fix the review signal first

Goal:
make the repo trustworthy before changing more planner behavior

Actions:

1. make root and CAD lint both pass
2. replace or properly scope the root Jest path
3. make planner Vitest green
4. widen production release gating to require real validation, not one smoke test
5. add CI workflow coverage for the validation stack

Exit criteria:

- `npm run lint` is meaningful
- `npm -w cad-suite run lint` passes
- `npm test` is either fixed or intentionally replaced
- `npm run test:planner` passes
- deploy gating enforces the real release checks

## Phase 1: Correct planner product contract drift

Goal:
make the product language and state model match BOQ reality

Actions:

1. rename quote wording in planner UI to BOQ wording
2. rename quote-oriented handler names where they encode wrong product meaning
3. decide whether `/quote-cart` stays as a route alias or is replaced by a BOQ-specific route
4. remove dead `price` semantics from planner handoff state if pricing is intentionally absent
5. align tests and docs to BOQ-only expectations

Exit criteria:

- no planner UX copy promises quote pricing
- planner handoff data is quantity-only by design
- tests and docs use BOQ terminology consistently

## Phase 2: Harden temporary internal ops surfaces

Goal:
reduce security debt while the internal tool still exists

Actions:

1. move `/ops/customer-queries` behind the same authenticated admin boundary or a network restriction
2. remove browser `localStorage` token persistence
3. replace shared header-token auth with user/session/role authorization where practical
4. document explicit removal or migration deadline for the temporary tool

Exit criteria:

- temporary internal tool is not casually reachable
- no privileged browser token is persisted in local storage
- service-role access is no longer exposed through a shared static browser token path

## Phase 3: Fix planner workflow and state integrity

Goal:
make planner stage progression and BOQ handoff structurally correct

Actions:

1. replace one-boolean stage gating with real stage prerequisites
2. separate root and CAD persisted handoff state, or consolidate them into one canonical implementation
3. remove duplicated live planner-adjacent code where possible
4. update stale UI tests to match actual runtime behavior
5. make the `2100 mm` wall-height rule explicit in tests and docs

Exit criteria:

- step gating reflects actual workflow requirements
- persisted BOQ handoff does not rely on competing store definitions
- planner tests are contract tests, not history tests

## Phase 4: Production hardening

Goal:
close the review package with deploy-grade hygiene

Actions:

1. set `metadataBase` in the CAD app
2. add consistent rate limiting to public AI-backed routes
3. tighten fallback visibility for business-stats and similar runtime degradation paths
4. update reviewer docs after each completed phase

Exit criteria:

- CAD metadata is production-complete
- public AI routes have consistent abuse protection
- fallback-heavy paths have visible operational signals

## Phase 5: Consolidate CAD into the root app

Goal:
move the active CAD runtime out of `apps/cad-suite` and into the root app without breaking routes, validation, or deploys

Actions:

1. map every root script, workspace alias, test path, deploy config, and doc reference that currently assumes `apps/cad-suite`
2. choose the target root boundary for the CAD app (`src/app`, shared components, shared lib, and public assets) before moving files
3. move active CAD runtime code only; keep dead or legacy files archived instead of re-importing them into the root app
4. update root path aliases, Vitest coverage/include paths, package scripts, and build assumptions to the new locations
5. collapse duplicated root/CAD implementations where the CAD app is already the canonical runtime
6. update Cloudflare/Vercel/deploy configuration so production no longer depends on a second app folder
7. re-run the full release gate after the migration and refresh reviewer docs with the new canonical structure

Exit criteria:

- no production path depends on `apps/cad-suite` as a separate app
- root validation and deploy scripts operate on one canonical app tree
- archived CAD-only dead files stay out of the live runtime
- docs describe one app boundary instead of a root-plus-CAD split

## Checklist

### Phase 0: validation and release gates

- [x] Fix `npm -w cad-suite run lint`
- [x] Decide the future of root `npm test`: fix Jest or replace the command with the intended runner model
- [x] Make `npm run test:planner` pass
- [x] Update `vercel:prod` so it depends on meaningful validation
- [x] Add CI workflow coverage for lint, build, and planner tests
- [x] Re-run full validation and capture fresh proof in docs

### Phase 1: BOQ contract cleanup

- [x] Replace quote-era planner copy in the active planner surface with BOQ language
- [x] Rename quote-oriented planner handlers in the active planner surface where naming misstates product behavior
- [ ] Decide whether `/quote-cart` remains as a compatibility route or is renamed
- [ ] Remove planner `price` semantics if they are permanently out of scope
- [ ] Update docs that still describe quote submission as the planner end state
- [ ] Update tests to assert BOQ-only handoff behavior

### Phase 2: temporary internal tool hardening

- [ ] Put `/ops/customer-queries` behind stronger access control or internal-only delivery
- [ ] Remove `customer_queries_admin_token` browser persistence
- [ ] Replace shared token header auth if the tool remains longer than temporary
- [ ] Define an owner and removal deadline for the temporary tool

### Phase 3: planner workflow correctness

- [ ] Replace single-boolean stage unlocks with real stage prerequisites
- [ ] Consolidate or isolate the duplicated BOQ handoff store
- [ ] Remove or reduce duplicated root/CAD live implementations
- [ ] Update stale planner UI tests to match actual step labels and workflow
- [ ] Lock `2100 mm` into tests and docs as canonical wall height

### Phase 4: production hygiene

- [x] Add `metadataBase` to the CAD app layout
- [ ] Add rate limiting to remaining public AI-backed endpoints
- [ ] Improve fallback observability for business-stats and similar paths
- [ ] Publish a new clean review package after remediation

### Phase 5: CAD-to-root migration

- [ ] Inventory every script, config, alias, and deploy reference tied to `apps/cad-suite`
- [ ] Define the target root locations for CAD app routes, components, libs, and public assets
- [ ] Move only the active CAD runtime into the root app
- [ ] Keep unused CAD files in archive instead of reintroducing them
- [ ] Remove or merge duplicate root/CAD implementations after the move
- [ ] Rewire build, test, and deploy tooling to one app boundary
- [ ] Publish an updated reviewer package after the migration

## Honest Notes For Review

- This repo can be reviewed today, but the release signal is not yet trustworthy enough for a clean leadership signoff.
- The wall-height implementation should not be treated as a runtime bug. The stale test is the bug.
- The customer-queries tool should be reviewed as temporary internal debt, not as a permanent platform pattern.
- The planner is materially closer to a BOQ workflow than the codebase naming currently admits.
- Moving CAD into the root app is feasible, but it should be treated as a dedicated migration phase, not folded into routine cleanup.
