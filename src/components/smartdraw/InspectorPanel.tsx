"use client";

import React from "react";
import { Tag, Settings2, Box, FileText, Magnet, X, MousePointer2 } from "lucide-react";
import type { BoqItem } from "./types";

interface InspectorPanelProps {
  boqItems: BoqItem[];
  totalBoq: number;
  isSnapMode: boolean;
  onToggleSnap: () => void;
  onGenerateQuote: () => void;
  onClose: () => void;
  pinned: boolean;
  onTogglePin: () => void;
}

export function InspectorPanel({ boqItems, totalBoq, isSnapMode, onToggleSnap, onGenerateQuote, onClose, pinned, onTogglePin }: InspectorPanelProps) {
  const [tab, setTab] = React.useState<"items" | "settings">("items");

  return (
    <div className="h-full flex flex-col bg-transparent">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-theme-soft">
        <span className="typ-caption font-bold text-subtle uppercase tracking-widest">Inspector</span>
        <div className="flex items-center gap-1">
          <button
            onClick={onTogglePin}
            className={`px-2 py-1 rounded-md border text-[10px] font-bold uppercase tracking-wider transition-all ${
              pinned
                ? "border-blue-200 bg-blue-50 text-blue-600"
                : "border-theme-soft text-inverse-muted hover-text-muted"
            }`}
            title={pinned ? "Float panel" : "Dock panel"}
          >
            {pinned ? "Float" : "Dock"}
          </button>
          <button onClick={onClose} className="p-1 rounded text-inverse-muted hover-text-muted">
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-theme-soft">
        <button onClick={() => setTab("items")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 typ-caption-lg font-bold uppercase tracking-wider transition-all
            ${tab === "items" ? "text-blue-700 border-b-2 border-blue-600" : "text-subtle hover:text-slate-600"}`}>
          <Tag className="w-3.5 h-3.5" /> Items ({boqItems.length})
        </button>
        <button onClick={() => setTab("settings")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 typ-caption-lg font-bold uppercase tracking-wider transition-all
            ${tab === "settings" ? "text-blue-700 border-b-2 border-blue-600" : "text-subtle hover:text-slate-600"}`}>
          <Settings2 className="w-3.5 h-3.5" /> Settings
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {tab === "items" && (
          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto space-y-2">
              {boqItems.length === 0 ? (
                <div className="text-center py-10">
                  <MousePointer2 className="w-7 h-7 text-inverse-muted mx-auto mb-2" />
                  <p className="text-xs text-subtle font-medium">No items placed yet</p>
                  <p className="typ-caption text-subtle mt-1">Click products in the catalog</p>
                </div>
              ) : (
                boqItems.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 scheme-section-soft border border-theme-soft rounded-xl hover:bg-slate-100/60 transition-all">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center shrink-0">
                      <Box className="w-3 h-3 text-blue-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-strong truncate">{item.name}</p>
                      <p className="typ-caption text-subtle mt-0.5">{item.category}</p>
                      {item.dimensions && <p className="typ-caption text-muted mt-0.5 font-mono">{item.dimensions}</p>}
                    </div>
                    {item.price > 0 && <span className="text-xs font-bold text-strong whitespace-nowrap">₹{item.price.toLocaleString()}</span>}
                  </div>
                ))
              )}
            </div>

            <div className="mt-3 pt-3 border-t border-theme-soft space-y-3">
              {totalBoq > 0 && (
                <div className="flex justify-between items-baseline">
                  <span className="typ-caption-lg font-bold text-muted uppercase tracking-widest">Total</span>
                  <span className="text-lg font-extrabold text-blue-700">₹{totalBoq.toLocaleString()}</span>
                </div>
              )}
              <button onClick={onGenerateQuote} disabled={boqItems.length === 0}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white py-2.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/20 disabled:shadow-none">
                <FileText className="w-4 h-4" /> Generate Final Quote
              </button>
            </div>
          </div>
        )}

        {tab === "settings" && (
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 scheme-section-soft rounded-xl border border-theme-soft">
              <div className="flex items-center gap-2">
                <Magnet className="w-3.5 h-3.5 text-violet-600" />
                <span className="text-xs font-semibold text-strong">Grid Snapping</span>
              </div>
              <button onClick={onToggleSnap}
                className={`relative h-6 w-11 rounded-full transition-all duration-200 ${isSnapMode ? "bg-violet-600" : "bg-slate-300"}`}>
                <div className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-all duration-200 ${isSnapMode ? "left-6" : "left-1"}`} />
              </button>
            </div>
            <div className="flex justify-between items-center p-3 scheme-section-soft rounded-xl border border-theme-soft">
              <span className="text-xs font-semibold text-strong">Unit System</span>
              <span className="typ-caption-lg font-bold text-strong bg-white px-2 py-0.5 rounded-lg border border-theme-soft">mm</span>
            </div>
            <div className="mt-4 p-3 scheme-section-soft rounded-xl border border-theme-soft">
              <h4 className="typ-caption font-bold text-subtle uppercase tracking-wider mb-2">Shortcuts</h4>
              <div className="space-y-1.5 typ-caption text-muted">
                {[["Select", "V"], ["Draw", "D"], ["Eraser", "E"], ["Rectangle", "R"], ["Undo", "Ctrl+Z"]].map(([name, key]) => (
                  <div key={name} className="flex justify-between">
                    <span>{name}</span>
                    <kbd className="bg-white px-1.5 py-0.5 rounded border border-theme-soft font-mono typ-caption">{key}</kbd>
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
