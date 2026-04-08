"use client";

import { Boxes, CheckCircle2, DoorOpen, Ruler } from "lucide-react";

import type { PlannerStep } from "@/components/draw/types";
import { cn } from "@/lib/utils";

const STEPS: { key: PlannerStep; label: string; shortLabel: string; icon: typeof DoorOpen }[] = [
  { key: "room", label: "Room Shell", shortLabel: "Room", icon: DoorOpen },
  { key: "catalog", label: "Catalog", shortLabel: "Catalog", icon: Boxes },
  { key: "measure", label: "Measure", shortLabel: "Measure", icon: Ruler },
  { key: "review", label: "Review", shortLabel: "Review", icon: CheckCircle2 },
];

interface StepBarP0DV2Props {
  current: PlannerStep;
  onChange: (step: PlannerStep) => void;
  disabledSteps?: Partial<Record<PlannerStep, boolean>>;
  compact?: boolean;
  dense?: boolean;
}

export function StepBarP0DV2({
  current,
  onChange,
  disabledSteps = {},
  compact = false,
  dense = false,
}: StepBarP0DV2Props) {
  const currentIndex = STEPS.findIndex((step) => step.key === current);
  const compactLayout = compact || dense;

  return (
    <div
      className={cn(
        "flex items-center gap-1.5",
        compactLayout ? "overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" : "flex-wrap",
      )}
    >
      {STEPS.map((step, index) => {
        const Icon = step.icon;
        const isActive = step.key === current;
        const isDone = index < currentIndex;
        const isDisabled = Boolean(disabledSteps[step.key]);

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
            title={step.label}
            className={cn(
              "group flex shrink-0 items-center gap-2 rounded-full border px-2 py-1.5 text-left transition-all duration-200",
              compactLayout ? "min-w-[5.25rem]" : "min-w-[6.5rem]",
              isActive &&
                "border-[color:var(--planner-primary)] bg-[linear-gradient(135deg,var(--planner-primary)_0%,var(--planner-primary-hover)_100%)] text-white shadow-theme-panel",
              !isActive &&
                isDone &&
                "border-[color:var(--planner-accent-soft)] bg-[color:var(--planner-accent-soft)]/45 text-[color:var(--planner-accent-strong)] hover:border-[color:var(--planner-accent)] hover:bg-[color:var(--planner-accent-soft)]/65",
              !isActive &&
                !isDone &&
                !isDisabled &&
                "border-theme-soft bg-[color:var(--planner-panel-strong)] text-subtle hover:border-[color:var(--planner-border-hover)] hover:bg-[color:var(--planner-primary-soft)] hover:text-[color:var(--planner-primary)]",
              isDisabled && "cursor-not-allowed border-theme-soft bg-[color:var(--planner-surface-soft)] text-[color:var(--planner-text-subtle)]/55",
            )}
          >
            <span
              className={cn(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-[0.68rem] font-semibold transition-all",
                isActive && "border-white/18 bg-white/14 text-white",
                !isActive && isDone && "border-[color:var(--planner-accent-strong)]/20 bg-white/70 text-[color:var(--planner-accent-strong)]",
                !isActive && !isDone && !isDisabled && "border-theme-soft bg-[color:var(--planner-surface-soft)] text-[color:var(--planner-primary)]",
                isDisabled && "border-theme-soft bg-[color:var(--planner-surface-soft)] text-[color:var(--planner-text-subtle)]/55",
              )}
            >
              {isDone ? <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" /> : <Icon className="h-3.5 w-3.5" aria-hidden="true" />}
            </span>
            <span className="min-w-0">
              <span
                className={cn(
                  "block truncate text-[0.64rem] font-semibold uppercase tracking-[0.16em]",
                  compactLayout ? "hidden md:block" : "block",
                  isActive ? "text-white/72" : isDone ? "text-[color:var(--planner-accent-strong)]" : "text-muted",
                )}
              >
                0{index + 1}
              </span>
              <span className={cn("block truncate font-semibold tracking-[0.01em]", compactLayout ? "text-[0.66rem]" : "text-[0.7rem]")}>
                {compactLayout ? step.shortLabel : step.label}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
