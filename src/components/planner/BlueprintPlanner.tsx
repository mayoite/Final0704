"use client";

import Fuse from "fuse.js";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { LayoutGrid } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import {
  trackPlannerCatalogFailed,
  trackPlannerCatalogLoaded,
  trackPlannerExportFailed,
  trackPlannerExportStarted,
  trackPlannerExportSucceeded,
  trackPlannerImportFailed,
  trackPlannerItemAdded,
  trackPlannerSessionStarted,
  trackPlannerViewSwitched,
} from "@/lib/analytics/plannerEvents";
import { appendPlannerItem } from "@/lib/planner/document";
import {
  exportPlannerDocument,
  importPlannerDocument,
} from "@/lib/planner/importExport";
import { buildPlannerBoq } from "@/lib/planner/boq";
import { plannerDocumentFromBlueprintSerialized } from "@/lib/planner/serializer";
import { usePlannerStore } from "@/lib/planner/store";
import { formatLengthPair } from "@/lib/planner/units";

import { PlannerCatalogGrid } from "./PlannerCatalogGrid";
import { PlannerCanvas2D } from "./PlannerCanvas2D";
import { PlannerCanvas3D } from "./PlannerCanvas3D";
import { PlannerAiPanel } from "./PlannerAiPanel";
import { PlannerClientBar } from "./PlannerClientBar";
import { PlannerInspector } from "./PlannerInspector";
import { PlannerStatusBar } from "./PlannerStatusBar";
import { PlannerToolbar } from "./PlannerToolbar";
import { resolveCssColorExpression, resolveCssVarRgb } from "./cssVars";
import type { PlannerCatalogItem, PlannerCatalogPayload } from "./types";
import { loadStarterDesign } from "./plannerHelpers";
import { normalizePlannerCatalogItems } from "./utils";

import { useUndoRedo } from "@/hooks/planner/useUndoRedo";
import { useRoomLayout } from "@/hooks/planner/useRoomLayout";
import { usePlannerUI } from "@/hooks/planner/usePlannerUI";

export function BlueprintPlanner() {
  const DEFAULT_ALL_CATALOG_LIMIT = 18;
  const EXPANDED_ALL_CATALOG_STEP = 18;
  const importRef = useRef<HTMLInputElement>(null);
  const workspaceRef = useRef<HTMLElement>(null);
  const workspaceCaptureRef = useRef<HTMLDivElement>(null);
  const selectedItemIdRef = useRef<string | null>(null);

  const [catalog, setCatalog] = useState<PlannerCatalogItem[]>([]);
  const [catalogSummary, setCatalogSummary] = useState({
    itemCount: 0,
    phaseOneItemCount: 0,
  });
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [catalogReloadSeed, setCatalogReloadSeed] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("");
  const [allCatalogLimit, setAllCatalogLimit] = useState(
    DEFAULT_ALL_CATALOG_LIMIT,
  );
  const [showGrid, setShowGrid] = useState(true);
  const [isSidebarPeeked, setIsSidebarPeeked] = useState(false);

  const {
    isSidebarOpen,
    isInspectorOpen,
    isClientBarOpen,
    setIsSidebarOpen,
    toggleInspector,
    toggleClientBar,
  } = usePlannerUI();
  const {
    plannerDocument,
    sceneSelection,
    activeTool,
    handleSelectItem,
    handleMoveItem,
    handleRotateItem,
    handleDuplicateItem,
    handleDeleteItem,
    handleApplyRoomSize,
    handleMoveWall,
    setActiveTool,
    setStatus,
  } = useRoomLayout(catalog);
  const { canUndo, canRedo, handleUndo, handleRedo } = useUndoRedo();

  const [clientName, setClientName] = useState("");
  const [projectName, setProjectName] = useState("Workspace proposal");
  const [preparedBy, setPreparedBy] = useState("");
  const [isAiPanelOpen, setIsAiPanelOpen] = useState(false);
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const sessionTrackedRef = useRef(false);
  const reduceMotion = useReducedMotion();

  const status = usePlannerStore((state) => state.status);
  const currentView = usePlannerStore((state) => state.currentView);
  const selectedItemId = usePlannerStore(
    (state) => state.selectedCatalogItemId,
  );
  const setEngineMode = usePlannerStore((state) => state.setEngineMode);
  const setCurrentView = usePlannerStore((state) => state.setCurrentView);
  const setSelectedCatalogItemId = usePlannerStore(
    (state) => state.setSelectedCatalogItemId,
  );
  const setSceneSelection = usePlannerStore((state) => state.setSceneSelection);
  const resetDocument = usePlannerStore((state) => state.resetDocument);
  const commitDocument = usePlannerStore((state) => state.commitDocument);

  useEffect(() => {
    if (sessionTrackedRef.current) return;
    if (typeof window === "undefined") return;
    sessionTrackedRef.current = true;
    trackPlannerSessionStarted({
      entry: "planner",
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
    });
  }, []);

  useEffect(() => {
    selectedItemIdRef.current = selectedItemId;
  }, [selectedItemId]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const isModifierPressed = event.ctrlKey || event.metaKey;

      if (isModifierPressed && event.key.toLowerCase() === "z" && !event.shiftKey) {
        event.preventDefault();
        handleUndo();
        return;
      }

      if (
        isModifierPressed &&
        (event.key.toLowerCase() === "y" ||
          (event.key.toLowerCase() === "z" && event.shiftKey))
      ) {
        event.preventDefault();
        handleRedo();
        return;
      }

      if (event.key === "Delete" || event.key === "Backspace") {
        const target = event.target as HTMLElement | null;
        const isTextField =
          target instanceof HTMLInputElement ||
          target instanceof HTMLTextAreaElement ||
          target?.isContentEditable === true;

        if (!isTextField) {
          handleDeleteItem();
        }
        return;
      }

      if (event.key !== "Escape") {
        return;
      }

      setActiveTool("move");
      setStatus("Move mode active");
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleDeleteItem, handleRedo, handleUndo, setActiveTool, setStatus]);

  useEffect(() => {
    let cancelled = false;

    async function loadStarterDocument() {
      try {
        setEngineMode("react-canvas");
        const design = await loadStarterDesign();

        if (cancelled) {
          return;
        }

        resetDocument(plannerDocumentFromBlueprintSerialized(design));
        setStatus("Planner ready for layout editing");
      } catch (error) {
        if (!cancelled) {
          console.error(error);
          setStatus("Something went wrong loading the planner.");
        }
      }
    }

    void loadStarterDocument();

    return () => {
      cancelled = true;
    };
  }, [resetDocument, setEngineMode, setStatus]);

  useEffect(() => {
    let ignore = false;

    async function loadCatalog() {
      setCatalogLoading(true);
      setCatalogError(null);

      try {
        const response = await fetch(
          "/planner-app/data/planner-catalog.v1.json",
          {
            cache: "no-store",
          },
        );

        if (!response.ok) {
          throw new Error(`Catalog request failed with ${response.status}`);
        }

        const payload = (await response.json()) as PlannerCatalogPayload;

        if (!Array.isArray(payload.items)) {
          throw new Error("Catalog payload is malformed");
        }

        if (ignore) {
          return;
        }

        const normalizedItems = normalizePlannerCatalogItems(payload.items);

        setCatalog(normalizedItems);
        setCatalogSummary({
          itemCount: payload.itemCount,
          phaseOneItemCount: payload.phaseOneItemCount,
        });
        trackPlannerCatalogLoaded({
          itemCount: payload.itemCount,
          phaseOneItemCount: payload.phaseOneItemCount,
        });

        const categoryLabels = [
          ...new Set(
            normalizedItems
              .map((item) => item.categoryLabel ?? item.category)
              .filter(Boolean),
          ),
        ];
        setActiveCategory((current) => {
          if (current && categoryLabels.includes(current)) {
            return current;
          }
          return "";
        });

        setStatus(`${normalizedItems.length} catalog items ready`);
      } catch (error) {
        if (ignore) {
          return;
        }

        const message =
          error instanceof Error ? error.message : "Unknown catalog error";
        setCatalogError(message);
        setStatus("Failed to load catalog");
        trackPlannerCatalogFailed({ message });
      } finally {
        if (!ignore) {
          setCatalogLoading(false);
        }
      }
    }

    void loadCatalog();

    return () => {
      ignore = true;
    };
  }, [setSelectedCatalogItemId, setStatus, catalogReloadSeed]);

  const categories = useMemo(
    () =>
      [
        ...new Set(catalog.map((item) => item.categoryLabel ?? item.category)),
      ].sort((left, right) => {
        if (left === "Workstations") return -1;
        if (right === "Workstations") return 1;
        return left.localeCompare(right);
      }),
    [catalog],
  );

  const categoryFilteredCatalog = useMemo(
    () =>
      catalog.filter(
        (item) =>
          activeCategory.length === 0 ||
          (item.categoryLabel ?? item.category) === activeCategory,
      ),
    [catalog, activeCategory],
  );

  const categoryFuse = useMemo(
    () =>
      new Fuse(categoryFilteredCatalog, {
        keys: [
          "name",
          "family",
          "category",
          "categoryLabel",
          "subcategoryLabel",
          "shape",
        ],
        threshold: 0.35,
        ignoreLocation: true,
      }),
    [categoryFilteredCatalog],
  );

  const visibleCatalog = useMemo(
    () =>
      deferredSearchQuery.trim().length === 0
        ? categoryFilteredCatalog
        : categoryFuse.search(deferredSearchQuery).map((result) => result.item),
    [deferredSearchQuery, categoryFilteredCatalog, categoryFuse],
  );

  const shouldLimitCatalog =
    deferredSearchQuery.trim().length === 0 && activeCategory.length === 0;
  const displayedCatalog = shouldLimitCatalog
    ? visibleCatalog.slice(0, allCatalogLimit)
    : visibleCatalog;
  const canShowMoreCatalog =
    shouldLimitCatalog && displayedCatalog.length < visibleCatalog.length;

  const selectedItem = useMemo(
    () =>
      displayedCatalog.find((item) => item.id === selectedItemId) ??
      visibleCatalog.find((item) => item.id === selectedItemId) ??
      catalog.find((item) => item.id === selectedItemId) ??
      null,
    [displayedCatalog, visibleCatalog, catalog, selectedItemId],
  );
  const sidebarVisible = isSidebarOpen || isSidebarPeeked;
  const boqRows = useMemo(
    () => buildPlannerBoq(plannerDocument),
    [plannerDocument],
  );
  const activeRoom = plannerDocument.rooms[0] ?? null;
  const roomXs = activeRoom?.outline.map((point) => point.x) ?? [];
  const roomYs = activeRoom?.outline.map((point) => point.y) ?? [];
  const roomWidthCm =
    roomXs.length > 0 ? Math.max(...roomXs) - Math.min(...roomXs) : 0;
  const roomDepthCm =
    roomYs.length > 0 ? Math.max(...roomYs) - Math.min(...roomYs) : 0;
  const roomWidthLabel =
    roomWidthCm > 0 ? formatLengthPair(roomWidthCm) : undefined;
  const roomDepthLabel =
    roomDepthCm > 0 ? formatLengthPair(roomDepthCm) : undefined;
  const selectedPlacedItem =
    sceneSelection?.kind === "item"
      ? (plannerDocument.items.find((item) => item.id === sceneSelection.id) ?? null)
      : null;
  const entranceTransition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const };
  const panelMotionProps = reduceMotion
    ? { initial: false as const, animate: { opacity: 1, x: 0, y: 0, scale: 1 } }
    : {
        initial: { opacity: 0, y: 28 },
        animate: { opacity: 1, y: 0 },
      };
  const sideRailMotionProps = reduceMotion
    ? { initial: false as const, animate: { opacity: 1, x: 0 } }
    : {
        initial: { opacity: 0, x: -18 },
        animate: { opacity: 1, x: 0 },
      };
  const stageMotionProps = reduceMotion
    ? { initial: false as const, animate: { opacity: 1, scale: 1, y: 0 } }
    : {
        initial: { opacity: 0, scale: 0.985, y: 18 },
        animate: { opacity: 1, scale: 1, y: 0 },
      };
  const handleSwitchView = () => {
    const nextView = currentView === "2.5d" ? "3d" : "2.5d";
    setCurrentView(nextView);
    setStatus(`${nextView === "3d" ? "3D review" : "2D plan"} active`);
    trackPlannerViewSwitched({ to: nextView === "3d" ? "3d" : "2d" });
  };

  const handleToggleInspectorPanel = useCallback(() => {
    if (!isInspectorOpen) {
      setIsAiPanelOpen(false);
    }
    toggleInspector();
  }, [isInspectorOpen, toggleInspector]);

  const handleToggleClientPanel = useCallback(() => {
    if (!isClientBarOpen) {
      setIsAiPanelOpen(false);
    }
    toggleClientBar();
  }, [isClientBarOpen, toggleClientBar]);

  const handleToggleAiPanel = useCallback(() => {
    setIsAiPanelOpen((current) => {
      const next = !current;

      if (next) {
        if (isInspectorOpen) {
          toggleInspector();
        }
        if (isClientBarOpen) {
          toggleClientBar();
        }
      }

      return next;
    });
  }, [isClientBarOpen, isInspectorOpen, toggleClientBar, toggleInspector]);

  const handleSave = () => {
    try {
      trackPlannerExportStarted({ type: "json" });
      const exported = exportPlannerDocument(plannerDocument);
      const href = URL.createObjectURL(
        new Blob([exported.contents], { type: exported.mimeType }),
      );
      const link = window.document.createElement("a");
      link.href = href;
      link.download = exported.fileName;
      link.click();
      URL.revokeObjectURL(href);
      setStatus("Plan downloaded");
      trackPlannerExportSucceeded({ type: "json" });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown export error";
      setStatus(`Export failed: ${message}`);
      trackPlannerExportFailed({ type: "json", message });
    }
  };

  const handleExportCustomerPdf = async () => {
    try {
      setStatus("Preparing customer PDF");
      trackPlannerExportStarted({ type: "pdf" });
      const pdf = new jsPDF({
        unit: "pt",
        format: "a4",
      });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 42;
      let cursorY = margin;
      const rgbMuted = resolveCssVarRgb("--text-muted", [74, 92, 118]);
      const rgbHeading = resolveCssVarRgb("--text-heading", [11, 19, 36]);
      const rgbInverse = resolveCssVarRgb("--text-inverse", [248, 250, 252]);
      const rgbSurface = resolveCssVarRgb("--surface-panel", [255, 255, 255]);
      const rgbSurfaceWash = resolveCssVarRgb(
        "--surface-accent-wash",
        [238, 242, 247],
      );
      const rgbInverseSurface = resolveCssVarRgb(
        "--surface-inverse",
        [7, 13, 18],
      );
      const rgbBorder = resolveCssVarRgb("--border-soft", [221, 229, 237]);
      const captureBg = resolveCssColorExpression(
        "var(--surface-panel)",
        "#ffffff",
      );

      const drawLabelValue = (
        label: string,
        value: string,
        x: number,
        y: number,
      ) => {
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(9);
        pdf.setTextColor(rgbMuted[0], rgbMuted[1], rgbMuted[2]);
        pdf.text(label, x, y);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(11);
        pdf.setTextColor(rgbHeading[0], rgbHeading[1], rgbHeading[2]);
        pdf.text(value || "-", x, y + 14);
      };

      pdf.setFillColor(rgbSurface[0], rgbSurface[1], rgbSurface[2]);
      pdf.rect(0, 0, pageWidth, pageHeight, "F");
      pdf.setFillColor(
        rgbInverseSurface[0],
        rgbInverseSurface[1],
        rgbInverseSurface[2],
      );
      pdf.roundedRect(margin, cursorY, pageWidth - margin * 2, 72, 18, 18, "F");
      pdf.setTextColor(rgbInverse[0], rgbInverse[1], rgbInverse[2]);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(11);
      pdf.text("ONE&ONLY WORKSPACE PLANNER", margin + 18, cursorY + 20);
      pdf.setFontSize(22);
      pdf.text(projectName || "Workspace proposal", margin + 18, cursorY + 44);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(10);
      pdf.text(
        `Generated ${new Date().toLocaleDateString("en-IN")}`,
        pageWidth - margin - 110,
        cursorY + 22,
      );
      cursorY += 92;

      drawLabelValue("CLIENT", clientName, margin, cursorY);
      drawLabelValue("PREPARED BY", preparedBy, margin + 190, cursorY);
      drawLabelValue(
        "TOTAL ITEMS",
        String(plannerDocument.items.length),
        margin + 380,
        cursorY,
      );
      drawLabelValue(
        "BOQ LINES",
        String(boqRows.length),
        margin + 500,
        cursorY,
      );
      cursorY += 42;

      if (workspaceCaptureRef.current) {
        const capture = await html2canvas(workspaceCaptureRef.current, {
          scale: 2,
          backgroundColor: captureBg,
          useCORS: true,
          logging: false,
        });
        const imageWidth = pageWidth - margin * 2;
        const imageHeight = Math.min(
          250,
          (capture.height * imageWidth) / capture.width,
        );

        pdf.addImage(
          capture.toDataURL("image/png"),
          "PNG",
          margin,
          cursorY,
          imageWidth,
          imageHeight,
        );
        cursorY += imageHeight + 24;
      }

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(12);
      pdf.setTextColor(rgbHeading[0], rgbHeading[1], rgbHeading[2]);
      pdf.text("Bill of Quantity", margin, cursorY);
      cursorY += 16;

      const columns = [
        { label: "Product", width: 150 },
        { label: "Category", width: 70 },
        { label: "Qty", width: 34 },
        { label: "Dimensions", width: 110 },
        {
          label: "Specification",
          width: pageWidth - margin * 2 - 150 - 70 - 34 - 110,
        },
      ];

      const drawTableHeader = () => {
        let columnX = margin;
        pdf.setFillColor(
          rgbSurfaceWash[0],
          rgbSurfaceWash[1],
          rgbSurfaceWash[2],
        );
        pdf.roundedRect(margin, cursorY, pageWidth - margin * 2, 24, 8, 8, "F");
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(9);
        pdf.setTextColor(rgbHeading[0], rgbHeading[1], rgbHeading[2]);

        for (const column of columns) {
          pdf.text(column.label, columnX + 6, cursorY + 15);
          columnX += column.width;
        }

        cursorY += 30;
      };

      drawTableHeader();

      for (const row of boqRows) {
        const values = [
          row.name,
          row.category,
          String(row.quantity),
          `${row.widthCm} x ${row.depthCm} x ${row.heightCm} cm`,
          row.spec,
        ];
        const wrapped = values.map((value, index) =>
          pdf.splitTextToSize(value, columns[index].width - 12),
        );
        const rowHeight =
          Math.max(...wrapped.map((lines) => lines.length)) * 11 + 12;

        if (cursorY + rowHeight > pageHeight - margin) {
          pdf.addPage();
          pdf.setFillColor(rgbSurface[0], rgbSurface[1], rgbSurface[2]);
          pdf.rect(0, 0, pageWidth, pageHeight, "F");
          cursorY = margin;
          drawTableHeader();
        }

        let columnX = margin;
        pdf.setDrawColor(rgbBorder[0], rgbBorder[1], rgbBorder[2]);
        pdf.setFillColor(rgbSurface[0], rgbSurface[1], rgbSurface[2]);
        pdf.roundedRect(
          margin,
          cursorY - 4,
          pageWidth - margin * 2,
          rowHeight,
          8,
          8,
          "FD",
        );
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(9.5);
        pdf.setTextColor(rgbMuted[0], rgbMuted[1], rgbMuted[2]);

        wrapped.forEach((lines, index) => {
          pdf.text(lines, columnX + 6, cursorY + 8);
          columnX += columns[index].width;
        });

        cursorY += rowHeight + 6;
      }

      const safeFileName =
        `${projectName || "workspace-proposal"}-${clientName || "client"}`
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");

      pdf.save(`${safeFileName || "workspace-proposal"}.pdf`);
      setStatus("Customer PDF exported");
      trackPlannerExportSucceeded({ type: "pdf" });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown PDF export error";
      setStatus(`PDF export failed: ${message}`);
      trackPlannerExportFailed({ type: "pdf", message });
    }
  };

  const handleLoad = async (file: File) => {
    try {
      const data = await file.text();
      const imported = importPlannerDocument(data);

      resetDocument(imported.document);
      setSelectedCatalogItemId(imported.document.items[0]?.catalogId ?? null);
      setSceneSelection(null);
      setStatus(`Loaded ${file.name}`);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown import error";
      setStatus(`Import failed: ${message}`);
      trackPlannerImportFailed({ message });
    }
  };

  const handleAddCatalogItem = (item: PlannerCatalogItem) => {
    const nextDocument = appendPlannerItem(plannerDocument, item);
    const placedItem = nextDocument.items.at(-1) ?? null;

    commitDocument(nextDocument);
    setSelectedCatalogItemId(item.id);
    setSceneSelection({
      kind: "item",
      id: placedItem?.id,
      title: item.name,
      detail: "Placed in current plan",
    });
    setStatus(`${item.name} added to the room`);
    trackPlannerItemAdded({
      catalogId: item.id,
      category: item.categoryLabel ?? item.category,
      method: "button",
    });
  };

  const handleRetryCatalog = () => {
    setCatalogReloadSeed((value) => value + 1);
    setStatus("Retrying catalog");
  };

  const handleSelectItemInternal = useCallback(
    (itemId: string) => {
      handleSelectItem(itemId);
      selectedItemIdRef.current = itemId;
    },
    [handleSelectItem],
  );

  const handleCanvasSelectRoom = useCallback(() => {
    const activeRoom = plannerDocument.rooms[0];
    const xs = activeRoom?.outline.map((point) => point.x) ?? [];
    const ys = activeRoom?.outline.map((point) => point.y) ?? [];
    const widthCm = xs.length > 0 ? Math.max(...xs) - Math.min(...xs) : 0;
    const depthCm = ys.length > 0 ? Math.max(...ys) - Math.min(...ys) : 0;

    setSceneSelection({
      kind: "room",
      id: activeRoom?.id,
      title: activeRoom?.name ?? "Room selected",
      detail:
        widthCm > 0 && depthCm > 0
          ? `${formatLengthPair(widthCm)} wide and ${formatLengthPair(depthCm)} deep`
          : "Workspace selected",
      areaSqM: activeRoom?.areaSqM,
    });
  }, [plannerDocument.rooms, setSceneSelection]);

  const handleCanvasSelectWall = useCallback(
    (wallId: string) => {
      const wall = plannerDocument.walls.find((entry) => entry.id === wallId);

      if (!wall) {
        return;
      }

      const lengthCm = Math.hypot(
        wall.end.x - wall.start.x,
        wall.end.y - wall.start.y,
      );

      setSceneSelection({
        kind: "wall",
        id: wall.id,
        title: `Boundary ${
          plannerDocument.walls.findIndex((entry) => entry.id === wall.id) + 1
        }`,
        detail: `${formatLengthPair(lengthCm)} span. Drag to resize the room.`,
      });
      setStatus("Wall selected");
    },
    [plannerDocument.walls, setSceneSelection, setStatus],
  );

  const handleMoveItemInternal = useCallback(
    (itemId: string, x: number, z: number) => {
      handleMoveItem(itemId, x, z);
    },
    [handleMoveItem],
  );

  const handleCanvasMoveWall = useCallback(
    (wallId: string, coordinate: number) => {
      handleMoveWall(wallId, coordinate);
    },
    [handleMoveWall],
  );

  const handleApplyRoomSizeInternal = useCallback(
    (widthCm: number, depthCm: number) => {
      handleApplyRoomSize(widthCm, depthCm);
    },
    [handleApplyRoomSize],
  );

  const handleNudgeSelectedWall = useCallback(
    (deltaCm: number) => {
      if (sceneSelection?.kind !== "wall" || !sceneSelection.id) return;
      const wall = plannerDocument.walls.find(
        (w) => w.id === sceneSelection.id,
      );
      if (!wall) return;

      const isVertical =
        Math.abs(wall.start.x - wall.end.x) <=
        Math.abs(wall.start.y - wall.end.y);
      const currentCoordinate = isVertical ? wall.start.x : wall.start.y;
      handleMoveWall(sceneSelection.id, currentCoordinate + deltaCm);
    },
    [plannerDocument.walls, sceneSelection, handleMoveWall],
  );

  return (
    <>
      <input
        ref={importRef}
        type="file"
        accept=".json,.blueprint3d"
        className="hidden"
        onChange={async (event) => {
          const file = event.target.files?.[0];

          if (!file) {
            return;
          }

          await handleLoad(file);
          event.target.value = "";
        }}
      />

      <div className="planner-shell min-h-screen w-full text-[var(--text-body)] antialiased">
        <motion.div
          className="relative mx-auto flex min-h-screen w-full max-w-none flex-col gap-0 px-0 py-0"
          {...panelMotionProps}
          transition={entranceTransition}
        >
          <motion.div
            className={cn(
              "planner-shell-card relative grid min-h-[calc(100vh-160px)] w-full gap-0 overflow-hidden rounded-none border-x-0 border-b-0 p-0 transition-all duration-500 ease-in-out",
              sidebarVisible
                ? "lg:grid-cols-[360px_minmax(0,1fr)] xl:grid-cols-[420px_minmax(0,1fr)]"
                : "lg:grid-cols-[44px_minmax(0,1fr)]",
            )}
            layout={!reduceMotion}
            {...panelMotionProps}
            transition={entranceTransition}
          >
            <motion.div
              className="relative h-full overflow-hidden border-r border-white/8 bg-[var(--planner-panel-strong)]"
              layout={!reduceMotion}
              {...sideRailMotionProps}
              transition={entranceTransition}
              onMouseEnter={() => {
                if (!isSidebarOpen) {
                  setIsSidebarPeeked(true);
                }
              }}
              onMouseLeave={() => {
                if (!isSidebarOpen) {
                  setIsSidebarPeeked(false);
                }
              }}
            >
              {!sidebarVisible && (
                <div className="flex h-full flex-col items-center gap-3 px-2 py-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-10 w-10 rounded-full border border-inverse bg-[var(--overlay-panel-08)] text-[var(--text-inverse)] shadow-theme-soft hover:bg-[var(--overlay-panel-10)]"
                    onClick={() => setIsSidebarOpen(true)}
                    title="Pin Catalog Open"
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                  <button
                    type="button"
                    className="flex flex-1 items-center justify-center rounded-full border border-inverse bg-[var(--overlay-panel-08)] px-1 text-[10px] font-semibold tracking-[0.18em] text-[var(--text-inverse-subtle)] transition-colors [writing-mode:vertical-rl] hover:bg-[var(--overlay-panel-10)] hover:text-[var(--text-inverse)]"
                    onFocus={() => setIsSidebarPeeked(true)}
                    onMouseEnter={() => setIsSidebarPeeked(true)}
                  >
                    CATALOG
                  </button>
                </div>
              )}
              <div
                className={cn(
                  "h-full transition-all duration-500",
                  !sidebarVisible && "hidden",
                )}
              >
                <PlannerCatalogGrid
                  className="order-2 lg:order-0"
                  catalogSummary={catalogSummary}
                  catalog={catalog}
                  totalVisibleCount={visibleCatalog.length}
                  displayedCount={displayedCatalog.length}
                  searchQuery={searchQuery}
                  onSearchChange={(query) => {
                    setSearchQuery(query);
                    setAllCatalogLimit(DEFAULT_ALL_CATALOG_LIMIT);
                  }}
                  categories={categories}
                  activeCategory={activeCategory}
                  onCategoryChange={(category) => {
                    setActiveCategory(category);
                    setAllCatalogLimit(DEFAULT_ALL_CATALOG_LIMIT);
                  }}
                  catalogLoading={catalogLoading}
                  catalogError={catalogError}
                  visibleCatalog={displayedCatalog}
                  selectedItem={selectedItem}
                  onSelectItem={setSelectedCatalogItemId}
                  onAddCatalogItem={handleAddCatalogItem}
                  canShowMore={canShowMoreCatalog}
                  onShowMore={() =>
                    setAllCatalogLimit(
                      (current) => current + EXPANDED_ALL_CATALOG_STEP,
                    )
                  }
                  onRetryCatalog={handleRetryCatalog}
                  onCollapse={() => {
                    setIsSidebarOpen(false);
                    setIsSidebarPeeked(false);
                  }}
                />
              </div>
            </motion.div>

            <motion.section
              ref={workspaceRef}
              className="planner-workspace lg:order-0"
              {...panelMotionProps}
              transition={entranceTransition}
            >
              <div className="planner-surface mb-0 rounded-none border-x-0 border-t-0 px-4 py-2.5 text-[var(--text-inverse)] sm:px-5 lg:px-6">
                <div className="planner-toolbar-band">
                  <PlannerToolbar
                    currentView={currentView}
                    activeTool={activeTool}
                    canUndo={canUndo}
                    canRedo={canRedo}
                    showGrid={showGrid}
                    itemCount={plannerDocument.items.length}
                    boqLineCount={boqRows.length}
                    roomWidthLabel={roomWidthLabel}
                    roomDepthLabel={roomDepthLabel}
                    selectionLabel={sceneSelection?.title ?? "No selection"}
                    selectedItemPosition={
                      selectedPlacedItem
                        ? {
                            x: selectedPlacedItem.position.x,
                            z: selectedPlacedItem.position.z,
                          }
                        : null
                    }
                    selectedItemRotationDeg={selectedPlacedItem?.rotationDeg ?? null}
                    onUndo={handleUndo}
                    onRedo={handleRedo}
                    onSave={handleSave}
                    onSwitchView={handleSwitchView}
                    onDrawMode={() => {
                      setActiveTool("draw");
                      setStatus("Draw mode active");
                    }}
                    onMoveMode={() => {
                      setActiveTool("move");
                      setStatus("Move mode active");
                    }}
                    onToggleGrid={() => setShowGrid(!showGrid)}
                    onExportPdf={handleExportCustomerPdf}
                    onPrepareWallEditing={() => {
                      handleCanvasSelectRoom();
                      setStatus("Resize mode active");
                    }}
                    onRotateSelectedItem={handleRotateItem}
                    onDuplicateSelectedItem={handleDuplicateItem}
                    onDeleteSelectedItem={handleDeleteItem}
                    isInspectorOpen={isInspectorOpen}
                    isClientBarOpen={isClientBarOpen}
                    isAiPanelOpen={isAiPanelOpen}
                    onToggleInspector={handleToggleInspectorPanel}
                    onToggleClientBar={handleToggleClientPanel}
                    onToggleAiPanel={handleToggleAiPanel}
                  />
                </div>
              </div>

              <div className="planner-stage-layout">
                <div className="planner-stage-shell planner-stage-grid">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={currentView}
                      ref={workspaceCaptureRef}
                      className="planner-stage-viewport"
                      {...stageMotionProps}
                      transition={{
                        ...entranceTransition,
                        delay: reduceMotion ? 0 : 0.06,
                      }}
                    >
                      <div className="planner-stage-topline hidden xl:block" />
                      <div className="planner-stage-topbar">
                        <div className="rounded-full border border-white/10 bg-[rgba(5,10,18,0.84)] px-3 py-1.5 text-[var(--text-inverse-body)] shadow-[0_14px_30px_rgba(1,5,10,0.22)]">
                          {currentView === "3d" ? "Spatial review" : "Technical canvas"}
                        </div>
                        <div className="flex flex-wrap items-center justify-end gap-2">
                          <span className="rounded-full border border-white/10 bg-[rgba(5,10,18,0.78)] px-3 py-1.5 text-[var(--text-inverse-subtle)] shadow-[0_14px_30px_rgba(1,5,10,0.18)]">
                            {showGrid ? "Grid visible" : "Grid hidden"}
                          </span>
                          <span className="rounded-full border border-white/10 bg-[rgba(5,10,18,0.78)] px-3 py-1.5 text-[var(--text-inverse-subtle)] shadow-[0_14px_30px_rgba(1,5,10,0.18)]">
                            {currentView === "3d" ? "Orbit camera" : `${activeTool} mode`}
                          </span>
                        </div>
                      </div>

                      {currentView === "2.5d" ? (
                        <div className="planner-stage-canvas-pad planner-stage-canvas-pad--2d">
                          <PlannerCanvas2D
                            interactive
                            showGrid={showGrid}
                            currentView={currentView}
                            onSelectItem={handleSelectItemInternal}
                            onMoveItem={handleMoveItemInternal}
                            onSelectRoom={handleCanvasSelectRoom}
                            onSelectWall={handleCanvasSelectWall}
                            onMoveWall={handleCanvasMoveWall}
                            onToggleGrid={() => setShowGrid((value) => !value)}
                            onSwitchView={handleSwitchView}
                            onActivateMoveMode={() => {
                              setActiveTool("move");
                              setStatus("Move mode active");
                            }}
                          />
                        </div>
                      ) : (
                        <div className="planner-stage-canvas-pad planner-stage-canvas-pad--3d">
                          <PlannerCanvas3D />
                        </div>
                      )}

                      <div className="planner-stage-bottombar">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full border border-white/10 bg-[rgba(5,10,18,0.76)] px-3 py-1.5 text-[var(--text-inverse-body)] shadow-[0_12px_24px_rgba(1,5,10,0.18)]">
                            {roomWidthLabel && roomDepthLabel
                              ? `Canvas ${roomWidthLabel} x ${roomDepthLabel}`
                              : "Workspace frame"}
                          </span>
                          <span className="rounded-full border border-white/10 bg-[rgba(5,10,18,0.76)] px-3 py-1.5 text-[var(--text-inverse-subtle)] shadow-[0_12px_24px_rgba(1,5,10,0.18)]">
                            {plannerDocument.items.length} placed / {boqRows.length} boq
                          </span>
                        </div>
                        <span className="rounded-full border border-[var(--planner-accent-soft-border)] bg-[var(--planner-accent-soft-bg)] px-3 py-1.5 text-[var(--text-inverse)] shadow-[var(--planner-shadow-accent)]">
                          {sceneSelection?.title ?? "No selection"}
                        </span>
                      </div>

                      <PlannerStatusBar status={status} />
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>

              <AnimatePresence initial={false}>
                {isInspectorOpen ? (
                  <motion.div
                    key="planner-inspector"
                    className="pt-4 pb-3"
                    initial={reduceMotion ? false : { opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reduceMotion ? undefined : { opacity: 0, y: 12 }}
                    transition={entranceTransition}
                  >
                    <PlannerInspector
                      layout="bottom"
                      sceneSelection={sceneSelection}
                      onApplyRoomSize={handleApplyRoomSizeInternal}
                      onNudgeSelectedWall={handleNudgeSelectedWall}
                      selectedCatalogItem={selectedItem}
                    />
                  </motion.div>
                ) : null}

                {isClientBarOpen ? (
                  <motion.div
                    key="planner-client-bar"
                    className="pb-3"
                    initial={reduceMotion ? false : { opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reduceMotion ? undefined : { opacity: 0, y: 12 }}
                    transition={entranceTransition}
                  >
                    <PlannerClientBar
                      clientName={clientName}
                      projectName={projectName}
                      preparedBy={preparedBy}
                      onClientNameChange={setClientName}
                      onProjectNameChange={setProjectName}
                      onPreparedByChange={setPreparedBy}
                      totalItems={plannerDocument.items.length}
                      uniqueItems={boqRows.length}
                      boqRows={boqRows}
                      roomOutline={activeRoom?.outline ?? []}
                      placedItems={plannerDocument.items}
                    />
                  </motion.div>
                ) : null}

                {isAiPanelOpen ? (
                  <motion.div
                    className="pb-6"
                    initial={reduceMotion ? false : { opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reduceMotion ? undefined : { opacity: 0, y: 12 }}
                    transition={entranceTransition}
                  >
                    <PlannerAiPanel />
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </motion.section>
          </motion.div>
        </motion.div>
      </div>
    </>
  );
}
