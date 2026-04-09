"use client";

import type { ReactNode, Ref } from "react";
import {
  ArrowUpRight,
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
  Trash2,
  Type,
  Undo2,
  X,
  XCircle,
} from "lucide-react";

import { StepBar } from "./StepBar";
import type { PlannerDrawingTool, PlannerStep } from "@/components/draw/types";


interface PlannerToolbarProps {
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
  onOpen3d?: () => void;
  onImport: () => void;
  onOpenSession: () => void;
  onClearAll: () => void;
  onExport: () => void;
}

// ─── Atoms ───────────────────────────────────────────────────────────────────

const SEP = <div className="mx-1 h-5 w-px bg-[color:var(--planner-border-soft)]" aria-hidden />;

function ToolBtn({
  label, active, disabled, onClick, children,
}: { label: string; active?: boolean; disabled?: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button" title={label} aria-label={label} aria-pressed={active} disabled={disabled}
      onClick={onClick}
      className={`flex h-7 w-7 items-center justify-center transition-colors ${
        active
          ? "bg-[color:var(--planner-primary)] text-white"
          : "text-[color:var(--planner-text-body)] hover:bg-[color:var(--planner-primary-soft)] hover:text-[color:var(--planner-primary)]"
      } disabled:cursor-not-allowed disabled:opacity-30`}
    >
      {children}
    </button>
  );
}

function Btn({
  label, icon, disabled, onClick, variant = "ghost",
}: { label: string; icon?: ReactNode; disabled?: boolean; onClick: () => void; variant?: "ghost" | "primary" | "accent" | "danger" }) {
  const base = "flex h-7 items-center gap-1.5 px-3 transition-colors text-[11px] font-medium tracking-[0.01em] whitespace-nowrap";
  const styles: Record<string, string> = {
    ghost: "border border-[color:var(--planner-border-soft)] bg-[color:var(--planner-panel-strong)] text-[color:var(--planner-text-body)] hover:bg-[color:var(--planner-primary-soft)] hover:text-[color:var(--planner-text-strong)]",
    primary: "bg-[color:var(--planner-primary)] text-white hover:bg-[color:var(--planner-primary-hover)]",
    accent: "border border-[color:var(--planner-accent-soft)] bg-[color:var(--planner-accent-soft)]/40 text-[color:var(--planner-accent-strong)] hover:bg-[color:var(--planner-accent-soft)]",
    danger: "border border-[color:var(--planner-border-soft)] bg-[color:var(--planner-panel-strong)] text-[color:var(--planner-text-muted)] hover:border-red-300/70 hover:bg-red-50 hover:text-red-600",
  };
  return (
    <button
      type="button" title={label} aria-label={label} disabled={disabled} onClick={onClick}
      className={`${base} ${styles[variant]} disabled:cursor-not-allowed disabled:opacity-30`}
    >
      {icon}<span>{label}</span>
    </button>
  );
}

function ToggleBtn({
  label, active, onClick, children,
}: { label: string; active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button" title={label} aria-label={label} aria-pressed={active} onClick={onClick}
      className={`flex h-7 items-center gap-1.5 px-2.5 text-[12px] font-medium tracking-[0.01em] transition-colors ${
        active
          ? "bg-[color:var(--planner-primary)] text-white"
          : "text-[color:var(--planner-text-body)] hover:bg-[color:var(--planner-primary-soft)] hover:text-[color:var(--planner-primary)]"
      }`}
    >
      {children}
    </button>
  );
}

function PanelBtn({
  label, active, onClick, children,
}: { label: string; active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button" title={label} aria-label={label} aria-pressed={active} onClick={onClick}
      className={`flex h-7 w-8 items-center justify-center transition-colors ${
        active
          ? "bg-[color:var(--planner-primary-soft)] text-[color:var(--planner-primary)]"
          : "text-[color:var(--planner-text-body)] hover:bg-[color:var(--planner-primary-soft)] hover:text-[color:var(--planner-primary)]"
      }`}
    >
      {children}
    </button>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function PlannerToolbar({
  containerRef, currentStep, onStepChange, disabledSteps,
  planName, sessionModeLabel, sessionStateLabel, isSessionBusy = false,
  activeDrawingTool, onSelectDrawingTool,
  canUndo, canRedo, hasSelection, onUndo, onRedo,
  onFitToDrawing, onFitToSelection, onDeselectSelection, onDuplicateSelection, onDeleteSelection,
  isSnapMode, onToggleSnap, isGridVisible, onToggleGrid,
  zoomPercent, onZoomOut, onZoomIn,
  isMobileMode, showLayers, showCatalog, showInspector,
  onToggleLayers, onOpenMobileLayers, onToggleCatalog, onToggleInspector,
  onOpenMobileCatalog, onOpenMobileInspector,
  onSaveDraft, onOpen3d, onImport, onOpenSession, onClearAll, onExport,
}: PlannerToolbarProps) {
  const catalogLabel = currentStep === "room" ? "Room Builder" : "Catalog";

  const tools: { id: PlannerDrawingTool; label: string; icon: ReactNode }[] = [
    { id: "select", label: "Select (V)", icon: <MousePointer2 className="h-3.5 w-3.5" /> },
    { id: "hand",   label: "Pan (H)",   icon: <Hand className="h-3.5 w-3.5" /> },
    { id: "draw",   label: "Draw (D)",  icon: <PenTool className="h-3.5 w-3.5" /> },
    { id: "line",   label: "Line (L)",  icon: <Slash className="h-3.5 w-3.5" /> },
    { id: "geo",    label: "Rect (R)",  icon: <Square className="h-3.5 w-3.5" /> },
    { id: "arrow",  label: "Arrow (A)", icon: <ArrowUpRight className="h-3.5 w-3.5" /> },
    { id: "text",   label: "Text (T)",  icon: <Type className="h-3.5 w-3.5" /> },
    { id: "eraser", label: "Erase (E)", icon: <Eraser className="h-3.5 w-3.5" /> },
  ];

  return (
    <div
      ref={containerRef}
      style={{ fontFamily: "var(--font-helvetica-neue, 'Helvetica Neue', Helvetica, Arial, sans-serif)" }}
      className="pointer-events-none absolute top-0 left-0 right-0 z-[80] w-full select-none font-sans"
    >
      {/* ── TOP BAR: Brand / Steps / Session ─────────────────────────────── */}
      <div
        className="pointer-events-auto flex h-11 items-center gap-2 border-b border-[color:var(--planner-border-soft)] bg-panel/98 px-3 shadow-sm backdrop-blur-xl"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Brand */}
        <div className="flex shrink-0 items-center gap-2 pr-2">
          <span className="border border-[color:var(--planner-accent-soft)] bg-[color:var(--planner-accent-soft)]/25 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[color:var(--planner-accent-strong)]">
            CAD
          </span>
          <div className="hidden sm:block min-w-0">
            <p className="truncate text-[14px] font-semibold leading-tight text-[color:var(--planner-text-strong)]" title={planName}>
              {planName}
            </p>
            <p className="text-[10px] leading-tight text-[color:var(--planner-text-subtle)]">
              {sessionStateLabel}
            </p>
          </div>
        </div>

        {SEP}

        {/* Step bar — center */}
        <div className="flex flex-1 items-center">
          <StepBar current={currentStep} onChange={onStepChange} disabledSteps={disabledSteps} compact={isMobileMode} dense={!isMobileMode} />
        </div>

        {/* Session actions — right */}
        <div className="flex shrink-0 items-center gap-1 pl-1">
          <span className="hidden items-center border border-[color:var(--planner-border-soft)] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-[color:var(--planner-primary)] lg:flex">
            {isSessionBusy && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
            {sessionModeLabel}
          </span>
          {onOpen3d ? <Btn label="3D" icon={<ArrowUpRight className="h-3.5 w-3.5" />} onClick={onOpen3d} disabled={isSessionBusy} variant="ghost" /> : null}
          <Btn label={isMobileMode ? "Plans" : "Plan Sessions"} icon={isSessionBusy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FolderOpen className="h-3.5 w-3.5" />} onClick={onOpenSession} disabled={isSessionBusy} variant="primary" />
          <Btn label={isMobileMode ? "Save" : "Save Draft"} icon={<Save className="h-3.5 w-3.5" />} onClick={onSaveDraft} disabled={isSessionBusy} variant="accent" />
          {!isMobileMode && <Btn label="Import" icon={<Import className="h-3.5 w-3.5" />} onClick={onImport} disabled={isSessionBusy} variant="ghost" />}
        </div>
      </div>

      {/* ── TOOL STRIP ───────────────────────────────────────────────────── */}
      <div
        className="pointer-events-auto flex h-9 items-center gap-0 border-b border-[color:var(--planner-border-soft)] bg-panel/96 px-2 backdrop-blur-xl"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawing tools */}
        {tools.map((t) => (
          <ToolBtn key={t.id} label={t.label} active={activeDrawingTool === t.id} onClick={() => onSelectDrawingTool(t.id)}>
            {t.icon}
          </ToolBtn>
        ))}

        {SEP}

        <ToolBtn label="Undo (Ctrl+Z)" disabled={!canUndo} onClick={onUndo}><Undo2 className="h-3.5 w-3.5" /></ToolBtn>
        <ToolBtn label="Redo (Ctrl+Y)" disabled={!canRedo} onClick={onRedo}><Redo2 className="h-3.5 w-3.5" /></ToolBtn>

        {SEP}

        <ToggleBtn label="Snap" active={isSnapMode} onClick={onToggleSnap}>
          <Magnet className="h-3.5 w-3.5" /><span>Snap</span>
        </ToggleBtn>
        <ToggleBtn label="Grid" active={isGridVisible} onClick={onToggleGrid}>
          <Grid3X3 className="h-3.5 w-3.5" /><span>Grid</span>
        </ToggleBtn>

        {SEP}

        {/* Zoom */}
        <div className="flex h-7 items-center border border-[color:var(--planner-border-soft)]">
          <button type="button" onClick={onZoomOut} aria-label="Zoom out" className="flex h-full w-7 items-center justify-center text-[13px] font-medium text-[color:var(--planner-text-body)] hover:bg-[color:var(--planner-primary-soft)] hover:text-[color:var(--planner-primary)] transition-colors">−</button>
          <span className="w-[3.2rem] text-center text-[12px] font-semibold text-[color:var(--planner-text-strong)]">{zoomPercent}%</span>
          <button type="button" onClick={onZoomIn}  aria-label="Zoom in"  className="flex h-full w-7 items-center justify-center text-[13px] font-medium text-[color:var(--planner-text-body)] hover:bg-[color:var(--planner-primary-soft)] hover:text-[color:var(--planner-primary)] transition-colors">+</button>
        </div>
        <ToolBtn label="Fit drawing" onClick={onFitToDrawing}><Maximize2 className="h-3.5 w-3.5" /></ToolBtn>

        {SEP}

        {/* Panel toggles */}
        {isMobileMode ? (
          <>
            <ToolBtn label={`Open ${catalogLabel}`} onClick={onOpenMobileCatalog}><Boxes className="h-3.5 w-3.5" /></ToolBtn>
            <ToolBtn label="Open Layers" onClick={onOpenMobileLayers}><Layers className="h-3.5 w-3.5" /></ToolBtn>
            <ToolBtn label="Open Inspector" onClick={onOpenMobileInspector}><Settings2 className="h-3.5 w-3.5" /></ToolBtn>
          </>
        ) : (
          <>
            <PanelBtn label={`Toggle ${catalogLabel}`} active={showCatalog} onClick={onToggleCatalog}><Boxes className="h-3.5 w-3.5" /></PanelBtn>
            <PanelBtn label="Toggle Layers" active={showLayers} onClick={onToggleLayers}><Layers className="h-3.5 w-3.5" /></PanelBtn>
            <PanelBtn label="Toggle Inspector" active={showInspector} onClick={onToggleInspector}><Settings2 className="h-3.5 w-3.5" /></PanelBtn>
          </>
        )}

        {/* Spacer — compact */}
        <div className="w-2" />

        {SEP}

        <ToolBtn label="Fit to selection"   disabled={!hasSelection} onClick={onFitToSelection}><Maximize2 className="h-3.5 w-3.5" /></ToolBtn>
        <ToolBtn label="Deselect all"       disabled={!hasSelection} onClick={onDeselectSelection}><X className="h-3.5 w-3.5" /></ToolBtn>
        <ToolBtn label="Duplicate selection" disabled={!hasSelection} onClick={onDuplicateSelection}><CopyPlus className="h-3.5 w-3.5" /></ToolBtn>

        {SEP}

        <Btn label="Delete" icon={<Trash2 className="h-3.5 w-3.5" />} onClick={onDeleteSelection} disabled={!hasSelection} variant="danger" />
        <Btn label="Clear"  icon={<XCircle className="h-3.5 w-3.5" />} onClick={onClearAll} variant="danger" />

        {SEP}

        <Btn label="Export" icon={<Download className="h-3.5 w-3.5" />} onClick={onExport} />
      </div>
    </div>
  );
}
