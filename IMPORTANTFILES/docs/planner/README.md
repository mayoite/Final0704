# Planner Docs Index

## Purpose

This folder contains planner-specific documentation.

Not all files here have the same authority.
Some are current planning documents.
Some are historical or comparative references.

## Structure

```text
planner/
  README.md
  PLANNER-DOCS-REPORT.md
  new/
    README.md
    PLANNER-DETAILED-PLAN.md
    PLANNER-PLAN-POST.md
    planner-old-vs-new-architecture.svg
  old/
    README.md
    HANDOVER.md
    PLANNER-FLOW-AND-STRUCTURE.md
    PLANNER-QUOTE-FLOW.md
    architecture_matrix.md
    architecture_matrix_wide.md
    SMARTDRAW_PLAN.md
    b_yeh_standalone_planner_walkthrough.md
```

## Recommended Reading Order

1. `PLANNER-DOCS-REPORT.md`
2. `new/PLANNER-DETAILED-PLAN.md`
3. `new/PLANNER-PLAN-POST.md`
4. `new/planner-old-vs-new-architecture.svg`
5. `old/HANDOVER.md`
6. `old/PLANNER-FLOW-AND-STRUCTURE.md`

## Current / Authoritative Docs

| File | Status | Role |
|---|---|---|
| `new/PLANNER-DETAILED-PLAN.md` | Current | Main planner strategy, architecture, phases, auth, persistence, measurement |
| `new/PLANNER-PLAN-POST.md` | Current | Planner-only working plan summary |
| `new/planner-old-vs-new-architecture.svg` | Current | Visual old-vs-new architecture diagram |
| `PLANNER-DOCS-REPORT.md` | Current | Detailed report on old vs new planner docs and trust order |

## Reference / Historical Docs

| File | Status | Role |
|---|---|---|
| `old/HANDOVER.md` | Reference | Historical planner handoff and system framing |
| `old/PLANNER-FLOW-AND-STRUCTURE.md` | Reference | Older planner flow description |
| `old/PLANNER-QUOTE-FLOW.md` | Reference | Older quote-flow description |
| `old/architecture_matrix.md` | Reference | Planner comparison matrix |
| `old/architecture_matrix_wide.md` | Reference | Expanded planner comparison matrix |
| `old/SMARTDRAW_PLAN.md` | Reference | Legacy planning note |
| `old/b_yeh_standalone_planner_walkthrough.md` | Reference | Standalone planner snapshot walkthrough |

## Ground Rule

If a current document conflicts with a reference document:

- trust `new/PLANNER-DETAILED-PLAN.md`
- then trust `new/PLANNER-PLAN-POST.md`
- treat the older files as context, not system truth
