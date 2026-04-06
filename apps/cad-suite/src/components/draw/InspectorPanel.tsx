"use client";

import React from "react";
import { Tag, Settings2, Box, FileText, Magnet, X, MousePointer2, Pin, PinOff } from "lucide-react";
import type { BoqItem, PlannerStep } from "./types";

interface InspectorPanelProps {
  boqItems: BoqItem[];
  totalBoq: number;
  currentStep: PlannerStep;
  canContinueFromRoom: boolean;
  roomMetrics: string;
  selectedMetrics: string | null;
  unitSystem: "mm" | "ft-in";
  onUnitSystemChange: (unit: "mm" | "ft-in") => void;
  isSnapMode: boolean;
  onToggleSnap: () => void;
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
  unitSystem,
  onUnitSystemChange,
  isSnapMode,
  onToggleSnap,
  onGenerateQuote,
  onClose,
  pinned,
  onTogglePin,
  showPinToggle = true,
}: InspectorPanelProps) {
  const [tab, setTab] = React.useState<"items" | "settings">("items");
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

  return (
    <div className="flex h-full flex-col bg-transparent">
      <div data-panel-drag-handle="true" className="flex items-center justify-between border-b border-theme-soft px-4 py-2.5">
        <span className="text-[0.74rem] font-semibold uppercase tracking-[0.16em] text-slate-500">Inspector</span>
        <div className="flex items-center gap-1">
          {showPinToggle ? (
            <button
              onClick={onTogglePin}
              aria-label={pinned ? "Float panel" : "Dock panel"}
              className={`p-1.5 rounded-md border transition-all ${
                pinned
                  ? "border-blue-200 bg-blue-50 text-blue-600"
                  : "border-theme-soft text-inverse-muted hover:bg-slate-50"
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
            tab === "items" ? "border-b-2 border-blue-600 text-blue-700" : "text-subtle hover:text-slate-600"
          }`}
        >
          <Tag className="h-3.5 w-3.5" /> Items ({boqItems.length})
        </button>
        <button
          type="button"
          onClick={() => setTab("settings")}
          className={`flex flex-1 items-center justify-center gap-1.5 py-2.5 text-[0.72rem] font-semibold uppercase tracking-[0.14em] transition-all ${
            tab === "settings" ? "border-b-2 border-blue-600 text-blue-700" : "text-subtle hover:text-slate-600"
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
                  <p className="text-[0.86rem] font-semibold text-slate-700">No items placed yet</p>
                  <p className="mt-1 text-[0.8rem] leading-5 text-slate-500">{emptyStateBody}</p>
                </div>
              ) : (
                boqItems.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 rounded-[1.5rem] border border-theme-soft bg-white/90 px-4 py-3.5 shadow-[0_18px_42px_-36px_var(--overlay-inverse-35)] transition-all hover:border-[color:var(--border-hover)] hover:bg-white">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-500">
                      <Box className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[1.02rem] font-semibold leading-[1.15] tracking-[-0.02em] text-slate-900">{item.name}</p>
                      <p className="mt-1 text-[0.78rem] font-medium uppercase tracking-[0.08em] text-slate-500">{item.category}</p>
                      {item.dimensions && (
                        <p className="mt-1.5 break-words font-mono text-[0.84rem] leading-[1.5] tracking-[0.02em] text-slate-600">
                          {item.dimensions}
                        </p>
                      )}
                    </div>
                    {item.price > 0 && (
                      <span className="pt-0.5 text-[0.92rem] font-semibold tracking-[-0.01em] text-slate-900 whitespace-nowrap">
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
                  <span className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-slate-500">Total</span>
                  <span className="text-lg font-bold tracking-[-0.02em] text-blue-700">INR {totalBoq.toLocaleString()}</span>
                </div>
              )}
              <button onClick={onGenerateQuote} disabled={primaryButtonDisabled}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 text-[0.84rem] font-semibold text-white shadow-md shadow-blue-500/20 transition-all hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none">
                <FileText className="h-4 w-4" /> {quoteButtonLabel}
              </button>
            </div>
          </div>
        )}

        {tab === "settings" && (
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 scheme-section-soft rounded-xl border border-theme-soft">
              <div className="flex items-center gap-2">
                <Magnet className="h-3.5 w-3.5 text-violet-600" />
                <span className="text-[0.86rem] font-semibold text-slate-900">Grid Snapping</span>
              </div>
              <button onClick={onToggleSnap}
                className={`relative h-6 w-11 rounded-full transition-all duration-200 ${isSnapMode ? "bg-violet-600" : "bg-slate-300"}`}>
                <div className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-all duration-200 ${isSnapMode ? "left-6" : "left-1"}`} />
              </button>
            </div>
            <div className="flex justify-between items-center p-3 scheme-section-soft rounded-xl border border-theme-soft">
              <span className="text-[0.86rem] font-semibold text-slate-900">Unit System</span>
              <div className="flex items-center gap-1 rounded-full border border-theme-soft bg-white p-1">
                <button
                  type="button"
                  onClick={() => onUnitSystemChange("mm")}
                  className={`rounded-full px-2.5 py-1 text-[0.72rem] font-semibold transition-all ${
                    unitSystem === "mm" ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-100"
                  }`}
                >
                  mm
                </button>
                <button
                  type="button"
                  onClick={() => onUnitSystemChange("ft-in")}
                  className={`rounded-full px-2.5 py-1 text-[0.72rem] font-semibold transition-all ${
                    unitSystem === "ft-in" ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-100"
                  }`}
                >
                  ft/in
                </button>
              </div>
            </div>
            <div className="p-3 scheme-section-soft rounded-xl border border-theme-soft">
              <h4 className="mb-2 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-slate-500">Room Shell</h4>
              <p className="font-mono text-[0.92rem] font-semibold tracking-[0.03em] text-slate-900">{roomMetrics}</p>
            </div>
            <div className="p-3 scheme-section-soft rounded-xl border border-theme-soft">
              <h4 className="mb-2 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-slate-500">Selection Metrics</h4>
              <p className="font-mono text-[0.92rem] font-semibold tracking-[0.03em] text-slate-900">
                {selectedMetrics ?? "Select a wall or item to inspect exact size."}
              </p>
            </div>
            <div className="mt-4 p-3 scheme-section-soft rounded-xl border border-theme-soft">
              <h4 className="mb-2 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-slate-500">Shortcuts</h4>
              <div className="space-y-1.5 text-[0.78rem] text-slate-600">
                {[["Select", "V"], ["Draw", "D"], ["Eraser", "E"], ["Rectangle", "R"], ["Undo", "Ctrl+Z"]].map(([name, key]) => (
                  <div key={name} className="flex justify-between">
                    <span>{name}</span>
                    <kbd className="rounded border border-theme-soft bg-white px-1.5 py-0.5 font-mono text-[0.72rem]">{key}</kbd>
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

