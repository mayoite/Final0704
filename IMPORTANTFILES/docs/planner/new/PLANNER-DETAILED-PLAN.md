# Planner Detailed Plan

Generated: 2026-04-07

Related diagram: [planner-old-vs-new-architecture.svg](/C:/claude0104 - Copy/IMPORTANTFILES/docs/planner/new/planner-old-vs-new-architecture.svg)

## Position

`apps/cad-suite` is good.

It is not the wrong system.
It is the right system in rough shape.

That distinction matters.

The planner should be improved from `apps/cad-suite`, not replaced by a second app and not rebuilt around historical root docs.

## Additional Constraints

These requirements are now explicit:

1. One planner store should exist in Supabase as the canonical saved-plan source.
2. Import must be easy for the user.
3. There should be one admin login model and general user logins.
4. Admin should be able to access Supabase from the browser safely.
5. Measurement accuracy and consistency must be treated as a core planner problem.
6. The planner theme should broadly match the main site.
7. Existing site product data should remain the legacy read-only planner read source.
8. Planner write-side data may use a separate new store for now.
9. New planner-managed products should be written only to the new store.

Interpretation:

- no split saved-plan truth across multiple planner apps
- no second persistence system pretending to be canonical
- import should be available from the planner UI with minimal steps
- import should be treated as core planner capability, not backlog decoration
- auth should be one system with roles, not separate planner auth stacks
- browser access must use the authenticated browser client plus RLS, not a service-role key
- measurements must not drift between canvas, labels, saved plans, imports, and quote outputs
- planner UI should inherit the site's color family, typography direction, surface language, and interaction tone
- planner should read products from the existing legacy catalog rather than creating a second active read path in the old system
- planner saves, imports, drafts, session metadata, and newly managed products may use a separate write-side store until the stack is unified
- the old product database is read-only during the interim period

## Current Delivery Status

| Area | Status | Rough completion |
|---|---|---|
| Planner direction and docs | Established | 85% |
| Theme alignment | Site CSS and typography reuse wired in | 65% |
| Phase 1 refactor | Session, panel, measurement, and quote boundaries extracted | 70% |
| Phase 2 document/save/load/import foundation | Core document and planner session flow implemented, but write-side store, admin RLS, and final import normalization remain open | 75% |
| Phase 3 2D/3D document bridge | Basic bridge implemented with honest preview route | 65% |
| Session/cache behavior | Sticky error state plus 24-hour local draft cache implemented | 100% |
| Build and deploy stability | Not solved yet | 20% |
| Final production hardening | Not done | 15% |

### Recheck corrections

- canonical planner document schema is implemented
- Supabase-backed `planner_saves` persistence is implemented
- legacy catalog normalization is implemented for planner reads
- the separate planner-managed product write store is still planned, not implemented
- the merged adapter over legacy-read and new-write product sources is still planned, not implemented
- semantic import normalization exists, but the save-row reload path and editor restore path still leave measurement work incomplete
- planner-specific admin RLS is not implemented yet
- admin browser access without service-role exposure is the intended rule, but not yet proven through a planner-specific workflow
- `planner_saves` migrations currently show schema drift and should be treated as a deployment risk

## Interim Read/Write Split

This is a valid temporary architecture.

The planner does not need one physical database for every concern right now.
It does need one clean contract.

### Interim rule

| Concern | Source |
|---|---|
| Product and catalog reads | Legacy read-only site product data source |
| Planner save/load writes | Dedicated new planner write-side store |
| New planner-managed products | New write-side store only |
| Product resolution inside planner documents | Stable product `id` and `slug` from the read-side catalog |
| Quote and BOQ mapping | Resolve against the read-side product catalog |
| Local draft fallback | Temporary 24-hour browser cache only, never a second canonical store |

### Why this is acceptable for now

| Reason | Meaning |
|---|---|
| Existing site products already work | Homepage and product surfaces already prove the read-side catalog has usable data |
| Planner writes are a different domain | Saved plans, sessions, imports, and planner-specific metadata are not the same as product rows |
| Legacy writes stay frozen | The old database can remain stable while the new write path evolves |
| It avoids blocking planner progress | Planner save/load can move without waiting for full catalog-store unification |
| It reduces accidental duplication | Products stay in one read-side source instead of being copied into planner tables |

### Guardrails

| Rule | Why |
|---|---|
| Treat the legacy product database as read-only | Prevents accidental split-brain writes during the interim period |
| Send newly added planner-managed products to the new store only | Keeps the migration direction consistent |
| Normalize both legacy-read and new-write sources into one app contract | The UI and planner runtime should not branch on storage origin |
| Do not duplicate full product records into planner save tables | That creates drift and stale data |
| Store stable product identifiers in planner documents | Needed for BOQ, quote mapping, and catalog re-resolution |
| Store only minimal denormalized fallback fields if needed | Useful for resilience, but should not replace the read-side catalog |
| Treat the write-side store as canonical for planner documents only | Keeps ownership clear |

### What is actually live today

| Concern | Live status |
|---|---|
| Planner document save store | Live through `planner_saves` |
| Legacy planner catalog adapter | Live |
| Planner-managed product write store | Not live |
| Merged legacy-read plus new-write product adapter | Not live |

## Visual System Alignment

This should not become a separate visual product.

The planner can be more tool-like than the marketing pages, but it should still read as part of the same brand system.

### Visual rules

| Concern | Rule |
|---|---|
| Color direction | Use the main site blue, white, bronze, and neutral surface family as the base |
| Typography | Reuse the site's display and sans stack rather than inventing a planner-only type system |
| Radius and surfaces | Use the same rounded panels, soft borders, and layered surface treatment already present on the site |
| Motion | Keep motion restrained and purposeful, consistent with site motion style |
| Planner-specific exception | Dense tool surfaces are allowed, but they should still look like the same product |
| What not to do | Do not ship a generic dev-tool look or a random dark dashboard theme unrelated to the site |

### Practical theme direction

| Layer | Direction |
|---|---|
| Shell chrome | Match site tokens and spacing language |
| Toolbar and panels | More compact than the site, but visually related |
| Canvas surround | Can be quieter and more operational, but should still use site-brand neutrals and accents |
| CTA and save/import actions | Use the same visual hierarchy as the main site |
| Empty and loading states | Feel branded, not placeholder-grade |

## Measurement And Calibration

Measurement is a constant issue because it affects:

- room shell geometry
- wall lengths
- grid and snap behavior
- inspector values
- on-canvas measurement labels
- imported plan scale
- saved plan accuracy
- quote and BOQ credibility

If measurement is unreliable, the planner stops being a planning tool and becomes a drawing toy.

### Required measurement rules

| Rule | Meaning |
|---|---|
| One canonical internal unit | Store planner geometry in one internal unit system only |
| One display conversion layer | Convert for UI display only, not in core geometry storage |
| One import normalization pass | Imported plans must be normalized before editing |
| One measurement rendering rule | Labels and inspector values must come from the same geometry source |
| One quote geometry contract | Quote extraction must use the same underlying dimensions as the planner |

### Recommended unit policy

| Concern | Recommendation |
|---|---|
| Internal geometry unit | Millimeters |
| Room and wall storage | Millimeters |
| Product footprint storage | Millimeters |
| Display mode | Toggle `mm` and `ft-in` at presentation layer only |
| Import normalization | Convert external units to millimeters immediately |
| Export format | Preserve canonical geometry and optional display metadata |

### Measurement failure modes to eliminate

| Failure | Why It Happens | Fix Direction |
|---|---|---|
| Canvas size and label disagree | Derived from different sources | Use one geometry source of truth |
| Imported plan scales incorrectly | Missing or ambiguous unit metadata | Add import normalization and review |
| Grid looks right but dimensions are wrong | Visual scale and data scale diverge | Add explicit calibration handling |
| Quote quantities feel wrong | Layout and product dimensions do not align | Tie quote extraction to canonical planner geometry |
| Mobile and desktop show different numbers | Multiple display paths | Centralize formatting and measurement calculation |
| Saved row reload loses measurement intent | reload path bypasses full normalization | Route saved rows back through canonical planner document normalization |

## Authentication Model

The planner should use one authentication system.

That system should support:

- admin login
- general user login
- role-based access control

It should not create:

- one auth stack for admin and another for normal users
- one planner app for admin and another planner app for users
- duplicated login flows across planner variants

### Recommended auth rule

| Concern | Rule |
|---|---|
| Auth provider | Supabase Auth |
| Admin access | Role or profile flag inside the same auth system |
| General user access | Standard user login in the same auth system |
| Planner saved plans | Scoped by authenticated user identity |
| Admin planner capabilities | Elevated permissions, not separate planner architecture |
| Public planner access | Can remain partially open if needed, but save/import management should respect auth rules |
| Browser Supabase access | Allowed for admin through authenticated browser client and RLS |
| Service-role access | Server-only, never exposed in browser |

### Recommended auth surfaces

| Surface | Purpose |
|---|---|
| General login | User saves plans, reopens plans, imports plans into own workspace |
| Admin login | Catalog, templates, user oversight, planner diagnostics, managed imports if needed |
| Shared identity layer | Same user/profile tables, same session model, same authorization rules |
| Browser admin data access | Real-time or direct admin reads/writes through Supabase browser client under role-gated policies |

## Admin Browser Access To Supabase

This is a valid requirement.

It should work like this:

- admin logs in through the normal auth system
- browser uses the normal Supabase browser client
- admin browser session carries authenticated user context
- RLS policies and role checks decide what the admin can read or write

It should not work like this:

- exposing service-role keys in browser code
- bypassing authorization by trusting client-side role flags only
- creating a separate secret admin browser client

### Implementation rule

| Access Type | Allowed? | How |
|---|---|---|
| Browser reads for admin dashboards | Yes | Browser client + authenticated session + RLS |
| Browser writes for admin-managed planner data | Yes | Browser client + authenticated session + RLS |
| Browser access to privileged destructive operations | Usually no | Route handler, server action, or edge function if needed |
| Browser use of service-role key | No | Never expose service-role in browser |

### Practical planner implication

Admin should be able to:

- inspect planner records
- manage templates and catalog-linked planner metadata
- review imported plans
- perform operational planner tasks from browser surfaces

But the permission model must still separate:

- normal user plan access
- admin oversight access
- server-only privileged operations

Current gap:

- user-owned planner save RLS exists
- planner-specific admin access policies do not exist yet
- browser client safety rule is implemented by architecture, but planner admin workflow is not yet verified end-to-end

## Persistence Risk

The persistence layer is implemented, but the migrations are not clean enough to trust without review.

Current issue:

- there are two `planner_saves` migrations
- the earlier migration and later migration do not fully agree on the table shape and defaults
- the later migration uses `CREATE TABLE IF NOT EXISTS`, so it would not repair an already-created earlier table

Practical effect:

- different environments could end up with different `planner_saves` schemas
- save/load behavior can look correct in code while failing or drifting in deployment

This should be treated as a real Phase 0 blocker, not a documentation nit

## Why CAD Suite Is The Right Base

| Area | Current CAD-Suite Status | Why It Matters |
|---|---|---|
| Public route model | Real `/planner` route in [page.tsx](/C:/claude0104 - Copy/apps/cad-suite/src/app/planner/page.tsx:4) | Already aligned with user-facing planner entry |
| Quote path | Real quote-cart bridge in [quoteCart.ts](/C:/claude0104 - Copy/apps/cad-suite/src/lib/store/quoteCart.ts:21) and planner runtime | Planner already ends in business output, not just drawing |
| Catalog fit | Planner route fetches catalog in [page.tsx](/C:/claude0104 - Copy/apps/cad-suite/src/app/planner/page.tsx:5) | Current planner already works from product data |
| 2D engine | Tldraw in [SmartdrawPlanner.tsx](/C:/claude0104 - Copy/apps/cad-suite/src/components/draw/SmartdrawPlanner.tsx:12) | Strongest drafting engine in this repo |
| Deployment target | CAD suite is already part of the two-worker Cloudflare model | The architecture already matches the deployment plan |
| UX direction | Room shell -> catalog -> measure -> review flow in planner runtime | Better fit for a public planning and quotation tool |

## What Is Wrong With CAD Suite Today

| Problem | Evidence | Impact |
|---|---|---|
| Build plumbing is unstable | CAD build currently fails in app boundary | Blocks deployment |
| Planner is too monolithic | [SmartdrawPlanner.tsx](/C:/claude0104 - Copy/apps/cad-suite/src/components/draw/SmartdrawPlanner.tsx) owns too much behavior | Hard to evolve safely |
| Route duplication | `/planner` and `/draw` both render same runtime in [planner/page.tsx](/C:/claude0104 - Copy/apps/cad-suite/src/app/planner/page.tsx:17) and [draw/page.tsx](/C:/claude0104 - Copy/apps/cad-suite/src/app/draw/page.tsx:16) | Redundant QA and unclear canonical route |
| Persistence is still interim | Save/load/import and local draft now exist, but schema hardening, RLS, and build stability are not finished | Planner continuity is better, but not yet production-final |
| 3D route is still interim | `/configurator` now reads the canonical planner document as an honest preview in [configurator/page.tsx](/C:/claude0104 - Copy/apps/cad-suite/src/app/configurator/page.tsx:76) | Product promise still needs restraint |
| Remaining monolith debt exists | `SmartdrawPlanner.tsx` is smaller, but still owns editor, shell, and quote behavior | More boundary work is still required |

## Old vs Current vs Target

| System | Lives Where | Truth Status | Strength | Weakness | Recommendation |
|---|---|---|---|---|---|
| Historical root planner | `src/app/planner`, `src/app/planner2`, `src/components/planner`, `src/lib/planner` | Not present in live source | Historical product intent | Not runnable in this repo | Treat as reference only |
| Current public planner | `apps/cad-suite/src/app/planner`, `apps/cad-suite/src/components/draw` | Live | Best public route, catalog, quote fit | Build instability and monolith | Keep as canonical base |
| Donor planner snapshot | `07docs/Backupcad` | Reference snapshot | Persistence and 3D structure | Wrong product boundary | Port selected capabilities only |
| Archived duplicate donor trees | `apps/cad-suite/b_yeh73xcndxr` and `b_yeh73xcndxr` | Removed | Preserved prior work before cleanup | Previously caused confusion and drift | Keep `07docs/Backupcad` as the sole donor snapshot |
| Target planner system | `apps/cad-suite/src/features/planner/*` | Planned | One code boundary, one route strategy, one persistence story | Requires disciplined refactor | Build this |

## Feature Comparison

| Feature | Historical Root Planner | Current CAD Suite | Backupcad Donor | Target Planner |
|---|---|---|---|---|
| Public `/planner` route | Documented only | Yes | No | Yes |
| Public quote-cart handoff | Intended | Yes | No | Yes |
| Product catalog integration | Documented | Yes | Separate furniture API pattern | Yes |
| Drafting-quality 2D engine | Unknown old stack | Yes, Tldraw | No, Fabric furniture editor | Yes, Tldraw |
| Save / load plans | Documented | Yes, first-class foundation implemented | Yes | Yes, single Supabase-backed store |
| Import saved plans | Documented historically | Yes, planner-shell JSON import exists | Partial/manual structure | Yes, simple user-facing import flow |
| Admin and user auth model | Not reliable in current docs | Partial app auth exists elsewhere | Yes in donor app model | Yes, one auth system with roles |
| Admin browser access to Supabase | Unclear | Technically possible with browser client | Present in donor auth pattern | Yes, explicitly supported under RLS |
| Measurement consistency | Historically unclear | Partial, but still a pain point | Different editor assumptions | Yes, explicit canonical measurement model |
| Optional 3D mode | Documented in old materials | No | Yes | Yes |
| Clear planner store boundary | Documented | Partial | Yes | Yes |
| Production-ready route naming | No | Partial | No | Yes |
| Cloudflare deployment fit | No longer relevant | Yes | No | Yes |
| Repo clarity | No | No | No | Yes |

## Live Planner Surfaces

### Current public surfaces

| Route | Source | Current Role | Keep? |
|---|---|---|---|
| `/planner` | [apps/cad-suite/src/app/planner/page.tsx](/C:/claude0104 - Copy/apps/cad-suite/src/app/planner/page.tsx:4) | Canonical public planner | Yes |
| `/draw` | [apps/cad-suite/src/app/draw/page.tsx](/C:/claude0104 - Copy/apps/cad-suite/src/app/draw/page.tsx:4) | Duplicate planner entry | Temporary alias only |
| `/configurator` | [apps/cad-suite/src/app/configurator/page.tsx](/C:/claude0104 - Copy/apps/cad-suite/src/app/configurator/page.tsx:76) | Honest interim 3D preview route | Keep route, do not oversell it |

### Current planner runtime pieces

| File | Current Responsibility | Future Responsibility |
|---|---|---|
| [SmartdrawPlanner.tsx](/C:/claude0104 - Copy/apps/cad-suite/src/components/draw/SmartdrawPlanner.tsx) | Large planner owner with extracted session and measurement boundaries | Split further into shell, state, quote bridge, geometry, UI |
| [PlannerCanvas.tsx](/C:/claude0104 - Copy/apps/cad-suite/src/components/draw/PlannerCanvas.tsx) | Tldraw wrapper | Remain as canvas wrapper |
| [PlannerDesktopPanels.tsx](/C:/claude0104 - Copy/apps/cad-suite/src/features/planner/ui/PlannerDesktopPanels.tsx) | Desktop planner chrome under planner feature UI | Keep under planner UI module |
| [PlannerMobilePanels.tsx](/C:/claude0104 - Copy/apps/cad-suite/src/features/planner/ui/PlannerMobilePanels.tsx) | Mobile planner chrome under planner feature UI | Keep under planner UI module |
| [usePlannerSession.ts](/C:/claude0104 - Copy/apps/cad-suite/src/features/planner/hooks/usePlannerSession.ts) | Planner session, draft, import, and save/load workflow | Keep as planner session boundary and extend carefully |
| [quoteBridge.ts](/C:/claude0104 - Copy/apps/cad-suite/src/features/planner/lib/quoteBridge.ts) | Planner BOQ grouping and quote-cart payload mapping | Keep as the planner quote bridge |
| [AiCopilot.tsx](/C:/claude0104 - Copy/apps/cad-suite/src/components/draw/AiCopilot.tsx) | Heuristic suggestion UI | Keep as planner-side assistant UI |
| [quoteCart.ts](/C:/claude0104 - Copy/apps/cad-suite/src/lib/store/quoteCart.ts) | Quote cart state | Keep, but use via planner quote bridge |

## Donor Extraction Plan

Use `07docs/Backupcad` as the clean donor snapshot.

### Port from donor

| Donor File | Capability To Extract | Port Strategy |
|---|---|---|
| [07docs/Backupcad/lib/store.ts](/C:/claude0104 - Copy/07docs/Backupcad/lib/store.ts:12) | Explicit planner store structure | Rebuild as CAD-suite planner store, do not copy blindly |
| [07docs/Backupcad/components/floor-planner/editor.tsx](/C:/claude0104 - Copy/07docs/Backupcad/components/floor-planner/editor.tsx:31) | Save/load and editor workflow | Extract persistence and session concepts |
| [07docs/Backupcad/components/floor-planner/viewer-3d.tsx](/C:/claude0104 - Copy/07docs/Backupcad/components/floor-planner/viewer-3d.tsx:18) | 3D viewer shell | Port later as optional planner mode |

## Persistence And Import Strategy

### Canonical persistence rule

There should be one canonical planner persistence store in Supabase.

That means:

- one planner plan table family
- one save/load contract
- one source of truth for saved plans
- no parallel planner storage models across CAD-suite and donor code

### Target persistence model

| Concern | Target |
|---|---|
| Canonical backend | Supabase |
| Canonical saved-plan owner | `apps/cad-suite` |
| Plan document format | Single planner document model |
| Drafts | Local draft fallback is acceptable, but only as a 24-hour non-canonical cache |
| Quote linkage | Saved plan can still produce quote-cart payload |
| Import destination | Imported plans become first-class planner documents |
| Auth boundary | Same Supabase identity model for admin and general users |
| Admin browser access model | Supabase browser client with authenticated session and RLS |
| Server-only secrets | Service-role remains server-only |
| Canonical measurement unit | Millimeters |
| Display measurement modes | Presentation-only conversions from canonical geometry |

### Import principles

| Principle | Meaning |
|---|---|
| Easy | User should not fight the product to import a plan |
| Safe | Imported data is validated before entering the canonical store |
| Visible | Import option is obvious in the planner shell |
| Reversible | User can review imported content before overwriting an existing plan |
| Unified | Import feeds the same planner document model used by save/load and quote generation |

### Recommended import surfaces

| Surface | Priority | Reason |
|---|---|---|
| Import plan JSON / planner document | High | Fastest path to real import capability |
| Import into current session | High | Best editing UX |
| Import as new saved plan | High | Prevents accidental overwrite |
| Replace existing saved plan | Medium | Useful, but should require confirmation |
| Bulk catalog-style import | Low | Separate concern from planner document import |

### Do not port from donor

| Donor Area | Why Not |
|---|---|
| Full dashboard app shell | Wrong product boundary |
| Auth-first planner flow | Public planner should not depend on it |
| Fabric-based 2D editing core | We should keep Tldraw for drafting |
| Duplicate route and admin structure | More complexity than value |

## Target Structure

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
            metrics.ts
          state/
            plannerStore.ts
            quoteBridge.ts
            sessionStore.ts
          data/
            catalogAdapter.ts
            plannerProducts.ts
            backupCatalogAdapter.ts
          persistence/
            planRepository.ts
            draftRepository.ts
            importPlan.ts
            exportPlan.ts
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
            ImportPlanDialog.tsx
          three-d/
            Viewer3D.tsx
            sceneAdapter.ts
            modelAdapter.ts
```

## New Planner Principles

| Principle | Meaning |
|---|---|
| One canonical planner route | `/planner` is the single public source of truth |
| One planner engine | Tldraw stays the 2D base |
| One planner data contract | Same plan model feeds quote, save/load, and later 3D |
| One persistence model | One canonical Supabase-backed saved-plan system |
| One auth system | Admin and general users share the same auth foundation with role-based permissions |
| One secure browser-access model | Admin browser access to Supabase is supported through RLS, never through exposed server secrets |
| One code ownership boundary | Planner logic lives under `features/planner` |
| One documentation story | Docs must describe live code, not history |
| One import path | Import uses the same canonical planner document model |
| One measurement source of truth | Geometry, labels, saved plans, imports, and quotes all derive from the same unit model |
| One visual language family | Planner should broadly match the site's design system without copying marketing layouts blindly |
| One package discipline | Keep only packages that serve the canonical planner path or a clearly scheduled future phase |

## Package Direction

Package decisions should follow the actual canonical planner path, not the donor app's historical package list.

### Keep as core planner packages

| Package | Why It Stays | Evidence |
|---|---|---|
| `tldraw` | Canonical 2D planning engine | Live planner canvas and editor runtime |
| `zustand` | Lightweight planner-side state for quote cart and future planner store | Live store usage and best fit for planner state extraction |
| `@supabase/ssr` | Shared auth/session client for browser and server | Live Supabase browser/server client setup |
| `@supabase/supabase-js` | Direct planner data access and plan persistence | Live data and admin client usage |
| `vaul` | Mobile planner sheet behavior | Live mobile drawer usage |
| `zod` | Import validation and planner document validation | Already used for route validation and fits import boundary |

### Keep for planned phase work

| Package | Why It Stays | Phase |
|---|---|---|
| `@react-three/fiber` | Optional 3D mode should stay inside the same planner boundary | Phase 3 |
| `@react-three/drei` | Viewer scaffolding for optional 3D mode | Phase 3 |
| `three` | Scene runtime for optional 3D mode | Phase 3 |
| `openai` | Planner-side AI/copilot and planner-adjacent assistant flows | Phase 1 or later hardening |

### Reuse from the site shell

| Package | Why It Matters |
|---|---|
| `framer-motion` | Planner motion should feel like the rest of the site rather than a disconnected utility app |
| `clsx` and `tailwind-merge` | Keep planner styling composition consistent with the site codebase |
| `@radix-ui/*` | Reuse existing interaction primitives where planner dialogs, tabs, or menus need them |

### Donor-only reference packages

| Package | Status | Reason |
|---|---|---|
| `fabric` | Do not add to canonical planner | Donor used it for a different 2D editing model; canonical planner stays on Tldraw |

### Reserved packages for planned planner work

| Package | Current Signal | Planned Use |
|---|---|---|
| `react-konva` and `konva` | No live usage found in `apps/cad-suite/src` | Reserve for secondary 2D canvas tooling or overlays if Tldraw is not the right fit for a sub-surface |
| `@thi.ng/geom-hull` | No live usage found in `apps/cad-suite/src` | Reserve for polygon hull generation and room-outline cleanup |
| `alpha-shape` | No live usage found in `apps/cad-suite/src` | Reserve for polygon boundary reconstruction and enclosure calculations |
| `bezier-js` | No live usage found in `apps/cad-suite/src` | Reserve for curves, rounded corners, and wall-path calculations |
| `line-intersect` | No live usage found in `apps/cad-suite/src` | Reserve for wall joins, segment intersections, and measurement rules |
| `@tanstack/react-query` | No live planner usage found in `apps/cad-suite/src` | Reserve for planner async data synchronization if persistence surfaces grow |
| `html2canvas` | No live usage found in `apps/cad-suite/src` | Reserve for planner image snapshots and raster export capture |
| `jspdf` | No live usage found in `apps/cad-suite/src` | Reserve for PDF export, quote summaries, and printable planner output |
| `jszip` | No live usage found in `apps/cad-suite/src` | Reserve for bundled export packages and planner asset archives |
| `axios` | No live usage found in `apps/cad-suite/src` | Reserve for external planner API integration if native `fetch` is not enough |
| `point-in-polygon` | No live usage found in `apps/cad-suite/src` | Reserve for polygon containment checks and layout validation rules |

## Detailed Delivery Plan

## Phase 0: Stabilize The Existing Planner

### Goal

Make current CAD-suite planner build and deploy reliably without changing the product direction.

### Tasks

| Task | Outcome |
|---|---|
| Fix workspace and Turbopack package resolution | `apps/cad-suite` build stops failing on missing packages |
| Make `npm -w cad-suite run build` pass | Local production build gate restored |
| Make `npm -w cad-suite run cf:build` pass | Cloudflare build gate restored |
| Resolve small planner contract drift | Remove obvious broken prop expectations |
| Lock `/planner` as canonical in docs | Route strategy becomes explicit |
| Document current measurement bugs and mismatches | Measurement work starts from observed failures |

### Exit Gate

- CAD-suite build passes
- Cloudflare build passes
- `/planner` is deployable

## Phase 1: Refactor Without Product Drift

### Goal

Keep current UX and split the monolith.

### Tasks

| Task | Outcome |
|---|---|
| Extract planner shell from `SmartdrawPlanner.tsx` | Cleaner route/runtime boundary |
| Extract quote generation logic | Stable BOQ and cart contract |
| Extract geometry and measurement logic | Easier future enhancements |
| Move panel components into planner feature module | Cleaner ownership |
| Separate UI state from editor state | Lower coupling |
| Create centralized measurement utilities | Same values power labels, inspectors, and quote calculations |
| Define canonical unit and conversion boundaries | No hidden unit drift in runtime |
| Align planner shell tokens to the main site design system | Planner feels like the same product |
| Reuse site typography, surface, and accent rules in planner chrome | Theme alignment happens intentionally, not as afterthought |

### Exit Gate

- current planner UX still works
- core logic no longer lives in one giant file
- measurement display and geometry logic are no longer scattered

## Phase 2: Add Persistence

### Goal

Add save/load and draft continuity to the real public planner.

### Tasks

| Task | Outcome |
|---|---|
| Define planner document model | Stable unit for save/load |
| Create plan repository abstraction | Supabase-backed canonical storage can evolve safely |
| Port save/update flow from donor concepts | Existing planner can persist |
| Add saved-plan route | Return-to-edit becomes possible |
| Add draft recovery | Session continuity improves |
| Define import validator and mapper | Imported plans land in canonical planner document shape |
| Add import dialog in planner shell | Import is easy, visible, and fast |
| Bind save/load permissions to shared auth model | One admin and general-user auth system governs planner data |
| Define admin RLS and browser-access boundaries | Admin can safely operate from browser surfaces without exposed secrets |
| Normalize imported dimensions into canonical units | Imported geometry becomes trustworthy inside the planner |
| Persist measurement metadata where necessary | Saves preserve unit assumptions and calibration state |

### Exit Gate

- a user can save a plan
- a user can reopen a plan
- quote generation still works from saved plans
- a user can import a plan without leaving the planner
- admin and general user access rules use the same auth system
- admin browser access works through Supabase client and RLS without secret exposure
- imported and reopened plans preserve correct geometry measurements

## Phase 3: Add Unified 3D

### Goal

Make 3D a mode of the planner, not a different planner.

### Tasks

| Task | Outcome |
|---|---|
| Port donor viewer shell | CAD-suite gains 3D surface |
| Map planner document to 3D scene | Same data powers 2D and 3D |
| Add mode toggle | Planner stays unified |
| Keep `/configurator` honest | Route reflects actual capability |
| Keep 3D dimensions derived from canonical geometry | No separate 3D scale model |

### Exit Gate

- one plan can open in 2D and 3D
- no second app boundary is created

## Phase 4: Collapse Duplicates And Rewrite Docs

### Goal

Remove planner confusion from the repo.

### Tasks

| Task | Outcome |
|---|---|
| Keep `07docs/Backupcad` as the sole archival donor snapshot | Cleaner repo and clearer extraction source |
| Demote `/draw` to alias or redirect | Cleaner public entry strategy |
| Rewrite stale planner docs | Docs match live system |
| Add final architecture doc and module map | Faster onboarding |

### Exit Gate

- one clear planner codebase
- one clear planner route
- one accurate documentation set

## Old vs New Architecture Table

| Dimension | Old / Current Reality | New / Target Reality |
|---|---|---|
| Product boundary | Split across docs, CAD-suite, donor copies | Single boundary in `apps/cad-suite` |
| Public route strategy | `/planner` plus duplicate `/draw` | `/planner` canonical, others secondary |
| 2D engine | Tldraw in CAD-suite, Fabric in donor | Tldraw only |
| Persistence | Donor app only | In canonical planner |
| 3D | Donor app only, placeholder-grade | Optional mode under same planner |
| Quote flow | Strong only in CAD-suite | Strong and formalized |
| Catalog integration | Strong only in CAD-suite | Formalized under planner data layer |
| Deployment fit | Only CAD-suite matches deployment plan | Fully aligned with deployment plan |
| Documentation accuracy | Poor | Accurate and repo-backed |
| Measurement model | Scattered and partly implicit | Explicit canonical unit, conversion, and import normalization |

## Final Recommendation

Yes, CAD suite is good.

More precisely:

- it is the correct planner base
- it already has the right business direction
- it already has the right route model
- it already has the right 2D engine
- it should be strengthened, not replaced

The plan is:

1. stabilize CAD-suite
2. refactor the planner into a real feature module
3. make Supabase the one canonical saved-plan store
4. add an easy import flow into that same planner document model
5. fix measurement consistency as part of core geometry and import work
6. align the planner shell to the site's visual system
7. keep only the planner packages that serve the canonical path
8. port persistence patterns from the donor snapshot
9. add optional 3D later
10. keep `07docs/Backupcad` as the only donor snapshot
11. rewrite docs to match the truth
