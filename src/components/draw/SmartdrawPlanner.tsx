"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import "tldraw/tldraw.css";
import { useRouter } from "next/navigation";

import { loadPlannerDocumentFromSupabase } from "../../features/planner/data/plannerSaves";
import { loadPlannerDraftDocument } from "../../features/planner/data/plannerDraft";
import { usePlannerSession } from "../../features/planner/hooks/usePlannerSession";
import { usePlannerWorkspace } from "../../features/planner/hooks/usePlannerWorkspace";
import { LOCAL_CURRENT_DRAFT_ID, sanitizePlannerPlanName } from "../../features/planner/lib/sessionState";
import {
  normalizePlannerDocument,
  type PlannerDocument as SavedPlannerDocument,
} from "../../features/planner/model";
import { PlannerCanvas } from "../../features/planner/ui/PlannerCanvas";
import { PlannerDesktopPanels } from "../../features/planner/ui/PlannerDesktopPanels";
import { PlannerMobilePanels } from "../../features/planner/ui/PlannerMobilePanels";
import { PlannerSessionDialog } from "../../features/planner/ui/PlannerSessionDialog";
import { PlannerToolbar } from "../../features/planner/ui/PlannerToolbar";
import {
  DEFAULT_PLANNER_PANEL_DOCK_GAP_PX,
  DEFAULT_PLANNER_PANEL_WIDTH_PX,
  PLANNER_PANEL_DOCK_GAP_CSS_VAR,
  PLANNER_PANEL_WIDTH_CSS_VAR,
} from "../../features/planner/ui/WorkspacePanel";
import {
  createClient as createSupabaseBrowserClient,
  getBrowserSessionUser,
} from "@/lib/supabase/client";
import { useQuoteCart } from "@/lib/store/quoteCart";

import { AiCopilot } from "./AiCopilot";
import type { CatalogProduct } from "./types";

export function SmartdrawPlanner({
  catalogProducts = [],
  mode = "auto",
  initialDocument = null,
  initialSaveId = null,
}: {
  catalogProducts?: CatalogProduct[];
  mode?: "desktop" | "mobile" | "auto";
  initialDocument?: SavedPlannerDocument | null;
  initialSaveId?: string | null;
}) {
  const router = useRouter();
  const quoteCart = useQuoteCart();
  const supabase = useMemo(() => {
    const hasSupabaseEnv = Boolean(
      process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    );
    return hasSupabaseEnv ? createSupabaseBrowserClient() : null;
  }, []);
  const importInputRef = useRef<HTMLInputElement | null>(null);
  const toolbarRef = useRef<HTMLDivElement | null>(null);
  const [planName, setPlanName] = useState(() => sanitizePlannerPlanName(initialDocument?.name ?? "Untitled plan"));
  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(initialDocument?.id ?? initialSaveId ?? null);
  const [hydratedInitialDocument, setHydratedInitialDocument] = useState(false);
  const [toolbarInsetPx, setToolbarInsetPx] = useState(() => (mode === "mobile" ? 128 : 192));
  const [desktopPanelWidthPx, setDesktopPanelWidthPx] = useState(DEFAULT_PLANNER_PANEL_WIDTH_PX);
  const [desktopPanelDockGapPx, setDesktopPanelDockGapPx] = useState(DEFAULT_PLANNER_PANEL_DOCK_GAP_PX);

  const workspace = usePlannerWorkspace({
    mode,
    planName,
    setPlanName,
    activeDocumentId,
    setActiveDocumentId,
    navigate: (href) => router.push(href),
    addBoqItem: (item) => quoteCart.addItem(item),
    clearBoqCart: () => quoteCart.clearCart(),
    catalogProducts,
  });

  const buildCurrentPlannerDocumentRef = useRef(workspace.buildCurrentPlannerDocument);

  useEffect(() => {
    buildCurrentPlannerDocumentRef.current = workspace.buildCurrentPlannerDocument;
  }, [workspace.buildCurrentPlannerDocument]);

  const session = usePlannerSession({
    activeDocumentId,
    planName,
    setActiveDocumentId,
    setPlanName,
    supabase,
    router,
    buildCurrentPlannerDocument: () => buildCurrentPlannerDocumentRef.current(),
    applyPlannerDocument: workspace.applyPlannerDocument,
  });
  const plannerEditor = workspace.editor;
  const applyPlannerDocument = workspace.applyPlannerDocument;
  const getDraftScope = session.getDraftScope;
  const reportSessionError = session.reportSessionError;
  const desktopTopInsetPx = toolbarInsetPx;
  const desktopPanelDockedSpanPx = desktopPanelWidthPx + desktopPanelDockGapPx;
  const canvasLeftInsetPx =
    !workspace.isMobileMode && workspace.showCatalog && workspace.catalogPinned ? desktopPanelDockedSpanPx : 0;
  const canvasRightInsetPx =
    !workspace.isMobileMode
      ? (workspace.showInspector && workspace.inspectorPinned ? desktopPanelDockedSpanPx : 0) +
        (workspace.showLayers && workspace.layersPinned ? desktopPanelDockedSpanPx : 0)
      : 0;

  useEffect(() => {
    if (typeof window === "undefined") return;

    const syncDesktopPanelWidth = () => {
      const rawWidth = window.getComputedStyle(document.documentElement).getPropertyValue(PLANNER_PANEL_WIDTH_CSS_VAR);
      const rawDockGap = window
        .getComputedStyle(document.documentElement)
        .getPropertyValue(PLANNER_PANEL_DOCK_GAP_CSS_VAR);
      const parsedWidth = Number.parseFloat(rawWidth);
      const parsedDockGap = Number.parseFloat(rawDockGap);
      setDesktopPanelWidthPx(Number.isFinite(parsedWidth) ? parsedWidth : DEFAULT_PLANNER_PANEL_WIDTH_PX);
      setDesktopPanelDockGapPx(Number.isFinite(parsedDockGap) ? parsedDockGap : DEFAULT_PLANNER_PANEL_DOCK_GAP_PX);
    };

    syncDesktopPanelWidth();
    window.addEventListener("resize", syncDesktopPanelWidth);

    return () => {
      window.removeEventListener("resize", syncDesktopPanelWidth);
    };
  }, []);

  useEffect(() => {
    const toolbarElement = toolbarRef.current;
    if (!toolbarElement) return;

    const syncToolbarInset = () => {
      const nextInset = Math.max(128, Math.ceil(toolbarElement.getBoundingClientRect().height) + 24);
      setToolbarInsetPx(nextInset);
    };

    syncToolbarInset();

    const resizeObserver = new ResizeObserver(() => {
      syncToolbarInset();
    });

    resizeObserver.observe(toolbarElement);
    window.addEventListener("resize", syncToolbarInset);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", syncToolbarInset);
    };
  }, [workspace.isMobileMode]);

  useEffect(() => {
    if (!plannerEditor || hydratedInitialDocument) return;

    let isCancelled = false;

    const hydratePlanner = async () => {
      let documentToLoad: SavedPlannerDocument | null = null;

      if (initialDocument) {
        documentToLoad = normalizePlannerDocument(initialDocument);
      } else if (initialSaveId && supabase) {
        try {
          const user = await getBrowserSessionUser(supabase);

          if (user?.id) {
            documentToLoad = await loadPlannerDocumentFromSupabase(supabase, initialSaveId, { userId: user.id });
          }
        } catch (error) {
          if (!isCancelled) {
            reportSessionError(
              error instanceof Error
                ? `Cloud planner load is unavailable right now. Using local draft mode instead. ${error.message}`
                : "Cloud planner load is unavailable right now. Using local draft mode instead.",
            );
          }
        }
      }

      if (!documentToLoad) {
        documentToLoad = loadPlannerDraftDocument(getDraftScope(LOCAL_CURRENT_DRAFT_ID));
      }

      if (!isCancelled && documentToLoad) {
        applyPlannerDocument(documentToLoad);
      }

      if (!isCancelled) {
        setHydratedInitialDocument(true);
      }
    };

    void hydratePlanner();

    return () => {
      isCancelled = true;
    };
  }, [
    hydratedInitialDocument,
    initialDocument,
    initialSaveId,
    getDraftScope,
    plannerEditor,
    reportSessionError,
    supabase,
    applyPlannerDocument,
  ]);

  const handleClearAll = () => {
    workspace.handleClearAll();
    session.reportSessionStatus("Planner canvas cleared.");
  };

  return (
    <section className="fixed inset-0 z-[100] isolate h-full w-full overflow-hidden bg-page">
      <input
        ref={importInputRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={session.handleImportFileChange}
      />

      <div className="relative h-full w-full overflow-hidden">
        <PlannerToolbar
          containerRef={toolbarRef}
          currentStep={workspace.currentStep}
          onStepChange={workspace.applyStepMode}
          disabledSteps={{
            catalog: !workspace.canEnterCatalog,
            measure: !workspace.canEnterMeasure,
            review: !workspace.canEnterReview,
          }}
          planName={planName}
          sessionModeLabel={session.toolbarSessionModeLabel}
          sessionStateLabel={session.toolbarSessionStateLabel}
          isSessionBusy={session.sessionBusy}
          activeDrawingTool={workspace.activeDrawingTool}
          onSelectDrawingTool={workspace.selectDrawingTool}
          canUndo={workspace.canUndo}
          canRedo={workspace.canRedo}
          hasSelection={workspace.hasSelection}
          onUndo={workspace.handleUndo}
          onRedo={workspace.handleRedo}
          onFitToDrawing={workspace.handleFitToDrawing}
          onFitToSelection={workspace.handleFitToSelection}
          onDeselectSelection={workspace.handleDeselectSelection}
          onDuplicateSelection={workspace.handleDuplicateSelection}
          onDeleteSelection={workspace.handleDeleteSelection}
          isSnapMode={workspace.isSnapMode}
          onToggleSnap={() => workspace.setIsSnapMode((current) => !current)}
          isGridVisible={workspace.isGridVisible}
          onToggleGrid={() => workspace.setIsGridVisible((current) => !current)}
          zoomPercent={workspace.zoomPercent}
          onZoomOut={() => workspace.adjustZoom(0.9)}
          onZoomIn={() => workspace.adjustZoom(1.1)}
          isMobileMode={workspace.isMobileMode}
          showLayers={workspace.showLayers}
          showCatalog={workspace.showCatalog}
          showInspector={workspace.showInspector}
          onToggleLayers={() => {
            workspace.setShowLayers((current) => !current);
            workspace.setActivePanel("layers");
          }}
          onOpenMobileLayers={() => workspace.setMobileLayersOpen(true)}
          onToggleCatalog={() => workspace.setShowCatalog((current) => !current)}
          onToggleInspector={() => workspace.setShowInspector((current) => !current)}
          onOpenMobileCatalog={() => workspace.setMobileCatalogOpen(true)}
          onOpenMobileInspector={() => workspace.setMobileInspectorOpen(true)}
          onSaveDraft={session.handleSaveDraft}
          onOpen3d={session.handleOpen3d}
          onImport={() => session.handleImportRequest(importInputRef.current)}
          onOpenSession={() => session.setSessionDialogOpen(true)}
          onClearAll={handleClearAll}
          onExport={() => window.print()}
        />

        <PlannerCanvas
          currentStep={workspace.currentStep}
          onMount={workspace.handleMount}
          isGridVisible={workspace.isGridVisible}
          topInsetPx={desktopTopInsetPx}
          leftInsetPx={canvasLeftInsetPx}
          rightInsetPx={canvasRightInsetPx}
          gridState={workspace.gridState}
          measurements={workspace.canvasMeasurements}
        />

        {!workspace.isMobileMode ? (
          <PlannerDesktopPanels
            editor={workspace.editor}
            catalogProducts={catalogProducts}
            roomPresets={workspace.roomPresets}
            boqItems={workspace.boqItems}
            totalBoq={workspace.totalBoq}
            currentStep={workspace.currentStep}
            canContinueFromRoom={workspace.canEnterCatalog}
            roomMetrics={workspace.roomMetrics}
            selectedMetrics={workspace.selectedMetrics}
            selectionDimensions={workspace.selectionDimensions}
            unitSystem={workspace.unitSystem}
            showCatalog={workspace.showCatalog}
            showLayers={workspace.showLayers}
            showInspector={workspace.showInspector}
            catalogPinned={workspace.catalogPinned}
            layersPinned={workspace.layersPinned}
            inspectorPinned={workspace.inspectorPinned}
            activePanel={workspace.activePanel}
            isSnapMode={workspace.isSnapMode}
            onDropFurniture={workspace.handleDropFurniture}
            onApplyRoomPreset={workspace.handleApplyRoomPreset}
            onActivateWallTool={workspace.handleActivateWallTool}
            onActivateBasicShapeTool={workspace.handleActivateBasicShapeTool}
            onAddWallSegment={workspace.handleAddWallSegment}
            onAddDoorOpening={workspace.handleAddDoorOpening}
            onResolveWallJoins={workspace.handleResolveWallJoins}
            onFitSelection={workspace.handleFitToSelection}
            onAlignSelection={workspace.handleAlignSelection}
            onDistributeSelection={workspace.handleDistributeSelection}
            onCloseCatalog={() => workspace.setShowCatalog(false)}
            onCloseLayers={() => workspace.setShowLayers(false)}
            onCloseInspector={() => workspace.setShowInspector(false)}
            onToggleCatalogPin={() => workspace.setCatalogPinned((current) => !current)}
            onToggleLayersPin={() => workspace.setLayersPinned((current) => !current)}
            onToggleInspectorPin={() => workspace.setInspectorPinned((current) => !current)}
            onFocusCatalog={() => workspace.setActivePanel("catalog")}
            onFocusLayers={() => workspace.setActivePanel("layers")}
            onFocusInspector={() => workspace.setActivePanel("inspector")}
            onToggleSnap={() => workspace.setIsSnapMode((current) => !current)}
            onUpdateSelectionDimensions={workspace.handleUpdateSelectionDimensions}
            onUnitSystemChange={workspace.setUnitSystem}
            onAdvanceBoqFlow={workspace.handleAdvanceBoqFlow}
            topInsetPx={desktopTopInsetPx}
            panelDockedSpanPx={desktopPanelDockedSpanPx}
          />
        ) : null}
      </div>

      {workspace.showAi && workspace.currentStep !== "room" ? (
        <AiCopilot suggestions={workspace.aiSuggestions} onClose={() => workspace.setShowAi(false)} />
      ) : null}

      {workspace.isMobileMode ? (
        <PlannerMobilePanels
          editor={workspace.editor}
          catalogProducts={catalogProducts}
          roomPresets={workspace.roomPresets}
          boqItems={workspace.boqItems}
          totalBoq={workspace.totalBoq}
          currentStep={workspace.currentStep}
          canContinueFromRoom={workspace.canEnterCatalog}
          roomMetrics={workspace.roomMetrics}
          selectedMetrics={workspace.selectedMetrics}
          selectionDimensions={workspace.selectionDimensions}
          unitSystem={workspace.unitSystem}
          mobileCatalogOpen={workspace.mobileCatalogOpen}
          mobileLayersOpen={workspace.mobileLayersOpen}
          mobileInspectorOpen={workspace.mobileInspectorOpen}
          isSnapMode={workspace.isSnapMode}
          onOpenCatalogChange={workspace.setMobileCatalogOpen}
          onOpenLayersChange={workspace.setMobileLayersOpen}
          onOpenInspectorChange={workspace.setMobileInspectorOpen}
          onDropFurniture={workspace.handleDropFurniture}
          onApplyRoomPreset={workspace.handleApplyRoomPreset}
          onActivateWallTool={workspace.handleActivateWallTool}
          onActivateBasicShapeTool={workspace.handleActivateBasicShapeTool}
          onAddWallSegment={workspace.handleAddWallSegment}
          onAddDoorOpening={workspace.handleAddDoorOpening}
          onResolveWallJoins={workspace.handleResolveWallJoins}
          onFitSelection={workspace.handleFitToSelection}
          onAlignSelection={workspace.handleAlignSelection}
          onDistributeSelection={workspace.handleDistributeSelection}
          onToggleSnap={() => workspace.setIsSnapMode((current) => !current)}
          onUpdateSelectionDimensions={workspace.handleUpdateSelectionDimensions}
          onUnitSystemChange={workspace.setUnitSystem}
          onAdvanceBoqFlow={workspace.handleAdvanceBoqFlow}
        />
      ) : null}

      <PlannerSessionDialog
        open={session.sessionDialogOpen}
        onOpenChange={session.setSessionDialogOpen}
        planName={planName}
        onPlanNameChange={setPlanName}
        plans={session.plannerSavedEntries}
        isAuthenticated={session.isAuthenticated}
        isBusy={session.sessionBusy}
        statusMessage={session.sessionStatusMessage}
        errorMessage={session.sessionErrorMessage}
        canOpen3d={Boolean(workspace.editor)}
        isAdmin={session.isAdmin}
        adminPlans={session.plannerAdminSavedEntries}
        managedProducts={session.plannerManagedProducts}
        onSaveCloud={session.handleSaveCloud}
        onSaveDraft={session.handleSaveDraft}
        onLoadPlan={session.handleLoadPlan}
        onDeletePlan={session.handleDeletePlan}
        onImport={() => session.handleImportRequest(importInputRef.current)}
        onExportJson={session.handleExportJson}
        onOpen3d={session.handleOpen3d}
        onUpsertManagedProduct={session.handleUpsertManagedProduct}
        onDeleteManagedProduct={session.handleDeleteManagedProduct}
        onDismissError={session.clearSessionError}
      />
    </section>
  );
}
