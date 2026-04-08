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
import { cn } from "@/lib/utils";

import { StepBarP0DV2 } from "./StepBarP0DV2";

interface PlannerToolbarP0DV2Props {
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

type ActionButtonConfig = {
  id: string;
  label: string;
  shortLabel?: string;
  icon: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  pressed?: boolean;
  title?: string;
  variant?: "default" | "accent" | "primary" | "danger" | "panel";
  ariaLabel?: string;
  ariaControls?: string;
  ariaExpanded?: boolean;
};

const drawingTools: { id: PlannerDrawingTool; label: string; icon: ReactNode }[] = [
  { id: "select", label: "Select", icon: <MousePointer2 className="h-3.5 w-3.5" aria-hidden="true" /> },
  { id: "hand", label: "Pan", icon: <Hand className="h-3.5 w-3.5" aria-hidden="true" /> },
  { id: "draw", label: "Draw", icon: <PenTool className="h-3.5 w-3.5" aria-hidden="true" /> },
  { id: "line", label: "Line", icon: <Slash className="h-3.5 w-3.5" aria-hidden="true" /> },
  { id: "geo", label: "Rect", icon: <Square className="h-3.5 w-3.5" aria-hidden="true" /> },
  { id: "eraser", label: "Erase", icon: <Eraser className="h-3.5 w-3.5" aria-hidden="true" /> },
];

function CommandButton({
  label,
  shortLabel,
  icon,
  onClick,
  disabled = false,
  pressed = false,
  title,
  variant = "default",
  ariaLabel,
  ariaControls,
  ariaExpanded,
}: ActionButtonConfig) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={pressed || undefined}
      aria-label={ariaLabel ?? label}
      aria-controls={ariaControls}
      aria-expanded={ariaExpanded}
      title={title ?? label}
      className={cn(
        "flex h-9 shrink-0 items-center gap-1.5 rounded-xl border px-2.5 typ-caption font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-35",
        variant === "default" &&
          "border-theme-soft bg-[color:var(--planner-panel-strong)] text-muted enabled:hover:border-[color:var(--planner-border-hover)] enabled:hover:bg-[color:var(--planner-primary-soft)] enabled:hover:text-[color:var(--planner-primary)]",
        variant === "accent" &&
          "border-[color:var(--planner-accent-soft)] bg-[color:var(--planner-accent-soft)]/50 text-[color:var(--planner-accent-strong)] enabled:hover:bg-[color:var(--planner-accent-soft)] enabled:hover:text-[color:var(--planner-accent-strong)]",
        variant === "primary" &&
          "border-[color:var(--planner-primary)] bg-[color:var(--planner-primary)] text-white shadow-theme-panel enabled:hover:bg-[color:var(--planner-primary-hover)]",
        variant === "danger" &&
          "border-theme-soft bg-[color:var(--planner-panel-strong)] text-muted enabled:hover:border-[color:var(--planner-accent-soft)] enabled:hover:bg-[color:var(--planner-accent-soft)]/55 enabled:hover:text-[color:var(--planner-accent-strong)]",
        variant === "panel" &&
          (pressed
            ? "border-[color:var(--planner-primary-soft)] bg-[color:var(--planner-primary-soft)] text-[color:var(--planner-primary)]"
            : "border-theme-soft bg-[color:var(--planner-panel-strong)] text-subtle enabled:hover:bg-[color:var(--planner-primary-soft)] enabled:hover:text-[color:var(--planner-primary)]"),
      )}
    >
      {icon}
      <span className="hidden lg:inline">{shortLabel ?? label}</span>
    </button>
  );
}

export function PlannerToolbarP0DV2({
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
}: PlannerToolbarP0DV2Props) {
  const catalogPanelLabel = currentStep === "room" ? "Room Builder" : "Catalog";
  const sessionIndicatorClass = isSessionBusy
    ? "bg-[color:var(--planner-accent)] animate-pulse"
    : "bg-[color:var(--planner-primary)]";

  const primaryActions: ActionButtonConfig[] = [
    {
      id: "session",
      label: isMobileMode ? "Plans" : "Plan Sessions",
      shortLabel: "Plans",
      icon: isSessionBusy ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
      ) : (
        <FolderOpen className="h-3.5 w-3.5" aria-hidden="true" />
      ),
      onClick: onOpenSession,
      disabled: isSessionBusy,
      variant: "primary",
      ariaLabel: "Open planner session controls",
    },
    {
      id: "save",
      label: "Save Draft",
      shortLabel: "Save",
      icon: <Save className="h-3.5 w-3.5" aria-hidden="true" />,
      onClick: onSaveDraft,
      disabled: isSessionBusy,
      variant: "accent",
      ariaLabel: "Save a local planner draft",
    },
  ];

  if (!isMobileMode) {
    primaryActions.push({
      id: "import",
      label: "Import",
      icon: <Import className="h-3.5 w-3.5" aria-hidden="true" />,
      onClick: onImport,
      disabled: isSessionBusy,
      variant: "default",
      ariaLabel: "Import planner document JSON",
    });
  }

  const panelActions: ActionButtonConfig[] = isMobileMode
    ? [
        {
          id: "catalog",
          label: catalogPanelLabel,
          shortLabel: "Catalog",
          icon: <Boxes className="h-4 w-4" aria-hidden="true" />,
          onClick: onOpenMobileCatalog,
          variant: "panel",
          ariaLabel: `Open ${catalogPanelLabel}`,
        },
        {
          id: "layers",
          label: "Layers",
          icon: <Layers className="h-4 w-4" aria-hidden="true" />,
          onClick: onOpenMobileLayers,
          variant: "panel",
          ariaLabel: "Open Layers",
        },
        {
          id: "inspector",
          label: "Inspector",
          icon: <Settings2 className="h-4 w-4" aria-hidden="true" />,
          onClick: onOpenMobileInspector,
          variant: "panel",
          ariaLabel: "Open Inspector",
        },
      ]
    : [
        {
          id: "catalog",
          label: catalogPanelLabel,
          shortLabel: "Catalog",
          icon: <Boxes className="h-4 w-4" aria-hidden="true" />,
          onClick: onToggleCatalog,
          pressed: showCatalog,
          variant: "panel",
          ariaLabel: `Toggle ${catalogPanelLabel} Panel`,
          ariaControls: "catalog-panel",
          ariaExpanded: showCatalog,
        },
        {
          id: "layers",
          label: "Layers",
          icon: <Layers className="h-4 w-4" aria-hidden="true" />,
          onClick: onToggleLayers,
          pressed: showLayers,
          variant: "panel",
          ariaLabel: "Toggle Layers Panel",
          ariaControls: "layers-panel",
          ariaExpanded: showLayers,
        },
        {
          id: "inspector",
          label: "Inspector",
          icon: <Settings2 className="h-4 w-4" aria-hidden="true" />,
          onClick: onToggleInspector,
          pressed: showInspector,
          variant: "panel",
          ariaLabel: "Toggle CAD Inspector Layout Properties Panel",
          ariaControls: "inspector-panel",
          ariaExpanded: showInspector,
        },
      ];

  return (
    <div ref={containerRef} className="pointer-events-none absolute top-2 left-1/2 z-[80] w-[min(99vw,1760px)] -translate-x-1/2 px-1">
      <div
        className="pointer-events-auto rounded-[1.35rem] border border-theme-soft bg-panel/95 px-2 py-1.5 shadow-theme-float backdrop-blur-xl"
        onPointerDown={(event) => event.stopPropagation()}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-1.5">
            <div className="flex min-w-0 flex-1 items-center gap-1.5 overflow-hidden rounded-[1.1rem] border border-theme-soft bg-[color:var(--planner-panel-strong)] px-1.5 py-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
              <div className="hidden shrink-0 items-center gap-1.5 pl-1 md:flex">
                <span className="rounded-full border border-[color:var(--planner-accent-soft)] bg-[color:var(--planner-accent-soft)]/50 px-2 py-0.5 typ-caption font-semibold uppercase tracking-[0.18em] text-[color:var(--planner-accent-strong)]">
                  Shell V2
                </span>
                <div className="hidden min-w-0 xl:block">
                  <p className="truncate text-[0.78rem] font-semibold tracking-[-0.02em] text-strong" title={planName}>
                    {planName}
                  </p>
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <StepBarP0DV2
                  current={currentStep}
                  onChange={onStepChange}
                  disabledSteps={disabledSteps}
                  compact={isMobileMode}
                  dense
                />
              </div>
            </div>

            <div className="flex min-w-[12rem] flex-1 items-center justify-between gap-2 rounded-[1.1rem] border border-theme-soft bg-[linear-gradient(135deg,rgba(255,255,255,0.96)_0%,rgba(237,244,250,0.92)_100%)] px-2.5 py-1.5 md:max-w-[24rem] md:flex-none">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 rounded-full border border-theme-soft bg-white/80 px-2 py-0.5 typ-caption font-semibold uppercase tracking-[0.14em] text-[color:var(--planner-primary)]">
                    {isSessionBusy ? (
                      <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
                    ) : (
                      <span className={cn("h-2 w-2 rounded-full", sessionIndicatorClass)} aria-hidden="true" />
                    )}
                    {sessionModeLabel}
                  </span>
                </div>
                <p className="mt-1 truncate text-[0.72rem] font-semibold tracking-[-0.02em] text-strong" title={planName}>
                  {planName}
                </p>
                {!isMobileMode ? <p className="text-[0.58rem] leading-[1.15] text-body">{sessionStateLabel}</p> : null}
              </div>
              <div className="flex shrink-0 items-center gap-1">
                {primaryActions.map((action) => (
                  <CommandButton key={action.id} {...action} />
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex shrink-0 items-center gap-1 rounded-[1rem] border border-theme-soft bg-[color:var(--planner-panel-strong)] px-1 py-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
              {drawingTools.map((tool) => {
                const isActive = activeDrawingTool === tool.id;
                return (
                  <button
                    key={tool.id}
                    type="button"
                    onClick={() => onSelectDrawingTool(tool.id)}
                    aria-pressed={isActive}
                    aria-label={`Activate ${tool.label} tool`}
                    title={tool.label}
                    className={cn(
                      "flex h-9 items-center gap-1 rounded-xl px-2 typ-caption font-semibold transition-all",
                      isActive
                        ? "border border-[color:var(--planner-primary)] bg-[color:var(--planner-primary)] text-white shadow-theme-panel"
                        : "text-subtle hover:bg-[color:var(--planner-primary-soft)] hover:text-[color:var(--planner-primary)]",
                    )}
                  >
                    {tool.icon}
                    <span className="hidden xl:inline">{tool.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex shrink-0 items-center gap-1 rounded-[1rem] border border-theme-soft bg-[color:var(--planner-panel-strong)] px-1 py-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
              <CommandButton
                id="undo"
                label="Undo"
                icon={<Undo2 className="h-3.5 w-3.5" aria-hidden="true" />}
                onClick={onUndo}
                disabled={!canUndo}
              />
              <CommandButton
                id="redo"
                label="Redo"
                icon={<Redo2 className="h-3.5 w-3.5" aria-hidden="true" />}
                onClick={onRedo}
                disabled={!canRedo}
              />
            </div>

            <CommandButton
              id="snap"
              label="Snap"
              icon={<Magnet className="h-3.5 w-3.5" aria-hidden="true" />}
              onClick={onToggleSnap}
              pressed={isSnapMode}
              variant={isSnapMode ? "accent" : "default"}
              ariaLabel={isSnapMode ? "Disable geometric snapping" : "Enable geometric snapping"}
            />
            <CommandButton
              id="grid"
              label="Grid"
              icon={<Grid3X3 className="h-3.5 w-3.5" aria-hidden="true" />}
              onClick={onToggleGrid}
              pressed={isGridVisible}
              variant={isGridVisible ? "panel" : "default"}
              ariaLabel={isGridVisible ? "Hide drawing grid" : "Show drawing grid"}
            />

            <div className="flex h-9 shrink-0 items-center rounded-xl border border-theme-soft bg-[color:var(--planner-panel-strong)]">
              <button
                type="button"
                onClick={onZoomOut}
                aria-label="Zoom out"
                className="px-2 py-1.5 typ-caption font-bold text-subtle transition-all hover:bg-[color:var(--planner-primary-soft)] hover:text-[color:var(--planner-primary)]"
              >
                -
              </button>
              <span className="min-w-12 px-2 text-center typ-caption font-semibold tracking-[0.02em] text-subtle">{zoomPercent}%</span>
              <button
                type="button"
                onClick={onZoomIn}
                aria-label="Zoom in"
                className="px-2 py-1.5 typ-caption font-bold text-subtle transition-all hover:bg-[color:var(--planner-primary-soft)] hover:text-[color:var(--planner-primary)]"
              >
                +
              </button>
            </div>

            <div className="flex shrink-0 items-center gap-1 rounded-[1rem] border border-theme-soft bg-[color:var(--planner-panel-strong)] px-1 py-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
              <CommandButton
                id="fit"
                label="Fit"
                icon={<Maximize2 className="h-3.5 w-3.5" aria-hidden="true" />}
                onClick={onFitToDrawing}
                ariaLabel="Fit entire drawing into view"
              />
              <CommandButton
                id="selection"
                label="Selection"
                shortLabel="Select"
                icon={<SquareDashedMousePointer className="h-3.5 w-3.5" aria-hidden="true" />}
                onClick={onFitToSelection}
                disabled={!hasSelection}
                ariaLabel="Fit selected items into view"
              />
              <CommandButton
                id="deselect"
                label="Deselect"
                icon={<X className="h-3.5 w-3.5" aria-hidden="true" />}
                onClick={onDeselectSelection}
                disabled={!hasSelection}
                ariaLabel="Deselect everything"
              />
            </div>

            <div className="flex shrink-0 items-center gap-1 rounded-[1rem] border border-theme-soft bg-[color:var(--planner-panel-strong)] px-1 py-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
              {panelActions.map((action) => (
                <CommandButton key={action.id} {...action} />
              ))}
            </div>

            <div className="hidden h-6 w-px scheme-section-muted lg:block" aria-hidden="true" />

            <CommandButton
              id="duplicate"
              label="Duplicate"
              icon={<CopyPlus className="h-3.5 w-3.5" aria-hidden="true" />}
              onClick={onDuplicateSelection}
              disabled={!hasSelection}
              ariaLabel="Duplicate selected items"
            />
            <CommandButton
              id="delete"
              label="Delete"
              icon={<Trash2 className="h-3.5 w-3.5" aria-hidden="true" />}
              onClick={onDeleteSelection}
              disabled={!hasSelection}
              variant="danger"
              ariaLabel="Delete selected items"
            />
            <CommandButton
              id="clear"
              label="Clear"
              icon={<Trash2 className="h-3.5 w-3.5" aria-hidden="true" />}
              onClick={onClearAll}
              variant="danger"
              ariaLabel="Clear all furniture and items from the drafting canvas"
            />
            <CommandButton
              id="export"
              label="Export"
              icon={<Download className="h-3.5 w-3.5" aria-hidden="true" />}
              onClick={onExport}
              ariaLabel="Export drafting canvas to PDF or Print"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
