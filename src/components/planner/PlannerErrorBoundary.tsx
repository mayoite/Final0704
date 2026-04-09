"use client";

import type { ErrorInfo, ReactNode } from "react";
import { Component } from "react";

type PlannerErrorBoundaryProps = {
  children: ReactNode;
};

type PlannerErrorBoundaryState = {
  hasError: boolean;
};

export class PlannerErrorBoundary extends Component<
  PlannerErrorBoundaryProps,
  PlannerErrorBoundaryState
> {
  state: PlannerErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Planner route failed", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="min-h-dvh px-4 py-6"
          style={{
            background:
              "radial-gradient(circle at top, var(--surface-page) 0%, var(--surface-accent-wash) 52%, var(--color-ocean-boat-blue-100) 100%)",
          }}
        >
          <div className="mx-auto max-w-3xl rounded-[28px] border border-white/75 bg-white/80 p-8 text-[var(--text-heading)] shadow-[var(--shadow-float)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
              Workspace Planner
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight">
              Something went wrong loading the planner.
            </h1>
            <p className="mt-3 text-sm leading-6 text-[var(--text-muted)]">
              Reload the page to start again. If the issue persists, check the latest planner build and catalog artifacts.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
