# Full Audit Plan and Checklist

Generated: 2026-04-09  
Scope: full repo (`root` + `apps/cad-suite`) including deploy paths (Vercel + Cloudflare)

## 1) Executive Audit Summary

The codebase is now buildable and testable on both app surfaces, but production readiness is still blocked by platform and security gaps.

Current risk profile:

- `Critical`: runtime/data integrity risk due to invalid Supabase public key behavior (`Unregistered API key`) in current build-time fetch paths
- `High`: Cloudflare CAD deploy blocked by Worker size limit
- `High`: privileged temporary ops surface uses weak token model
- `Medium`: planner workflow gating and BOQ persistence drift remain
- `Medium`: deploy governance still inconsistent between Vercel and Cloudflare

## 2) Audit Method

Validated using:

- static code/config scan (`rg`) for secrets, auth boundaries, planner gates, and deploy config
- runtime gate checks: `npm run release:gate`
- deploy inventory checks for both Vercel projects
- Cloudflare deploy attempts for root and CAD paths

## 3) Current State Snapshot

### Validation

- Root lint: `pass`
- CAD lint: `pass`
- Root tests: `pass`
- Planner tests: `pass`
- Root build: `pass`
- CAD build: `pass`
- Full release gate: `pass`

### Deployment

- Vercel main project: recent production deploys `ready`
- Vercel CAD project: manual production deploy path works, git-trigger path still intermittently policy/config-sensitive
- Cloudflare main: build completes, deploy blocked by Wrangler remote-mode auth in this environment
- Cloudflare CAD: deploy blocked by Worker size limit (`3 MiB` cap)

### Security/Config

- old key literals requested for removal are no longer found in active source/config scan
- `.next` and `.open-next` directories were cleaned repo-wide
- temporary ops privileged route still uses weak token model (not yet hardened)

## 4) Findings by Severity

## Critical

1. Supabase public key/runtime validity mismatch is still active in execution logs.
   Impact: catalog/planner data can degrade to empty/fallback behavior in production paths.
   Evidence: release-gate build logs show repeated `Unregistered API key`.

## High

2. CAD Cloudflare deploy blocked by Worker size limit.
   Impact: CAD cannot be shipped to Cloudflare on current plan/shape.
   Evidence: deploy error `code: 10027`, `handler.mjs ~15073 KiB`.

3. Temporary privileged ops tool has weak auth boundary.
   Impact: static token model is vulnerable if exposed.
   Evidence files:
   - `apps/cad-suite/src/app/ops/customer-queries/CustomerQueriesOpsClient.tsx`
   - `apps/cad-suite/src/app/api/customer-queries/manage/route.ts`
   - `apps/cad-suite/src/lib/supabaseAdmin.ts`

## Medium

4. Planner stage gating is too permissive (`catalog/measure/review` all tied to one room-shell boolean).
   Evidence: `apps/cad-suite/src/features/planner/hooks/usePlannerWorkspace.ts`.

5. BOQ persistence contract drift remains between root and CAD stores while sharing key `quote-cart-v1`.
   Evidence:
   - `apps/cad-suite/src/lib/store/quoteCart.ts`
   - `src/lib/store/quoteCart.ts`

6. AI route protection is inconsistent.
   Evidence:
   - rate-limited: `apps/cad-suite/src/app/api/nav-search/route.ts`
   - not consistently rate-limited: `filter`, `generate-alt`, `ai-advisor` routes

## Low

7. Observability is still log-heavy with limited operational signalization on fallback paths.

## 5) Full Remediation Plan

## Phase 0: Stabilize Runtime Credentials (Immediate)

Goal: eliminate `Unregistered API key` behavior across build/runtime.

Actions:

1. rotate/sync one canonical active publishable key across:
   - root `.env.local`
   - `apps/cad-suite/.env.local`
   - Vercel main env
   - Vercel CAD env
   - Cloudflare root worker vars
   - Cloudflare CAD worker vars
2. verify Supabase project accepts the same anon/publishable key
3. rerun `npm run release:gate`
4. smoke-test key routes: `/products`, `/planner`, `/api/nav-search`

Exit criteria:

- no `Unregistered API key` logs in build/runtime
- catalog/planner return live data instead of fallback empty-path behavior

## Phase 1: Separate and Normalize Deploy Pipelines

Goal: keep root app and CAD app deploys independently deterministic.

Actions:

1. freeze Vercel linkage:
   - root project: `final-oando-0504`
   - CAD project: `oneandonly-cad-suite`
2. ensure CAD deploy uses one consistent method:
   - either git-trigger with contributor policy fixed
   - or explicit manual pipeline (`--archive=tgz`) until policy is fixed
3. resolve Cloudflare auth prerequisite (`wrangler login`) for root deploy path
4. document exact command matrix per app and provider

Exit criteria:

- root deploy command cannot accidentally deploy CAD
- CAD deploy command cannot accidentally deploy root

## Phase 2: Fix Cloudflare CAD Blocker

Goal: unblock CAD deployment to Cloudflare.

Actions:

1. choose one route:
   - upgrade Worker plan (supports larger script)
   - or shrink bundle architecture to fit current limit
2. if shrinking:
   - profile server bundle contributors
   - split heavy server paths where possible
   - remove unused heavy imports on server path
3. redeploy CAD Cloudflare and validate domain

Exit criteria:

- `npm run cf:cad:deploy` completes successfully
- `https://cad.oando.co.in` serves current CAD build

## Phase 3: Harden Temporary Privileged Ops Surface

Goal: reduce security debt while tool remains temporary.

Actions:

1. remove browser `localStorage` admin token persistence
2. replace shared header token with authenticated role/session gate
3. restrict route availability (admin shell or network-level restriction)
4. define owner + retirement date for this temporary surface

Exit criteria:

- no privileged static browser token path
- explicit decommission plan exists

## Phase 4: Planner Contract Integrity

Goal: make planner flow and BOQ handoff structurally consistent.

Actions:

1. replace single-boolean step gating with prerequisite-based transitions
2. unify or isolate BOQ persistence shape between root and CAD
3. keep active BOQ wording and phase out quote-route naming debt intentionally
4. add tests for gate transitions and BOQ persistence contract

Exit criteria:

- step progression enforces real workflow requirements
- handoff contract is consistent and test-covered

## Phase 5: API Abuse Protection and Observability

Goal: production hardening.

Actions:

1. add consistent rate limits to all AI-backed public endpoints
2. promote key fallback conditions into structured telemetry/alerts
3. track deploy-time and runtime health checks in one runbook

Exit criteria:

- all AI public endpoints have explicit abuse controls
- fallback-heavy systems are visible in ops telemetry

## 6) Master Checklist

### Runtime Credentials

- [ ] Confirm one active Supabase publishable/anon key pair
- [ ] Sync key pair to all local/env/platform surfaces
- [ ] Verify no `Unregistered API key` in root build logs
- [ ] Verify no `Unregistered API key` in CAD build logs

### Validation and Quality

- [x] `npm run lint`
- [x] `npm -w cad-suite run lint`
- [x] `npm test`
- [x] `npm run test:planner`
- [x] `npm run build`
- [x] `npm -w cad-suite run build`
- [x] `npm run release:gate`

### Deploy Separation

- [ ] Root Vercel deploy verified on current commit
- [ ] CAD Vercel deploy verified on current commit
- [ ] Root Cloudflare deploy verified
- [ ] CAD Cloudflare deploy verified
- [ ] Deploy matrix documented (`root/cad x vercel/cloudflare`)

### Cloudflare CAD Blocker

- [ ] Decide plan upgrade vs bundle reduction
- [ ] Implement chosen path
- [ ] Confirm CAD Cloudflare deploy success
- [ ] Verify `cad.oando.co.in` runtime

### Security Hardening

- [ ] Remove browser admin-token persistence from customer queries ops client
- [ ] Replace `x-admin-token` shared auth model
- [ ] Restrict temporary ops route exposure
- [ ] Add owner + removal deadline

### Planner Integrity

- [ ] Implement strict step prerequisites
- [ ] Resolve `quote-cart-v1` schema drift between root/CAD
- [ ] Add regression tests for planner gate rules
- [ ] Add regression tests for BOQ persistence contract

### API Protection and Observability

- [ ] Add rate limiting to `filter`
- [ ] Add rate limiting to `generate-alt`
- [ ] Add rate limiting to `ai-advisor`
- [ ] Add structured telemetry for catalog/planner fallback paths

## 7) Command Runbook

Validation:

```powershell
npm run release:gate
```

Vercel:

```powershell
# root app
vercel --prod --yes --archive=tgz

# cad app (use cad-linked project context)
vercel --prod --yes --archive=tgz
```

Cloudflare:

```powershell
# root app
npm run cf:deploy

# cad app
npm run cf:cad:deploy
```

## 8) Audit Exit Criteria

The audit is considered closed when:

1. all critical/high findings are either fixed or explicitly accepted with owner/date
2. both apps deploy cleanly to both providers or one provider is intentionally retired
3. planner and catalog runtime no longer show Supabase key-registration failures
4. temporary privileged ops surface has a hardened boundary or a removal date

## 9) Reviewer Notes

- This is a full execution-grade plan, not a static snapshot.
- Current repo quality is significantly improved, but production governance still depends on provider-side configuration discipline.
- The next blocking decision is Cloudflare CAD strategy: plan upgrade vs architectural size reduction.
