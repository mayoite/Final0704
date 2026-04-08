# PLANNER-CHECKLIST

Generated: 2026-04-08
Owner: Lead agent
Cadence rule: update this file every 2 minutes while execution is active.

## Status Legend

- [ ] not started
- [~] in progress
- [x] done
- [!] blocked

## Baseline Verification

- [x] `npm -w cad-suite run build` passes (2026-04-08).
- [x] Route probe `http://127.0.0.1:3001/` returns 200.
- [x] Route probe `http://127.0.0.1:3001/planner` returns 200.
- [x] Route probe `http://127.0.0.1:3001/configurator` returns 200.

## Critical (P0)

- [x] P0-A Clickability audit in toolbar, canvas overlays, and workspace panels.
- [x] P0-A Fix pointer-events and z-index conflicts.
- [!] P0-A Add Playwright click smoke at `1980x1080` (blocked: no active Playwright config/tests folder in current tree).

- [x] P0-B Trace selection -> inspector metrics pipeline.
- [x] P0-B Fix dimension update handlers and validation.
- [x] P0-B Add mm/ft-in conversion tests.

- [x] P0-C Replace panel width magic numbers with single shared token.
- [x] P0-C Align canvas insets to tokenized panel widths.
- [x] P0-C Validate desktop pinned panel overlap behavior.

- [~] P0-D Rebuild toolbar group layout to use full width without dead space.
- [~] P0-D Remove duplicate instructional strip where repeated.
- [~] P0-D Keep mobile toolbar behavior intact after desktop changes.

- [x] P0-E Remove pricing totals from planner surfaces.
- [x] P0-E Convert quote wording to BOQ enquiry wording.
- [x] P0-E Verify quantity-only payload generation.

- [x] P0-F Confirm Supabase envelope for BOQ enquiry save/load.
- [x] P0-F Add CRM sync status fields and mapping contract.
- [x] P0-F Verify RLS for owner and admin access paths.

## Moderate (P1)

- [~] P1-A Redesign catalog list/cards for clean hierarchy.
- [~] P1-A Reduce legacy-looking controls in structural tool list.
- [~] P1-A Implement icon-first secondary actions with hover labels where needed.

- [~] P1-B Improve live measurement chips and snap feedback.
- [~] P1-B Reduce repeated explanatory text noise.

- [x] P1-C Harden `/configurator` 3D loading states.
- [x] P1-C Validate draft and saved-plan 3D source loading.
- [x] P1-C Document 2D-to-3D mapping assumptions.

## Easy (P2)

- [~] Harmonize typography scale after P0/P1 freeze.
- [~] Polish empty states and button microcopy.
- [~] Final responsive sweep across planner panels.

## Security and Strategic

- [x] Confirm service-role keys are server-only.
- [x] Add policy validation notes for planner save/load tables.
- [x] Add structured error reporting for planner save/sync failures.

- [x] Finalize single-db vs dual-db Supabase decision record.
- [x] Finalize CRM import method decision record (push vs pull).
- [x] Finalize canonical route ownership record (`/planner`, `/configurator`, `/draw`).

## Package and Dependency Audit Tasks

- [x] Build strict discrepancy table: root vs `apps/cad-suite` dependencies.
- [x] Identify TSX imports with missing package declarations.
- [x] Mark each package as keep/remove/move-to-app/move-to-root.
- [x] Propose lockstep versions for planner-critical packages.

## 25-Parameter Audit Tracking

- [ ] Route ownership
- [ ] Build reliability
- [ ] Runtime clickability
- [ ] Selection behavior
- [ ] Dimension editing
- [ ] Unit conversion
- [ ] Toolbar density and spacing
- [ ] Panel width and insets
- [ ] Catalog usability
- [ ] Layers usability
- [ ] Inspector usability
- [ ] Session save/load reliability
- [ ] Draft persistence reliability
- [ ] Supabase schema consistency
- [ ] RLS correctness
- [ ] Error handling and fallback UX
- [ ] BOQ enquiry correctness
- [ ] CRM export readiness
- [ ] 3D preview correctness
- [ ] Mobile behavior
- [ ] Accessibility baseline
- [ ] Performance baseline
- [ ] Security key handling
- [ ] Telemetry and diagnostics
- [ ] Test coverage and release gates

## Evidence Log

- 2026-04-08: Created fresh plan/checklist in `IMPORTANTFILES/docs/planner/new`.
- 2026-04-08: Verified CAD build and route probes before execution.
- 2026-04-08: Spawned 4 execution agents with fixed scopes:
  - HIGH: clickability/layering fixes
  - HIGH: dimension/selection reliability fixes
  - MEDIUM: UI audit report at 1980x1080
  - MEDIUM: BOQ/Supabase/security report
- 2026-04-08: MEDIUM UI audit report delivered at `IMPORTANTFILES/docs/reports/planner/AGENT-UI-1980x1080-AUDIT.md`.
- 2026-04-08: MEDIUM BOQ/Supabase/security report delivered at `IMPORTANTFILES/docs/reports/planner/AGENT-BOQ-SUPABASE-SECURITY-REPORT.md`.
- 2026-04-08: HIGH clickability patch delivered in:
  - `apps/cad-suite/src/components/draw/SmartdrawPlanner.tsx`
  - `apps/cad-suite/src/features/planner/ui/PlannerToolbar.tsx`
  - `apps/cad-suite/src/features/planner/ui/WorkspacePanel.tsx`
- 2026-04-08: HIGH dimensions patch delivered in:
  - `apps/cad-suite/src/features/planner/hooks/usePlannerWorkspace.ts`
  - `apps/cad-suite/src/features/planner/lib/editorTools.ts`
  - `apps/cad-suite/src/features/planner/lib/measurements.ts`
  - `apps/cad-suite/src/features/planner/ui/InspectorPanel.tsx`
  - `apps/cad-suite/src/features/planner/lib/editorTools.test.ts`
  - `apps/cad-suite/src/features/planner/lib/measurements.test.ts`
- 2026-04-08: Verification run:
  - `npm run test:planner -- apps/cad-suite/src/features/planner/lib/measurements.test.ts apps/cad-suite/src/features/planner/lib/editorTools.test.ts` (pass)
  - `npm -w cad-suite run build` (pass)
- 2026-04-08: Spawned 2 dedicated HIGH 3D workers:
  - Route/load hardening (`/configurator`, draft/saved-plan flow)
  - 3D viewer runtime/camera/scene stability
- 2026-04-08: Retasked 3D workers per latest directive:
  - Worker UI/CSS: use repo/CAD global style system for 3D surfaces.
  - Worker logic: focus on non-UI load/validity hardening.
- 2026-04-08: 3D logic worker completed:
  - `apps/cad-suite/src/app/configurator/page.tsx`
  - `apps/cad-suite/src/features/planner/data/plannerDraft.ts`
  - `apps/cad-suite/src/features/planner/data/plannerSaves.ts`
  - Report: `IMPORTANTFILES/docs/reports/planner/AGENT-3D-ROUTE-LOAD-REPORT.md`
  - Validation (agent-reported): planner draft/saves/model vitest suite passed, CAD build passed.
- 2026-04-08: 3D UI/CSS worker completed:
  - `apps/cad-suite/src/app/globals.css`
  - `apps/cad-suite/src/features/planner/3d/Planner3DViewer.tsx`
  - `apps/cad-suite/src/app/configurator/page.tsx` (UI surfaces)
  - Report: `IMPORTANTFILES/docs/reports/planner/AGENT-3D-VIEWER-REPORT.md`
- 2026-04-08: Lead verification after merge:
  - `npm exec vitest run apps/cad-suite/src/features/planner/data/plannerDraft.test.ts apps/cad-suite/src/features/planner/data/plannerSaves.test.ts apps/cad-suite/src/features/planner/model/plannerDocument.test.ts` (pass)
  - `npm -w cad-suite run build` (pass)
- 2026-04-08: Spawned 2 HIGH agents for P0-E (quantity-only enquiry):
  - BOQ/payload pricing removal worker
  - UI/copy pricing removal + enquiry wording worker
- 2026-04-08: Spawned 1 additional HIGH agent for P0-F (Supabase enquiry envelope + CRM sync readiness).
- 2026-04-08: Spawned 1 additional HIGH agent for P0-C (panel width/inset unification) to make total active agents = 4.
- 2026-04-08: P0-E UI enquiry worker completed:
  - `apps/cad-suite/src/features/planner/ui/InspectorPanel.tsx`
  - `apps/cad-suite/src/app/quote-cart/page.tsx`
  - `apps/cad-suite/src/features/planner/ui/InspectorPanel.test.tsx`
  - `apps/cad-suite/src/app/quote-cart/page.test.tsx`
  - Report: `IMPORTANTFILES/docs/reports/planner/AGENT-P0E-UI-ENQUIRY-REPORT.md`
  - Agent validation: targeted vitest pass + CAD build pass.
- 2026-04-08: P0-E payload worker completed:
  - `apps/cad-suite/src/components/draw/types.ts`
  - `apps/cad-suite/src/features/planner/hooks/usePlannerWorkspace.ts`
  - `apps/cad-suite/src/features/planner/lib/documentBridge.ts`
  - `apps/cad-suite/src/features/planner/lib/quoteBridge.ts`
  - `apps/cad-suite/src/features/planner/lib/quoteBridge.test.ts`
  - Report: `IMPORTANTFILES/docs/reports/planner/AGENT-P0E-PRICING-PAYLOAD-REPORT.md`
- 2026-04-08: P0-F worker completed:
  - `apps/cad-suite/src/features/planner/model/plannerDocument.ts`
  - `apps/cad-suite/src/features/planner/data/plannerSaves.ts`
  - `apps/cad-suite/src/features/planner/model/plannerDocument.test.ts`
  - `apps/cad-suite/src/features/planner/data/plannerSaves.test.ts`
  - `supabase/migrations/20260408143000_add_planner_saves_enquiry_payload_and_crm_sync.sql`
  - Report: `IMPORTANTFILES/docs/reports/planner/AGENT-P0F-SUPABASE-CRM-REPORT.md`
- 2026-04-08: P0-C worker completed:
  - `apps/cad-suite/src/app/globals.css`
  - `apps/cad-suite/src/components/draw/SmartdrawPlanner.tsx`
  - `apps/cad-suite/src/features/planner/ui/PlannerDesktopPanels.tsx`
  - `apps/cad-suite/src/features/planner/ui/WorkspacePanel.tsx`
  - Report: `IMPORTANTFILES/docs/reports/planner/AGENT-P0C-PANEL-WIDTH-REPORT.md`
- 2026-04-08: Lead integrated verification after P0-C/P0-E/P0-F:
  - `npm run test:planner -- apps/cad-suite/src/features/planner/lib/quoteBridge.test.ts apps/cad-suite/src/features/planner/ui/InspectorPanel.test.tsx apps/cad-suite/src/app/quote-cart/page.test.tsx apps/cad-suite/src/features/planner/model/plannerDocument.test.ts apps/cad-suite/src/features/planner/data/plannerSaves.test.ts` (pass)
  - `npm -w cad-suite run build` (pass)
- 2026-04-08: Spawned 2 HIGH agents for P0-D dual-version delivery:
  - Version 1 isolated files under `apps/cad-suite/src/features/planner/ui/variants/p0d-v1/`
  - Version 2 isolated files under `apps/cad-suite/src/features/planner/ui/variants/p0d-v2/`
- 2026-04-08: Retasked to new 4-agent split:
  - P1 implementation agent
  - P2 implementation agent
  - Package/dependency audit agent
  - Security/strategic audit agent
- 2026-04-08: Package/dependency audit report delivered:
  - `IMPORTANTFILES/docs/reports/planner/AGENT-PACKAGE-DEPENDENCY-AUDIT.md`
  - Includes strict discrepancy table and critical missing package findings.
- 2026-04-08: Security/strategic audit report delivered:
  - `IMPORTANTFILES/docs/reports/planner/AGENT-SECURITY-STRATEGIC-AUDIT.md`
  - Includes critical migration/RLS/CRM/release-gate risks and priority actions.
