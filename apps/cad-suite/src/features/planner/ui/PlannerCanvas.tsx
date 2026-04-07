"use client";

import { Tldraw, type TLComponents } from "tldraw";

import type { PlannerStep } from "@/components/draw/types";

import type { CanvasMeasurement } from "../lib/measurements";

interface PlannerCanvasProps {
  currentStep: PlannerStep;
  onMount: Parameters<typeof Tldraw>[0]["onMount"];
  isGridVisible: boolean;
  gridState: {
    originX: number;
    originY: number;
    zoom: number;
  };
  measurements: CanvasMeasurement[];
}

const CANVAS_COMPONENTS: TLComponents = {
  SharePanel: null,
};

export function PlannerCanvas({
  currentStep,
  onMount,
  isGridVisible,
  gridState,
  measurements,
}: PlannerCanvasProps) {
  const minorGrid = Math.max(14, Math.round(24 * gridState.zoom));
  const majorGrid = minorGrid * 5;

  return (
    <div className="absolute inset-0 z-0">
      <Tldraw
        onMount={onMount}
        hideUi={true}
        className="absolute inset-0"
        components={CANVAS_COMPONENTS}
      />

      {isGridVisible ? (
        <div
          className="pointer-events-none absolute inset-0 z-10"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(148, 163, 184, 0.18) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(148, 163, 184, 0.18) 1px, transparent 1px),
              linear-gradient(to right, rgba(71, 85, 105, 0.22) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(71, 85, 105, 0.22) 1px, transparent 1px)
            `,
            backgroundSize: `${minorGrid}px ${minorGrid}px, ${minorGrid}px ${minorGrid}px, ${majorGrid}px ${majorGrid}px, ${majorGrid}px ${majorGrid}px`,
            backgroundPosition: `${gridState.originX}px ${gridState.originY}px, ${gridState.originX}px ${gridState.originY}px, ${gridState.originX}px ${gridState.originY}px, ${gridState.originX}px ${gridState.originY}px`,
          }}
        />
      ) : null}

      <div className="pointer-events-none absolute top-28 left-1/2 z-20 -translate-x-1/2">
        <div className="surface-overlay-95 flex items-center gap-2 rounded-full border border-theme-soft px-5 py-2 text-strong shadow-theme-panel backdrop-blur-md">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success-soft opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-success-soft" />
          </span>
          <span className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[color:var(--planner-text-muted)]">
            {currentStep === "room" && "Room Shell - Walls and basic shapes"}
            {currentStep === "catalog" && "Catalog - Place modules"}
            {currentStep === "measure" && "Measure - Inspect shell and dimensions"}
            {currentStep === "review" && "Review - Verify and generate"}
          </span>
        </div>
      </div>

      {measurements.map((measurement) => (
        <div
          key={measurement.id}
          className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-1/2"
          style={{
            left: `${measurement.x}px`,
            top: `${measurement.y}px`,
            transform: `translate(-50%, -50%) rotate(${measurement.rotateDeg ?? 0}deg)`,
          }}
        >
          <div
            className={`min-w-[8.75rem] rounded-2xl border px-3 py-2 shadow-theme-panel backdrop-blur-md ${
              measurement.tone === "selection"
                ? "border-[color:var(--planner-accent-soft)] bg-[color:var(--planner-accent-soft)]/96 text-[color:var(--planner-accent-strong)]"
                : "border-[color:var(--planner-primary-soft)] bg-[color:var(--planner-panel-strong)] text-[color:var(--planner-text-strong)]"
            }`}
          >
            <div className="text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-[color:var(--planner-text-muted)]">
              {measurement.caption}
            </div>
            <div className="mt-1 font-mono text-[0.86rem] font-semibold tracking-[0.03em]">
              {measurement.value}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
