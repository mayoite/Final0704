"use client";

import React from "react";
import { Boxes, CheckCircle2, LayoutDashboard, Ruler } from "lucide-react";
import type { PlannerStep } from "@/components/draw/types";

const STEPS: { key: PlannerStep; label: string; icon: React.ReactNode }[] = [
  { key: "room", label: "Space", icon: <LayoutDashboard className="w-4 h-4" /> },
  { key: "catalog", label: "Catalog", icon: <Boxes className="w-4 h-4" /> },
  { key: "measure", label: "Measure", icon: <Ruler className="w-4 h-4" /> },
  { key: "review", label: "Review", icon: <CheckCircle2 className="w-4 h-4" /> },
];

interface StepBarProps {
  current: PlannerStep;
  onChange: (step: PlannerStep) => void;
  disabledSteps?: Partial<Record<PlannerStep, boolean>>;
  compact?: boolean;
  dense?: boolean;
}

export function StepBar({ current, onChange, disabledSteps = {}, compact = false, dense = false }: StepBarProps) {
  const idx = STEPS.findIndex((s) => s.key === current);
  const compactLayout = compact || dense;

  return (
    <div
      className={`flex items-center gap-1 font-sans ${compactLayout ? "overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" : "flex-wrap"}`}
    >
      {STEPS.map((step, i) => {
        const isActive = step.key === current;
        const isDone = i < idx;
        const isDisabled = !!disabledSteps[step.key];
        return (
          <button
            key={step.key}
            type="button"
            disabled={isDisabled}
            onClick={() => {
              if (!isDisabled) onChange(step.key);
            }}
            className={`group flex h-8 shrink-0 items-center gap-1.5 border text-left transition-all duration-200 ${
              compactLayout ? "min-w-[5.5rem] px-2.5" : "min-w-[6.5rem] px-3"
            } ${
              isActive
                ? "border-[color:var(--planner-primary)] bg-[color:var(--planner-primary)] text-white shadow-theme-panel"
                : isDone
                  ? "border-[color:var(--planner-accent-soft)] bg-[color:var(--planner-accent-soft)]/52 text-[color:var(--planner-accent-strong)] hover:border-[color:var(--planner-accent)] hover:bg-[color:var(--planner-accent-soft)]/72"
                  : isDisabled
                    ? "cursor-not-allowed border-theme-soft bg-[color:var(--planner-surface-soft)] text-[color:var(--planner-text-subtle)]/55"
                    : "border-theme-soft bg-[color:var(--planner-panel-strong)] text-subtle shadow-[inset_0_1px_0_rgba(255,255,255,0.68)] hover:border-[color:var(--planner-border-hover)] hover:bg-[color:var(--planner-panel)] hover:text-[color:var(--planner-primary)]"
            }`}
            aria-current={isActive ? "step" : undefined}
            aria-disabled={isDisabled}
            title={step.label}
          >
            <span
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-sm border transition-all ${
                isActive
                  ? "border-white/20 bg-white/14 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]"
                : isDone
                    ? "border-[color:var(--planner-accent-strong)]/18 bg-white/72 text-[color:var(--planner-accent-strong)]"
                    : isDisabled
                      ? "border-theme-soft bg-[color:var(--planner-surface-soft)] text-[color:var(--planner-text-subtle)]/55"
                      : "border-theme-soft bg-[color:var(--planner-surface-soft)] text-[color:var(--planner-primary)]"
              }`}
            >
              {isDone ? <CheckCircle2 className="h-4 w-4" /> : step.icon}
            </span>
            <span className={`truncate font-semibold tracking-[0.01em] text-[12px]`}>
              {step.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
