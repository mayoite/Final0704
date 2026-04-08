"use client";

import React from "react";
import { Boxes, CheckCircle2, DoorOpen, Ruler } from "lucide-react";

import type { PlannerStep } from "@/components/draw/types";

const STEPS: { key: PlannerStep; label: string; shortLabel: string; icon: React.ReactNode }[] = [
  { key: "room", label: "Room Shell", shortLabel: "Shell", icon: <DoorOpen className="h-4 w-4" /> },
  { key: "catalog", label: "Catalog", shortLabel: "Catalog", icon: <Boxes className="h-4 w-4" /> },
  { key: "measure", label: "Measure", shortLabel: "Measure", icon: <Ruler className="h-4 w-4" /> },
  { key: "review", label: "Review", shortLabel: "Review", icon: <CheckCircle2 className="h-4 w-4" /> },
];

interface StepBarP0DV1Props {
  current: PlannerStep;
  onChange: (step: PlannerStep) => void;
  disabledSteps?: Partial<Record<PlannerStep, boolean>>;
  compact?: boolean;
  dense?: boolean;
}

export function StepBarP0DV1({
  current,
  onChange,
  disabledSteps = {},
  compact = false,
  dense = false,
}: StepBarP0DV1Props) {
  const currentIndex = STEPS.findIndex((step) => step.key === current);
  const compactRail = compact || dense;

  return (
    <div className="rounded-[1.35rem] border border-theme-soft bg-[color:var(--planner-panel-strong)] p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.72)]">
      <div className={compactRail ? "flex gap-1 overflow-x-auto pb-1" : "grid grid-cols-4 gap-1"}>
        {STEPS.map((step, index) => {
          const isActive = step.key === current;
          const isDone = index < currentIndex;
          const isDisabled = !!disabledSteps[step.key];

          return (
            <button
              key={step.key}
              type="button"
              disabled={isDisabled}
              onClick={() => {
                if (!isDisabled) {
                  onChange(step.key);
                }
              }}
              aria-current={isActive ? "step" : undefined}
              aria-disabled={isDisabled}
              className={`group flex min-w-[7.2rem] items-center gap-3 rounded-[1rem] border px-3 py-2 text-left transition-all ${
                compactRail ? "shrink-0" : "min-w-0"
              } ${
                isActive
                  ? "border-[color:var(--planner-primary)] bg-[linear-gradient(135deg,var(--planner-primary)_0%,var(--planner-primary-hover)_100%)] text-white shadow-theme-panel"
                  : isDone
                    ? "border-[color:var(--planner-accent-soft)] bg-[linear-gradient(180deg,rgba(232,223,212,0.56)_0%,rgba(255,255,255,0.94)_100%)] text-[color:var(--planner-primary)]"
                    : isDisabled
                      ? "cursor-not-allowed border-theme-soft scheme-section-muted text-[color:var(--planner-text-subtle)]/55"
                      : "border-theme-soft bg-panel text-subtle hover:border-[color:var(--planner-border-hover)] hover:bg-[color:var(--planner-primary-soft)]/72 hover:text-[color:var(--planner-primary)]"
              }`}
            >
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[0.9rem] border transition-all ${
                  isActive
                    ? "border-white/20 bg-white/12 text-white"
                    : isDone
                      ? "border-[color:var(--planner-accent-strong)]/20 bg-white/82 text-[color:var(--planner-accent-strong)]"
                      : isDisabled
                        ? "border-theme-soft bg-[color:var(--planner-surface-soft)] text-[color:var(--planner-text-subtle)]/55"
                        : "border-theme-soft bg-[color:var(--planner-surface-soft)] text-[color:var(--planner-primary)]"
                }`}
              >
                {isDone ? <CheckCircle2 className="h-4 w-4" /> : step.icon}
              </span>

              <span className="min-w-0 flex-1">
                <span
                  className={`inline-flex rounded-full px-1.5 py-0.5 text-[0.52rem] font-semibold uppercase tracking-[0.18em] ${
                    isActive
                      ? "bg-white/14 text-white/74"
                      : isDone
                        ? "bg-white/70 text-[color:var(--planner-accent-strong)]"
                        : "scheme-section-soft text-muted"
                  }`}
                >
                  {compactRail ? step.shortLabel : `Step ${index + 1}`}
                </span>
                <span className={`mt-1 block truncate font-semibold tracking-[0.01em] ${compactRail ? "text-[0.72rem]" : "text-[0.78rem]"}`}>
                  {step.label}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
