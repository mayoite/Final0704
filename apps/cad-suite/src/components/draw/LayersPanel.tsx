"use client";

import { useMemo } from "react";
import {
  ArrowDownToLine,
  ArrowUpToLine,
  Lock,
  LockOpen,
  MousePointer2,
  Pin,
  PinOff,
  ScanSearch,
  X,
} from "lucide-react";
import { createShapeId, type Editor } from "tldraw";

import { getMetricLabelForShape, type MeasurementUnit } from "../../features/planner/lib/measurements";
import type { PlannerShapeMeta } from "./types";

const ROOM_BOUNDARY_SHAPE_ID = createShapeId("room-boundary");

interface LayersPanelProps {
  editor: Editor | null;
  unitSystem: MeasurementUnit;
  onClose: () => void;
  onFitSelection: () => void;
  pinned: boolean;
  onTogglePin: () => void;
  showPinToggle?: boolean;
}

function getShapeMeta(meta: unknown): PlannerShapeMeta {
  return meta && typeof meta === "object" ? (meta as PlannerShapeMeta) : {};
}

function formatShapeMetrics(
  editor: Editor,
  shapeId: ReturnType<typeof createShapeId>,
  shapeType: string,
  unitSystem: MeasurementUnit,
) {
  return (
    getMetricLabelForShape(editor, shapeId, unitSystem) ??
    (shapeType === "line" ? "Length unavailable" : "No geometry")
  );
}

export function LayersPanel({
  editor,
  unitSystem,
  onClose,
  onFitSelection,
  pinned,
  onTogglePin,
  showPinToggle = true,
}: LayersPanelProps) {
  const layerEntries = useMemo(() => {
    if (!editor) return [];

    return editor
      .getCurrentPageShapesSorted()
      .filter((shape) => {
        const meta = getShapeMeta(shape.meta);
        return shape.id !== ROOM_BOUNDARY_SHAPE_ID && !meta.isRoomDimension;
      })
      .map((shape) => {
        const meta = getShapeMeta(shape.meta);

        return {
        id: shape.id,
        type: shape.type,
        isLocked: !!shape.isLocked,
        isSelected: editor.getSelectedShapeIds().includes(shape.id),
        name:
          typeof meta.text === "string" && meta.text.trim().length > 0
            ? meta.text
            : shape.type === "image"
              ? "Placed Image"
              : shape.type === "geo"
                ? "Rectangle / Wall"
                : shape.type === "line"
                  ? "Structural Line"
                : shape.type === "draw"
                  ? "Freehand Wall"
                  : shape.type,
        metrics: formatShapeMetrics(editor, shape.id, shape.type, unitSystem),
      };
      })
      .reverse();
  }, [editor, unitSystem]);

  const actionableSelectedIds =
    editor
      ?.getSelectedShapeIds()
      .filter((shapeId) => {
        const meta = getShapeMeta(editor.getShape(shapeId)?.meta);
        return shapeId !== ROOM_BOUNDARY_SHAPE_ID && !meta.isRoomDimension;
      }) ?? [];
  const hasSelection = actionableSelectedIds.length > 0;
  const hasLockedSelection = actionableSelectedIds.some((shapeId) => editor?.getShape(shapeId)?.isLocked);

  const handleSelectShape = (shapeId: ReturnType<typeof createShapeId>) => {
    if (!editor) return;
    editor.select(shapeId);
  };

  const handleToggleShapeLock = (shapeId: ReturnType<typeof createShapeId>) => {
    if (!editor) return;
    editor.toggleLock([shapeId]);
  };

  const handleBringToFront = (shapeId: ReturnType<typeof createShapeId>) => {
    if (!editor) return;
    editor.bringToFront([shapeId]);
    editor.select(shapeId);
  };

  const handleSendToBack = (shapeId: ReturnType<typeof createShapeId>) => {
    if (!editor) return;
    editor.sendToBack([shapeId]);
    editor.select(shapeId);
  };

  const handleToggleSelectionLock = () => {
    if (!editor || actionableSelectedIds.length === 0) return;
    editor.toggleLock(actionableSelectedIds);
  };

  return (
    <div className="flex h-full flex-col bg-transparent">
      <div data-panel-drag-handle="true" className="flex items-center justify-between border-b border-theme-soft px-4 py-3">
        <span className="typ-caption-lg font-semibold uppercase tracking-[0.14em] text-muted">Layers</span>
        <div className="flex items-center gap-1">
          {showPinToggle ? (
            <button
              onClick={onTogglePin}
              aria-label={pinned ? "Float panel" : "Dock panel"}
              className={`rounded-md border p-1.5 transition-all ${
                pinned
                  ? "border-[color:var(--planner-primary-soft)] bg-[color:var(--planner-primary-soft)] text-[color:var(--planner-primary)]"
                  : "border-theme-soft text-inverse-muted hover:bg-[color:var(--planner-primary-soft)] hover:text-[color:var(--planner-primary)]"
              }`}
              title={pinned ? "Float panel" : "Dock panel"}
            >
              {pinned ? <PinOff className="h-3.5 w-3.5" /> : <Pin className="h-3.5 w-3.5" />}
            </button>
          ) : null}
          <button onClick={onClose} className="rounded p-1 text-inverse-muted hover-text-muted">
            <X className="h-3 w-3" />
          </button>
        </div>
      </div>

      <div className="border-b border-theme-soft p-3">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => editor?.selectAll()}
            className="flex items-center justify-center gap-2 rounded-lg border border-theme-soft bg-[color:var(--planner-panel-strong)] px-3 py-2 typ-caption-lg font-semibold text-strong transition-all hover:bg-[color:var(--planner-primary-soft)] hover:text-[color:var(--planner-primary)]"
          >
            <MousePointer2 className="h-3.5 w-3.5" /> Select All
          </button>
          <button
            type="button"
            onClick={onFitSelection}
            disabled={!hasSelection}
            className="flex items-center justify-center gap-2 rounded-lg border border-theme-soft bg-[color:var(--planner-panel-strong)] px-3 py-2 typ-caption-lg font-semibold text-strong transition-all enabled:hover:bg-[color:var(--planner-primary-soft)] enabled:hover:text-[color:var(--planner-primary)] disabled:cursor-not-allowed disabled:opacity-35"
          >
            <ScanSearch className="h-3.5 w-3.5" /> Fit Selection
          </button>
          <button
            type="button"
            onClick={handleToggleSelectionLock}
            disabled={!hasSelection}
            className="flex items-center justify-center gap-2 rounded-lg border border-theme-soft bg-[color:var(--planner-panel-strong)] px-3 py-2 typ-caption-lg font-semibold text-strong transition-all enabled:hover:bg-[color:var(--planner-primary-soft)] enabled:hover:text-[color:var(--planner-primary)] disabled:cursor-not-allowed disabled:opacity-35"
          >
            {hasLockedSelection ? <LockOpen className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
            {hasLockedSelection ? "Unlock" : "Lock"}
          </button>
          <div className="flex items-center justify-center rounded-lg border border-theme-soft px-3 py-2 typ-caption font-semibold uppercase tracking-wider text-subtle">
            {layerEntries.length} layers
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {layerEntries.length === 0 ? (
          <div className="rounded-xl border border-theme-soft bg-[color:var(--planner-panel-strong)] px-4 py-6 text-center typ-caption-lg text-subtle">
            No editable layers yet. Draw walls or place items to build the plan.
          </div>
        ) : (
          <div className="space-y-2">
            {layerEntries.map((layer) => (
              <div
                key={layer.id}
                className={`rounded-2xl border px-3 py-3 transition-all ${
                  layer.isSelected
                    ? "border-[color:var(--planner-primary-soft)] bg-[color:var(--planner-primary-soft)]/72 shadow-theme-panel"
                    : "border-theme-soft bg-[color:var(--planner-panel-strong)]"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => handleSelectShape(layer.id)}
                    className="min-w-0 flex-1 text-left"
                  >
                    <p className="truncate text-[0.98rem] font-semibold leading-[1.15] tracking-[-0.02em] text-strong">
                      {layer.name}
                    </p>
                    <p className="mt-1 text-[0.76rem] font-semibold uppercase tracking-[0.12em] text-muted">
                      {layer.type}
                    </p>
                    <p className="mt-1.5 text-[0.86rem] leading-[1.4] text-body">{layer.metrics}</p>
                  </button>

                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleToggleShapeLock(layer.id)}
                      className={`rounded-lg border p-1.5 transition-all ${
                        layer.isLocked
                          ? "border-[color:var(--planner-accent-soft)] bg-[color:var(--planner-accent-soft)] text-[color:var(--planner-accent-strong)]"
                          : "border-theme-soft text-subtle hover:bg-[color:var(--planner-primary-soft)] hover:text-[color:var(--planner-primary)]"
                      }`}
                      title={layer.isLocked ? "Unlock layer" : "Lock layer"}
                    >
                      {layer.isLocked ? <Lock className="h-3.5 w-3.5" /> : <LockOpen className="h-3.5 w-3.5" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleBringToFront(layer.id)}
                      className="rounded-lg border border-theme-soft p-1.5 text-subtle transition-all hover:bg-[color:var(--planner-primary-soft)] hover:text-[color:var(--planner-primary)]"
                      title="Bring to front"
                    >
                      <ArrowUpToLine className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSendToBack(layer.id)}
                      className="rounded-lg border border-theme-soft p-1.5 text-subtle transition-all hover:bg-[color:var(--planner-primary-soft)] hover:text-[color:var(--planner-primary)]"
                      title="Send to back"
                    >
                      <ArrowDownToLine className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
