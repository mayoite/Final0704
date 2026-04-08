# Repo Audit 2026-04-08

## Scope

Static and command-line audit of the root app and the CAD Suite planner app for reviewer prep.

This audit is based on repo truth in the current working tree, not on older checklist claims.

## Commands Run

```powershell
npm run lint
npm -w cad-suite run lint
npm run test:planner
rg -n "SERVICE_ROLE|service_role|SUPABASE_SERVICE|NEXT_PUBLIC_.*SECRET|NEXT_PUBLIC_.*SERVICE|anon key|publishable" src apps supabase cloudflare wrangler.jsonc apps/cad-suite/wrangler.jsonc
rg -n "dangerouslySetInnerHTML|eval\(|new Function\(|innerHTML\s*=|document\.write\(|localStorage|sessionStorage" src apps
rg -n "Content-Security-Policy|CSP|security headers|Strict-Transport-Security|X-Frame-Options|Referrer-Policy|Permissions-Policy" src apps next.config.js wrangler.jsonc apps/cad-suite/wrangler.jsonc
rg -n "createClient\(|createServerClient\(|auth\.getUser\(|auth\.getSession\(|mfa\.|profiles\.role|app_role|RLS|row level security" src apps supabase
```

## 20 Review Parameters

| # | Parameter | Status | Evidence / note |
|---|---|---|---|
| 1 | Root lint | Pass | `npm run lint` passes after removing incompatible `react/*` rule loading from the shared flat config and fixing current source errors. |
| 2 | CAD Suite lint | Pass | `npm -w cad-suite run lint` passes. |
| 3 | Planner Vitest suite | Pass | `npm run test:planner` passes: 6 files, 22 tests. |
| 4 | Root build | Blocked by sandbox | Current shell sandbox throws `spawn EPERM`. This was not re-verified from source in this session because escalated build was denied. |
| 5 | CAD Suite build | Blocked by sandbox | Current shell sandbox throws `.next` unlink `EPERM`. This was not re-verified from source in this session because escalated build was denied. |
| 6 | Planner toolbar density | Improved in code | Toolbar now has `max-h-[31vh]`, denser control spacing, and icon-first utility labels on desktop with hover titles. |
| 7 | Planner top overlay hit area | Improved in code | Utility row is horizontal-scroll, reducing multi-row wrap pressure that previously bloated the header. |
| 8 | Docked panel top offset | Fixed in code | `WorkspacePanel` now honors `topPx` even when `docked`, instead of forcing `top: 0`. |
| 9 | Canvas centering against visible workspace | Fixed in code | `PlannerCanvas` now accepts top/left/right insets and `SmartdrawPlanner` passes unobscured workspace offsets based on pinned panels. |
| 10 | Planner canvas status pill overlap | Improved in code | Status pill moved inside the inset canvas area instead of sitting deep under the toolbar. |
| 11 | Root route hygiene in review page | Improved | `src/app/ops/planner-overhaul/page.tsx` now references `/planner` instead of stale `/planning` quick links. |
| 12 | Root lint toolchain stability | Improved | Shared ESLint config now strips incompatible `react/*` rules from imported Next flat configs. |
| 13 | Browser-exposed service-role key | Pass | No `NEXT_PUBLIC_*SERVICE*` or browser-exposed service-role env key was found. Public Supabase keys in wrangler configs are publishable/anon keys only. |
| 14 | Server-only service role usage | Pass with scope note | `SUPABASE_SERVICE_ROLE_KEY` access is confined to server-side helpers and API routes such as `src/lib/supabaseAdmin.ts` and `src/app/api/*`. |
| 15 | Planner admin browser security model | Pass in code | Planner repository supports `owner` and `admin` access modes, and planner docs/migrations show RLS-based admin oversight. |
| 16 | Security headers | Pass with warning | `next.config.js` defines `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, HSTS in production, and CSP. |
| 17 | CSP strictness | Warning | CSP currently allows `'unsafe-inline'` and `'unsafe-eval'` in `script-src`, which weakens XSS posture even though a CSP exists. |
| 18 | Unsafe dynamic code in shipped public assets | Warning | Legacy vendor bundles under `apps/cad-suite/public/vendors` and `apps/cad-suite/public/smartdraw/vendor` include `new Function`, `innerHTML`, and similar unsafe patterns. |
| 19 | Token storage in browser | Warning | `src/app/ops/customer-queries/CustomerQueriesOpsClient.tsx` stores `customer_queries_admin_token` in `localStorage`, which is a real security review concern. |
| 20 | Controlled HTML/script injection surfaces | Mixed but understood | App uses `dangerouslySetInnerHTML` mainly for JSON-LD script tags, which is controlled. No obvious first-party `eval` usage was found in app source. |

## Security Findings

### Clean signals

- No browser-exposed service-role key was found.
- Browser Supabase usage is aligned to publishable/anon keys.
- Planner admin browser access is implemented through normal client auth plus RLS-oriented repository logic.
- Security headers are configured centrally in [next.config.js](/C:/claude0104%20-%20Copy/next.config.js).

### Review risks

- `script-src` still allows `'unsafe-inline'` and `'unsafe-eval'` in [next.config.js](/C:/claude0104%20-%20Copy/next.config.js).
- Legacy public vendor bundles include unsafe dynamic code patterns.
- [CustomerQueriesOpsClient.tsx](/C:/claude0104%20-%20Copy/src/app/ops/customer-queries/CustomerQueriesOpsClient.tsx) stores an admin token in `localStorage`.

## Planner-Specific Code Changes In This Pass

- [SmartdrawPlanner.tsx](/C:/claude0104%20-%20Copy/apps/cad-suite/src/components/draw/SmartdrawPlanner.tsx)
- [PlannerToolbar.tsx](/C:/claude0104%20-%20Copy/apps/cad-suite/src/features/planner/ui/PlannerToolbar.tsx)
- [PlannerCanvas.tsx](/C:/claude0104%20-%20Copy/apps/cad-suite/src/features/planner/ui/PlannerCanvas.tsx)
- [PlannerDesktopPanels.tsx](/C:/claude0104%20-%20Copy/apps/cad-suite/src/features/planner/ui/PlannerDesktopPanels.tsx)
- [WorkspacePanel.tsx](/C:/claude0104%20-%20Copy/apps/cad-suite/src/features/planner/ui/WorkspacePanel.tsx)
- [StepBar.tsx](/C:/claude0104%20-%20Copy/apps/cad-suite/src/features/planner/ui/StepBar.tsx)

## Remaining Honest Blockers

- Fresh root build proof from this exact working tree is still blocked by current sandbox restrictions.
- Fresh CAD build proof from this exact working tree is still blocked by current sandbox restrictions.
- Live browser proof of the current toolbar/canvas compaction pass is still blocked in this session because browser launch escalation was denied.
- `customer_queries_admin_token` should be moved out of `localStorage` before a hard security review.
- CSP should be tightened if the legacy vendor/runtime dependencies can be reduced.

## Reviewer Summary

If the expert review happens on source and command evidence, the repo is in materially better shape than before this pass:

- root lint is green
- CAD lint is green
- planner tests are green
- planner toolbar/panel/canvas layout logic has been corrected toward a compact visible workspace model
- the main real security concerns are now explicit and narrow, not hidden

The two biggest remaining evidence gaps are fresh build proof and live browser proof from this exact tree, both blocked here by denied escalation rather than by known source failures.
