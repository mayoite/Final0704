"use client";

import { useEffect, useState } from "react";

import { BlueprintPlanner } from "@/components/planner/BlueprintPlanner";
import { PlannerErrorBoundary } from "@/components/planner/PlannerErrorBoundary";

const DESKTOP_BREAKPOINT = 1024;

export function PlannerViewportGate() {
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia(`(min-width: ${DESKTOP_BREAKPOINT}px)`);
    const syncViewport = () => setIsDesktop(mediaQuery.matches);

    syncViewport();
    mediaQuery.addEventListener("change", syncViewport);

    return () => {
      mediaQuery.removeEventListener("change", syncViewport);
    };
  }, []);

  if (isDesktop === null) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6 py-16">
        <div className="w-full max-w-md rounded-[28px] border border-white/10 bg-[var(--surface-inverse-soft)] p-8 text-center text-[var(--text-inverse)] shadow-[0_24px_60px_rgba(1,5,10,0.24)]">
          <p className="text-[11px] font-semibold tracking-[0.22em] text-[var(--text-inverse-subtle)] uppercase">
            Workspace Planner
          </p>
          <p className="mt-3 text-sm leading-6 text-[var(--text-inverse-body)]">
            Loading planner experience...
          </p>
        </div>
      </div>
    );
  }

  if (!isDesktop) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6 py-16">
        <div className="w-full max-w-md rounded-[28px] border border-white/10 bg-[var(--surface-inverse-soft)] p-8 text-center text-[var(--text-inverse)] shadow-[0_24px_60px_rgba(1,5,10,0.24)]">
          <p className="text-[11px] font-semibold tracking-[0.22em] text-[var(--text-inverse-subtle)] uppercase">
            Workspace Planner
          </p>
          <h1 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-[var(--text-inverse)]">
            This planner works best on a larger screen.
          </h1>
          <p className="mt-3 text-sm leading-6 text-[var(--text-inverse-body)]">
            Please use a desktop or laptop for the full planning experience.
          </p>
        </div>
      </div>
    );
  }

  return (
    <PlannerErrorBoundary>
      <BlueprintPlanner />
    </PlannerErrorBoundary>
  );
}
