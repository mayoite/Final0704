"use client";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import {
  Copy,
  FileDown,
  Grid2X2,
  Grid3X3,
  Move,
  PanelsTopLeft,
  PenTool,
  RotateCcw,
  RotateCw,
  Save,
  Sparkles,
  SplitSquareVertical,
  StretchHorizontal,
  Trash2,
  ClipboardList,
} from "lucide-react";

interface PlannerToolbarProps {
  currentView: "2.5d" | "3d";
  activeTool: "draw" | "move";
  canUndo: boolean;
  canRedo: boolean;
  showGrid: boolean;
  itemCount: number;
  boqLineCount: number;
  roomWidthLabel?: string;
  roomDepthLabel?: string;
  selectionLabel: string;
  selectedItemPosition?: { x: number; z: number } | null;
  selectedItemRotationDeg?: number | null;
  onUndo: () => void;
  onRedo: () => void;
  onSave: () => void;
  onSwitchView: () => void;
  onDrawMode: () => void;
  onMoveMode: () => void;
  onToggleGrid: () => void;
  onExportPdf: () => void;
  onPrepareWallEditing: () => void;
  onRotateSelectedItem: (deltaDeg: number) => void;
  onDuplicateSelectedItem: () => void;
  onDeleteSelectedItem: () => void;
  isInspectorOpen: boolean;
  isClientBarOpen: boolean;
  isAiPanelOpen: boolean;
  onToggleInspector: () => void;
  onToggleClientBar: () => void;
  onToggleAiPanel: () => void;
}

function Sep() {
  return <div className="hidden h-4 w-px bg-[var(--planner-toolbar-border)] lg:block" />;
}

export function PlannerToolbar({
  currentView,
  activeTool,
  canUndo,
  canRedo,
  showGrid,
  itemCount,
  boqLineCount,
  roomWidthLabel,
  roomDepthLabel,
  selectionLabel,
  selectedItemPosition,
  selectedItemRotationDeg,
  onUndo,
  onRedo,
  onSave,
  onSwitchView,
  onDrawMode,
  onMoveMode,
  onToggleGrid,
  onExportPdf,
  onPrepareWallEditing,
  onRotateSelectedItem,
  onDuplicateSelectedItem,
  onDeleteSelectedItem,
  isInspectorOpen,
  isClientBarOpen,
  isAiPanelOpen,
  onToggleInspector,
  onToggleClientBar,
  onToggleAiPanel,
}: PlannerToolbarProps) {
  const itemPosition = selectedItemPosition ?? null;
  const itemRotation =
    typeof selectedItemRotationDeg === "number" ? selectedItemRotationDeg : null;
  const hasSelectedItem =
    Boolean(itemPosition) &&
    itemRotation !== null &&
    selectionLabel !== "No selection";
  const roundedX = itemPosition ? Math.round(itemPosition.x) : null;
  const roundedZ = itemPosition ? Math.round(itemPosition.z) : null;
  const chromeButtonClass =
    "h-8 w-8 rounded-[10px] p-0 text-[var(--text-inverse-muted)] transition-all hover:bg-white/8 hover:text-white";
  const activeChromeButtonClass =
    "h-8 w-8 rounded-[10px] bg-white/10 p-0 text-white transition-all hover:bg-white/12";
  const showSelectionCluster = selectionLabel && selectionLabel !== "No selection";

  return (
    <div
      data-planner-toolbar
      className="z-20 w-full px-0 py-1"
    >
      <div className="grid w-full grid-cols-[minmax(0,1fr)] gap-2 rounded-[16px] border border-[var(--planner-toolbar-border)] bg-[var(--planner-toolbar-surface)] px-2 py-1.5 shadow-theme-soft">
        <div className="flex min-w-0 items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-1.5 overflow-hidden">
            <div className="flex shrink-0 items-center gap-1 rounded-[12px] border border-white/8 bg-black/10 p-1">
          <Button
            size="sm"
            variant="ghost"
            className={cn(
              "h-8 min-w-[64px] gap-1.5 rounded-[9px] px-2.5 text-[11px] font-semibold tracking-[0.02em] transition-all",
              activeTool === "draw"
                ? "bg-[var(--planner-accent)] text-black hover:bg-[var(--planner-accent-hover)]"
                : "text-[var(--text-inverse-muted)] hover:bg-white/8 hover:text-white",
            )}
            onClick={onDrawMode}
            title="Draw Walls (D)"
            aria-label="Draw Mode"
          >
            <PenTool className="h-4 w-4" />
            Draw
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className={cn(
              "h-8 min-w-[64px] gap-1.5 rounded-[9px] px-2.5 text-[11px] font-semibold tracking-[0.02em] transition-all",
              activeTool === "move"
                ? "border border-white/14 bg-white/10 text-white hover:bg-white/12"
                : "text-[var(--text-inverse-muted)] hover:bg-white/8 hover:text-white",
            )}
            onClick={onMoveMode}
            title="Move Items (V)"
            aria-label="Move Mode"
          >
            <Move className="h-4 w-4" />
            Move
          </Button>
            </div>

            <Sep />

            <div className="flex shrink-0 items-center gap-0.5">
          <Button
            size="sm"
            variant="ghost"
            className={chromeButtonClass}
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className={chromeButtonClass}
            onClick={onRedo}
            disabled={!canRedo}
            title="Redo"
          >
            <RotateCw className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className={cn(chromeButtonClass, "hidden md:inline-flex")}
            onClick={onPrepareWallEditing}
            title="Resize Room"
            aria-label="Resize Room"
          >
            <StretchHorizontal className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className={cn(
              "h-8 min-w-[54px] gap-1 rounded-[10px] px-2 text-[11px] font-semibold tracking-[0.03em] text-white hover:bg-white/8",
            )}
            onClick={onSwitchView}
            title="Switch view"
          >
            <SplitSquareVertical className="h-4 w-4 text-[var(--planner-accent)]" />
            {currentView === "2.5d" ? "3D" : "2D"}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className={cn(
              showGrid ? activeChromeButtonClass : chromeButtonClass,
            )}
            onClick={onToggleGrid}
            title="Toggle Grid"
            aria-label="Toggle Grid"
          >
            {showGrid ? (
              <Grid3X3 className="h-4 w-4" />
            ) : (
              <Grid2X2 className="h-4 w-4" />
            )}
          </Button>
            </div>

            <Sep />

            <div className="flex shrink-0 items-center gap-0.5">
          <Button
            size="sm"
            variant="ghost"
            className={cn(
              isInspectorOpen ? activeChromeButtonClass : chromeButtonClass,
            )}
            onClick={onToggleInspector}
            title="Toggle inspector"
          >
            <PanelsTopLeft className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className={cn(
              isClientBarOpen ? activeChromeButtonClass : chromeButtonClass,
            )}
            onClick={onToggleClientBar}
            title="Toggle details"
          >
            <ClipboardList className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className={cn(
              isAiPanelOpen ? activeChromeButtonClass : chromeButtonClass,
            )}
            onClick={onToggleAiPanel}
            title="Toggle advisor"
          >
            <Sparkles className="h-4 w-4" />
          </Button>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            {!showSelectionCluster ? (
              <div className="hidden items-center gap-1 rounded-[12px] border border-white/8 bg-black/10 px-2 py-1 sm:flex">
                <div className="flex min-w-[38px] flex-col items-center justify-center rounded-[9px] px-1 py-1">
                  <span className="text-[12px] font-black leading-none text-white">
                    {itemCount}
                  </span>
                  <span className="text-[8px] font-semibold uppercase tracking-[0.14em] text-[var(--text-inverse-muted)]">
                    Placed
                  </span>
                </div>
                <div className="flex min-w-[38px] flex-col items-center justify-center rounded-[9px] px-1 py-1">
                  <span className="text-[12px] font-black leading-none text-[var(--planner-accent)]">
                    {boqLineCount}
                  </span>
                  <span className="text-[8px] font-semibold uppercase tracking-[0.14em] text-[var(--text-inverse-muted)]">
                    BOQ
                  </span>
                </div>
                {roomWidthLabel && roomDepthLabel ? (
                  <div className="hidden min-w-[98px] border-l border-[var(--planner-toolbar-border)] pl-2 md:flex md:flex-col">
                    <span className="text-[8px] font-semibold uppercase tracking-[0.14em] text-[var(--text-inverse-muted)]">
                      Room
                    </span>
                    <span className="text-[10px] font-semibold text-white">
                      {roomWidthLabel} x {roomDepthLabel}
                    </span>
                  </div>
                ) : null}
              </div>
            ) : null}
            <Button
              size="sm"
              variant="ghost"
              className={chromeButtonClass}
              onClick={onSave}
              title="Save"
            >
              <Save className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              className="h-8 rounded-[10px] bg-[var(--planner-accent)] px-3 text-[11px] font-semibold tracking-[0.04em] text-black shadow-[var(--planner-shadow-accent)] transition-all hover:bg-[var(--planner-accent-hover)]"
              onClick={onExportPdf}
            >
              <FileDown className="mr-1.5 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
        {showSelectionCluster ? (
          <div className="hidden items-center gap-1 rounded-[12px] border border-[var(--planner-accent-soft-border)] bg-[var(--planner-accent-soft-bg)] p-1 md:flex">
            <span className="max-w-[120px] truncate px-2 text-[10px] font-semibold tracking-[0.05em] text-white">
              {selectionLabel}
            </span>
            {hasSelectedItem ? (
              <>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 rounded-[9px] p-0 text-white hover:bg-white/10"
                  onClick={() => onRotateSelectedItem(-15)}
                  title="Rotate counter-clockwise"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 rounded-[9px] p-0 text-white hover:bg-white/10"
                  onClick={() => onRotateSelectedItem(15)}
                  title="Rotate clockwise"
                >
                  <RotateCw className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 rounded-[9px] p-0 text-white hover:bg-white/10"
                  onClick={onDuplicateSelectedItem}
                  title="Duplicate item"
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 rounded-[9px] border border-rose-500/20 bg-rose-500/10 p-0 text-rose-300 hover:bg-rose-500/20"
                  onClick={onDeleteSelectedItem}
                  title="Delete item"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <div className="hidden px-1.5 text-right lg:block">
                  <div className="text-[10px] font-semibold text-white/70">
                    {itemPosition ? `${roundedX} x ${roundedZ}` : "-"}
                  </div>
                  <div className="text-[10px] font-semibold text-[var(--planner-selection)]">
                    {itemRotation ?? 0} deg
                  </div>
                </div>
              </>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
