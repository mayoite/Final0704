# Planner UX Improvement Plan

## Goal
Make planner behavior predictable, fast, and task-first so users can draw, measure, and review without confusion or blocked actions.

## Scope
- Step flow (Room -> Catalog -> Measure -> Review)
- Tool behavior (select/draw/line/rect/erase/pan)
- Selection and layer actions
- Measurement workflow and unit handling
- Save/load/draft/enquiry payload behavior
- Error handling, feedback, and keyboard support

## Current UX Pain Points
- "Nothing is clickable" moments from state/overlay issues
- Catalog appears unavailable without clear reason
- Too many disabled actions without actionable guidance
- Measurement and dimensions not always obvious or trusted
- Duplicated guidance text creates noise, not clarity
- Lack of confidence loops (did action apply?)

## UX Principles
- One clear next action at every step
- Progressive enablement with explicit unlock criteria
- Immediate visual confirmation for every command
- Error messages must be specific and recoverable
- Reduce reading; increase direct manipulation

## UX Workstreams

### P0 Critical
1. Interaction reliability
- Audit pointer-event layers and z-index blockers
- Ensure all visible controls are clickable and focusable
- Add guard tests for core click paths

2. Step gating clarity
- Room step completion criteria must be explicit
- Show compact inline unlock hints near disabled controls
- Remove repeated banner warnings

3. Catalog unlock behavior
- If locked: show exact unmet condition
- If unlocked: first click places item consistently
- Add fail-safe toast when placement cannot occur

4. Measurement trust
- Auto-show key dimensions while drawing/editing
- Ensure unit conversion is deterministic (mm <-> ft/in)
- Keep dimension labels anchored and readable

5. Save/enquiry integrity
- Save draft and enquiry payload should never block editing
- BOQ persists correctly to Supabase
- Clear user feedback on save state and sync state

### P1 Moderate
1. Selection workflow
- Multi-select should unlock align/distribute with clear thresholds
- Deselect, duplicate, delete behaviors must be deterministic

2. Layers workflow
- Lock/unlock/front/back actions show immediate visual change
- Hover labels/tooltips for icon-only actions

3. Keyboard productivity
- `Esc` deselect
- `Delete` remove selection
- `Ctrl/Cmd+Z` undo, `Ctrl/Cmd+Shift+Z` redo

4. 2D -> 3D handoff
- Preserve latest saved scene state
- Surface missing geometry warnings before handoff

### P2 Easy / Polish
1. Empty states
- Contextual, one-line guidance only

2. Feedback language
- Short success/error text; no long paragraphs

3. Session resilience
- Recover gracefully from HMR reload/state refresh in dev

## UX Acceptance Criteria
- Core flow works end-to-end without dead controls
- User can complete room shell, place items, measure, and save
- Disabled controls always explain why
- Catalog never "silently fails" to load/place
- Enquiry save path succeeds and is traceable

## Testing Matrix
- Viewports: `1980x1080`, `1366x768`, `390x844`
- Scenarios:
  1. New room -> draw walls -> unlock catalog -> place item
  2. Select 1/2/3+ items -> align/distribute behavior
  3. Unit toggle mm/ft-in and dimension verification
  4. Save draft -> reload -> resume
  5. Enquiry payload write + retrieval
  6. 2D to 3D route continuity

## Instrumentation
- Log blocked actions with reason code
- Log step transitions and catalog unlock events
- Log save/enquiry success/failure with correlation id

## Risks
- Large UI refactors can regress pointer interactions
- Unit conversion bugs can break trust quickly
- Unsynced panel widths can reintroduce clipping

## Mitigations
- Feature-flag critical behavior changes
- Add snapshot + interaction tests before merge
- Keep P0 fixes isolated and verified first

## File Targets
- `apps/cad-suite/src/components/draw/SmartdrawPlanner.tsx`
- `apps/cad-suite/src/features/planner/hooks/usePlannerWorkspace.ts`
- `apps/cad-suite/src/features/planner/ui/PlannerToolbar.tsx`
- `apps/cad-suite/src/features/planner/ui/CatalogPanel.tsx`
- `apps/cad-suite/src/features/planner/ui/LayersPanel.tsx`
- `apps/cad-suite/src/features/planner/ui/InspectorPanel.tsx`
- `apps/cad-suite/src/features/planner/lib/measurements.ts`
- `apps/cad-suite/src/features/planner/data/plannerSaves.ts`

## Execution Order
1. P0 interaction reliability and catalog unlock fixes
2. P0 measurement and save integrity
3. P1 selection/layers/keyboard improvements
4. P1 2D-3D continuity
5. P2 polish and telemetry cleanup
