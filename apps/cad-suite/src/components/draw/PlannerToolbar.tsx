"use client";

import type { ReactNode } from "react";
import {
  Boxes,
  CopyPlus,
  Download,
  Eraser,
  Grid3X3,
  Hand,
  Layers,
  Magnet,
  MousePointer2,
  PenTool,
  Redo2,
  ScanSearch,
  Settings2,
  Slash,
  Square,
  Trash2,
  Undo2,
} from "lucide-react";

import { StepBar } from "./StepBar";
import type { PlannerDrawingTool, PlannerStep } from "./types";

interface PlannerToolbarProps {
  currentStep: PlannerStep;
  onStepChange: (step: PlannerStep) => void;
  disabledSteps?: Partial<Record<PlannerStep, boolean>>;
  activeDrawingTool: PlannerDrawingTool;
  onSelectDrawingTool: (tool: PlannerDrawingTool) => void;
  canUndo: boolean;
  canRedo: boolean;
  hasSelection: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onFitToDrawing: () => void;
  onFitToSelection: () => void;
  onDuplicateSelection: () => void;
  onDeleteSelection: () => void;
  isSnapMode: boolean;
  onToggleSnap: () => void;
  isGridVisible: boolean;
  onToggleGrid: () => void;
  zoomPercent: number;
  onZoomOut: () => void;
  onZoomIn: () => void;
  isMobileMode: boolean;
  showLayers: boolean;
  showCatalog: boolean;
  showInspector: boolean;
  onToggleLayers: () => void;
  onOpenMobileLayers: () => void;
  onToggleCatalog: () => void;
  onToggleInspector: () => void;
  onOpenMobileCatalog: () => void;
  onOpenMobileInspector: () => void;
  onClearAll: () => void;
  onExport: () => void;
}

export function PlannerToolbar({
  currentStep,
  onStepChange,
  disabledSteps,
  activeDrawingTool,
  onSelectDrawingTool,
  canUndo,
  canRedo,
  hasSelection,
  onUndo,
  onRedo,
  onFitToDrawing,
  onFitToSelection,
  onDuplicateSelection,
  onDeleteSelection,
  isSnapMode,
  onToggleSnap,
  isGridVisible,
  onToggleGrid,
  zoomPercent,
  onZoomOut,
  onZoomIn,
  isMobileMode,
  showLayers,
  showCatalog,
  showInspector,
  onToggleLayers,
  onOpenMobileLayers,
  onToggleCatalog,
  onToggleInspector,
  onOpenMobileCatalog,
  onOpenMobileInspector,
  onClearAll,
  onExport,
}: PlannerToolbarProps) {
  const catalogPanelLabel = currentStep === "room" ? "Room Builder" : "Catalog";
  const drawingTools: { id: PlannerDrawingTool; label: string; icon: ReactNode }[] = [
    { id: "select", label: "Select", icon: <MousePointer2 className="h-3.5 w-3.5" aria-hidden="true" /> },
    { id: "hand", label: "Pan", icon: <Hand className="h-3.5 w-3.5" aria-hidden="true" /> },
    { id: "draw", label: "Draw", icon: <PenTool className="h-3.5 w-3.5" aria-hidden="true" /> },
    { id: "line", label: "Line", icon: <Slash className="h-3.5 w-3.5" aria-hidden="true" /> },
    { id: "geo", label: "Rect", icon: <Square className="h-3.5 w-3.5" aria-hidden="true" /> },
    { id: "eraser", label: "Erase", icon: <Eraser className="h-3.5 w-3.5" aria-hidden="true" /> },
  ];

  return (
    <div className="pointer-events-none absolute top-4 left-1/2 z-[60] w-[min(96vw,1400px)] -translate-x-1/2">
      <div
        className="pointer-events-auto flex max-w-full flex-wrap items-center justify-center gap-2 rounded-blob border border-theme-soft bg-panel px-3 py-2 shadow-theme-float"
        onPointerDown={(event) => event.stopPropagation()}
        onClick={(event) => event.stopPropagation()}
      >
        <StepBar current={currentStep} onChange={onStepChange} disabledSteps={disabledSteps} />

        <div className="h-6 w-px bg-muted opacity-20" />

        <div className="flex flex-wrap items-center justify-center gap-2">
          <div className="flex shrink-0 items-center gap-1 rounded-xl border border-theme-soft bg-white/80 px-1.5 py-1">
            {drawingTools.map((tool) => {
              const isActive = activeDrawingTool === tool.id;
              return (
                <button
                  key={tool.id}
                  type="button"
                  onClick={() => onSelectDrawingTool(tool.id)}
                  aria-pressed={isActive}
                  aria-label={`Activate ${tool.label} tool`}
                  className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 typ-caption font-semibold transition-all ${
                    isActive
                      ? "bg-slate-900 text-white shadow-sm"
                      : "text-subtle hover:bg-slate-100 hover:text-slate-700"
                  }`}
                  title={tool.label}
                >
                  {tool.icon}
                  <span>{tool.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex shrink-0 items-center gap-1 rounded-xl border border-theme-soft bg-white/80 px-1.5 py-1">
            <button
              type="button"
              onClick={onUndo}
              disabled={!canUndo}
              aria-label="Undo last action"
              className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 typ-caption font-semibold text-subtle transition-all enabled:hover:bg-slate-100 enabled:hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-35"
              title="Undo"
            >
              <Undo2 className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Undo</span>
            </button>
            <button
              type="button"
              onClick={onRedo}
              disabled={!canRedo}
              aria-label="Redo last action"
              className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 typ-caption font-semibold text-subtle transition-all enabled:hover:bg-slate-100 enabled:hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-35"
              title="Redo"
            >
              <Redo2 className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Redo</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onToggleSnap}
            aria-pressed={isSnapMode}
            aria-label={isSnapMode ? "Disable geometric snapping" : "Enable geometric snapping"}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 typ-caption-lg font-semibold tracking-wide transition-all ${
              isSnapMode
                ? "border-violet-200 bg-violet-50 text-violet-700"
                : "border-theme-soft bg-panel text-subtle hover:bg-slate-50"
            }`}
          >
            <Magnet className="h-3.5 w-3.5" aria-hidden="true" /> Snap
          </button>
          <button
            type="button"
            onClick={onToggleGrid}
            aria-pressed={isGridVisible}
            aria-label={isGridVisible ? "Hide drawing grid" : "Show drawing grid"}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 typ-caption-lg font-semibold tracking-wide transition-all ${
              isGridVisible
                ? "border-blue-200 bg-blue-50 text-blue-700"
                : "border-theme-soft bg-panel text-subtle hover:bg-slate-50"
            }`}
          >
            <Grid3X3 className="h-3.5 w-3.5" aria-hidden="true" /> Grid
          </button>
          <div className="flex shrink-0 items-center rounded-lg border border-theme-soft bg-panel">
            <button
              type="button"
              onClick={onZoomOut}
              aria-label="Zoom out"
              className="px-2 py-1.5 typ-caption-lg font-bold text-subtle hover:bg-slate-50"
            >
              -
            </button>
            <span className="min-w-13 px-2 py-1.5 text-center typ-caption-lg font-semibold tracking-wide text-subtle">
              {zoomPercent}%
            </span>
            <button
              type="button"
              onClick={onZoomIn}
              aria-label="Zoom in"
              className="px-2 py-1.5 typ-caption-lg font-bold text-subtle hover:bg-slate-50"
            >
              +
            </button>
          </div>

          <div className="flex shrink-0 items-center gap-1 rounded-xl border border-theme-soft bg-white/80 px-1.5 py-1">
            <button
              type="button"
              onClick={onFitToDrawing}
              aria-label="Fit entire drawing into view"
              className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 typ-caption font-semibold text-subtle transition-all hover:bg-slate-100 hover:text-slate-700"
              title="Fit drawing"
            >
              <ScanSearch className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Fit</span>
            </button>
            <button
              type="button"
              onClick={onFitToSelection}
              disabled={!hasSelection}
              aria-label="Fit selected items into view"
              className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 typ-caption font-semibold text-subtle transition-all enabled:hover:bg-slate-100 enabled:hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-35"
              title="Fit selection"
            >
              <ScanSearch className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Selection</span>
            </button>
          </div>

          {isMobileMode ? (
            <>
              <button
                type="button"
                onClick={onOpenMobileCatalog}
                aria-label={`Open ${catalogPanelLabel}`}
                className="rounded-lg border border-theme-soft p-2 text-subtle transition-all"
                title={`Open ${catalogPanelLabel}`}
              >
                <Boxes className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={onOpenMobileLayers}
                aria-label="Open Layers"
                className="rounded-lg border border-theme-soft p-2 text-subtle transition-all"
              >
                <Layers className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={onOpenMobileInspector}
                aria-label="Open Inspector"
                className="rounded-lg border border-theme-soft p-2 text-subtle transition-all"
              >
                <Settings2 className="h-4 w-4" aria-hidden="true" />
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={onToggleCatalog}
                aria-expanded={showCatalog}
                aria-controls="catalog-panel"
                aria-label={`Toggle ${catalogPanelLabel} Panel`}
                className={`rounded-lg border p-2 transition-all ${
                  showCatalog
                    ? "border-blue-200 bg-blue-50 text-blue-600"
                    : "border-theme-soft text-subtle hover:bg-slate-50"
                }`}
                title={`Toggle ${catalogPanelLabel}`}
              >
                <Boxes className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={onToggleLayers}
                aria-expanded={showLayers}
                aria-controls="layers-panel"
                aria-label="Toggle Layers Panel"
                className={`rounded-lg border p-2 transition-all ${
                  showLayers
                    ? "border-blue-200 bg-blue-50 text-blue-600"
                    : "border-theme-soft text-subtle hover:bg-slate-50"
                }`}
                title="Toggle Layers"
              >
                <Layers className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={onToggleInspector}
                aria-expanded={showInspector}
                aria-controls="inspector-panel"
                aria-label="Toggle CAD Inspector Layout Properties Panel"
                className={`rounded-lg border p-2 transition-all ${
                  showInspector
                    ? "border-blue-200 bg-blue-50 text-blue-600"
                    : "border-theme-soft text-subtle hover:bg-slate-50"
                }`}
                title="Toggle Inspector"
              >
                <Settings2 className="h-4 w-4" aria-hidden="true" />
              </button>
            </>
          )}

          <div className="h-6 w-px scheme-section-muted" aria-hidden="true" />

          <button
            type="button"
            onClick={onDuplicateSelection}
            disabled={!hasSelection}
            aria-label="Duplicate selected items"
            className="flex items-center gap-1.5 rounded-lg border border-theme-soft px-3 py-1.5 typ-caption-lg font-semibold text-muted transition-all enabled:hover:bg-slate-50 enabled:hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-35"
          >
            <CopyPlus className="h-3.5 w-3.5" aria-hidden="true" /> Duplicate
          </button>
          <button
            type="button"
            onClick={onDeleteSelection}
            disabled={!hasSelection}
            aria-label="Delete selected items"
            className="flex items-center gap-1.5 rounded-lg border border-theme-soft px-3 py-1.5 typ-caption-lg font-semibold text-muted transition-all enabled:hover:bg-red-50 enabled:hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-35"
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" /> Delete
          </button>

          <button
            type="button"
            onClick={onClearAll}
            aria-label="Clear all furniture and items from the drafting canvas"
            className="flex items-center gap-1.5 rounded-lg border border-theme-soft px-3 py-1.5 typ-caption-lg font-semibold text-muted transition-all hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" /> Clear
          </button>
          <button
            type="button"
            onClick={onExport}
            aria-label="Export drafting canvas to PDF or Print"
            className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 typ-caption-lg font-semibold text-white shadow-sm transition-all hover:bg-black"
          >
            <Download className="h-3.5 w-3.5" aria-hidden="true" /> Export
          </button>
        </div>
      </div>
    </div>
  );
}
