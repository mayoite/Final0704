import type { PlannerHistoryState } from "@/lib/planner/types";

export function createPlannerHistory<T>(initial: T): PlannerHistoryState<T> {
  return {
    past: [],
    present: initial,
    future: [],
  };
}

export function commitPlannerHistory<T>(
  history: PlannerHistoryState<T>,
  next: T,
) {
  if (Object.is(history.present, next)) {
    return history;
  }

  return {
    past: [...history.past, history.present],
    present: next,
    future: [],
  };
}

export function replacePlannerHistoryPresent<T>(
  history: PlannerHistoryState<T>,
  next: T,
) {
  return {
    ...history,
    present: next,
  };
}

export function undoPlannerHistory<T>(history: PlannerHistoryState<T>) {
  const previous = history.past.at(-1);

  if (previous === undefined) {
    return history;
  }

  return {
    past: history.past.slice(0, -1),
    present: previous,
    future: [history.present, ...history.future],
  };
}

export function redoPlannerHistory<T>(history: PlannerHistoryState<T>) {
  const next = history.future[0];

  if (next === undefined) {
    return history;
  }

  return {
    past: [...history.past, history.present],
    present: next,
    future: history.future.slice(1),
  };
}
