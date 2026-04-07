# Planner Package Matrix

Generated: 2026-04-07

## Purpose

This file is the single package decision table for the planner.

It answers:

- what each package is for
- whether it is part of the canonical planner path
- which phase it belongs to
- whether it should stay, stay reserved, or stay out

## Package Matrix

| Package | Domain | Intended role | Phase | Decision | Notes |
|---|---|---|---|---|---|
| `tldraw` | 2D planner engine | Canonical drafting and editing surface | Phase 0-1 | Keep | Primary 2D engine |
| `zustand` | State | Planner state, quote bridge, future planner store | Phase 0-2 | Keep | Fits modular planner extraction |
| `@supabase/ssr` | Auth/session | Shared browser/server auth session model | Phase 0-2 | Keep | Required for browser and server auth flow |
| `@supabase/supabase-js` | Data | Planner persistence and admin browser data access | Phase 0-2 | Keep | Canonical planner store depends on it |
| `vaul` | Mobile UI | Mobile drawer and planner sheet behavior | Phase 0-1 | Keep | Already fits planner mobile UX |
| `zod` | Validation | Planner document validation and import validation | Phase 1-2 | Keep | Required for reliable import and persistence boundaries |
| `framer-motion` | UI shell | Motion language aligned with the main site | Phase 1 | Keep | Planner should broadly match the site |
| `clsx` | Styling | Conditional class composition | Phase 0-1 | Keep | Existing codebase standard |
| `tailwind-merge` | Styling | Tailwind class merge helper | Phase 0-1 | Keep | Existing codebase standard |
| `@radix-ui/*` | UI shell | Reusable dialogs, tabs, menus, overlays | Phase 1-2 | Keep selectively | Use existing primitives, not planner-only ones |
| `@react-three/fiber` | 3D | Unified 3D planner mode | Phase 3 | Keep | Real 3D path lives here, not in Konva |
| `@react-three/drei` | 3D | Scene helpers for unified 3D planner mode | Phase 3 | Keep | Companion package to R3F |
| `three` | 3D | Core 3D scene runtime | Phase 3 | Keep | Required for 3D mode |
| `openai` | AI | Planner-adjacent AI/copilot flows | Phase 1+ | Keep if scope remains | Not core to geometry, but intentional |
| `react-konva` | 2D sub-tools | Secondary 2D canvas surfaces and overlays | Phase 1-2 | Keep reserved | Not 3D; useful for constrained 2D tools if Tldraw is not ideal |
| `konva` | 2D sub-tools | Canvas layer beneath React Konva | Phase 1-2 | Keep reserved | Same role as above |
| `@thi.ng/geom-hull` | Geometry | Polygon hull generation and room-outline cleanup | Phase 1-2 | Keep reserved | Good fit for room-shape cleanup |
| `alpha-shape` | Geometry | Polygon boundary reconstruction, enclosure logic, and distance-aware shape formation | Phase 1-2 | Keep reserved | Useful for polygon shaping and measurement-related geometry decisions |
| `bezier-js` | Geometry | Curves, rounded corners, and wall-path calculations | Phase 1-2 | Keep reserved | Use only if curved-wall support is real |
| `line-intersect` | Geometry | Wall joins, segment intersections, and measurement rules | Phase 1-2 | Keep reserved | Directly relevant to wall-join logic |
| `point-in-polygon` | Geometry | Polygon containment, hit-testing, and layout validation | Phase 1-2 | Keep reserved | Useful for object-inside-room rules |
| `@tanstack/react-query` | Data sync | Async planner data synchronization and cache control | Phase 2 | Keep reserved | Add only if persistence surfaces become state-heavy |
| `html2canvas` | Export | Raster snapshot capture for planner exports | Phase 2 | Keep reserved | Useful for preview/export pipelines |
| `jspdf` | Export | PDF export for plans, quotes, and printable layouts | Phase 2 | Keep reserved | Planned export stack |
| `jszip` | Export | Bundled export packages and planner asset archives | Phase 2 | Keep reserved | Useful for multi-file export/import packages |
| `axios` | Networking | Optional API client abstraction | Phase 2+ | Keep reserved | Use only where native `fetch` becomes awkward |
| `fabric` | Donor-only | Donor 2D editor engine | None | Do not adopt | Canonical planner stays on Tldraw |

## Geometry Notes

| Package | Specific use |
|---|---|
| `alpha-shape` | Shape reconstruction and distance-aware enclosure logic |
| `line-intersect` | Wall joins, intersections, and dimension rules |
| `point-in-polygon` | Containment checks for layout validation |
| `@thi.ng/geom-hull` | Hull cleanup for room outlines |
| `bezier-js` | Curves and rounded wall/path math |

## Export Notes

| Package | Specific use |
|---|---|
| `html2canvas` | Image snapshots and preview capture |
| `jspdf` | PDF generation |
| `jszip` | Bundled export packages |

## Decision Rules

- `Keep`: active part of the canonical planner path
- `Keep reserved`: intentionally retained for a planned planner phase
- `Keep selectively`: allowed when it serves the planner shell without adding new visual drift
- `Do not adopt`: should not be brought into the canonical planner path
