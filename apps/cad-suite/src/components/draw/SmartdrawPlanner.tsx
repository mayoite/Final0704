"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getIndices } from "@tldraw/utils";
import { AssetRecordType, createShapeId, Editor, type TLGeoShape, type TLLineShape } from "tldraw";
import "tldraw/tldraw.css";
import { useRouter } from "next/navigation";

import {
  loadPlannerDocumentFromSupabase,
  loadPlannerDraftDocument,
} from "../../features/planner/data";
import { usePlannerSession } from "../../features/planner/hooks/usePlannerSession";
import { buildPlannerDocumentFromEditor, loadPlannerDocumentIntoEditor } from "../../features/planner/lib/documentBridge";
import { runPlannerComplianceCheck } from "../../features/planner/lib/compliance";
import { configureBasicShapeTool, configureWallTool } from "../../features/planner/lib/editorTools";
import {
  deriveViewportState,
  getShapeMeta,
  getStructuralShapes,
  type CanvasMeasurement,
  type MeasurementUnit,
} from "../../features/planner/lib/measurements";
import { buildPlannerQuoteCartItems, calculatePlannerBoqTotal } from "../../features/planner/lib/quoteBridge";
import {
  LOCAL_CURRENT_DRAFT_ID,
  sanitizePlannerPlanName,
} from "../../features/planner/lib/sessionState";
import {
  createPlannerDocument,
  normalizePlannerDocument,
  type PlannerDocument as SavedPlannerDocument,
} from "../../features/planner/model";
import { PlannerDesktopPanels } from "../../features/planner/ui/PlannerDesktopPanels";
import { PlannerMobilePanels } from "../../features/planner/ui/PlannerMobilePanels";
import { PlannerSessionDialog } from "../../features/planner/ui/PlannerSessionDialog";
import { createClient as createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useQuoteCart } from "@/lib/store/quoteCart";

import { AiCopilot, type AiSuggestion } from "./AiCopilot";
import { PlannerCanvas } from "./PlannerCanvas";
import { PlannerToolbar } from "./PlannerToolbar";
import type { BoqItem, CatalogProduct, PlannerDrawingTool, PlannerStep, RoomPreset } from "./types";

const ROOM_BOUNDARY_ID = createShapeId("room-boundary");

const ROOM_PRESETS: RoomPreset[] = [
  {
    id: "focus-room",
    name: "Focus Room",
    summary: "Compact enclosed shell for focused seating and solo work.",
    widthMm: 3600,
    heightMm: 3000,
  },
  {
    id: "meeting-room",
    name: "Meeting Room",
    summary: "Balanced rectangular shell with central-table clearance.",
    widthMm: 4800,
    heightMm: 3600,
  },
  {
    id: "open-studio",
    name: "Open Studio",
    summary: "Larger open shell for workstation clusters and circulation.",
    widthMm: 7200,
    heightMm: 5400,
  },
];

function getCatalogMetadataValue(product: CatalogProduct, key: string) {
  if (!product.metadata || typeof product.metadata !== "object" || Array.isArray(product.metadata)) {
    return undefined;
  }

  const raw = product.metadata[key];
  return typeof raw === "string" && raw.trim().length > 0 ? raw.trim() : undefined;
}

export function SmartdrawPlanner({
  catalogProducts = [],
  mode = "desktop",
  initialDocument = null,
  initialSaveId = null,
}: {
  catalogProducts?: CatalogProduct[];
  mode?: "desktop" | "mobile";
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
  const isMobileMode = mode === "mobile";
  const importInputRef = useRef<HTMLInputElement | null>(null);

  const [editor, setEditor] = useState<Editor | null>(null);
  const [boqItems, setBoqItems] = useState<BoqItem[]>([]);
  const [hasRoomShellDraft, setHasRoomShellDraft] = useState(false);
  const [currentStep, setCurrentStep] = useState<PlannerStep>("room");
  const [activeDrawingTool, setActiveDrawingTool] = useState<PlannerDrawingTool>("line");
  const [showCatalog, setShowCatalog] = useState(true);
  const [showLayers, setShowLayers] = useState(true);
  const [showInspector, setShowInspector] = useState(true);
  const [catalogPinned, setCatalogPinned] = useState(true);
  const [layersPinned, setLayersPinned] = useState(false);
  const [inspectorPinned, setInspectorPinned] = useState(true);
  const [isSnapMode, setIsSnapMode] = useState(true);
  const [isGridVisible, setIsGridVisible] = useState(true);
  const [zoomPercent, setZoomPercent] = useState(100);
  const [hasSelection, setHasSelection] = useState(false);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [roomMetrics, setRoomMetrics] = useState("W 9000 x H 6500 mm");
  const [selectedMetrics, setSelectedMetrics] = useState<string | null>(null);
  const [canvasMeasurements, setCanvasMeasurements] = useState<CanvasMeasurement[]>([]);
  const [unitSystem, setUnitSystem] = useState<MeasurementUnit>("mm");
  const [gridState, setGridState] = useState({ originX: 0, originY: 0, zoom: 1 });
  const [activePanel, setActivePanel] = useState<"catalog" | "layers" | "inspector" | null>(null);
  const [aiSuggestions, setAiSuggestions] = useState<AiSuggestion[]>([]);
  const [showAi, setShowAi] = useState(true);
  const [mobileCatalogOpen, setMobileCatalogOpen] = useState(false);
  const [mobileLayersOpen, setMobileLayersOpen] = useState(false);
  const [mobileInspectorOpen, setMobileInspectorOpen] = useState(false);
  const [planName, setPlanName] = useState(() => sanitizePlannerPlanName(initialDocument?.name ?? "Untitled plan"));
  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(initialDocument?.id ?? initialSaveId ?? null);
  const [hydratedInitialDocument, setHydratedInitialDocument] = useState(false);

  const canEnterCatalog = hasRoomShellDraft;
  const canEnterMeasure = hasRoomShellDraft;
  const canEnterReview = boqItems.length > 0;

  const getActionableSelectionIds = useCallback(
    () =>
      editor
        ?.getSelectedShapeIds()
        .filter((shapeId) => {
          const meta = getShapeMeta(editor.getShape(shapeId)?.meta);
          return shapeId !== ROOM_BOUNDARY_ID && !meta.isRoomDimension;
        }) ?? [],
    [editor],
  );

  const selectDrawingTool = useCallback(
    (tool: PlannerDrawingTool) => {
      setActiveDrawingTool(tool);
      if (!editor) return;

      if (tool === "line") {
        configureWallTool(editor);
        return;
      }

      if (tool === "geo") {
        configureBasicShapeTool(editor);
        return;
      }

      editor.setCurrentTool(tool);
    },
    [editor],
  );

  const applyStepMode = useCallback(
    (nextStep: PlannerStep) => {
      if (nextStep === "catalog" && !canEnterCatalog) return;
      if (nextStep === "measure" && !canEnterMeasure) return;
      if (nextStep === "review" && !canEnterReview) return;

      setCurrentStep(nextStep);

      if (nextStep === "room") {
        setShowCatalog(true);
        setShowLayers(true);
        setShowInspector(true);
        setActivePanel("catalog");
        setMobileLayersOpen(false);
        setMobileInspectorOpen(false);
        selectDrawingTool("line");
        return;
      }

      if (nextStep === "catalog") {
        setShowCatalog(true);
        setShowLayers(true);
        setShowInspector(true);
        setActivePanel("catalog");
        setMobileLayersOpen(false);
        setMobileInspectorOpen(false);
        selectDrawingTool("select");
        return;
      }

      if (nextStep === "measure") {
        setShowCatalog(false);
        setShowLayers(true);
        setShowInspector(true);
        setActivePanel("layers");
        setMobileCatalogOpen(false);
        if (isMobileMode) {
          setMobileInspectorOpen(true);
        }
        selectDrawingTool("select");
        return;
      }

      setShowCatalog(false);
      setShowLayers(true);
      setShowInspector(true);
      setInspectorPinned(true);
      setActivePanel("inspector");
      setMobileCatalogOpen(false);
      setMobileLayersOpen(false);
      if (isMobileMode) {
        setMobileInspectorOpen(true);
      }
      selectDrawingTool("select");
    },
    [canEnterCatalog, canEnterMeasure, canEnterReview, isMobileMode, selectDrawingTool],
  );

  const applyPlannerDocument = useCallback(
    (document: SavedPlannerDocument) => {
      const normalized = normalizePlannerDocument(document);

      setPlanName(sanitizePlannerPlanName(normalized.name));
      setActiveDocumentId(normalized.id ?? null);
      setUnitSystem(normalized.unitSystem === "imperial" ? "ft-in" : "mm");

      if (editor) {
        loadPlannerDocumentIntoEditor(editor, normalized);
      }

      setCurrentStep(normalized.itemCount > 0 ? "measure" : "room");
      setShowCatalog(true);
      setShowLayers(true);
      setShowInspector(true);
      setActivePanel(normalized.itemCount > 0 ? "inspector" : "catalog");
    },
    [editor],
  );

  const buildAiSuggestions = useCallback(
    (items: BoqItem[], totalShapes: number, geometricWarnings: string[] = []) => {
      const suggestions: AiSuggestion[] = [];

      if (geometricWarnings.length > 0) {
        geometricWarnings.forEach((warning) => {
          suggestions.push({
            type: warning.includes("CRITICAL") ? "action" : "warning",
            text: warning,
          });
        });
      } else if (items.length >= 6) {
        suggestions.push({ type: "tip", text: "Healthy density. Clearances look compliant." });
      }

      if (currentStep === "room" && totalShapes <= 1) {
        suggestions.push({
          type: "tip",
          text: "Step 1 is room shell only. Use presets, wall chains, or basic shapes to define the room first.",
        });
      }

      if (currentStep === "catalog" && items.length === 0) {
        suggestions.push({
          type: "tip",
          text: "Step 2 is catalog. Place modules only after the room shell is defined.",
        });
      }

      if (currentStep === "measure") {
        suggestions.push({
          type: "tip",
          text: "Step 3 is measurement. Read the room dimensions on canvas and inspect selected object sizes before review.",
        });
      }

      if (currentStep === "review" && items.length > 0) {
        suggestions.push({
          type: "action",
          text: `${items.length} item(s) ready. Click Generate Final Quote to proceed.`,
        });
      }

      setAiSuggestions(suggestions);
    },
    [currentStep],
  );

  const handleMount = useCallback((app: Editor) => {
    setEditor(app);
    app.updateInstanceState({ isGridMode: false });
    app.user.updateUserPreferences({ isSnapMode: true });
    configureWallTool(app);
    setActiveDrawingTool("line");
  }, []);

  useEffect(() => {
    if (editor) {
      editor.user.updateUserPreferences({ isSnapMode });
    }
  }, [editor, isSnapMode]);

  useEffect(() => {
    if (editor) {
      editor.updateInstanceState({ isGridMode: false });
    }
  }, [editor, isGridVisible]);

  useEffect(() => {
    if (!editor) return;

    const syncViewportState = () => {
      const viewportState = deriveViewportState(editor, getActionableSelectionIds(), unitSystem);

      setZoomPercent(viewportState.zoomPercent);
      setGridState(viewportState.gridState);
      setHasSelection(viewportState.hasSelection);
      setCanUndo(viewportState.canUndo);
      setCanRedo(viewportState.canRedo);
      setRoomMetrics(viewportState.roomMetrics);
      setSelectedMetrics(viewportState.selectedMetrics);
      setCanvasMeasurements(viewportState.canvasMeasurements);
    };

    syncViewportState();
    const intervalId = window.setInterval(syncViewportState, 200);

    return () => window.clearInterval(intervalId);
  }, [editor, getActionableSelectionIds, unitSystem]);

  useEffect(() => {
    if (!editor) return;

    const syncBoq = () => {
      const shapes = editor.getCurrentPageShapes();
      const items = shapes
        .filter((shape) => getShapeMeta(shape.meta).isPlannerItem)
        .map((shape) => {
          const meta = getShapeMeta(shape.meta);
          return {
            id: String(shape.id),
            productId: meta.productId,
            productSlug: meta.productSlug,
            plannerSourceSlug: meta.plannerSourceSlug,
            name: meta.text || "Custom Module",
            category: meta.category || "Workstations",
            price: Number(meta.price ?? 0),
            imageUrl: meta.imageUrl,
            dimensions: meta.dimensions || "",
          } satisfies BoqItem;
        });
      const structuralShapes = getStructuralShapes(editor);

      setBoqItems(items);
      setHasRoomShellDraft(structuralShapes.length > 0);
      const geometricWarnings = runPlannerComplianceCheck(editor, shapes);
      buildAiSuggestions(items, shapes.length, geometricWarnings);
    };

    syncBoq();

    const stopListening = editor.store.listen(
      (history) => {
        const { added, updated, removed } = history.changes;
        if (
          Object.keys(added).length > 0 ||
          Object.keys(updated).length > 0 ||
          Object.keys(removed).length > 0
        ) {
          syncBoq();
        }
      },
      { source: "user", scope: "document" },
    );

    return () => stopListening();
  }, [buildAiSuggestions, editor]);

  const buildCurrentPlannerDocument = useCallback(() => {
    if (!editor) {
      return createPlannerDocument({
        id: activeDocumentId ?? undefined,
        name: planName,
        unitSystem: unitSystem === "ft-in" ? "imperial" : "metric",
      });
    }

    return buildPlannerDocumentFromEditor(editor, {
      documentId: activeDocumentId,
      name: planName,
      unitSystem,
    });
  }, [activeDocumentId, editor, planName, unitSystem]);
  const buildCurrentPlannerDocumentRef = useRef(buildCurrentPlannerDocument);

  useEffect(() => {
    buildCurrentPlannerDocumentRef.current = buildCurrentPlannerDocument;
  }, [buildCurrentPlannerDocument]);

  const {
    isAuthenticated,
    sessionBusy,
    sessionStatusMessage,
    sessionErrorMessage,
    sessionDialogOpen,
    plannerSavedEntries,
    toolbarSessionModeLabel,
    toolbarSessionStateLabel,
    getDraftScope,
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
  } = usePlannerSession({
    activeDocumentId,
    planName,
    setActiveDocumentId,
    setPlanName,
    supabase,
    router,
    buildCurrentPlannerDocument: () => buildCurrentPlannerDocumentRef.current(),
    applyPlannerDocument,
  });

  useEffect(() => {
    if (!editor || hydratedInitialDocument) return;

    let isCancelled = false;

    const hydratePlanner = async () => {
      let documentToLoad: SavedPlannerDocument | null = null;

      if (initialDocument) {
        documentToLoad = normalizePlannerDocument(initialDocument);
      } else if (initialSaveId && supabase) {
        try {
          const {
            data: { user },
          } = await supabase.auth.getUser();

          if (user?.id) {
            documentToLoad = await loadPlannerDocumentFromSupabase(supabase, initialSaveId, { userId: user.id });
          }
        } catch (error) {
          if (!isCancelled && error instanceof Error) {
            reportSessionError(error.message);
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
    applyPlannerDocument,
    editor,
    getDraftScope,
    hydratedInitialDocument,
    initialDocument,
    initialSaveId,
    reportSessionError,
    supabase,
  ]);

  const handleDropFurniture = (product: CatalogProduct | { name: string; category: string }) => {
    if (!editor) return;
    if (currentStep !== "catalog" || !canEnterCatalog) {
      setAiSuggestions([
        {
          type: "warning",
          text: "Product placement belongs to Step 2. Finish the room shell first, then move to Catalog.",
        },
      ]);
      setShowCatalog(true);
      setShowInspector(true);
      return;
    }

    const viewportCenter = editor.getViewportPageBounds().center;
    let width = 120;
    let height = 120;

    const dimensions = "specs" in product ? product.specs?.dimensions : undefined;
    if (dimensions) {
      const numbers = String(dimensions).match(/\d+/g);
      if (numbers && numbers.length >= 2) {
        width = Number.parseInt(numbers[0], 10) / 10 || 120;
        height = Number.parseInt(numbers[1], 10) / 10 || 120;
      }
    }

    const productId = "id" in product && typeof product.id === "string" ? product.id : undefined;
    const productSlug = "slug" in product && typeof product.slug === "string" ? product.slug : undefined;
    const plannerSourceSlug =
      ("plannerSourceSlug" in product && typeof product.plannerSourceSlug === "string"
        ? product.plannerSourceSlug
        : undefined) ?? getCatalogMetadataValue(product as CatalogProduct, "plannerSourceSlug") ?? getCatalogMetadataValue(product as CatalogProduct, "sourceSlug");
    const imageUrl =
      ("flagship_image" in product ? product.flagship_image || product.images?.[0] : undefined) ?? undefined;
    const meta = {
      text: product.name,
      productId,
      productSlug,
      plannerSourceSlug,
      imageUrl,
      isPlannerItem: true,
      price: "price" in product ? Number(product.price ?? 0) : 0,
      category: product.category || getCatalogMetadataValue(product as CatalogProduct, "category") || "Workstations",
      dimensions: dimensions || "",
    };

    const x = viewportCenter.x - width / 2 + Math.random() * 40 - 20;
    const y = viewportCenter.y - height / 2 + Math.random() * 40 - 20;

    if (imageUrl) {
      const assetId = AssetRecordType.createId();
      editor.createAssets([
        {
          id: assetId,
          type: "image",
          typeName: "asset",
          props: {
            w: width,
            h: height,
            name: product.name,
            isAnimated: false,
            mimeType: "image/png",
            src: imageUrl,
          },
          meta: {},
        },
      ]);

      editor.createShape({
        id: createShapeId(),
        type: "image",
        x,
        y,
        props: { w: width, h: height, assetId },
        meta,
      });
      return;
    }

    editor.createShape({
      id: createShapeId(),
      type: "geo",
      x,
      y,
      props: { geo: "rectangle", w: width, h: height, color: "blue", fill: "semi", size: "s" } as TLGeoShape["props"],
      meta,
    });
  };

  const handleClearAll = () => {
    if (!editor) return;

    const shapeIds = editor.getCurrentPageShapes().map((shape) => shape.id);

    editor.deleteShapes(shapeIds);
    setActiveDocumentId(null);
    setPlanName("Untitled plan");
    applyStepMode("room");
    reportSessionStatus("Planner canvas cleared.");
  };

  const handleApplyRoomPreset = useCallback(
    (preset: RoomPreset) => {
      if (!editor) return;

      const existingShapeIds = editor.getCurrentPageShapes().map((shape) => shape.id);
      if (existingShapeIds.length > 0) {
        editor.deleteShapes(existingShapeIds);
      }

      const width = preset.widthMm / 10;
      const height = preset.heightMm / 10;
      const viewportCenter = editor.getViewportPageBounds().center;
      const originX = viewportCenter.x - width / 2;
      const originY = viewportCenter.y - height / 2;
      const indices = getIndices(5);
      const points = [
        { x: 0, y: 0 },
        { x: width, y: 0 },
        { x: width, y: height },
        { x: 0, y: height },
        { x: 0, y: 0 },
      ];

      editor.createShape({
        id: ROOM_BOUNDARY_ID,
        type: "line",
        x: originX,
        y: originY,
        props: {
          color: "grey",
          dash: "solid",
          size: "m",
          spline: "line",
          scale: 1,
          points: Object.fromEntries(
            points.map((point, index) => [
              indices[index],
              { id: indices[index], index: indices[index], x: point.x, y: point.y },
            ]),
          ),
        } as TLLineShape["props"],
        meta: { isRoomShell: true, presetId: preset.id, text: preset.name },
      });

      applyStepMode("room");
      editor.select(ROOM_BOUNDARY_ID);
      editor.zoomToSelection({ animation: { duration: 200 } });
    },
    [applyStepMode, editor],
  );

  const handleActivateWallTool = useCallback(() => {
    applyStepMode("room");
    selectDrawingTool("line");
  }, [applyStepMode, selectDrawingTool]);

  const handleActivateBasicShapeTool = useCallback(() => {
    applyStepMode("room");
    selectDrawingTool("geo");
  }, [applyStepMode, selectDrawingTool]);

  const handleGenerateQuote = () => {
    if (currentStep === "room") {
      if (!canEnterCatalog) return;
      applyStepMode("catalog");
      return;
    }
    if (currentStep === "catalog") {
      if (!canEnterMeasure) return;
      applyStepMode("measure");
      return;
    }
    if (currentStep === "measure") {
      if (boqItems.length === 0) return;
      applyStepMode("review");
      return;
    }
    if (boqItems.length === 0) return;

    buildPlannerQuoteCartItems(boqItems).forEach((item) => {
      quoteCart.addItem(item);
    });

    router.push("/quote-cart");
  };

  const totalBoq = calculatePlannerBoqTotal(boqItems);

  const adjustZoom = (factor: number) => {
    if (!editor) return;

    const camera = editor.getCamera();
    const nextZoom = Math.max(20, Math.min(400, Math.round(camera.z * factor * 100))) / 100;
    editor.setCamera({ ...camera, z: nextZoom });
    setZoomPercent(Math.round(nextZoom * 100));
  };

  const handleUndo = () => {
    if (!editor || !editor.canUndo()) return;
    editor.undo();
  };

  const handleRedo = () => {
    if (!editor || !editor.canRedo()) return;
    editor.redo();
  };

  const handleFitToDrawing = () => {
    if (!editor) return;
    editor.zoomToFit({ animation: { duration: 200 } });
  };

  const handleFitToSelection = () => {
    if (!editor || getActionableSelectionIds().length === 0) return;
    editor.zoomToSelection({ animation: { duration: 200 } });
  };

  const handleDuplicateSelection = () => {
    if (!editor) return;
    const selectedIds = getActionableSelectionIds();
    if (selectedIds.length === 0) return;
    editor.duplicateShapes(selectedIds, { x: 32, y: 32 });
  };

  const handleDeleteSelection = () => {
    if (!editor) return;
    const selectedIds = getActionableSelectionIds();
    if (selectedIds.length === 0) return;
    editor.deleteShapes(selectedIds);
  };

  return (
    <section className="fixed inset-0 z-[100] h-full w-full overflow-hidden bg-page">
      <input
        ref={importInputRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={handleImportFileChange}
      />

      <div className="relative h-full w-full overflow-hidden">
        <PlannerToolbar
          currentStep={currentStep}
          onStepChange={applyStepMode}
          disabledSteps={{ catalog: !canEnterCatalog, measure: !canEnterMeasure, review: !canEnterReview }}
          planName={planName}
          sessionModeLabel={toolbarSessionModeLabel}
          sessionStateLabel={toolbarSessionStateLabel}
          isSessionBusy={sessionBusy}
          activeDrawingTool={activeDrawingTool}
          onSelectDrawingTool={selectDrawingTool}
          canUndo={canUndo}
          canRedo={canRedo}
          hasSelection={hasSelection}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onFitToDrawing={handleFitToDrawing}
          onFitToSelection={handleFitToSelection}
          onDuplicateSelection={handleDuplicateSelection}
          onDeleteSelection={handleDeleteSelection}
          isSnapMode={isSnapMode}
          onToggleSnap={() => setIsSnapMode((current) => !current)}
          isGridVisible={isGridVisible}
          onToggleGrid={() => setIsGridVisible((current) => !current)}
          zoomPercent={zoomPercent}
          onZoomOut={() => adjustZoom(0.9)}
          onZoomIn={() => adjustZoom(1.1)}
          isMobileMode={isMobileMode}
          showLayers={showLayers}
          showCatalog={showCatalog}
          showInspector={showInspector}
          onToggleLayers={() => {
            setShowLayers((current) => !current);
            setActivePanel("layers");
          }}
          onOpenMobileLayers={() => setMobileLayersOpen(true)}
          onToggleCatalog={() => setShowCatalog((current) => !current)}
          onToggleInspector={() => setShowInspector((current) => !current)}
          onOpenMobileCatalog={() => setMobileCatalogOpen(true)}
          onOpenMobileInspector={() => setMobileInspectorOpen(true)}
          onSaveDraft={handleSaveDraft}
          onImport={() => handleImportRequest(importInputRef.current)}
          onOpenSession={() => setSessionDialogOpen(true)}
          onClearAll={handleClearAll}
          onExport={() => window.print()}
        />

        <PlannerCanvas
          currentStep={currentStep}
          onMount={handleMount}
          isGridVisible={isGridVisible}
          gridState={gridState}
          measurements={canvasMeasurements}
        />

        {!isMobileMode ? (
          <PlannerDesktopPanels
            editor={editor}
            catalogProducts={catalogProducts}
            roomPresets={ROOM_PRESETS}
            boqItems={boqItems}
            totalBoq={totalBoq}
            currentStep={currentStep}
            canContinueFromRoom={canEnterCatalog}
            roomMetrics={roomMetrics}
            selectedMetrics={selectedMetrics}
            unitSystem={unitSystem}
            showCatalog={showCatalog}
            showLayers={showLayers}
            showInspector={showInspector}
            catalogPinned={catalogPinned}
            layersPinned={layersPinned}
            inspectorPinned={inspectorPinned}
            activePanel={activePanel}
            isSnapMode={isSnapMode}
            onDropFurniture={handleDropFurniture}
            onApplyRoomPreset={handleApplyRoomPreset}
            onActivateWallTool={handleActivateWallTool}
            onActivateBasicShapeTool={handleActivateBasicShapeTool}
            onFitSelection={handleFitToSelection}
            onCloseCatalog={() => setShowCatalog(false)}
            onCloseLayers={() => setShowLayers(false)}
            onCloseInspector={() => setShowInspector(false)}
            onToggleCatalogPin={() => setCatalogPinned((current) => !current)}
            onToggleLayersPin={() => setLayersPinned((current) => !current)}
            onToggleInspectorPin={() => setInspectorPinned((current) => !current)}
            onFocusCatalog={() => setActivePanel("catalog")}
            onFocusLayers={() => setActivePanel("layers")}
            onFocusInspector={() => setActivePanel("inspector")}
            onToggleSnap={() => setIsSnapMode((current) => !current)}
            onUnitSystemChange={setUnitSystem}
            onGenerateQuote={handleGenerateQuote}
          />
        ) : null}
      </div>

      {showAi && currentStep !== "room" ? <AiCopilot suggestions={aiSuggestions} onClose={() => setShowAi(false)} /> : null}

      {isMobileMode ? (
        <PlannerMobilePanels
          editor={editor}
          catalogProducts={catalogProducts}
          roomPresets={ROOM_PRESETS}
          boqItems={boqItems}
          totalBoq={totalBoq}
          currentStep={currentStep}
          canContinueFromRoom={canEnterCatalog}
          roomMetrics={roomMetrics}
          selectedMetrics={selectedMetrics}
          unitSystem={unitSystem}
          mobileCatalogOpen={mobileCatalogOpen}
          mobileLayersOpen={mobileLayersOpen}
          mobileInspectorOpen={mobileInspectorOpen}
          isSnapMode={isSnapMode}
          onOpenCatalogChange={setMobileCatalogOpen}
          onOpenLayersChange={setMobileLayersOpen}
          onOpenInspectorChange={setMobileInspectorOpen}
          onDropFurniture={handleDropFurniture}
          onApplyRoomPreset={handleApplyRoomPreset}
          onActivateWallTool={handleActivateWallTool}
          onActivateBasicShapeTool={handleActivateBasicShapeTool}
          onFitSelection={handleFitToSelection}
          onToggleSnap={() => setIsSnapMode((current) => !current)}
          onUnitSystemChange={setUnitSystem}
          onGenerateQuote={handleGenerateQuote}
        />
      ) : null}

      <PlannerSessionDialog
        open={sessionDialogOpen}
        onOpenChange={setSessionDialogOpen}
        planName={planName}
        onPlanNameChange={setPlanName}
        plans={plannerSavedEntries}
        isAuthenticated={isAuthenticated}
        isBusy={sessionBusy}
        statusMessage={sessionStatusMessage}
        errorMessage={sessionErrorMessage}
        canOpen3d={Boolean(editor)}
        onSaveCloud={handleSaveCloud}
        onSaveDraft={handleSaveDraft}
        onLoadPlan={handleLoadPlan}
        onDeletePlan={handleDeletePlan}
        onImport={() => handleImportRequest(importInputRef.current)}
        onExportJson={handleExportJson}
        onOpen3d={handleOpen3d}
        onDismissError={clearSessionError}
      />
    </section>
  );
}
