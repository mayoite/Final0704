"use client";

import React, { useState } from "react";
import { Search, Box, DoorOpen, Package, PenTool, ChevronDown, ChevronRight, Eye, EyeOff, X } from "lucide-react";
import type { CatalogProduct } from "./types";
import type { Editor } from "tldraw";

interface CatalogPanelProps {
  products: CatalogProduct[];
  editor: Editor | null;
  onDropFurniture: (prod: CatalogProduct | { name: string; category: string }) => void;
  onClose: () => void;
  pinned: boolean;
  onTogglePin: () => void;
}

export function CatalogPanel({ products, editor, onDropFurniture, onClose, pinned, onTogglePin }: CatalogPanelProps) {
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ catalog: true, structural: false, storage: false });

  const toggle = (k: string) => setExpanded((p) => ({ ...p, [k]: !p[k] }));

  const filtered = products.filter((p) => p.name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="h-full flex flex-col bg-transparent">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-theme-soft">
        <span className="typ-caption font-bold text-subtle uppercase tracking-widest">Catalog</span>
        <div className="flex items-center gap-1">
          <button onClick={onTogglePin} className={`p-1 rounded ${pinned ? "text-blue-500" : "text-inverse-muted hover-text-muted"}`} title={pinned ? "Unpin" : "Pin"}>
            {pinned ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
          </button>
          <button onClick={onClose} className="p-1 rounded text-inverse-muted hover-text-muted">
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="p-3 border-b border-theme-soft">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-subtle" />
          <input
            type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search catalog..."
            className="w-full scheme-section-soft border border-theme-soft rounded-lg py-2 pl-8 pr-3 text-xs font-medium placeholder:text-slate-400 focus:ring-2 focus:ring-blue-400/40 focus:bg-white focus:border-blue-300 outline-none transition-all"
          />
        </div>
      </div>

      {/* Sections */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {/* Product Catalog */}
        <Section title="Product Catalog" icon={<Box className="w-3.5 h-3.5" />} count={filtered.length} expanded={expanded.catalog} onToggle={() => toggle("catalog")}>
          <div className="grid grid-cols-2 gap-2 pt-2">
            {filtered.slice(0, 20).map((prod, idx) => (
              <button key={idx} onClick={() => onDropFurniture(prod)}
                className="group relative flex flex-col items-center p-2 scheme-section-soft border border-theme-soft rounded-xl hover-border-primary hover:bg-blue-50/50 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 outline-none">
                <div className="w-full h-12 rounded-lg bg-white flex items-center justify-center mb-1 overflow-hidden">
                  {(prod.flagship_image || prod.images?.[0]) ? (
                    <img src={prod.flagship_image || prod.images?.[0]} alt={prod.name} className="max-h-full max-w-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-300" />
                  ) : (
                    <Box className="w-5 h-5 text-inverse-muted" />
                  )}
                </div>
                <span className="typ-caption font-semibold text-strong leading-tight text-center truncate w-full">{prod.name?.slice(0, 16)}</span>
              </button>
            ))}
          </div>
        </Section>

        {/* Structural */}
        <Section title="Structural" icon={<DoorOpen className="w-3.5 h-3.5" />} expanded={expanded.structural} onToggle={() => toggle("structural")}>
          <div className="grid grid-cols-1 gap-2 pt-2">
            <button onClick={() => editor?.setCurrentTool("draw")} className="flex items-center gap-2 p-2.5 scheme-section-soft border border-theme-soft rounded-lg hover-border-subtle hover:shadow-sm text-strong transition-all text-xs font-medium">
              <PenTool className="w-3.5 h-3.5 text-amber-600" /> Freehand Wall Mode
            </button>
            <button onClick={() => editor?.setCurrentTool("line")} className="flex items-center gap-2 p-2.5 scheme-section-soft border border-theme-soft rounded-lg hover-border-subtle hover:shadow-sm text-strong transition-all text-xs font-medium">
              <span className="text-blue-600 text-sm font-bold">/</span> Draw Structural Line
            </button>
          </div>
        </Section>

        {/* Storage */}
        <Section title="Storage" icon={<Package className="w-3.5 h-3.5" />} expanded={expanded.storage} onToggle={() => toggle("storage")}>
          <div className="grid grid-cols-2 gap-2 pt-2">
            <button onClick={() => onDropFurniture({ name: "Mobile Pedestal", category: "Storage" })} className="flex flex-col items-center p-2 scheme-section-soft border border-theme-soft rounded-xl hover-border-primary hover:shadow-sm transition-all">
              <div className="w-7 h-9 scheme-section-soft border-2 border-muted rounded-sm mb-1" />
              <span className="typ-caption font-semibold text-strong">Pedestal</span>
            </button>
            <button onClick={() => onDropFurniture({ name: "High Cabinet", category: "Storage" })} className="flex flex-col items-center p-2 scheme-section-soft border border-theme-soft rounded-xl hover-border-primary hover:shadow-sm transition-all">
              <div className="w-9 h-11 scheme-section-soft border-2 border-muted rounded-sm mb-1" />
              <span className="typ-caption font-semibold text-strong">Cabinet</span>
            </button>
          </div>
        </Section>
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
