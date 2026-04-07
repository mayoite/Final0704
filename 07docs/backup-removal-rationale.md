# Backup And Removal Rationale

Generated: 2026-04-07

## Purpose

This document explains why specific items should live in backup or reference areas instead of the active app tree.

This is not a blanket delete list.
It is a decision log for:

- why an item is backed up
- why it should not be treated as active source
- whether it should be kept, archived further, or removed from active paths

## Decision Rules

| Rule | Meaning |
|---|---|
| Keep in active tree | The file or folder is part of the current product or deployment path |
| Move to backup/reference | The file has historical or donor value but should not participate in current ownership |
| Remove from active path | The item causes confusion, duplication, or dead maintenance cost |
| Do not delete blindly | Backup/reference value can still exist even if active ownership should end |

## High-Level Summary

| Area | Decision | Reason |
|---|---|---|
| `apps/cad-suite` live planner | Keep active | Canonical current planner base |
| `07docs/Backupcad` | Keep as reference snapshot | Clean donor copy for persistence and 3D ideas |
| `b_yeh73xcndxr` / `apps/cad-suite/b_yeh73xcndxr` | Keep one as archive, remove one from active path later | Duplicate donor app trees are confusing |
| `backup/planner/*` | Keep as historical archive only | Old planner history, not current runtime |
| `backup/home`, `backup/layout`, `backup/shared`, `backup/site`, `backup/bot` | Archive only | Old UI component copies, not current ownership |
| `backup/src/components/*` | Prefer this structured copy over flat duplicates if one backup must remain | More coherent historical shape |
| `.next`, `.open-next`, `coverage` | Treat as generated/output, not source | No product ownership value in active design decisions |

## Item-By-Item Rationale

### 1. `07docs/Backupcad`

| Item | Decision | Reason For Backup | Reason Not To Treat As Active |
|---|---|---|---|
| `07docs/Backupcad` | Keep as reference | It is a clean donor snapshot without build junk | It is not the canonical public planner and should not split ownership |
| `07docs/Backupcad/components/floor-planner/editor.tsx` | Keep as donor reference | Useful for save/load workflow ideas | It belongs to a different app boundary and editor model |
| `07docs/Backupcad/components/floor-planner/viewer-3d.tsx` | Keep as donor reference | Useful future 3D shell | Current public planner is not driven by this stack |
| `07docs/Backupcad/lib/store.ts` | Keep as donor reference | Good example of explicit planner state separation | Direct copy would drag in the donor app’s assumptions |

### 2. `b_yeh73xcndxr`

| Item | Decision | Reason For Backup / Archive | Reason For Removing From Active Role |
|---|---|---|---|
| `b_yeh73xcndxr` root app | Keep one archival copy only | Preserves earlier planner/dashboard implementation with persistence and 3D | It is not the current public planner and creates ownership ambiguity |
| `b_yeh73xcndxr/components/floor-planner/*` | Use as donor reference | Contains useful editor, save/load, and viewer patterns | Fabric-based editor and dashboard app model do not match the canonical CAD-suite planner |

### 3. `apps/cad-suite/b_yeh73xcndxr`

| Item | Decision | Reason For Backup / Archive | Reason For Removing From Active Role |
|---|---|---|---|
| `apps/cad-suite/b_yeh73xcndxr` | Archive one copy, do not keep as active peer to CAD suite | It preserves donor code near CAD suite | It duplicates the root `b_yeh73xcndxr` and confuses which planner is real |
| Duplicate donor files inside it | Archive only | Still useful for comparison | Duplicates inside the product tree add noise and maintenance risk |

### 4. `backup/planner`

| Item | Decision | Reason For Backup | Reason Not To Restore As Active |
|---|---|---|---|
| `backup/planner/2026-04-05/page.tsx.backup` | Keep as archive | Historical record of planner route state | Current planner has moved to CAD suite |
| `backup/planner/2026-04-05/PlannerClient.tsx.backup` | Keep as archive | Historical client entrypoint | Root planner route family is not live |
| `backup/planner/2026-04-05/SmartdrawPlanner.tsx.backup` | Keep as archive | Useful for historical comparison | Not part of the current planner ownership model |
| `backup/planner/legacy/2026-04-05/SMARTDRAW_PLAN.md` | Keep if historical context matters | Documents old planning ideas | It should not drive current technical decisions on its own |

### 5. `backup/home`

| Item | Decision | Reason For Backup | Reason For Removing From Active Role |
|---|---|---|---|
| `backup/home/CatalogSection.tsx` | Archive only | Earlier homepage implementation snapshot | Current app should not own two versions of the same home section |
| `backup/home/ClientLogos.tsx` | Archive only | Historical marketing UI | Same reason: duplicate UI ownership |
| `backup/home/ClientMarquee.tsx` | Archive only | Historical component | Duplicate component lineage |
| `backup/home/CTASection.tsx` | Archive only | Historical CTA version | Not canonical current source |
| `backup/home/HomepageStatsStrip.tsx` | Archive only | Historical homepage state | Duplicate UI implementation |
| `backup/home/InteractiveRoom.tsx` | Archive only | Preserves previous experiment | Not part of planner ownership |
| `backup/home/OurWork.tsx` | Archive only | Historical content component | Duplicate homepage content path |
| `backup/home/SolutionsShowcase.tsx` | Archive only | Historical showcase UI | Duplicate ownership and maintenance noise |
| `backup/home/StatsBlock.tsx` | Archive only | Historical stats component | Duplicate UI |
| `backup/home/StatsSection.tsx` | Archive only | Historical stats section | Duplicate UI |
| `backup/home/Values.tsx` | Archive only | Historical content block | Duplicate UI |
| `backup/home/VideoSection.tsx` | Archive only | Historical media block | Duplicate UI |
| `backup/home/WhyUs.tsx` | Archive only | Historical messaging block | Duplicate UI |

### 6. `backup/layout`

| Item | Decision | Reason For Backup | Reason For Removing From Active Role |
|---|---|---|---|
| `backup/layout/Footer.tsx` | Archive only | Previous layout version | Current app should have one live layout path |
| `backup/layout/Header.tsx` | Archive only | Preserves old header implementation | Duplicate ownership |
| `backup/layout/MegaMenu.tsx` | Archive only | Historical nav behavior | Not canonical current source |
| `backup/layout/MobileMenu.tsx` | Archive only | Historical mobile nav | Duplicate layout logic |
| `backup/layout/Navbar.tsx` | Archive only | Large prior nav implementation | High confusion cost if left looking active |
| `backup/layout/SearchOverlay.tsx` | Archive only | Historical UI utility | Duplicate UI source |
| `backup/layout/WhatsAppBot.tsx` | Archive only | Historical helper | Not part of current canonical flow |

### 7. `backup/shared`, `backup/site`, `backup/bot`

| Item | Decision | Reason For Backup | Reason For Removing From Active Role |
|---|---|---|---|
| `backup/shared/ProcessSection.tsx` | Archive only | Historical shared section | Duplicate shared component source |
| `backup/shared/SectionReveal.tsx` | Archive only | Historical helper | Duplicate utility ownership |
| `backup/site/RouteChrome.tsx` | Archive only | Historical route wrapper | Current route chrome should have one owner |
| `backup/bot/AdvancedBot.tsx` | Archive only | Previous assistant implementation | Avoid multiple bot implementations appearing active |
| `backup/SafeImage.tsx` | Archive only | Historical utility snapshot | Duplicate utility path |

### 8. `backup/src/components/*`

| Item | Decision | Reason For Backup | Reason For Removing Flat Duplicates |
|---|---|---|---|
| `backup/src/components/home/*` | Keep if one structured archive is needed | Preserves original source tree shape | Better than keeping both structured and flattened backup copies |
| `backup/src/components/layout/*` | Keep if one structured archive is needed | Maintains original folder relationships | Same content also exists in `backup/layout/*` |
| `backup/src/components/shared/*` | Keep if one structured archive is needed | Preserves structure | Same content also exists in `backup/shared/*` |
| `backup/src/components/site/*` | Keep if one structured archive is needed | Preserves source organization | Same content also exists in `backup/site/*` |
| `backup/src/components/bot/*` | Keep if one structured archive is needed | Preserves source organization | Same content also exists in `backup/bot/*` |

### 9. `backup/never-shown-cleanup`

| Item | Decision | Reason For Backup | Reason Not To Restore As Active |
|---|---|---|---|
| `backup/never-shown-cleanup/2026-04-05/src/components/home/HomeFAQ.tsx.bak` | Archive only | Explicitly tagged as cleanup and not shown | Not part of approved live UX |
| `backup/never-shown-cleanup/2026-04-05/src/components/home/PartnershipBanner.tsx.bak` | Archive only | Keeps discarded experiment | Not current product |
| `backup/never-shown-cleanup/2026-04-05/src/data/site/homepage.ts.bak` | Archive only | Preserves prior data shape | Should not override live homepage data decisions |

### 10. Generated / Output Trees

| Item | Decision | Reason For Backup / Exclusion | Reason For Removing From Design Decisions |
|---|---|---|---|
| `.next` | Do not treat as source | Build output only | Generated files should never guide architecture |
| `.open-next` | Do not treat as source | Deployment build output | Generated deployment artifact |
| `coverage` | Keep only as report output | Test coverage artifact | Not product source |

## Recommended Cleanup Strategy

### Keep active

- `apps/cad-suite/*`
- current root site source
- canonical planner docs under `IMPORTANTFILES/docs/planner/*`

### Keep as reference

- `07docs/Backupcad`
- one archived copy of the donor `b_yeh` app
- `backup/planner/*`

### Consolidate

| Current Duplication | Recommended Action | Reason |
|---|---|---|
| `backup/home/*` and `backup/src/components/home/*` | Keep one structured archive version | Flat and structured duplicates are unnecessary |
| `backup/layout/*` and `backup/src/components/layout/*` | Keep one structured archive version | Same reason |
| `backup/shared/*` and `backup/src/components/shared/*` | Keep one structured archive version | Same reason |
| `backup/site/*` and `backup/src/components/site/*` | Keep one structured archive version | Same reason |
| `b_yeh73xcndxr` and `apps/cad-suite/b_yeh73xcndxr` | Keep one archival donor copy | Two active-looking donor trees are unnecessary |

## Bottom Line

The reason to backup an item is:

- it has historical value
- it has donor value
- it may still be useful for extraction or comparison

The reason to remove it from active ownership is:

- it is not part of the live product path
- it duplicates canonical code
- it confuses future planning
- it increases maintenance cost without improving delivery
