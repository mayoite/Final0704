"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  DefaultColorStyle,
  DefaultDashStyle,
  DefaultFillStyle,
  DefaultSizeStyle,
  GeoShapeGeoStyle,
} from "@tldraw/tlschema";
import { getIndices } from "@tldraw/utils";
import { AssetRecordType, createShapeId, Editor, type TLGeoShape, type TLLineShape } from "tldraw";
import "tldraw/tldraw.css";
import { useRouter } from "next/navigation";

import { useQuoteCart } from "@/lib/store/quoteCart";

import { AiCopilot, type AiSuggestion } from "./AiCopilot";
import { PlannerCanvas } from "./PlannerCanvas";
import { PlannerDesktopPanels } from "./PlannerDesktopPanels";
import { PlannerMobilePanels } from "./PlannerMobilePanels";
import { PlannerToolbar } from "./PlannerToolbar";
import type { BoqItem, CatalogProduct, PlannerDrawingTool, PlannerShapeMeta, PlannerStep, RoomPreset } from "./types";

const LOCAL_TLDRAW_ASSET_URLS = {
  fonts: {
    tldraw_mono: "/cdn/tldraw/fonts/IBMPlexMono-Medium.woff2",
    tldraw_mono_italic: "/cdn/tldraw/fonts/IBMPlexMono-MediumItalic.woff2",
    tldraw_mono_bold: "/cdn/tldraw/fonts/IBMPlexMono-Bold.woff2",
    tldraw_mono_italic_bold: "/cdn/tldraw/fonts/IBMPlexMono-BoldItalic.woff2",
    tldraw_serif: "/cdn/tldraw/fonts/IBMPlexSerif-Medium.woff2",
    tldraw_serif_italic: "/cdn/tldraw/fonts/IBMPlexSerif-MediumItalic.woff2",
    tldraw_serif_bold: "/cdn/tldraw/fonts/IBMPlexSerif-Bold.woff2",
    tldraw_serif_italic_bold: "/cdn/tldraw/fonts/IBMPlexSerif-BoldItalic.woff2",
    tldraw_sans: "/cdn/tldraw/fonts/IBMPlexSans-Medium.woff2",
    tldraw_sans_italic: "/cdn/tldraw/fonts/IBMPlexSans-MediumItalic.woff2",
    tldraw_sans_bold: "/cdn/tldraw/fonts/IBMPlexSans-Bold.woff2",
    tldraw_sans_italic_bold: "/cdn/tldraw/fonts/IBMPlexSans-BoldItalic.woff2",
    tldraw_draw: "/cdn/tldraw/fonts/Shantell_Sans-Informal_Regular.woff2",
    tldraw_draw_italic: "/cdn/tldraw/fonts/Shantell_Sans-Informal_Regular_Italic.woff2",
    tldraw_draw_bold: "/cdn/tldraw/fonts/Shantell_Sans-Informal_Bold.woff2",
    tldraw_draw_italic_bold: "/cdn/tldraw/fonts/Shantell_Sans-Informal_Bold_Italic.woff2",
  },
  translations: {
    en: "/cdn/tldraw/translations/en.json",
  },
} as const;

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

interface CanvasMeasurement {
  id: string;
  caption: string;
  value: string;
  x: number;
  y: number;
  rotateDeg?: number;
  tone?: "room" | "selection";
}

type MeasurementUnit = "mm" | "ft-in";
type PlannerShape = ReturnType<Editor["getCurrentPageShapes"]>[number];
type PlannerBounds = NonNullable<ReturnType<Editor["getShapePageBounds"]>>;
type PlannerLinePoint = TLLineShape["props"]["points"][string];

function formatFeetAndInches(mm: number) {
  const totalInches = Math.max(0, Math.round(mm / 25.4));
  const feet = Math.floor(totalInches / 12);
  const inches = totalInches % 12;
  return `${feet}' ${inches}"`;
}

function formatLength(mm: number, unitSystem: MeasurementUnit) {
  return unitSystem === "ft-in" ? formatFeetAndInches(mm) : `${Math.round(mm)} mm`;
}

function formatMetricFromBounds(bounds: { w: number; h: number }, unitSystem: MeasurementUnit) {
  return `W ${formatLength(bounds.w * 10, unitSystem)} x H ${formatLength(bounds.h * 10, unitSystem)}`;
}

function getMergedBounds(
  boundsList: PlannerBounds[]
) {
  if (boundsList.length === 0) return null;

  const minX = Math.min(...boundsList.map((bounds) => bounds.minX));
  const minY = Math.min(...boundsList.map((bounds) => bounds.minY));
  const maxX = Math.max(...boundsList.map((bounds) => bounds.maxX));
  const maxY = Math.max(...boundsList.map((bounds) => bounds.maxY));

  return {
    minX,
    minY,
    maxX,
    maxY,
    w: maxX - minX,
    h: maxY - minY,
  };
}

function getShapeMeta(meta: unknown): PlannerShapeMeta {
  return meta && typeof meta === "object" ? (meta as PlannerShapeMeta) : {};
}

function getLinePoints(shape: PlannerShape): PlannerLinePoint[] {
  if (shape.type !== "line") return [];

  const points = shape.props.points;
  return Object.values(points)
    .filter((point): point is PlannerLinePoint => {
      return (
        typeof point.id === "string" &&
        typeof point.index === "string" &&
        typeof point.x === "number" &&
        typeof point.y === "number"
      );
    })
    .sort((left, right) => left.index.localeCompare(right.index));
}

function getStructuralShapes(editor: Editor) {
  return editor
    .getCurrentPageShapes()
    .filter((shape) => {
      const meta = getShapeMeta(shape.meta);
      return !meta.isPlannerItem && !meta.isRoomDimension;
    });
}

function getMetricLabelForShape(
  editor: Editor,
  shapeId: ReturnType<typeof createShapeId>,
  unitSystem: MeasurementUnit
) {
  const shape = editor.getShape(shapeId);
  const bounds = editor.getShapePageBounds(shapeId);

  if (!shape || !bounds) return null;

  if (shape.type === "line") {
    const points = getLinePoints(shape);

    if (points.length >= 2) {
      const length = points.slice(1).reduce((total, point, index) => {
        const previous = points[index];
        return total + Math.hypot(point.x - previous.x, point.y - previous.y);
      }, 0);

      return `Length ${formatLength(length * 10, unitSystem)}`;
    }
  }

  return formatMetricFromBounds(bounds, unitSystem);
}

function configureWallTool(editor: Editor) {
  editor.setCurrentTool("line");
  editor.setStyleForNextShapes(DefaultColorStyle, "grey");
  editor.setStyleForNextShapes(DefaultDashStyle, "solid");
  editor.setStyleForNextShapes(DefaultSizeStyle, "m");
}

function configureBasicShapeTool(editor: Editor) {
  editor.setCurrentTool("geo");
  editor.setStyleForNextShapes(GeoShapeGeoStyle, "rectangle");
  editor.setStyleForNextShapes(DefaultColorStyle, "grey");
  editor.setStyleForNextShapes(DefaultFillStyle, "none");
  editor.setStyleForNextShapes(DefaultDashStyle, "solid");
  editor.setStyleForNextShapes(DefaultSizeStyle, "m");
}

export function SmartdrawPlanner({
  catalogProducts = [],
  mode = "desktop",
}: {
  catalogProducts?: CatalogProduct[];
  mode?: "desktop" | "mobile";
}) {
  const router = useRouter();
  const quoteCart = useQuoteCart();
  const isMobileMode = mode === "mobile";

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
        }) ??
      [],
    [editor]
  );

  const selectDrawingTool = useCallback(
    (tool: PlannerDrawingTool) => {
      setActiveDrawingTool(tool);
      if (editor) {
        if (tool === "line") {
          configureWallTool(editor);
          return;
        }

        if (tool === "geo") {
          configureBasicShapeTool(editor);
          return;
        }

        if (tool === "draw") {
          editor.setCurrentTool("draw");
          editor.setStyleForNextShapes(DefaultColorStyle, "grey");
          editor.setStyleForNextShapes(DefaultDashStyle, "solid");
          editor.setStyleForNextShapes(DefaultSizeStyle, "m");
          return;
        }

        editor.setCurrentTool(tool);
      }
    },
    [editor]
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
    [canEnterCatalog, canEnterMeasure, canEnterReview, isMobileMode, selectDrawingTool]
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
    [currentStep]
  );

  const runComplianceCheck = useCallback(
    (shapes: PlannerShape[]) => {
      if (!editor) return [];

      const warnings: string[] = [];
      const plannerShapes = shapes.filter((shape) => getShapeMeta(shape.meta).isPlannerItem);
      let overlapCount = 0;
      let tightClearanceCount = 0;

      for (let index = 0; index < plannerShapes.length; index += 1) {
        for (let nextIndex = index + 1; nextIndex < plannerShapes.length; nextIndex += 1) {
          const boundsA = editor.getShapePageBounds(plannerShapes[index]);
          const boundsB = editor.getShapePageBounds(plannerShapes[nextIndex]);

          if (!boundsA || !boundsB) continue;

          const isOverlapping = !(
            boundsA.maxX < boundsB.minX ||
            boundsA.minX > boundsB.maxX ||
            boundsA.maxY < boundsB.minY ||
            boundsA.minY > boundsB.maxY
          );

          if (isOverlapping) {
            overlapCount += 1;
            continue;
          }

          const clearanceX = Math.max(0, Math.max(boundsA.minX - boundsB.maxX, boundsB.minX - boundsA.maxX));
          const clearanceY = Math.max(0, Math.max(boundsA.minY - boundsB.maxY, boundsB.minY - boundsA.maxY));
          const distance = Math.sqrt(clearanceX * clearanceX + clearanceY * clearanceY);

          if (distance > 0 && distance < 90) {
            tightClearanceCount += 1;
          }
        }
      }

      if (overlapCount > 0) {
        warnings.push(`CRITICAL: ${overlapCount} workstation(s) are severely overlapping.`);
      }
      if (tightClearanceCount > 0) {
        warnings.push(
          `COMPLIANCE WARNING: ${tightClearanceCount} module boundary clearances are under the strict 900mm ADA minimum.`
        );
      }

      return warnings;
    },
    [editor]
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
      const camera = editor.getCamera();
      const pageOrigin = editor.pageToViewport({ x: 0, y: 0 });

      setZoomPercent(Math.round(camera.z * 100));
      setGridState({ originX: pageOrigin.x, originY: pageOrigin.y, zoom: camera.z });
      const selectionIds = getActionableSelectionIds();
      setHasSelection(selectionIds.length > 0);
      setCanUndo(editor.canUndo());
      setCanRedo(editor.canRedo());

      const structuralBounds = getStructuralShapes(editor)
        .map((shape) => editor.getShapePageBounds(shape.id))
        .filter((bounds): bounds is PlannerBounds => bounds !== null);
      const mergedStructuralBounds = getMergedBounds(structuralBounds);

      if (mergedStructuralBounds) {
        setRoomMetrics(formatMetricFromBounds(mergedStructuralBounds, unitSystem));
      } else {
        setRoomMetrics("No room shell yet");
      }

      if (selectionIds.length > 0) {
        setSelectedMetrics(
          selectionIds.length === 1
            ? getMetricLabelForShape(editor, selectionIds[0], unitSystem) ?? null
            : (() => {
                const selectionBounds = editor.getSelectionPageBounds();
                return selectionBounds ? formatMetricFromBounds(selectionBounds, unitSystem) : null;
              })()
        );
      } else {
        setSelectedMetrics(null);
      }

      const nextMeasurements: CanvasMeasurement[] = [];

      if (mergedStructuralBounds) {
        const roomWidthAnchor = editor.pageToViewport({
          x: mergedStructuralBounds.minX + mergedStructuralBounds.w / 2,
          y: mergedStructuralBounds.minY,
        });
        const roomHeightAnchor = editor.pageToViewport({
          x: mergedStructuralBounds.maxX,
          y: mergedStructuralBounds.minY + mergedStructuralBounds.h / 2,
        });

        nextMeasurements.push({
          id: "room-width",
          caption: "Room width",
          value: formatLength(mergedStructuralBounds.w * 10, unitSystem),
          x: Math.round(roomWidthAnchor.x),
          y: Math.max(104, Math.round(roomWidthAnchor.y) - 34),
          tone: "room",
        });
        nextMeasurements.push({
          id: "room-height",
          caption: "Room depth",
          value: formatLength(mergedStructuralBounds.h * 10, unitSystem),
          x: Math.round(roomHeightAnchor.x) + 34,
          y: Math.max(124, Math.round(roomHeightAnchor.y)),
          rotateDeg: 90,
          tone: "room",
        });
      }

      if (selectionIds.length > 0) {
        const selectionBounds = editor.getSelectionPageBounds();
        const selectionLabel =
          selectionIds.length === 1
            ? getMetricLabelForShape(editor, selectionIds[0], unitSystem)
            : selectionBounds
              ? formatMetricFromBounds(selectionBounds, unitSystem)
              : null;
        const selectionShape = selectionIds.length === 1 ? editor.getShape(selectionIds[0]) : null;

        if (selectionBounds && selectionLabel) {
          const selectionAnchor = editor.pageToViewport({
            x: selectionBounds.minX + selectionBounds.w / 2,
            y: selectionBounds.minY,
          });

          nextMeasurements.push({
            id: "selection-metrics",
            caption: selectionShape?.type === "line" ? "Wall span" : "Selection",
            value: selectionLabel,
            x: Math.round(selectionAnchor.x),
            y: Math.max(104, Math.round(selectionAnchor.y) - 34),
            tone: "selection",
          });
        }
      }

      setCanvasMeasurements(nextMeasurements);
    };
    syncViewportState();
    const intervalId = window.setInterval(syncViewportState, 200);

    return () => window.clearInterval(intervalId);
  }, [currentStep, editor, getActionableSelectionIds, unitSystem]);

  useEffect(() => {
    if (!editor) return;

    const syncBoq = () => {
      const shapes = editor.getCurrentPageShapes();
      const items = shapes
        .filter((shape) => getShapeMeta(shape.meta).isPlannerItem)
        .map((shape) => {
          const meta = getShapeMeta(shape.meta);
          return {
            id: shape.id,
            name: meta.text || "Custom Module",
            category: meta.category || "Workstations",
            price: meta.price || 0,
            dimensions: meta.dimensions || "",
          };
        });
      const structuralShapes = getStructuralShapes(editor);

      setBoqItems(items);
      setHasRoomShellDraft(structuralShapes.length > 0);
      const geometricWarnings = runComplianceCheck(shapes);
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
      { source: "user", scope: "document" }
    );

    return () => stopListening();
  }, [buildAiSuggestions, currentStep, editor, runComplianceCheck]);

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

    const imageUrl = "flagship_image" in product ? product.flagship_image || product.images?.[0] : undefined;
    const meta = {
      text: product.name,
      isPlannerItem: true,
      price: "price" in product ? product.price || 0 : 0,
      category: product.category || "Workstations",
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

    const shapeIds = editor
      .getCurrentPageShapes()
      .map((shape) => shape.id);

    editor.deleteShapes(shapeIds);
    applyStepMode("room");
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
            ])
          ),
        } as TLLineShape["props"],
        meta: { isRoomShell: true, presetId: preset.id, text: preset.name },
      });

      applyStepMode("room");
      editor.select(ROOM_BOUNDARY_ID);
      editor.zoomToSelection({ animation: { duration: 200 } });
    },
    [applyStepMode, editor]
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

    const groupedItems = boqItems.reduce((accumulator, item) => {
      if (!accumulator[item.name]) {
        accumulator[item.name] = { ...item, qty: 1 };
      } else {
        accumulator[item.name].qty += 1;
      }
      return accumulator;
    }, {} as Record<string, BoqItem & { qty: number }>);

    Object.values(groupedItems).forEach((item) => {
      quoteCart.addItem({
        id: `planner-${item.name.replace(/\s+/g, "-")}`,
        name: item.name,
        qty: item.qty,
        source: "planner",
        plannerFamily: item.category,
      });
    });

    router.push("/quote-cart");
  };

  const totalBoq = boqItems.reduce((total, item) => total + item.price, 0);

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
      <div className="relative h-full w-full overflow-hidden">
        <PlannerToolbar
          currentStep={currentStep}
          onStepChange={applyStepMode}
          disabledSteps={{ catalog: !canEnterCatalog, measure: !canEnterMeasure, review: !canEnterReview }}
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
          onClearAll={handleClearAll}
          onExport={() => window.print()}
        />

        <PlannerCanvas
          currentStep={currentStep}
          assetUrls={LOCAL_TLDRAW_ASSET_URLS}
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

      {showAi ? <AiCopilot suggestions={aiSuggestions} onClose={() => setShowAi(false)} /> : null}

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
    </section>
  );
}
