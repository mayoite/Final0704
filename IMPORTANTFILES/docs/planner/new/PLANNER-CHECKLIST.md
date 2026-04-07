# Planner Checklist

Generated: 2026-04-07

## Purpose

This is the execution checklist for the canonical planner plan.

Use this with `PLANNER-DETAILED-PLAN.md`.

## Locked Decisions

- [x] Canonical planner base is `apps/cad-suite`
- [x] Sole donor snapshot is `07docs/Backupcad`
- [x] Planner docs are split into `old` and `new`
- [x] One canonical Supabase-backed plan store is required
- [x] Existing site product data remains the legacy read-only planner read source
- [x] Planner save/write data may live in a separate new write-side store for now
- [x] Any newly added planner-managed products should go to the new write-side store only
- [x] A normalized adapter contract is required across old read and new write sources
- [x] Import must be easy from inside the planner
- [x] One shared auth model must serve admin and general users
- [x] Admin browser access must use Supabase client plus RLS, never service-role in browser
- [x] Measurement must use one canonical internal unit model
- [x] Planner theme should broadly match the site
- [x] Tldraw stays the base engine, but planner UX must improve well beyond stock Tldraw behavior

## Current Status

| Area | Status | Rough completion |
|---|---|---|
| Planner direction and docs | Established | 85% |
| Theme alignment | Site CSS and typography reuse wired in | 65% |
| Phase 1 refactor | Session, panel, measurement, and quote boundaries extracted | 70% |
| Phase 2 document/save/load/import foundation | Core document/session flow is live, measurement persistence is normalized, and planner save schema/RLS hardening is in repo; write-side product store and merged adapter remain open | 80% |
| Phase 3 2D/3D document bridge | Basic bridge implemented with honest preview route | 65% |
| Session/cache behavior | Sticky error state plus 24-hour local draft cache implemented | 100% |
| Build and deploy stability | Not solved yet | 20% |
| Final production hardening | Not done | 15% |

## Interim Architecture Reminder

- `legacy` catalog database is read-only for now
- `new` planner/product database is the write target for new planner-managed data
- new products should be created only in the new database
- the application must normalize both sources into one catalog shape
- this is an interim strategy, not the final end-state

## Recheck Notes

- `planner_saves` now has owner-managed RLS plus planner admin read/update oversight groundwork through `profiles.role = 'admin'`
- planner product reads still come only from the legacy catalog adapter; there is no live `planner_managed_products` write-side store yet
- import validation exists, semantic scene geometry is normalized toward canonical `mm`, and saved-row restore now routes back through canonical normalization
- browser admin access is a documented rule and the normal browser Supabase client exists; `planner_saves` now has admin read/update groundwork, but the end-to-end planner admin browser workflow is still not proven

## Package Decisions

### Keep now

| Package | Status | Why |
|---|---|---|
| `tldraw` | Keep | Canonical 2D planner engine |
| `zustand` | Keep | Planner-side state, quote bridge, and future planner store |
| `@supabase/ssr` | Keep | Browser and server auth/session model |
| `@supabase/supabase-js` | Keep | Planner persistence and admin browser data access |
| `vaul` | Keep | Mobile planner drawer UX |
| `zod` | Keep | Import and planner document validation |

### Keep for later phases

| Package | Status | Why |
|---|---|---|
| `@react-three/fiber` | Keep for Phase 3 | Optional unified 3D mode |
| `@react-three/drei` | Keep for Phase 3 | Optional unified 3D mode |
| `three` | Keep for Phase 3 | Optional unified 3D mode |
| `openai` | Keep if AI planner assistance remains in scope | Planner assistant and planner-adjacent AI flows |

### Shared site-shell support

| Package | Status | Why |
|---|---|---|
| `framer-motion` | Keep | Planner motion should feel like the site |
| `clsx` | Keep | Existing styling composition helper |
| `tailwind-merge` | Keep | Existing styling composition helper |
| `@radix-ui/*` | Keep selectively | Existing primitives for dialogs, tabs, and menus |

### Donor-only reference

| Package | Status | Why |
|---|---|---|
| `fabric` | Do not adopt into canonical planner | Donor 2D editor model is not the canonical Tldraw planner |

### Reserved for planned planner work

| Package | Status | Intended use |
|---|---|---|
| `react-konva` and `konva` | Keep reserved | Secondary 2D canvas tooling, overlays, or constrained editor surfaces if Tldraw does not fit a sub-problem |
| `@thi.ng/geom-hull` | Keep reserved | Polygon hull generation and room-outline cleanup |
| `alpha-shape` | Keep reserved | Polygon boundary reconstruction and enclosure calculations |
| `bezier-js` | Keep reserved | Curves, rounded corners, and wall-path calculations where needed |
| `line-intersect` | Keep reserved | Wall joins, segment intersection math, and measurement rules |
| `@tanstack/react-query` | Keep reserved | Planner data synchronization and async cache if persistence surfaces grow |
| `html2canvas` | Keep reserved | Planner image snapshots and raster export capture |
| `jspdf` | Keep reserved | PDF export for plans, quote summaries, and printable layouts |
| `jszip` | Keep reserved | Bundled export packages for plan files and related assets |
| `axios` | Keep reserved | Optional client abstraction for external planner APIs if native `fetch` becomes awkward |
| `point-in-polygon` | Keep reserved | Polygon containment checks, hit-testing, and layout validation rules |

### Review later

| Package | Current signal | Action |
|---|---|---|

## Theme Alignment Checklist

- [x] Reuse the site token family from `src/app/theme-tokens.css`
- [x] Reuse the site font direction from `src/app/typography.css`
- [x] Bring planner shell colors closer to the site's blue, white, bronze, and neutral surface family
- [x] Bring planner panels onto the site's radius, border, and shadow language
- [ ] Align primary actions, save/import buttons, and selection states with site hierarchy
- [ ] Keep canvas and dense tools operational rather than over-styled
- [ ] Validate desktop and mobile planner surfaces against the main site feel

## Phase 0 Checklist

- [x] Add a reconciliation migration for `planner_saves` schema drift before deployment
- [ ] Make `npm -w cad-suite run build` pass
- [ ] Make `npm -w cad-suite run cf:build` pass
- [ ] Confirm planner routes still load after build fixes
- [ ] Remove obvious contract drift in planner props and route boundaries
- [ ] Audit planner package list against actual imports and planned geometry usage before feature expansion

## Phase 1 Checklist

- [ ] Split `SmartdrawPlanner.tsx` into shell, core logic, state, and quote bridge
- [x] Extract measurement and geometry utilities into planner feature modules
- [x] Extract session/save/load/import workflow into `features/planner/hooks/usePlannerSession.ts`
- [x] Extract planner quote-cart payload building into `features/planner/lib/quoteBridge.ts`
- [ ] Decide where reserved geometry packages actually fit and avoid overlapping abstractions
- [x] Move planner panels under a `features/planner/ui` boundary
- [ ] Separate editor state from UI state
- [ ] Improve stock Tldraw behavior with planner-grade tools, joins, snapping, and constrained editing
- [x] Define canonical internal unit model in millimeters
- [ ] Finish display conversion rules for `mm` and `ft-in` across all planner surfaces
- [x] Align planner shell theme to site tokens and typography

## Phase 2 Checklist

- [x] Define canonical planner document schema
- [x] Create Supabase-backed plan repository abstraction
- [x] Keep product reads on the legacy read-only site product catalog source
- [ ] Define the new write-side planner store without duplicating the product catalog
- [ ] Mirror important catalog fields in the new write-side schema where compatibility matters
- [ ] Send newly added planner-managed products to the new write-side store only
- [ ] Build one normalized adapter over legacy-read and new-write sources
- [x] Build normalized planner catalog helpers over the legacy read-side source
- [x] Make planner documents reference products by stable ids/slugs from the read-side catalog
- [x] Add save flow for authenticated users
- [x] Add load flow for authenticated users
- [x] Add local draft fallback without creating a second canonical store
- [x] Make local draft cache expire after 24 hours and auto-clean
- [x] Add import dialog inside planner shell
- [x] Add import validator and mapper
- [x] Normalize imported geometry into canonical units
- [x] Persist measurement metadata where required
- [x] Bind save/load/import to one shared auth model
- [x] Keep planner session errors sticky until dismissed
- [x] Add planner save admin read/update oversight groundwork under shared `profiles`/`app_role` RLS checks
- [ ] Confirm admin browser access works without service-role exposure

### Phase 2 Recheck Detail

- `Normalize imported geometry into canonical units`: done in repo
  - semantic planner document normalization exists
  - saved-row restore now routes back through canonical normalization
- `Persist measurement metadata where required`: done in repo
  - `sceneJson.measurement` is written and survives saved-row restoration
- `Define admin RLS policies for browser-side admin work`: groundwork done
  - `planner_saves` owner policies are explicit
  - authenticated admins can now read and update planner saves through `profiles.role = 'admin'`
  - insert/delete remain owner-scoped only
- `Confirm admin browser access works without service-role exposure`: not done
  - browser client exists and service-role remains server-only, but planner-specific admin access is not proven

## Phase 3 Checklist

- [ ] Port viewer concepts from `07docs/Backupcad/components/floor-planner/viewer-3d.tsx`
- [x] Map one planner document into both 2D and 3D
- [x] Keep `/configurator` honest until capability is real
- [x] Confirm 3D uses canonical planner geometry and units

## Tldraw Improvement Checklist

- [ ] Add planner-grade wall editing instead of generic line behavior
- [ ] Add reliable wall joins and corner handling
- [ ] Add constrained room-shell creation flows
- [ ] Improve snap behavior for planner geometry and product placement
- [ ] Improve on-canvas measurement labels and inspector editing
- [ ] Add planner-specific selection, duplication, and alignment rules
- [ ] Add door, opening, and wall-segment editing behaviors where needed
- [ ] Keep Tldraw as the rendering/editing engine, not as the final UX contract

## Phase 4 Checklist

- [ ] Keep `07docs/Backupcad` as the only donor snapshot
- [ ] Convert `/draw` into an alias or redirect strategy
- [ ] Remove only planner packages that remain unused and unassigned after implementation decisions
- [ ] Rewrite planner docs again if code reality changes
- [ ] Publish final module map for planner ownership

## Deployment Gate

- [ ] `apps/cad-suite` build passes
- [ ] `apps/cad-suite` Cloudflare build passes
- [ ] `/planner` is the clear canonical public route
- [ ] planner can create quote-cart payloads reliably
- [ ] save/load/import work with one Supabase-backed model
- [ ] measurement remains correct across edit, save, load, import, and quote
- [ ] planner theme broadly matches the site
