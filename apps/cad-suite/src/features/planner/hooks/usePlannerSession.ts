"use client";

import { useCallback, useEffect, useMemo, useState, type ChangeEvent } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";

import {
  deletePlannerDocumentFromSupabase,
  deletePlannerDraftDocument,
  listPlannerDocumentsFromSupabase,
  loadPlannerDocumentFromSupabase,
  loadPlannerDraftDocument,
  parsePlannerDocumentImportFile,
  savePlannerDocumentToSupabase,
  savePlannerDraftDocument,
} from "../data";
import type { PlannerDocument, PlannerSaveSummary } from "../model";
import {
  buildPlannerToolbarSessionStateLabel,
  createPlannerExportPayload,
  formatPlannerSavedPlanTimestamp,
  LOCAL_CURRENT_DRAFT_ID,
  sanitizePlannerPlanName,
  VIEWER_PREVIEW_DRAFT_ID,
} from "../lib/sessionState";
import { formatDimensionPair, plannerUnitSystemToMeasurementUnit } from "../lib/measurements";
import type { PlannerSavedEntry } from "../ui/PlannerSessionDialog";

interface PlannerSessionOptions {
  activeDocumentId: string | null;
  planName: string;
  setActiveDocumentId: (value: string | null) => void;
  setPlanName: (value: string) => void;
  supabase: SupabaseClient | null;
  router: { push: (href: string) => void };
  buildCurrentPlannerDocument: () => PlannerDocument;
  applyPlannerDocument: (document: PlannerDocument) => void;
}

interface PlannerDraftScope {
  documentId: string;
  userId?: string;
}

function buildPlannerSavedEntries({
  cloudPlans,
  getDraftScope,
}: {
  cloudPlans: PlannerSaveSummary[];
  getDraftScope: (documentId: string) => PlannerDraftScope;
}) {
  const entries: PlannerSavedEntry[] = [];
  const localDraft = loadPlannerDraftDocument(getDraftScope(LOCAL_CURRENT_DRAFT_ID));

  if (localDraft) {
    entries.push({
      id: LOCAL_CURRENT_DRAFT_ID,
      name: localDraft.name,
      source: "local",
      updatedAtLabel: formatPlannerSavedPlanTimestamp(localDraft.updatedAt ?? localDraft.createdAt),
      itemCount: localDraft.itemCount,
      detail: formatDimensionPair(
        localDraft.roomWidthMm,
        localDraft.roomDepthMm,
        plannerUnitSystemToMeasurementUnit(localDraft.unitSystem),
      ),
    });
  }

  cloudPlans.forEach((plan) => {
    entries.push({
      id: plan.id,
      name: plan.name,
      source: "cloud",
      updatedAtLabel: formatPlannerSavedPlanTimestamp(plan.updated_at),
      itemCount: plan.item_count,
      detail: formatDimensionPair(
        plan.room_width_mm,
        plan.room_depth_mm,
        plannerUnitSystemToMeasurementUnit(plan.unit_system),
      ),
    });
  });

  return entries;
}

export function usePlannerSession({
  activeDocumentId,
  planName,
  setActiveDocumentId,
  setPlanName,
  supabase,
  router,
  buildCurrentPlannerDocument,
  applyPlannerDocument,
}: PlannerSessionOptions) {
  const [authUserId, setAuthUserId] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [cloudPlans, setCloudPlans] = useState<PlannerSaveSummary[]>([]);
  const [sessionBusy, setSessionBusy] = useState(false);
  const [sessionStatusMessage, setSessionStatusMessage] = useState<string | null>(null);
  const [sessionErrorMessage, setSessionErrorMessage] = useState<string | null>(null);
  const [sessionDialogOpen, setSessionDialogOpen] = useState(false);
  const [localDraftVersion, setLocalDraftVersion] = useState(0);

  const reportSessionStatus = useCallback((message: string | null) => {
    setSessionStatusMessage(message);
  }, []);

  const reportSessionError = useCallback((message: string | null) => {
    setSessionErrorMessage(message);
  }, []);

  const clearSessionError = useCallback(() => {
    setSessionErrorMessage(null);
  }, []);

  const getDraftScope = useCallback(
    (documentId: string) => ({
      documentId,
      userId: authUserId ?? undefined,
    }),
    [authUserId],
  );

  const syncSessionInventory = useCallback(async () => {
    if (!supabase) {
      setAuthUserId(null);
      setIsAuthenticated(false);
      setCloudPlans([]);
      setLocalDraftVersion((value) => value + 1);
      return;
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const nextUserId = user?.id?.trim() || null;
      setAuthUserId(nextUserId);
      setIsAuthenticated(Boolean(nextUserId));

      if (nextUserId) {
        const savedPlans = await listPlannerDocumentsFromSupabase(supabase, { userId: nextUserId });
        setCloudPlans(savedPlans);
      } else {
        setCloudPlans([]);
      }
    } catch (error) {
      setAuthUserId(null);
      setIsAuthenticated(false);
      setCloudPlans([]);
      if (error instanceof Error) {
        reportSessionError(error.message);
      }
    } finally {
      setLocalDraftVersion((value) => value + 1);
    }
  }, [reportSessionError, supabase]);

  useEffect(() => {
    void syncSessionInventory();
  }, [syncSessionInventory]);

  const handleSaveCloud = useCallback(async () => {
    if (!isAuthenticated) {
      reportSessionError("Sign in is required for cloud save.");
      return;
    }
    if (!supabase) {
      reportSessionError("Supabase is not configured in this environment.");
      return;
    }

    setSessionBusy(true);
    try {
      const savedDocument = await savePlannerDocumentToSupabase(supabase, buildCurrentPlannerDocument(), {
        userId: authUserId ?? undefined,
        saveId: activeDocumentId ?? undefined,
      });

      setPlanName(savedDocument.name);
      setActiveDocumentId(savedDocument.id ?? null);
      reportSessionStatus(`Cloud save updated: ${savedDocument.name}`);
      await syncSessionInventory();
    } catch (error) {
      reportSessionError(error instanceof Error ? error.message : "Unable to save planner document.");
    } finally {
      setSessionBusy(false);
    }
  }, [
    activeDocumentId,
    authUserId,
    buildCurrentPlannerDocument,
    isAuthenticated,
    reportSessionError,
    reportSessionStatus,
    setActiveDocumentId,
    setPlanName,
    supabase,
    syncSessionInventory,
  ]);

  const handleSaveDraft = useCallback(() => {
    const savedDraft = savePlannerDraftDocument(buildCurrentPlannerDocument(), getDraftScope(LOCAL_CURRENT_DRAFT_ID));
    setLocalDraftVersion((value) => value + 1);
    reportSessionStatus(
      savedDraft
        ? `Local draft updated: ${formatPlannerSavedPlanTimestamp(savedDraft.savedAt)}`
        : "Draft save is unavailable in this environment.",
    );
  }, [buildCurrentPlannerDocument, getDraftScope, reportSessionStatus]);

  const handleLoadPlan = useCallback(
    async (plan: PlannerSavedEntry) => {
      setSessionBusy(true);
      try {
        if (plan.source === "local") {
          const draft = loadPlannerDraftDocument(getDraftScope(plan.id));
          if (!draft) {
            reportSessionError("Local draft not found.");
            return;
          }

          applyPlannerDocument(draft);
          reportSessionStatus(`Loaded local draft: ${draft.name}`);
          return;
        }

        if (!supabase) {
          reportSessionError("Supabase is not configured in this environment.");
          return;
        }

        const cloudDocument = await loadPlannerDocumentFromSupabase(supabase, plan.id, {
          userId: authUserId ?? undefined,
        });

        if (!cloudDocument) {
          reportSessionError("Cloud plan not found.");
          return;
        }

        applyPlannerDocument(cloudDocument);
        reportSessionStatus(`Loaded cloud plan: ${cloudDocument.name}`);
      } catch (error) {
        reportSessionError(error instanceof Error ? error.message : "Unable to load planner document.");
      } finally {
        setSessionBusy(false);
      }
    },
    [applyPlannerDocument, authUserId, getDraftScope, reportSessionError, reportSessionStatus, supabase],
  );

  const handleDeletePlan = useCallback(
    async (plan: PlannerSavedEntry) => {
      setSessionBusy(true);
      try {
        if (plan.source === "local") {
          deletePlannerDraftDocument(getDraftScope(plan.id));
          setLocalDraftVersion((value) => value + 1);
          reportSessionStatus("Local draft removed.");
          return;
        }

        if (!supabase) {
          reportSessionError("Supabase is not configured in this environment.");
          return;
        }

        const deleted = await deletePlannerDocumentFromSupabase(supabase, plan.id, {
          userId: authUserId ?? undefined,
        });
        reportSessionStatus(deleted ? "Cloud plan removed." : "Cloud plan was not found.");
        await syncSessionInventory();
      } catch (error) {
        reportSessionError(error instanceof Error ? error.message : "Unable to delete planner document.");
      } finally {
        setSessionBusy(false);
      }
    },
    [authUserId, getDraftScope, reportSessionError, reportSessionStatus, supabase, syncSessionInventory],
  );

  const handleImportRequest = useCallback((input: HTMLInputElement | null) => {
    input?.click();
  }, []);

  const handleImportFileChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      setSessionBusy(true);
      try {
        const parsed = await parsePlannerDocumentImportFile(file);
        if (!parsed.ok || !parsed.document) {
          reportSessionError(parsed.errors.join(" | "));
          return;
        }

        applyPlannerDocument(parsed.document);
        reportSessionStatus(`Imported planner JSON: ${parsed.document.name}`);
        savePlannerDraftDocument(parsed.document, getDraftScope(LOCAL_CURRENT_DRAFT_ID));
        setLocalDraftVersion((value) => value + 1);
      } catch (error) {
        reportSessionError(error instanceof Error ? error.message : "Unable to import planner JSON.");
      } finally {
        event.currentTarget.value = "";
        setSessionBusy(false);
      }
    },
    [applyPlannerDocument, getDraftScope, reportSessionError, reportSessionStatus],
  );

  const handleExportJson = useCallback(() => {
    const plannerDocument = buildCurrentPlannerDocument();
    const payload = JSON.stringify(createPlannerExportPayload(plannerDocument), null, 2);
    const blob = new Blob([payload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = window.document.createElement("a");
    anchor.href = url;
    anchor.download = `${
      sanitizePlannerPlanName(planName).toLowerCase().replace(/[^a-z0-9]+/g, "-") || "planner-document"
    }.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    reportSessionStatus("Planner JSON exported.");
  }, [buildCurrentPlannerDocument, planName, reportSessionStatus]);

  const handleOpen3d = useCallback(() => {
    const plannerDocument = buildCurrentPlannerDocument();
    savePlannerDraftDocument(plannerDocument, getDraftScope(VIEWER_PREVIEW_DRAFT_ID));
    router.push(`/configurator?draft=${VIEWER_PREVIEW_DRAFT_ID}`);
  }, [buildCurrentPlannerDocument, getDraftScope, router]);

  const plannerSavedEntries = useMemo(() => {
    void localDraftVersion;
    return buildPlannerSavedEntries({ cloudPlans, getDraftScope });
  }, [cloudPlans, getDraftScope, localDraftVersion]);

  const toolbarSessionModeLabel = isAuthenticated ? "Cloud + local drafts" : "Local draft mode";
  const toolbarSessionStateLabel = buildPlannerToolbarSessionStateLabel({
    sessionBusy,
    sessionErrorMessage,
    sessionStatusMessage,
    activeDocumentId,
  });

  return {
    authUserId,
    isAuthenticated,
    sessionBusy,
    sessionStatusMessage,
    sessionErrorMessage,
    sessionDialogOpen,
    plannerSavedEntries,
    toolbarSessionModeLabel,
    toolbarSessionStateLabel,
    getDraftScope,
    syncSessionInventory,
    reportSessionStatus,
    reportSessionError,
    clearSessionError,
    setSessionDialogOpen,
    handleSaveCloud,
    handleSaveDraft,
    handleLoadPlan,
    handleDeletePlan,
    handleImportRequest,
    handleImportFileChange,
    handleExportJson,
    handleOpen3d,
  };
}
