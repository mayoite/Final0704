"use client";

import React from "react";
import { Boxes, CheckCircle2, DoorOpen, Ruler } from "lucide-react";
import type { PlannerStep } from "@/components/draw/types";

const STEPS: { key: PlannerStep; label: string; icon: React.ReactNode }[] = [
  { key: "room", label: "Room Shell", icon: <DoorOpen className="w-4 h-4" /> },
  { key: "catalog", label: "Catalog", icon: <Boxes className="w-4 h-4" /> },
  { key: "measure", label: "Measure", icon: <Ruler className="w-4 h-4" /> },
  { key: "review", label: "Review", icon: <CheckCircle2 className="w-4 h-4" /> },
];

interface StepBarProps {
  current: PlannerStep;
  onChange: (step: PlannerStep) => void;
  disabledSteps?: Partial<Record<PlannerStep, boolean>>;
  compact?: boolean;
}

export function StepBar({ current, onChange, disabledSteps = {}, compact = false }: StepBarProps) {
  const idx = STEPS.findIndex((s) => s.key === current);

  return (
    <div
      className={`flex items-center gap-1.5 ${compact ? "overflow-x-auto pb-1" : "flex-wrap"}`}
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
            className={`group flex shrink-0 items-center gap-2.5 rounded-[1.1rem] border text-left transition-all duration-200 ${
              compact ? "min-w-[6.6rem] px-2.5 py-2" : "min-w-[8.1rem] px-3 py-2.5"
            } ${
              isActive
                ? "border-[color:var(--planner-primary)] bg-[linear-gradient(135deg,var(--planner-primary)_0%,var(--planner-primary-hover)_100%)] text-white shadow-theme-panel"
                : isDone
                  ? "border-[color:var(--planner-accent-soft)] bg-[linear-gradient(180deg,rgba(232,223,212,0.72)_0%,rgba(255,255,255,0.92)_100%)] text-[color:var(--planner-primary)] hover:border-[color:var(--planner-accent)] hover:bg-[linear-gradient(180deg,rgba(232,223,212,0.92)_0%,rgba(255,255,255,1)_100%)]"
                  : isDisabled
                    ? "border-theme-soft scheme-section-soft text-[color:var(--planner-text-subtle)]/55 cursor-not-allowed"
                    : "border-theme-soft bg-[color:var(--planner-panel-strong)] text-subtle hover:border-[color:var(--planner-border-hover)] hover:bg-[color:var(--planner-panel)] hover:text-[color:var(--planner-primary)]"
            }`}
            aria-current={isActive ? "step" : undefined}
            aria-disabled={isDisabled}
          >
            <span
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-all ${
                isActive
                  ? "border-white/20 bg-white/14 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]"
                  : isDone
                    ? "border-[color:var(--planner-accent-strong)]/18 bg-white/70 text-[color:var(--planner-accent-strong)]"
                    : isDisabled
                      ? "border-theme-soft bg-[color:var(--planner-surface-soft)] text-[color:var(--planner-text-subtle)]/55"
                      : "border-theme-soft bg-[color:var(--planner-surface-soft)] text-[color:var(--planner-primary)]"
              }`}
            >
              {isDone ? <CheckCircle2 className="h-4 w-4" /> : step.icon}
            </span>
            <span className="min-w-0">
              <span
                className={`block typ-caption font-semibold uppercase tracking-[0.16em] ${
                  compact
                    ? "hidden"
                    : isActive
                      ? "text-white/72"
                      : isDone
                        ? "text-[color:var(--planner-accent-strong)]"
                        : "text-muted"
                }`}
              >
                Stage {i + 1}
              </span>
              <span className={`block font-semibold tracking-[0.01em] ${compact ? "text-[0.78rem]" : "mt-0.5 text-[0.82rem]"}`}>
                {step.label}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
