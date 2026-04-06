"use client";

import React, { useState } from "react";
import {
  Search,
  Box,
  DoorOpen,
  Package,
  PenTool,
  ChevronDown,
  ChevronRight,
  X,
  Pin,
  PinOff,
  Building2,
  Square,
} from "lucide-react";
import type { CatalogProduct, PlannerStep, RoomPreset } from "./types";
import type { Editor } from "tldraw";

interface CatalogPanelProps {
  products: CatalogProduct[];
  editor: Editor | null;
  currentStep: PlannerStep;
  canPlaceFurniture: boolean;
  roomPresets: RoomPreset[];
  onApplyRoomPreset: (preset: RoomPreset) => void;
  onActivateWallTool: () => void;
  onActivateBasicShapeTool: () => void;
  onDropFurniture: (prod: CatalogProduct | { name: string; category: string }) => void;
  onClose: () => void;
  pinned: boolean;
  onTogglePin: () => void;
  showPinToggle?: boolean;
}

export function CatalogPanel({
  products,
  editor,
  currentStep,
  canPlaceFurniture,
  roomPresets,
  onApplyRoomPreset,
  onActivateWallTool,
  onActivateBasicShapeTool,
  onDropFurniture,
  onClose,
  pinned,
  onTogglePin,
  showPinToggle = true,
}: CatalogPanelProps) {
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    presets: true,
    catalog: true,
    structural: true,
    storage: true,
  });
  const isRoomStep = currentStep === "room";

  const toggle = (k: string) => setExpanded((p) => ({ ...p, [k]: !p[k] }));

  const filtered = products.filter((p) => p.name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="h-full flex flex-col bg-transparent">
      {/* Header */}
      <div data-panel-drag-handle="true" className="flex items-center justify-between px-4 py-2.5 border-b border-theme-soft">
        <span className="typ-caption-lg font-semibold text-muted uppercase tracking-[0.14em]">
          {isRoomStep ? "Room Builder" : "Catalog"}
        </span>
        <div className="flex items-center gap-1">
          {showPinToggle && (
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
              {pinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
            </button>
          )}
          <button onClick={onClose} className="p-1 rounded text-inverse-muted hover-text-muted">
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Search */}
      {!isRoomStep ? (
        <div className="p-3 border-b border-theme-soft">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-subtle" />
            <input
              type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search catalog..."
              className="w-full scheme-section-soft border border-theme-soft rounded-lg py-2 pl-8 pr-3 typ-caption-lg font-medium placeholder:text-slate-400 focus:ring-2 focus:ring-blue-400/40 focus:bg-white focus:border-blue-300 outline-none transition-all"
            />
          </div>
        </div>
      ) : null}

      {/* Sections */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {isRoomStep ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[0.82rem] font-medium leading-5 text-amber-800">
            Step 1 is structural-only. Draw walls and basic room shapes first. Product placement unlocks in Step 2.
          </div>
        ) : null}

        {isRoomStep ? (
          <Section title="Room Presets" icon={<Building2 className="w-3.5 h-3.5" />} expanded={expanded.presets} onToggle={() => toggle("presets")}>
            <div className="grid grid-cols-1 gap-2 pt-2">
              {roomPresets.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => onApplyRoomPreset(preset)}
                  className="rounded-xl border border-theme-soft bg-white/90 px-3 py-3 text-left transition-all hover:border-blue-300 hover:bg-blue-50/60 hover:shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="typ-caption-lg font-semibold text-strong">{preset.name}</p>
                      <p className="mt-1 typ-caption text-subtle">{preset.summary}</p>
                    </div>
                    <div className="rounded-lg border border-theme-soft bg-panel px-2 py-1 typ-caption font-semibold text-subtle">
                      {preset.widthMm} x {preset.heightMm}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </Section>
        ) : (
          <Section title="Product Catalog" icon={<Box className="w-3.5 h-3.5" />} count={filtered.length} expanded={expanded.catalog} onToggle={() => toggle("catalog")}>
            <div className="grid grid-cols-2 gap-2 pt-2">
              {filtered.slice(0, 20).map((prod, idx) => (
                <button
                  key={idx}
                  type="button"
                  disabled={!canPlaceFurniture}
                  onClick={() => onDropFurniture(prod)}
                  className={`group relative flex flex-col items-center rounded-xl border p-2 outline-none transition-all duration-200 ${
                    canPlaceFurniture
                      ? "scheme-section-soft border-theme-soft hover-border-primary hover:bg-blue-50/50 hover:shadow-md hover:-translate-y-0.5"
                      : "cursor-not-allowed border-theme-soft bg-slate-50 opacity-45"
                  }`}
                  title={canPlaceFurniture ? prod.name : "Complete the room shell first"}
                >
                  <div className="w-full h-12 rounded-lg bg-white flex items-center justify-center mb-1 overflow-hidden">
                    {(prod.flagship_image || prod.images?.[0]) ? (
                      // Catalog imagery can come from arbitrary asset origins, so the native element is intentional here.
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={prod.flagship_image || prod.images?.[0]} alt={prod.name} className="max-h-full max-w-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-300" />
                    ) : (
                      <Box className="w-5 h-5 text-inverse-muted" />
                    )}
                  </div>
                  <span className="typ-caption-lg font-semibold text-strong leading-snug text-center truncate w-full">{prod.name?.slice(0, 16)}</span>
                </button>
              ))}
            </div>
          </Section>
        )}

        {/* Structural */}
        <Section title="Structural" icon={<DoorOpen className="w-3.5 h-3.5" />} expanded={expanded.structural} onToggle={() => toggle("structural")}>
          <div className="grid grid-cols-1 gap-2 pt-2">
            <button onClick={onActivateWallTool} className="flex items-center gap-2 p-2.5 scheme-section-soft border border-theme-soft rounded-lg hover-border-subtle hover:shadow-sm text-strong transition-all typ-caption-lg font-medium">
              <PenTool className="w-3.5 h-3.5 text-amber-600" /> Multipoint Wall Chain
            </button>
            <button onClick={onActivateBasicShapeTool} className="flex items-center gap-2 p-2.5 scheme-section-soft border border-theme-soft rounded-lg hover-border-subtle hover:shadow-sm text-strong transition-all typ-caption-lg font-medium">
              <Square className="w-3.5 h-3.5 text-blue-600" /> Basic Room Shape
            </button>
            <button onClick={() => editor?.setCurrentTool("draw")} className="flex items-center gap-2 p-2.5 scheme-section-soft border border-theme-soft rounded-lg hover-border-subtle hover:shadow-sm text-strong transition-all typ-caption-lg font-medium">
              <span className="text-blue-600 text-sm font-bold">~</span> Freehand Trace
            </button>
          </div>
        </Section>

        {/* Storage */}
        {!isRoomStep ? (
          <Section title="Storage" icon={<Package className="w-3.5 h-3.5" />} expanded={expanded.storage} onToggle={() => toggle("storage")}>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                disabled={!canPlaceFurniture}
                onClick={() => onDropFurniture({ name: "Mobile Pedestal", category: "Storage" })}
                className={`flex flex-col items-center rounded-xl border p-2 transition-all ${
                  canPlaceFurniture
                    ? "scheme-section-soft border-theme-soft hover-border-primary hover:shadow-sm"
                    : "cursor-not-allowed border-theme-soft bg-slate-50 opacity-45"
                }`}
                title={canPlaceFurniture ? "Mobile Pedestal" : "Complete the room shell first"}
              >
                <div className="w-7 h-9 scheme-section-soft border-2 border-muted rounded-sm mb-1" />
                <span className="typ-caption font-semibold text-strong">Pedestal</span>
              </button>
              <button
                type="button"
                disabled={!canPlaceFurniture}
                onClick={() => onDropFurniture({ name: "High Cabinet", category: "Storage" })}
                className={`flex flex-col items-center rounded-xl border p-2 transition-all ${
                  canPlaceFurniture
                    ? "scheme-section-soft border-theme-soft hover-border-primary hover:shadow-sm"
                    : "cursor-not-allowed border-theme-soft bg-slate-50 opacity-45"
                }`}
                title={canPlaceFurniture ? "High Cabinet" : "Complete the room shell first"}
              >
                <div className="w-9 h-11 scheme-section-soft border-2 border-muted rounded-sm mb-1" />
                <span className="typ-caption font-semibold text-strong">Cabinet</span>
              </button>
            </div>
          </Section>
        ) : null}
      </div>
    </div>
  );
}

/* ── Collapsible Section ── */
function Section({ title, icon, count, expanded, onToggle, children }: {
  title: string; icon: React.ReactNode; count?: number; expanded: boolean; onToggle: () => void; children: React.ReactNode;
}) {
  return (
    <div>
      <button onClick={onToggle} className="w-full flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-slate-50 transition-all">
        <span className="text-subtle">{icon}</span>
        <span className="typ-caption-lg font-bold text-muted uppercase tracking-wider flex-1 text-left">{title}</span>
        {count !== undefined && <span className="typ-caption font-bold text-subtle scheme-section-soft px-1.5 py-0.5 rounded-full">{count}</span>}
        {expanded ? <ChevronDown className="w-3.5 h-3.5 text-subtle" /> : <ChevronRight className="w-3.5 h-3.5 text-subtle" />}
      </button>
      {expanded && <div className="px-1 pb-2">{children}</div>}
    </div>
  );
}
