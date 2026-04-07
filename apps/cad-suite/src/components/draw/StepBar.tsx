"use client";

import React from "react";
import { Boxes, CheckCircle2, DoorOpen, Ruler } from "lucide-react";
import type { PlannerStep } from "./types";

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
}

export function StepBar({ current, onChange, disabledSteps = {} }: StepBarProps) {
  const idx = STEPS.findIndex((s) => s.key === current);

  return (
    <div className="flex flex-wrap items-center gap-1.5">
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
            className={`group flex min-w-[8.1rem] items-center gap-2.5 rounded-[1.1rem] border px-3 py-2.5 text-left transition-all duration-200 ${
              isActive
                ? "border-[color:var(--planner-primary)] bg-[color:var(--planner-primary)] text-white shadow-theme-panel"
                : isDone
                  ? "border-[color:var(--planner-accent-soft)] bg-[color:var(--planner-accent-soft)]/55 text-[color:var(--planner-primary)] hover:bg-[color:var(--planner-accent-soft)]/80"
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
                  ? "border-white/18 bg-white/12 text-white"
                  : isDone
                    ? "border-[color:var(--planner-accent-strong)]/18 bg-white/55 text-[color:var(--planner-primary)]"
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
                  isActive ? "text-white/72" : isDone ? "text-[color:var(--planner-accent-strong)]" : "text-muted"
                }`}
              >
                Stage {i + 1}
              </span>
              <span className="mt-0.5 block text-[0.82rem] font-semibold tracking-[0.01em]">
                {step.label}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
