type PlannerEventPayload = Record<string, unknown>;

function emitPlannerEvent(name: string, payload?: PlannerEventPayload) {
  // Preserve the legacy planner import surface without forcing analytics at runtime.
  void name;
  void payload;
}

export function trackPlannerCatalogFailed(payload?: PlannerEventPayload) {
  emitPlannerEvent("planner_catalog_failed", payload);
}

export function trackPlannerCatalogLoaded(payload?: PlannerEventPayload) {
  emitPlannerEvent("planner_catalog_loaded", payload);
}

export function trackPlannerExportFailed(payload?: PlannerEventPayload) {
  emitPlannerEvent("planner_export_failed", payload);
}

export function trackPlannerExportStarted(payload?: PlannerEventPayload) {
  emitPlannerEvent("planner_export_started", payload);
}

export function trackPlannerExportSucceeded(payload?: PlannerEventPayload) {
  emitPlannerEvent("planner_export_succeeded", payload);
}

export function trackPlannerImportFailed(payload?: PlannerEventPayload) {
  emitPlannerEvent("planner_import_failed", payload);
}

export function trackPlannerItemAdded(payload?: PlannerEventPayload) {
  emitPlannerEvent("planner_item_added", payload);
}

export function trackPlannerSessionStarted(payload?: PlannerEventPayload) {
  emitPlannerEvent("planner_session_started", payload);
}

export function trackPlannerViewSwitched(payload?: PlannerEventPayload) {
  emitPlannerEvent("planner_view_switched", payload);
}
