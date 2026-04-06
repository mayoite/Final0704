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
    <div className="flex items-center gap-1">
      {STEPS.map((step, i) => {
        const isActive = step.key === current;
        const isDone = i < idx;
        const isDisabled = !!disabledSteps[step.key];
        return (
          <React.Fragment key={step.key}>
            {i > 0 && (
              <div className={`w-8 h-px mx-1 transition-colors ${i <= idx ? "bg-blue-400" : "scheme-section-muted"}`} />
            )}
            <button
              type="button"
              disabled={isDisabled}
              onClick={() => {
                if (!isDisabled) onChange(step.key);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl typ-caption-lg font-semibold tracking-wide transition-all
                ${isActive
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                  : isDone
                    ? "bg-blue-50 text-blue-700 hover:bg-blue-100"
                    : isDisabled
                      ? "scheme-section-soft text-slate-300 cursor-not-allowed"
                      : "scheme-section-soft text-subtle hover:bg-slate-100 hover:text-slate-600"
                }`}
              aria-disabled={isDisabled}
            >
              {isDone ? <CheckCircle2 className="w-3.5 h-3.5" /> : step.icon}
              <span>{step.label}</span>
            </button>
          </React.Fragment>
        );
      })}
    </div>
  );
}
