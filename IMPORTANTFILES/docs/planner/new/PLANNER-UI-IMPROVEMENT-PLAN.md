# Planner UI Improvement Plan

## Goal
Deliver a clean, modern, dense planner interface that uses full width, minimizes visual clutter, and keeps controls readable at small sizes.

## Scope
- Planner top shell and command bars
- Left panel (Room Builder / Catalog)
- Right panel (Layers / Inspector)
- Typography scale, spacing, radius, iconography, states
- Responsive behavior (mobile + desktop)

## Current UI Pain Points
- Toolbar controls look pill-heavy and inconsistent in size
- Excessive radius and decorative containers create dated look
- Too much helper copy consumes critical vertical space
- Uneven panel density (oversized cards, large paddings)
- Mismatch between control groups (height/spacing not uniform)
- Incomplete use of horizontal real estate on wide screens

## Visual Direction
- Flat compact command surfaces
- Minimal radius (`2px` to `6px`, no large pills)
- One clear text scale ladder
- Icon-first dense controls with hover labels where needed
- Strong state clarity: default, hover, active, disabled

## UI System Decisions
- Radius tokens:
  - `--ui-radius-xs: 2px`
  - `--ui-radius-sm: 4px`
  - `--ui-radius-md: 6px`
  - Remove `rounded-full` from command controls
- Height tokens:
  - `--ui-h-control-sm: 28px`
  - `--ui-h-control-md: 32px`
  - `--ui-h-toolbar: 36px`
- Typography tokens:
  - Label: `11px/14px`
  - Button: `11px/14px`
  - Section title: `12px/14px`
  - Body helper: `10px/13px` (only where essential)
- Spacing:
  - Global command gap: `4px`
  - Group gap: `8px`
  - Panel inner padding: `8px`

## UI Workstreams

### P0 Critical
1. Toolbar shape + spacing reset
- Flatten all command buttons and groups
- Align control heights
- Split toolbar into left command rail and right utility rail
- Use full width with predictable group spacing

2. Remove duplicated text blocks
- Keep only one plan/session summary surface
- Remove repeated instructional banners from panel headers

3. Panel density pass
- Convert oversized cards to compact rows where possible
- Room preset: single-line name + dimensions
- Structural actions: compact rows/icon-actions (not verbose cards)

4. State consistency
- Standardize hover/active/disabled colors and contrast
- Ensure disabled controls are legible but clearly inactive

### P1 Moderate
1. Icon + label behavior
- Desktop: icon + short label
- Tight widths: icon-only + hover/focus label

2. Responsive compact mode
- At narrow widths, auto-collapse secondary labels
- Preserve tap targets while reducing text footprint

3. Empty-state cleanup
- Smaller empty-state blocks
- Keep primary CTA visible without giant dead zones

### P2 Polish
1. Motion pass
- Subtle transitions only on background/border/color
- No heavy shadows or visual noise

2. Micro-alignment pass
- Baseline alignment across icons/text
- Fix odd pixel drifts between grouped controls

## File Targets
- `apps/cad-suite/src/features/planner/ui/PlannerToolbar.tsx`
- `apps/cad-suite/src/features/planner/ui/StepBar.tsx`
- `apps/cad-suite/src/features/planner/ui/CatalogPanel.tsx`
- `apps/cad-suite/src/features/planner/ui/LayersPanel.tsx`
- `apps/cad-suite/src/features/planner/ui/InspectorPanel.tsx`
- `apps/cad-suite/src/app/globals.css`

## Acceptance Criteria
- No pill-like toolbars; compact flat controls throughout
- Top command area uses full available width
- Left and right panels have consistent control sizing
- Room presets show as dense one-line rows
- Visual style looks modern (not legacy skeuomorphic)
- Build passes without regressions

## Validation
- Desktop screenshots at `1980x1080`
- Tablet + mobile snapshots
- Visual checklist against SmartDraw/Floorplanner-style density
- Run: `npm -w cad-suite run build`

## Rollout Sequence
1. Apply tokenized radius/height/text updates
2. Refactor toolbar layout and grouping
3. Compact left panel rows
4. Compact right panel actions + hover labels
5. Final visual QA and screenshot baseline
