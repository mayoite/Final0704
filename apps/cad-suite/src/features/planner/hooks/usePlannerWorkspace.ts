import { useCallback, useEffect, useState } from "react";
import { getIndices } from "@tldraw/utils";
import { AssetRecordType, createShapeId, Editor, type TLGeoShape, type TLLineShape } from "tldraw";

import type { BoqItem, CatalogProduct, PlannerDrawingTool, PlannerStep, RoomPreset } from "@/components/draw/types";

import { runPlannerComplianceCheck } from "../lib/compliance";
import { buildPlannerDocumentFromEditor, loadPlannerDocumentIntoEditor } from "../lib/documentBridge";
import {
  alignPlannerSelection,
  configureBasicShapeTool,
  configureWallTool,
  createPlannerDoorOpening,
  createPlannerWallSegment,
  distributePlannerSelection,
  readPlannerSelectionDimensions,
  resolvePlannerWallJoins,
  type PlannerSelectionDimensions,
  updatePlannerSelectionDimensions,
} from "../lib/editorTools";
import {
  deriveViewportState,
  formatDimensionPair,
  getShapeMeta,
  getStructuralShapes,
  type CanvasMeasurement,
} from "../lib/measurements";
import { buildPlannerQuoteCartItems, calculatePlannerBoqTotal } from "../lib/quoteBridge";
import { sanitizePlannerPlanName } from "../lib/sessionState";
import { usePlannerUiState } from "./usePlannerUiState";
import {
  createPlannerDocument,
  normalizePlannerDocument,
  type PlannerDocument as SavedPlannerDocument,
} from "../model";

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

interface UsePlannerWorkspaceOptions {
  mode: "desktop" | "mobile" | "auto";
  planName: string;
  setPlanName: (value: string) => void;
  activeDocumentId: string | null;
  setActiveDocumentId: (value: string | null) => void;
  navigate: (href: string) => void;
  addQuoteItem: (item: ReturnType<typeof buildPlannerQuoteCartItems>[number]) => void;
}

function getCatalogMetadataValue(product: CatalogProduct, key: string) {
  if (!product.metadata || typeof product.metadata !== "object" || Array.isArray(product.metadata)) {
    return undefined;
  }

  const raw = product.metadata[key];
  return typeof raw === "string" && raw.trim().length > 0 ? raw.trim() : undefined;
}

export function usePlannerWorkspace({
  mode,
  planName,
  setPlanName,
  activeDocumentId,
  setActiveDocumentId,
  navigate,
  addQuoteItem,
}: UsePlannerWorkspaceOptions) {
  const [editor, setEditor] = useState<Editor | null>(null);
  const [boqItems, setBoqItems] = useState<BoqItem[]>([]);
  const [hasRoomShellDraft, setHasRoomShellDraft] = useState(false);
  const [zoomPercent, setZoomPercent] = useState(100);
  const [hasSelection, setHasSelection] = useState(false);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [roomMetrics, setRoomMetrics] = useState("W 9000 x H 6500 mm");
  const [selectedMetrics, setSelectedMetrics] = useState<string | null>(null);
  const [selectionDimensions, setSelectionDimensions] = useState<PlannerSelectionDimensions | null>(null);
  const [canvasMeasurements, setCanvasMeasurements] = useState<CanvasMeasurement[]>([]);
  const [gridState, setGridState] = useState({ originX: 0, originY: 0, zoom: 1 });
  const [aiSuggestions, setAiSuggestions] = useState<
    Array<{ type: "warning" | "tip" | "action"; text: string }>
  >([]);
  const ui = usePlannerUiState({ mode });
  const {
    isMobileMode,
    currentStep,
    activeDrawingTool,
    showCatalog,
    showLayers,
    showInspector,
    catalogPinned,
    layersPinned,
    inspectorPinned,
    isSnapMode,
    isGridVisible,
    unitSystem,
    activePanel,
    showAi,
    mobileCatalogOpen,
    mobileLayersOpen,
    mobileInspectorOpen,
    setCurrentStep,
    setActiveDrawingTool,
    setShowCatalog,
    setShowLayers,
    setShowInspector,
    setCatalogPinned,
    setLayersPinned,
    setInspectorPinned,
    setIsSnapMode,
    setIsGridVisible,
    setUnitSystem,
    setActivePanel,
    setShowAi,
    setMobileCatalogOpen,
    setMobileLayersOpen,
    setMobileInspectorOpen,
  } = ui;

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
    [editor, setActiveDrawingTool],
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
    [
      canEnterCatalog,
      canEnterMeasure,
      canEnterReview,
      isMobileMode,
      selectDrawingTool,
      setActivePanel,
      setCurrentStep,
      setInspectorPinned,
      setMobileCatalogOpen,
      setMobileInspectorOpen,
      setMobileLayersOpen,
      setShowCatalog,
      setShowInspector,
      setShowLayers,
    ],
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
    [
      editor,
      setActiveDocumentId,
      setActivePanel,
      setCurrentStep,
      setPlanName,
      setShowCatalog,
      setShowInspector,
      setShowLayers,
      setUnitSystem,
    ],
  );

  const buildAiSuggestions = useCallback(
    (items: BoqItem[], totalShapes: number, geometricWarnings: string[] = []) => {
      const suggestions: Array<{ type: "warning" | "tip" | "action"; text: string }> = [];

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
  }, [setActiveDrawingTool]);

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
      setSelectionDimensions(readPlannerSelectionDimensions(editor, getActionableSelectionIds()));
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
          const measuredWidthMm =
            "props" in shape && shape.props && typeof shape.props === "object" && "w" in shape.props && typeof shape.props.w === "number"
              ? Math.round(shape.props.w * 10)
              : null;
          const measuredDepthMm =
            "props" in shape && shape.props && typeof shape.props === "object" && "h" in shape.props && typeof shape.props === "object" && "h" in shape.props && typeof shape.props.h === "number"
              ? Math.round(shape.props.h * 10)
              : null;
          const measuredDimensions =
            measuredWidthMm && measuredDepthMm
              ? formatDimensionPair(measuredWidthMm, measuredDepthMm, "mm")
              : meta.dimensions || "";
          return {
            id: String(shape.id),
            productId: meta.productId,
            productSlug: meta.productSlug,
            plannerSourceSlug: meta.plannerSourceSlug,
            name: meta.text || "Custom Module",
            category: meta.category || "Workstations",
            price: Number(meta.price ?? 0),
            imageUrl: meta.imageUrl,
            dimensions: measuredDimensions,
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

  const handleDropFurniture = useCallback(
    (product: CatalogProduct | { name: string; category: string }) => {
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
          : undefined) ??
        getCatalogMetadataValue(product as CatalogProduct, "plannerSourceSlug") ??
        getCatalogMetadataValue(product as CatalogProduct, "sourceSlug");
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

      const snapToPlacementGrid = (value: number) => Math.round(value / 40) * 40;
      const x = snapToPlacementGrid(viewportCenter.x - width / 2);
      const y = snapToPlacementGrid(viewportCenter.y - height / 2);

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
    },
    [canEnterCatalog, currentStep, editor, setShowCatalog, setShowInspector],
  );

  const handleClearAll = useCallback(() => {
    if (!editor) return;

    const shapeIds = editor.getCurrentPageShapes().map((shape) => shape.id);

    editor.deleteShapes(shapeIds);
    setActiveDocumentId(null);
    setPlanName("Untitled plan");
    applyStepMode("room");
  }, [applyStepMode, editor, setActiveDocumentId, setPlanName]);

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
        meta: { isRoomShell: true, structureType: "room-shell", presetId: preset.id, text: preset.name },
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

  const handleAddWallSegment = useCallback(() => {
    if (!editor) return;
    applyStepMode("room");
    createPlannerWallSegment(editor);
    resolvePlannerWallJoins(editor);
  }, [applyStepMode, editor]);

  const handleAddDoorOpening = useCallback(() => {
    if (!editor) return;
    applyStepMode("room");
    createPlannerDoorOpening(editor);
  }, [applyStepMode, editor]);

  const handleResolveWallJoins = useCallback(() => {
    if (!editor) return;
    const selectedIds = getActionableSelectionIds();
    resolvePlannerWallJoins(editor, selectedIds.length > 0 ? selectedIds : undefined);
  }, [editor, getActionableSelectionIds]);

  const handleGenerateQuote = useCallback(() => {
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
      addQuoteItem(item);
    });

    navigate("/quote-cart");
  }, [addQuoteItem, applyStepMode, boqItems, canEnterCatalog, canEnterMeasure, currentStep, navigate]);

  const totalBoq = calculatePlannerBoqTotal(boqItems);

  const adjustZoom = useCallback(
    (factor: number) => {
      if (!editor) return;

      const camera = editor.getCamera();
      const nextZoom = Math.max(20, Math.min(400, Math.round(camera.z * factor * 100))) / 100;
      editor.setCamera({ ...camera, z: nextZoom });
      setZoomPercent(Math.round(nextZoom * 100));
    },
    [editor],
  );

  const handleUndo = useCallback(() => {
    if (!editor || !editor.canUndo()) return;
    editor.undo();
  }, [editor]);

  const handleRedo = useCallback(() => {
    if (!editor || !editor.canRedo()) return;
    editor.redo();
  }, [editor]);

  const handleFitToDrawing = useCallback(() => {
    if (!editor) return;
    editor.zoomToFit({ animation: { duration: 200 } });
  }, [editor]);

  const handleFitToSelection = useCallback(() => {
    if (!editor || getActionableSelectionIds().length === 0) return;
    editor.zoomToSelection({ animation: { duration: 200 } });
  }, [editor, getActionableSelectionIds]);

  const handleDuplicateSelection = useCallback(() => {
    if (!editor) return;
    const selectedIds = getActionableSelectionIds();
    if (selectedIds.length === 0) return;
    editor.duplicateShapes(selectedIds, { x: 40, y: 40 });
  }, [editor, getActionableSelectionIds]);

  const handleDeleteSelection = useCallback(() => {
    if (!editor) return;
    const selectedIds = getActionableSelectionIds();
    if (selectedIds.length === 0) return;
    editor.deleteShapes(selectedIds);
  }, [editor, getActionableSelectionIds]);

  const handleAlignSelection = useCallback(
    (operation: Parameters<Editor["alignShapes"]>[1]) => {
      if (!editor) return;
      alignPlannerSelection(editor, getActionableSelectionIds(), operation);
    },
    [editor, getActionableSelectionIds],
  );

  const handleDistributeSelection = useCallback(
    (operation: Parameters<Editor["distributeShapes"]>[1]) => {
      if (!editor) return;
      distributePlannerSelection(editor, getActionableSelectionIds(), operation);
    },
    [editor, getActionableSelectionIds],
  );

  const handleUpdateSelectionDimensions = useCallback(
    (next: { widthMm?: number; heightMm?: number | null }) => {
      if (!editor || !selectionDimensions) return;
      updatePlannerSelectionDimensions(editor, selectionDimensions, next);
      if (selectionDimensions.mode === "line") {
        resolvePlannerWallJoins(editor, [selectionDimensions.shapeId]);
      }
    },
    [editor, selectionDimensions],
  );

  return {
    roomPresets: ROOM_PRESETS,
    editor,
    boqItems,
    canEnterCatalog,
    canEnterMeasure,
    canEnterReview,
    currentStep,
    activeDrawingTool,
    showCatalog,
    showLayers,
    showInspector,
    catalogPinned,
    layersPinned,
    inspectorPinned,
    isSnapMode,
    isGridVisible,
    zoomPercent,
    hasSelection,
    canUndo,
    canRedo,
      roomMetrics,
      selectedMetrics,
      selectionDimensions,
      canvasMeasurements,
      unitSystem,
    gridState,
    activePanel,
    aiSuggestions,
    showAi,
    mobileCatalogOpen,
    mobileLayersOpen,
    mobileInspectorOpen,
    isMobileMode,
    totalBoq,
    setShowCatalog,
    setShowLayers,
    setShowInspector,
    setCatalogPinned,
    setLayersPinned,
    setInspectorPinned,
    setIsSnapMode,
    setIsGridVisible,
    setUnitSystem,
    setActivePanel,
    setShowAi,
    setMobileCatalogOpen,
    setMobileLayersOpen,
    setMobileInspectorOpen,
    selectDrawingTool,
    handleMount,
    applyStepMode,
    applyPlannerDocument,
    buildCurrentPlannerDocument,
    handleDropFurniture,
    handleClearAll,
      handleApplyRoomPreset,
      handleActivateWallTool,
      handleActivateBasicShapeTool,
      handleAddWallSegment,
      handleAddDoorOpening,
      handleResolveWallJoins,
      handleGenerateQuote,
      adjustZoom,
      handleUndo,
      handleRedo,
      handleFitToDrawing,
      handleFitToSelection,
      handleDuplicateSelection,
      handleDeleteSelection,
      handleAlignSelection,
      handleDistributeSelection,
      handleUpdateSelectionDimensions,
    };
  }
