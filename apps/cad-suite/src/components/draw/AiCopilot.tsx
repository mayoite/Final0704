"use client";

import React from "react";
import { AlertTriangle, Sparkles, Wand2, X } from "lucide-react";

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
    <div className="fixed bottom-6 left-1/2 z-50 w-full max-w-lg -translate-x-1/2 px-4">
      <div className="rounded-[1.45rem] border border-[color:rgba(255,255,255,0.18)] bg-[color:rgba(11,20,29,0.88)] px-4 py-3 shadow-theme-inverse backdrop-blur-xl">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-5 w-5 items-center justify-center rounded-lg bg-[linear-gradient(135deg,var(--planner-accent)_0%,var(--planner-primary)_100%)]">
              <Sparkles className="h-2.5 w-2.5 text-inverse" />
            </div>
            <span className="typ-caption-lg font-semibold uppercase tracking-[0.14em] text-inverse">
              AI Spatial Copilot
            </span>
          </div>
          <button onClick={onClose} className="text-inverse-subtle transition-colors hover:text-inverse-body">
            <X className="h-3 w-3" />
          </button>
        </div>
        <div className="space-y-1">
          {suggestions.length > 0 ? (
            suggestions.slice(0, 2).map((suggestion, index) => (
              <div key={index} className="flex items-start gap-2 py-1">
                {suggestion.type === "warning" ? (
                  <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0 text-warning" />
                ) : null}
                {suggestion.type === "tip" ? (
                  <Sparkles className="mt-0.5 h-3 w-3 shrink-0 text-[color:var(--planner-accent-soft)]" />
                ) : null}
                {suggestion.type === "action" ? (
                  <Wand2 className="mt-0.5 h-3 w-3 shrink-0 text-[color:var(--planner-primary-soft)]" />
                ) : null}
                <p className="text-sm font-medium leading-relaxed text-inverse-body">{suggestion.text}</p>
              </div>
            ))
          ) : (
            <div className="flex items-start gap-2 py-1">
              <Sparkles className="mt-0.5 h-3 w-3 shrink-0 text-[color:var(--planner-accent-soft)]" />
              <p className="text-sm font-medium leading-relaxed text-inverse-body">
                Copilot is active. Suggestions will appear as you edit.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
