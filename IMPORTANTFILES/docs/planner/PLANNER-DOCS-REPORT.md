# Planner Docs Old vs New Report

Generated: 2026-04-07

## Purpose

This report explains the planner documentation split into `old/` and `new/`.

The goal is to stop mixing:

- live planner strategy
- historical planner notes
- comparative reference material

into one flat folder where every file looks equally authoritative.

## Executive Summary

The planner docs were divided into:

- `new/` for current authority
- `old/` for historical and reference material

This split was necessary because the repo had reached a state where older planner docs were still useful, but they no longer described the live codebase accurately.

## Why The Split Was Needed

| Problem | Before | After |
|---|---|---|
| Authority was unclear | Current and historical docs sat side by side | `new/` holds current authority |
| Historical docs looked active | Old handovers and flow docs looked like live system truth | `old/` now signals reference-only material |
| Planner decisions could be made from stale docs | Easy to read the wrong file first | Reading order is now explicit |
| Current planner strategy was mixed with legacy notes | Too much cognitive load | Current strategy is grouped and isolated |

## Folder Structure

```text
IMPORTANTFILES/docs/planner/
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

## New Docs

These are the files that should drive active planner work.

| File | Why It Is In `new/` | Use |
|---|---|---|
| `new/PLANNER-DETAILED-PLAN.md` | It is the current planner strategy and architecture document | Main build direction |
| `new/PLANNER-PLAN-POST.md` | It is the current planner execution summary | Working reference |
| `new/planner-old-vs-new-architecture.svg` | It visually explains the target direction | Architecture communication |

## Old Docs

These files still have value, but that value is reference value.

| File | Why It Is In `old/` | Use |
|---|---|---|
| `old/HANDOVER.md` | Describes a prior planner state and assumptions | Historical context |
| `old/PLANNER-FLOW-AND-STRUCTURE.md` | Documents an older flow model | Legacy comparison |
| `old/PLANNER-QUOTE-FLOW.md` | Older quote flow explanation | Prior workflow reference |
| `old/architecture_matrix.md` | Historical comparison material | Comparison reference |
| `old/architecture_matrix_wide.md` | Expanded historical comparison | Comparison reference |
| `old/SMARTDRAW_PLAN.md` | Legacy planning note | Design archaeology |
| `old/b_yeh_standalone_planner_walkthrough.md` | Donor planner walkthrough | Extraction reference |

## Trust Model

| Priority | Source | Meaning |
|---|---|---|
| 1 | `new/PLANNER-DETAILED-PLAN.md` | Highest authority |
| 2 | `new/PLANNER-PLAN-POST.md` | Current working summary |
| 3 | `new/planner-old-vs-new-architecture.svg` | Visual support for current direction |
| 4 | `old/*` | Historical context only |

## What This Changes Practically

### For planning

- use `new/` files first
- use `old/` only when you need background, donor extraction clues, or legacy comparisons

### For implementation

- do not treat `old/` paths as if they describe the current live planner architecture
- use `new/PLANNER-DETAILED-PLAN.md` as the canonical planner direction

### For onboarding

- the first planner doc a new contributor should read is now obvious
- the old materials remain available without pretending to be current

## Detailed Comparison

| Dimension | Old Docs | New Docs |
|---|---|---|
| Main role | Historical record and reference | Current planner authority |
| Relationship to live repo | Partly stale | Intentionally aligned to live repo decisions |
| Route truth | Often describes older route families | Anchored on current `apps/cad-suite` planner |
| Persistence model | Historical / mixed | Explicit one-store direction |
| Import and auth requirements | Not consistently framed | Explicitly defined |
| Measurement treatment | Implicit or scattered | Explicit core requirement |

## Recommendation

Keep this split.

Do not flatten `old/` and `new/` back together.

The correct reading behavior is:

1. read `new/`
2. implement from `new/`
3. consult `old/` only when you need background or donor extraction context
