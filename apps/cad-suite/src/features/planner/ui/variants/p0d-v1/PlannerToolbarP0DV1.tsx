"use client";

import type { ReactNode, Ref } from "react";
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
  Maximize2,
  MousePointer2,
  PenTool,
  Redo2,
  Save,
  Settings2,
  Slash,
  Square,
  SquareDashedMousePointer,
  Trash2,
  Undo2,
  X,
} from "lucide-react";

import type { PlannerDrawingTool, PlannerStep } from "@/components/draw/types";

import { StepBarP0DV1 } from "./StepBarP0DV1";

interface PlannerToolbarP0DV1Props {
  containerRef?: Ref<HTMLDivElement>;
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
  onDeselectSelection: () => void;
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

function RailButton({
  icon,
  label,
  onClick,
  title,
  active = false,
  disabled = false,
  accent = false,
  primary = false,
  hideLabelOnMobile = false,
}: {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  title?: string;
  active?: boolean;
  disabled?: boolean;
  accent?: boolean;
  primary?: boolean;
  hideLabelOnMobile?: boolean;
}) {
  const stateClass = primary
    ? "border-[color:var(--planner-primary)] bg-[color:var(--planner-primary)] text-white shadow-theme-panel enabled:hover:bg-[color:var(--planner-primary-hover)]"
    : accent
      ? "border-[color:var(--planner-accent-soft)] bg-[color:var(--planner-accent-soft)]/55 text-[color:var(--planner-accent-strong)] enabled:hover:bg-[color:var(--planner-accent-soft)]"
      : active
        ? "border-[color:var(--planner-primary-soft)] bg-[color:var(--planner-primary-soft)] text-[color:var(--planner-primary)]"
        : "border-theme-soft bg-[color:var(--planner-panel-strong)] text-subtle enabled:hover:border-[color:var(--planner-border-hover)] enabled:hover:bg-[color:var(--planner-primary-soft)] enabled:hover:text-[color:var(--planner-primary)]";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title ?? label}
      className={`flex min-h-10 items-center justify-center gap-2 rounded-[0.95rem] border px-3 py-2 text-[0.72rem] font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-35 ${stateClass}`}
    >
      {icon}
      <span className={hideLabelOnMobile ? "hidden sm:inline" : undefined}>{label}</span>
    </button>
  );
}

function RailGroup({
  title,
  eyebrow,
  children,
  alignEnd = false,
}: {
  title: string;
  eyebrow?: string;
  children: ReactNode;
  alignEnd?: boolean;
}) {
  return (
    <section className="rounded-[1.2rem] border border-theme-soft bg-[color:var(--planner-panel-strong)] p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.72)]">
      <div className={`mb-1.5 flex items-center justify-between gap-2 px-1 ${alignEnd ? "sm:justify-end" : ""}`}>
        <div className={alignEnd ? "text-right" : undefined}>
          {eyebrow ? <p className="typ-caption font-semibold uppercase tracking-[0.16em] text-muted">{eyebrow}</p> : null}
          <p className="text-[0.72rem] font-semibold tracking-[0.01em] text-strong">{title}</p>
        </div>
      </div>
      <div className="grid gap-1.5 sm:grid-cols-2 xl:grid-cols-none xl:grid-flow-col xl:auto-cols-fr">{children}</div>
    </section>
  );
}

export function PlannerToolbarP0DV1({
  containerRef,
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
  onDeselectSelection,
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
}: PlannerToolbarP0DV1Props) {
  const catalogPanelLabel = currentStep === "room" ? "Room Builder" : "Catalog";
  const sessionIndicatorClass = isSessionBusy
    ? "bg-[color:var(--planner-accent)] animate-pulse"
    : "bg-[color:var(--planner-primary)]";
  const compactLabels = isMobileMode;

  const drawingTools: { id: PlannerDrawingTool; label: string; icon: ReactNode }[] = [
    { id: "select", label: "Select", icon: <MousePointer2 className="h-3.5 w-3.5" aria-hidden="true" /> },
    { id: "hand", label: "Pan", icon: <Hand className="h-3.5 w-3.5" aria-hidden="true" /> },
    { id: "draw", label: "Draw", icon: <PenTool className="h-3.5 w-3.5" aria-hidden="true" /> },
    { id: "line", label: "Line", icon: <Slash className="h-3.5 w-3.5" aria-hidden="true" /> },
    { id: "geo", label: "Rect", icon: <Square className="h-3.5 w-3.5" aria-hidden="true" /> },
    { id: "eraser", label: "Erase", icon: <Eraser className="h-3.5 w-3.5" aria-hidden="true" /> },
  ];

  return (
    <div ref={containerRef} className="pointer-events-none absolute top-2 left-1/2 z-[80] w-[min(99vw,1760px)] -translate-x-1/2 px-1">
      <div
        className="pointer-events-auto rounded-[1.55rem] border border-theme-soft bg-panel p-2 shadow-theme-float backdrop-blur-xl"
        onPointerDown={(event) => event.stopPropagation()}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="grid gap-2 xl:grid-cols-[minmax(0,1.35fr)_minmax(22rem,0.95fr)]">
          <section className="rounded-[1.3rem] border border-theme-soft bg-[linear-gradient(135deg,rgba(255,255,255,0.96)_0%,rgba(237,244,250,0.92)_100%)] p-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="rounded-full border border-[color:var(--planner-accent-soft)] bg-[color:var(--planner-accent-soft)]/55 px-2 py-0.5 typ-caption font-semibold uppercase tracking-[0.18em] text-[color:var(--planner-accent-strong)]">
                    Layout Concept A
                  </span>
                  <span className="rounded-full border border-theme-soft bg-white/75 px-2 py-0.5 typ-caption font-semibold uppercase tracking-[0.16em] text-muted">
                    Full-width rails
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap items-end gap-x-4 gap-y-2">
                  <div className="min-w-0">
                    <p className="typ-caption font-semibold uppercase tracking-[0.16em] text-muted">Plan Session</p>
                    <p className="truncate text-[0.9rem] font-semibold tracking-[-0.02em] text-strong" title={planName}>
                      {planName}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-theme-soft bg-white/78 px-2.5 py-1 typ-caption font-semibold uppercase tracking-[0.15em] text-[color:var(--planner-primary)]">
                      {isSessionBusy ? (
                        <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
                      ) : (
                        <span className={`h-2 w-2 rounded-full ${sessionIndicatorClass}`} aria-hidden="true" />
                      )}
                      {sessionModeLabel}
                    </span>
                    {!isMobileMode ? <span className="typ-caption text-subtle">{sessionStateLabel}</span> : null}
                  </div>
                </div>
              </div>

              {isMobileMode ? null : (
                <div className="rounded-[1rem] border border-theme-soft bg-white/70 px-3 py-2 text-right">
                  <p className="typ-caption font-semibold uppercase tracking-[0.16em] text-muted">Workspace</p>
                  <p className="mt-1 text-[0.72rem] leading-[1.35] text-body">Segmented controls keep editing, view, and panel actions separated.</p>
                </div>
              )}
            </div>

            <div className="mt-3">
              <StepBarP0DV1
                current={currentStep}
                onChange={onStepChange}
                disabledSteps={disabledSteps}
                compact={isMobileMode}
                dense={!isMobileMode}
              />
            </div>
          </section>

          <section className="grid gap-2 rounded-[1.3rem] border border-theme-soft bg-[color:var(--planner-panel-strong)] p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.72)]">
            <div className="grid gap-1.5 sm:grid-cols-3">
              <RailButton
                icon={isSessionBusy ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> : <FolderOpen className="h-3.5 w-3.5" aria-hidden="true" />}
                label={isMobileMode ? "Plans" : "Plan Sessions"}
                onClick={onOpenSession}
                disabled={isSessionBusy}
                primary
              />
              <RailButton
                icon={<Save className="h-3.5 w-3.5" aria-hidden="true" />}
                label={isMobileMode ? "Save" : "Save Draft"}
                onClick={onSaveDraft}
                disabled={isSessionBusy}
                accent
              />
              <RailButton
                icon={<Import className="h-3.5 w-3.5" aria-hidden="true" />}
                label="Import"
                onClick={onImport}
                disabled={isSessionBusy}
              />
            </div>
            <div className="rounded-[1rem] border border-theme-soft bg-panel px-3 py-2">
              <p className="typ-caption font-semibold uppercase tracking-[0.16em] text-muted">Session State</p>
              <p className="mt-1 text-[0.78rem] leading-[1.4] text-body">{sessionStateLabel}</p>
            </div>
          </section>
        </div>

        <div className="mt-2 grid gap-2 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
          <div className="grid gap-2">
            <RailGroup eyebrow="Editing" title="Tool Rail">
              {drawingTools.map((tool) => (
                <RailButton
                  key={tool.id}
                  icon={tool.icon}
                  label={tool.label}
                  onClick={() => onSelectDrawingTool(tool.id)}
                  active={activeDrawingTool === tool.id}
                  title={`Activate ${tool.label} tool`}
                  hideLabelOnMobile={compactLabels}
                />
              ))}
            </RailGroup>

            <div className="grid gap-2 lg:grid-cols-2">
              <RailGroup eyebrow="History" title="Edit Actions">
                <RailButton
                  icon={<Undo2 className="h-3.5 w-3.5" aria-hidden="true" />}
                  label="Undo"
                  onClick={onUndo}
                  disabled={!canUndo}
                  hideLabelOnMobile={compactLabels}
                />
                <RailButton
                  icon={<Redo2 className="h-3.5 w-3.5" aria-hidden="true" />}
                  label="Redo"
                  onClick={onRedo}
                  disabled={!canRedo}
                  hideLabelOnMobile={compactLabels}
                />
                <RailButton
                  icon={<CopyPlus className="h-3.5 w-3.5" aria-hidden="true" />}
                  label="Duplicate"
                  onClick={onDuplicateSelection}
                  disabled={!hasSelection}
                  hideLabelOnMobile={compactLabels}
                />
                <RailButton
                  icon={<Trash2 className="h-3.5 w-3.5" aria-hidden="true" />}
                  label="Delete"
                  onClick={onDeleteSelection}
                  disabled={!hasSelection}
                  accent={hasSelection}
                  hideLabelOnMobile={compactLabels}
                />
              </RailGroup>

              <RailGroup eyebrow="View" title="Canvas Controls">
                <RailButton
                  icon={<Magnet className="h-3.5 w-3.5" aria-hidden="true" />}
                  label="Snap"
                  onClick={onToggleSnap}
                  active={isSnapMode}
                  hideLabelOnMobile={compactLabels}
                />
                <RailButton
                  icon={<Grid3X3 className="h-3.5 w-3.5" aria-hidden="true" />}
                  label="Grid"
                  onClick={onToggleGrid}
                  active={isGridVisible}
                  hideLabelOnMobile={compactLabels}
                />
                <RailButton
                  icon={<Maximize2 className="h-3.5 w-3.5" aria-hidden="true" />}
                  label="Fit All"
                  onClick={onFitToDrawing}
                  hideLabelOnMobile={compactLabels}
                />
                <RailButton
                  icon={<SquareDashedMousePointer className="h-3.5 w-3.5" aria-hidden="true" />}
                  label="Fit Selection"
                  onClick={onFitToSelection}
                  disabled={!hasSelection}
                  hideLabelOnMobile={compactLabels}
                />
              </RailGroup>
            </div>
          </div>

          <div className="grid gap-2">
            <RailGroup eyebrow="Panels" title="Workspace Docking" alignEnd={!isMobileMode}>
              {isMobileMode ? (
                <>
                  <RailButton
                    icon={<Boxes className="h-3.5 w-3.5" aria-hidden="true" />}
                    label={catalogPanelLabel}
                    onClick={onOpenMobileCatalog}
                    hideLabelOnMobile={compactLabels}
                  />
                  <RailButton
                    icon={<Layers className="h-3.5 w-3.5" aria-hidden="true" />}
                    label="Layers"
                    onClick={onOpenMobileLayers}
                    hideLabelOnMobile={compactLabels}
                  />
                  <RailButton
                    icon={<Settings2 className="h-3.5 w-3.5" aria-hidden="true" />}
                    label="Inspector"
                    onClick={onOpenMobileInspector}
                    hideLabelOnMobile={compactLabels}
                  />
                </>
              ) : (
                <>
                  <RailButton
                    icon={<Boxes className="h-3.5 w-3.5" aria-hidden="true" />}
                    label={catalogPanelLabel}
                    onClick={onToggleCatalog}
                    active={showCatalog}
                  />
                  <RailButton
                    icon={<Layers className="h-3.5 w-3.5" aria-hidden="true" />}
                    label="Layers"
                    onClick={onToggleLayers}
                    active={showLayers}
                  />
                  <RailButton
                    icon={<Settings2 className="h-3.5 w-3.5" aria-hidden="true" />}
                    label="Inspector"
                    onClick={onToggleInspector}
                    active={showInspector}
                  />
                </>
              )}
            </RailGroup>

            <RailGroup eyebrow="Selection + Output" title="Review Rail" alignEnd={!isMobileMode}>
              <div className="rounded-[1rem] border border-theme-soft bg-panel px-3 py-2 text-center">
                <p className="typ-caption font-semibold uppercase tracking-[0.16em] text-muted">Zoom</p>
                <div className="mt-2 flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={onZoomOut}
                    aria-label="Zoom out"
                    className="flex h-9 w-9 items-center justify-center rounded-[0.85rem] border border-theme-soft bg-[color:var(--planner-panel-strong)] text-[0.95rem] font-bold text-subtle transition-all hover:bg-[color:var(--planner-primary-soft)] hover:text-[color:var(--planner-primary)]"
                  >
                    -
                  </button>
                  <span className="min-w-16 rounded-[0.85rem] border border-theme-soft bg-[color:var(--planner-panel-strong)] px-3 py-2 text-[0.74rem] font-semibold tracking-[0.04em] text-strong">
                    {zoomPercent}%
                  </span>
                  <button
                    type="button"
                    onClick={onZoomIn}
                    aria-label="Zoom in"
                    className="flex h-9 w-9 items-center justify-center rounded-[0.85rem] border border-theme-soft bg-[color:var(--planner-panel-strong)] text-[0.95rem] font-bold text-subtle transition-all hover:bg-[color:var(--planner-primary-soft)] hover:text-[color:var(--planner-primary)]"
                  >
                    +
                  </button>
                </div>
              </div>

              <RailButton
                icon={<X className="h-3.5 w-3.5" aria-hidden="true" />}
                label="Deselect"
                onClick={onDeselectSelection}
                disabled={!hasSelection}
                hideLabelOnMobile={compactLabels}
              />
              <RailButton
                icon={<Trash2 className="h-3.5 w-3.5" aria-hidden="true" />}
                label="Clear All"
                onClick={onClearAll}
                accent
                hideLabelOnMobile={compactLabels}
              />
              <RailButton
                icon={<Download className="h-3.5 w-3.5" aria-hidden="true" />}
                label="Export"
                onClick={onExport}
                hideLabelOnMobile={compactLabels}
              />
            </RailGroup>
          </div>
        </div>
      </div>
    </div>
  );
}
