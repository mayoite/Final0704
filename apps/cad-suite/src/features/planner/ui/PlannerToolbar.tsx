"use client";

import type { ReactNode } from "react";
import {
  Boxes,
  CopyPlus,
  Download,
  Eraser,
  FolderOpen,
  Grid3X3,
  Hand,
  Import,
  Layers,
  Loader2,
  Magnet,
  MousePointer2,
  PenTool,
  Redo2,
  ScanSearch,
  Save,
  Settings2,
  Slash,
  Square,
  Trash2,
  Undo2,
} from "lucide-react";

import { StepBar } from "./StepBar";
import type { PlannerDrawingTool, PlannerStep } from "@/components/draw/types";

interface PlannerToolbarProps {
  currentStep: PlannerStep;
  onStepChange: (step: PlannerStep) => void;
  disabledSteps?: Partial<Record<PlannerStep, boolean>>;
  planName: string;
  sessionModeLabel: string;
  sessionStateLabel: string;
  isSessionBusy?: boolean;
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
  onSaveDraft: () => void;
  onImport: () => void;
  onOpenSession: () => void;
  onClearAll: () => void;
  onExport: () => void;
}

export function PlannerToolbar({
  currentStep,
  onStepChange,
  disabledSteps,
  planName,
  sessionModeLabel,
  sessionStateLabel,
  isSessionBusy = false,
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
  onSaveDraft,
  onImport,
  onOpenSession,
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
  const sessionIndicatorClass = isSessionBusy
    ? "bg-[color:var(--planner-accent)] animate-pulse"
    : "bg-[color:var(--planner-primary)]";
  const secondaryActionClass =
    "flex items-center gap-1.5 rounded-xl border border-theme-soft bg-[color:var(--planner-panel-strong)] px-3 py-2 typ-caption-lg font-semibold text-muted transition-all enabled:hover:border-[color:var(--planner-border-hover)] enabled:hover:bg-[color:var(--planner-primary-soft)] enabled:hover:text-[color:var(--planner-primary)] disabled:cursor-not-allowed disabled:opacity-35";
  const utilityActionClass =
    "flex items-center gap-1.5 rounded-xl border border-theme-soft bg-[color:var(--planner-panel-strong)] px-3 py-2 typ-caption-lg font-semibold text-muted transition-all enabled:hover:border-[color:var(--planner-border-hover)] enabled:hover:bg-[color:var(--planner-primary-soft)] enabled:hover:text-[color:var(--planner-primary)] disabled:cursor-not-allowed disabled:opacity-35";
  const accentActionClass =
    "flex items-center gap-1.5 rounded-xl border border-[color:var(--planner-accent-soft)] bg-[color:var(--planner-accent-soft)]/50 px-3 py-2 typ-caption-lg font-semibold text-[color:var(--planner-accent-strong)] transition-all enabled:hover:bg-[color:var(--planner-accent-soft)] enabled:hover:text-[color:var(--planner-accent-strong)] disabled:cursor-not-allowed disabled:opacity-35";
  const primaryActionClass =
    "flex items-center gap-1.5 rounded-xl bg-[color:var(--planner-primary)] px-3.5 py-2 typ-caption-lg font-semibold text-white shadow-theme-panel transition-all enabled:hover:bg-[color:var(--planner-primary-hover)] disabled:cursor-not-allowed disabled:bg-[color:var(--planner-surface-muted)] disabled:text-[color:var(--planner-text-subtle)] disabled:shadow-none";
  const panelToggleClass = (isOpen: boolean) =>
    `rounded-lg border p-2 transition-all ${
      isOpen
        ? "border-[color:var(--planner-primary-soft)] bg-[color:var(--planner-primary-soft)] text-[color:var(--planner-primary)]"
        : "border-theme-soft bg-[color:var(--planner-panel-strong)] text-subtle hover:bg-[color:var(--planner-primary-soft)] hover:text-[color:var(--planner-primary)]"
    }`;

  return (
    <div className="pointer-events-none absolute top-4 left-1/2 z-[60] w-[min(96vw,1440px)] -translate-x-1/2 px-1">
      <div
        className="pointer-events-auto rounded-[2rem] border border-theme-soft bg-panel px-3 py-3 shadow-theme-float backdrop-blur-xl"
        onPointerDown={(event) => event.stopPropagation()}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <div className="flex flex-wrap items-center gap-2 pl-1">
                <span className="rounded-full border border-[color:var(--planner-accent-soft)] bg-[color:var(--planner-accent-soft)]/50 px-2.5 py-1 typ-caption font-semibold uppercase tracking-[0.18em] text-[color:var(--planner-accent-strong)]">
                  Planner Shell
                </span>
                {!isMobileMode ? (
                  <span className="typ-caption-lg text-subtle">
                    Build, save, and review from one aligned workspace.
                  </span>
                ) : null}
              </div>
              <StepBar current={currentStep} onChange={onStepChange} disabledSteps={disabledSteps} compact={isMobileMode} />
            </div>

            <div className="flex flex-wrap items-stretch gap-2 xl:max-w-[35rem] xl:justify-end">
              {!isMobileMode ? (
                <div className="min-w-[15rem] max-w-full flex-1 rounded-[1.35rem] border border-theme-soft bg-[linear-gradient(135deg,rgba(255,255,255,0.96)_0%,rgba(237,244,250,0.92)_100%)] px-4 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="typ-caption font-semibold uppercase tracking-[0.16em] text-muted">
                        Plan Session
                      </p>
                      <p className="mt-1 truncate text-[0.94rem] font-semibold tracking-[-0.02em] text-strong" title={planName}>
                        {planName}
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-theme-soft bg-white/75 px-2.5 py-1 typ-caption font-semibold uppercase tracking-[0.14em] text-[color:var(--planner-primary)]">
                      {isSessionBusy ? (
                        <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
                      ) : (
                        <span className={`h-2 w-2 rounded-full ${sessionIndicatorClass}`} aria-hidden="true" />
                      )}
                      {sessionModeLabel}
                    </span>
                  </div>
                  <p className="mt-2 typ-caption-lg leading-5 text-body">{sessionStateLabel}</p>
                </div>
              ) : (
                <div className="min-w-0 flex-1 rounded-[1.15rem] border border-theme-soft bg-[color:var(--planner-panel-strong)] px-3 py-2.5">
                  <p className="typ-caption font-semibold uppercase tracking-[0.16em] text-muted">{sessionModeLabel}</p>
                  <p className="mt-1 truncate text-[0.84rem] font-semibold text-strong" title={planName}>
                    {planName}
                  </p>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={onOpenSession}
                  disabled={isSessionBusy}
                  aria-label="Open planner session controls"
                  className={primaryActionClass}
                >
                  {isSessionBusy ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                  ) : (
                    <FolderOpen className="h-3.5 w-3.5" aria-hidden="true" />
                  )}
                  <span>{isMobileMode ? "Plans" : "Plan Sessions"}</span>
                </button>

                <button
                  type="button"
                  onClick={onSaveDraft}
                  disabled={isSessionBusy}
                  aria-label="Save a local planner draft"
                  className={accentActionClass}
                >
                  <Save className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{isMobileMode ? "Save" : "Save Draft"}</span>
                </button>

                {!isMobileMode ? (
                  <button
                    type="button"
                    onClick={onImport}
                    disabled={isSessionBusy}
                    aria-label="Import planner document JSON"
                    className={secondaryActionClass}
                  >
                    <Import className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Import</span>
                  </button>
                ) : null}
              </div>
            </div>
          </div>

          <div className="h-px bg-[linear-gradient(90deg,rgba(127,106,82,0.08)_0%,rgba(127,106,82,0.34)_32%,rgba(31,54,83,0.18)_100%)]" />

          <div className={isMobileMode ? "flex items-center gap-2 overflow-x-auto pb-1" : "flex flex-wrap items-center gap-2"}>
          <div className="flex shrink-0 items-center gap-1 rounded-xl border border-theme-soft bg-[color:var(--planner-panel-strong)] px-1.5 py-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
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
                      ? "border border-[color:var(--planner-primary)] bg-[color:var(--planner-primary)] text-white shadow-theme-panel"
                      : "text-subtle hover:bg-[color:var(--planner-primary-soft)] hover:text-[color:var(--planner-primary)]"
                  }`}
                  title={tool.label}
                >
                  {tool.icon}
                  <span>{tool.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex shrink-0 items-center gap-1 rounded-xl border border-theme-soft bg-[color:var(--planner-panel-strong)] px-1.5 py-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
            <button
              type="button"
              onClick={onUndo}
              disabled={!canUndo}
              aria-label="Undo last action"
              className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 typ-caption font-semibold text-subtle transition-all enabled:hover:bg-[color:var(--planner-primary-soft)] enabled:hover:text-[color:var(--planner-primary)] disabled:cursor-not-allowed disabled:opacity-35"
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
              className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 typ-caption font-semibold text-subtle transition-all enabled:hover:bg-[color:var(--planner-primary-soft)] enabled:hover:text-[color:var(--planner-primary)] disabled:cursor-not-allowed disabled:opacity-35"
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
                ? "border-[color:var(--planner-accent-soft)] bg-[color:var(--planner-accent-soft)] text-[color:var(--planner-accent-strong)] shadow-[inset_0_0_0_1px_rgba(127,106,82,0.08)]"
                : "border-theme-soft bg-panel text-subtle hover:bg-[color:var(--planner-primary-soft)] hover:text-[color:var(--planner-primary)]"
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
                ? "border-[color:var(--planner-primary-soft)] bg-[color:var(--planner-primary-soft)] text-[color:var(--planner-primary)] shadow-[inset_0_0_0_1px_rgba(31,54,83,0.08)]"
                : "border-theme-soft bg-panel text-subtle hover:bg-[color:var(--planner-primary-soft)] hover:text-[color:var(--planner-primary)]"
            }`}
          >
            <Grid3X3 className="h-3.5 w-3.5" aria-hidden="true" /> Grid
          </button>
          <div className="flex shrink-0 items-center rounded-lg border border-theme-soft bg-[color:var(--planner-panel-strong)]">
            <button
              type="button"
              onClick={onZoomOut}
              aria-label="Zoom out"
              className="px-2 py-1.5 typ-caption-lg font-bold text-subtle hover:bg-[color:var(--planner-primary-soft)] hover:text-[color:var(--planner-primary)]"
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
              className="px-2 py-1.5 typ-caption-lg font-bold text-subtle hover:bg-[color:var(--planner-primary-soft)] hover:text-[color:var(--planner-primary)]"
            >
              +
            </button>
          </div>

          <div className="flex shrink-0 items-center gap-1 rounded-xl border border-theme-soft bg-[color:var(--planner-panel-strong)] px-1.5 py-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
            <button
              type="button"
              onClick={onFitToDrawing}
              aria-label="Fit entire drawing into view"
              className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 typ-caption font-semibold text-subtle transition-all hover:bg-[color:var(--planner-primary-soft)] hover:text-[color:var(--planner-primary)]"
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
              className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 typ-caption font-semibold text-subtle transition-all enabled:hover:bg-[color:var(--planner-primary-soft)] enabled:hover:text-[color:var(--planner-primary)] disabled:cursor-not-allowed disabled:opacity-35"
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
                className="rounded-lg border border-theme-soft bg-[color:var(--planner-panel-strong)] p-2 text-subtle transition-all hover:bg-[color:var(--planner-primary-soft)] hover:text-[color:var(--planner-primary)]"
                title={`Open ${catalogPanelLabel}`}
              >
                <Boxes className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={onOpenMobileLayers}
                aria-label="Open Layers"
                className="rounded-lg border border-theme-soft bg-[color:var(--planner-panel-strong)] p-2 text-subtle transition-all hover:bg-[color:var(--planner-primary-soft)] hover:text-[color:var(--planner-primary)]"
              >
                <Layers className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={onOpenMobileInspector}
                aria-label="Open Inspector"
                className="rounded-lg border border-theme-soft bg-[color:var(--planner-panel-strong)] p-2 text-subtle transition-all hover:bg-[color:var(--planner-primary-soft)] hover:text-[color:var(--planner-primary)]"
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
                className={panelToggleClass(showCatalog)}
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
                className={panelToggleClass(showLayers)}
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
                className={panelToggleClass(showInspector)}
                title="Toggle Inspector"
              >
                <Settings2 className="h-4 w-4" aria-hidden="true" />
              </button>
            </>
          )}

          <div className="hidden h-6 w-px scheme-section-muted sm:block" aria-hidden="true" />

          <button
            type="button"
            onClick={onDuplicateSelection}
            disabled={!hasSelection}
            aria-label="Duplicate selected items"
            className={utilityActionClass}
          >
            <CopyPlus className="h-3.5 w-3.5" aria-hidden="true" /> Duplicate
          </button>
          <button
            type="button"
            onClick={onDeleteSelection}
            disabled={!hasSelection}
            aria-label="Delete selected items"
            className="flex items-center gap-1.5 rounded-xl border border-theme-soft bg-[color:var(--planner-panel-strong)] px-3 py-2 typ-caption-lg font-semibold text-muted transition-all enabled:hover:border-[color:var(--planner-accent-soft)] enabled:hover:bg-[color:var(--planner-accent-soft)]/55 enabled:hover:text-[color:var(--planner-accent-strong)] disabled:cursor-not-allowed disabled:opacity-35"
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" /> Delete
          </button>
          <button
            type="button"
            onClick={onClearAll}
            aria-label="Clear all furniture and items from the drafting canvas"
            className="flex items-center gap-1.5 rounded-xl border border-theme-soft bg-[color:var(--planner-panel-strong)] px-3 py-2 typ-caption-lg font-semibold text-muted transition-all hover:border-[color:var(--planner-accent-soft)] hover:bg-[color:var(--planner-accent-soft)]/55 hover:text-[color:var(--planner-accent-strong)]"
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" /> Clear
          </button>
          <button
            type="button"
            onClick={onExport}
            aria-label="Export drafting canvas to PDF or Print"
            className={utilityActionClass}
          >
            <Download className="h-3.5 w-3.5" aria-hidden="true" /> Export
          </button>
        </div>
        </div>
      </div>
    </div>
  );
}
