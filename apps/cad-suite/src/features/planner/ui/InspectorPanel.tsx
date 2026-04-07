"use client";

import React from "react";
import { Tag, Settings2, Box, FileText, Magnet, X, MousePointer2, Pin, PinOff } from "lucide-react";
import type { BoqItem, PlannerStep } from "@/components/draw/types";
import type { PlannerSelectionDimensions } from "../lib/editorTools";

interface InspectorPanelProps {
  boqItems: BoqItem[];
  totalBoq: number;
  currentStep: PlannerStep;
  canContinueFromRoom: boolean;
  roomMetrics: string;
  selectedMetrics: string | null;
  selectionDimensions: PlannerSelectionDimensions | null;
  unitSystem: "mm" | "ft-in";
  onUnitSystemChange: (unit: "mm" | "ft-in") => void;
  isSnapMode: boolean;
  onToggleSnap: () => void;
  onUpdateSelectionDimensions: (next: { widthMm?: number; heightMm?: number | null }) => void;
  onGenerateQuote: () => void;
  onClose: () => void;
  pinned: boolean;
  onTogglePin: () => void;
  showPinToggle?: boolean;
}

export function InspectorPanel({
  boqItems,
  totalBoq,
  currentStep,
  canContinueFromRoom,
  roomMetrics,
  selectedMetrics,
  selectionDimensions,
  unitSystem,
  onUnitSystemChange,
  isSnapMode,
  onToggleSnap,
  onUpdateSelectionDimensions,
  onGenerateQuote,
  onClose,
  pinned,
  onTogglePin,
  showPinToggle = true,
}: InspectorPanelProps) {
  const [tab, setTab] = React.useState<"items" | "settings">("items");
  const [widthInput, setWidthInput] = React.useState("");
  const [heightInput, setHeightInput] = React.useState("");
  const isRoomStep = currentStep === "room";
  const isCatalogStep = currentStep === "catalog";
  const isMeasureStep = currentStep === "measure";
  const quoteButtonLabel = isRoomStep
    ? "Continue to Catalog"
    : isCatalogStep
      ? "Continue to Measure"
      : isMeasureStep
        ? "Continue to Review"
        : "Generate Final Quote";
  const primaryButtonDisabled = isRoomStep
    ? !canContinueFromRoom
    : isCatalogStep
      ? !canContinueFromRoom
      : boqItems.length === 0;
  const emptyStateBody = isRoomStep
    ? "Draw walls and basic shapes, then continue to catalog."
    : isCatalogStep
      ? "Click products in the catalog to build the layout."
      : isMeasureStep
        ? "Select walls or items to inspect measurements before review."
        : "Review the measured plan and generate the quote.";

  React.useEffect(() => {
    setWidthInput(selectionDimensions ? String(selectionDimensions.widthMm) : "");
    setHeightInput(
      selectionDimensions && typeof selectionDimensions.heightMm === "number"
        ? String(selectionDimensions.heightMm)
        : "",
    );
  }, [selectionDimensions]);

  return (
    <div className="flex h-full flex-col bg-transparent">
      <div data-panel-drag-handle="true" className="flex items-center justify-between border-b border-theme-soft px-4 py-3">
        <span className="text-[0.74rem] font-semibold uppercase tracking-[0.16em] text-muted">Inspector</span>
        <div className="flex items-center gap-1">
          {showPinToggle ? (
            <button
              onClick={onTogglePin}
              aria-label={pinned ? "Float panel" : "Dock panel"}
              className={`p-1.5 rounded-md border transition-all ${
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

      <div className="flex border-b border-theme-soft">
        <button
          type="button"
          onClick={() => setTab("items")}
          className={`flex flex-1 items-center justify-center gap-1.5 py-2.5 text-[0.72rem] font-semibold uppercase tracking-[0.14em] transition-all ${
            tab === "items" ? "border-b-2 border-[color:var(--planner-primary)] text-[color:var(--planner-primary)]" : "text-subtle hover:text-[color:var(--planner-primary)]"
          }`}
        >
          <Tag className="h-3.5 w-3.5" /> Items ({boqItems.length})
        </button>
        <button
          type="button"
          onClick={() => setTab("settings")}
          className={`flex flex-1 items-center justify-center gap-1.5 py-2.5 text-[0.72rem] font-semibold uppercase tracking-[0.14em] transition-all ${
            tab === "settings" ? "border-b-2 border-[color:var(--planner-primary)] text-[color:var(--planner-primary)]" : "text-subtle hover:text-[color:var(--planner-primary)]"
          }`}
        >
          <Settings2 className="h-3.5 w-3.5" /> Settings
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {tab === "items" && (
          <div className="flex h-full flex-col">
            <div className="flex-1 space-y-2 overflow-y-auto">
              {boqItems.length === 0 ? (
                <div className="py-10 text-center">
                  <MousePointer2 className="mx-auto mb-2 h-7 w-7 text-inverse-muted" />
                  <p className="text-[0.86rem] font-semibold text-strong">No items placed yet</p>
                  <p className="mt-1 text-[0.8rem] leading-5 text-muted">{emptyStateBody}</p>
                </div>
              ) : (
                boqItems.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 rounded-[1.5rem] border border-theme-soft bg-[color:var(--planner-panel-strong)] px-4 py-3.5 shadow-theme-panel transition-all hover:border-[color:var(--planner-border-hover)] hover:bg-[color:var(--planner-panel)]">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[color:var(--planner-primary-soft)] text-[color:var(--planner-primary)]">
                      <Box className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[1.02rem] font-semibold leading-[1.15] tracking-[-0.02em] text-strong">{item.name}</p>
                      <p className="mt-1 text-[0.78rem] font-medium uppercase tracking-[0.08em] text-muted">{item.category}</p>
                      {item.dimensions && (
                        <p className="mt-1.5 break-words font-mono text-[0.84rem] leading-[1.5] tracking-[0.02em] text-body">
                          {item.dimensions}
                        </p>
                      )}
                    </div>
                    {item.price > 0 && (
                      <span className="whitespace-nowrap pt-0.5 text-[0.92rem] font-semibold tracking-[-0.01em] text-strong">
                        INR {item.price.toLocaleString()}
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="mt-3 pt-3 border-t border-theme-soft space-y-3">
              {totalBoq > 0 && (
                <div className="flex justify-between items-baseline">
                  <span className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-muted">Total</span>
                  <span className="text-lg font-bold tracking-[-0.02em] text-[color:var(--planner-primary)]">INR {totalBoq.toLocaleString()}</span>
                </div>
              )}
              <button onClick={onGenerateQuote} disabled={primaryButtonDisabled}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[color:var(--planner-primary)] py-2.5 text-[0.84rem] font-semibold text-white shadow-theme-panel transition-all hover:bg-[color:var(--planner-primary-hover)] disabled:bg-[color:var(--planner-surface-muted)] disabled:text-[color:var(--planner-text-subtle)] disabled:shadow-none">
                <FileText className="h-4 w-4" /> {quoteButtonLabel}
              </button>
            </div>
          </div>
        )}

        {tab === "settings" && (
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 scheme-section-soft rounded-xl border border-theme-soft">
              <div className="flex items-center gap-2">
                <Magnet className="h-3.5 w-3.5 text-[color:var(--planner-accent-strong)]" />
                <span className="text-[0.86rem] font-semibold text-strong">Grid Snapping</span>
              </div>
              <button onClick={onToggleSnap}
                className={`relative h-6 w-11 rounded-full transition-all duration-200 ${isSnapMode ? "bg-[color:var(--planner-accent-strong)]" : "bg-[color:var(--planner-border-strong)]"}`}>
                <div className={`absolute top-1 h-4 w-4 rounded-full bg-[color:var(--planner-panel-strong)] shadow-sm transition-all duration-200 ${isSnapMode ? "left-6" : "left-1"}`} />
              </button>
            </div>
            <div className="flex justify-between items-center p-3 scheme-section-soft rounded-xl border border-theme-soft">
              <span className="text-[0.86rem] font-semibold text-strong">Unit System</span>
              <div className="flex items-center gap-1 rounded-full border border-theme-soft bg-[color:var(--planner-panel-strong)] p-1">
                <button
                  type="button"
                  onClick={() => onUnitSystemChange("mm")}
                  className={`rounded-full px-2.5 py-1 text-[0.72rem] font-semibold transition-all ${
                    unitSystem === "mm" ? "bg-[color:var(--planner-primary)] text-white" : "text-muted hover:bg-[color:var(--planner-primary-soft)] hover:text-[color:var(--planner-primary)]"
                  }`}
                >
                  mm
                </button>
                <button
                  type="button"
                  onClick={() => onUnitSystemChange("ft-in")}
                  className={`rounded-full px-2.5 py-1 text-[0.72rem] font-semibold transition-all ${
                    unitSystem === "ft-in" ? "bg-[color:var(--planner-primary)] text-white" : "text-muted hover:bg-[color:var(--planner-primary-soft)] hover:text-[color:var(--planner-primary)]"
                  }`}
                >
                  ft/in
                </button>
              </div>
            </div>
            <div className="p-3 scheme-section-soft rounded-xl border border-theme-soft">
              <h4 className="mb-2 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-muted">Room Shell</h4>
              <p className="font-mono text-[0.92rem] font-semibold tracking-[0.03em] text-strong">{roomMetrics}</p>
            </div>
            <div className="p-3 scheme-section-soft rounded-xl border border-theme-soft">
              <h4 className="mb-2 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-muted">Selection Metrics</h4>
              <p className="font-mono text-[0.92rem] font-semibold tracking-[0.03em] text-strong">
                {selectedMetrics ?? "Select a wall or item to inspect exact size."}
              </p>
            </div>
            <div className="p-3 scheme-section-soft rounded-xl border border-theme-soft">
              <h4 className="mb-2 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-muted">Inspector Edit</h4>
              {selectionDimensions ? (
                <div className="space-y-3">
                  <p className="typ-caption-lg text-body">{selectionDimensions.shapeName}</p>
                  <div className="grid grid-cols-2 gap-2">
                    <label className="typ-caption text-subtle">
                      {selectionDimensions.mode === "line" ? "Length mm" : "Width mm"}
                      <input
                        value={widthInput}
                        onChange={(event) => setWidthInput(event.target.value)}
                        className="mt-1 w-full rounded-lg border border-theme-soft bg-[color:var(--planner-panel-strong)] px-2.5 py-2 typ-caption-lg text-body outline-none transition focus:border-[color:var(--planner-primary)]"
                      />
                    </label>
                    <label className="typ-caption text-subtle">
                      {selectionDimensions.mode === "line" ? "Locked" : "Depth mm"}
                      <input
                        value={selectionDimensions.mode === "line" ? "n/a" : heightInput}
                        disabled={selectionDimensions.mode === "line"}
                        onChange={(event) => setHeightInput(event.target.value)}
                        className="mt-1 w-full rounded-lg border border-theme-soft bg-[color:var(--planner-panel-strong)] px-2.5 py-2 typ-caption-lg text-body outline-none transition focus:border-[color:var(--planner-primary)] disabled:opacity-50"
                      />
                    </label>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      onUpdateSelectionDimensions({
                        widthMm: Number.parseInt(widthInput || "0", 10) || undefined,
                        heightMm:
                          selectionDimensions.mode === "line"
                            ? null
                            : Number.parseInt(heightInput || "0", 10) || undefined,
                      })
                    }
                    className="w-full rounded-xl bg-[color:var(--planner-primary)] py-2.5 text-[0.84rem] font-semibold text-white shadow-theme-panel transition-all hover:bg-[color:var(--planner-primary-hover)]"
                  >
                    Apply Size
                  </button>
                </div>
              ) : (
                <p className="typ-caption-lg text-subtle">Select one wall or one item to edit dimensions.</p>
              )}
            </div>
            <div className="mt-4 p-3 scheme-section-soft rounded-xl border border-theme-soft">
              <h4 className="mb-2 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-muted">Shortcuts</h4>
              <div className="space-y-1.5 text-[0.78rem] text-body">
                {[["Select", "V"], ["Draw", "D"], ["Eraser", "E"], ["Rectangle", "R"], ["Undo", "Ctrl+Z"]].map(([name, key]) => (
                  <div key={name} className="flex justify-between">
                    <span>{name}</span>
                    <kbd className="rounded border border-theme-soft bg-[color:var(--planner-panel-strong)] px-1.5 py-0.5 font-mono text-[0.72rem]">{key}</kbd>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
