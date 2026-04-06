"use client";

import React from "react";
import { Sparkles, Wand2, AlertTriangle, X } from "lucide-react";

export interface AiSuggestion {
  type: "tip" | "warning" | "action";
  text: string;
}

interface AiCopilotProps {
  suggestions: AiSuggestion[];
  onClose: () => void;
}

export function AiCopilot({ suggestions, onClose }: AiCopilotProps) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-lg w-full px-4">
      <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center">
              <Sparkles className="w-2.5 h-2.5 text-white" />
            </div>
            <span className="typ-caption-lg font-semibold text-white/90 uppercase tracking-[0.14em]">AI Spatial Copilot</span>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white/80 transition-colors">
            <X className="w-3 h-3" />
          </button>
        </div>
        <div className="space-y-1">
          {suggestions.length > 0 ? (
            suggestions.slice(0, 2).map((s, i) => (
              <div key={i} className="flex items-start gap-2 py-1">
                {s.type === "warning" && <AlertTriangle className="w-3 h-3 text-warning shrink-0 mt-0.5" />}
                {s.type === "tip" && <Sparkles className="w-3 h-3 text-brand shrink-0 mt-0.5" />}
                {s.type === "action" && <Wand2 className="w-3 h-3 text-brand shrink-0 mt-0.5" />}
                <p className="text-sm font-medium text-white/75 leading-relaxed">{s.text}</p>
              </div>
            ))
          ) : (
            <div className="flex items-start gap-2 py-1">
              <Sparkles className="w-3 h-3 text-brand shrink-0 mt-0.5" />
              <p className="text-sm font-medium text-white/75 leading-relaxed">Copilot is active. Suggestions will appear as you edit.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
