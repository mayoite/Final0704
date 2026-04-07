"use client";

import * as Dialog from "@radix-ui/react-dialog";
import {
  BadgeCheck,
  Cloud,
  Download,
  FolderOpen,
  Import,
  Loader2,
  Save,
  ShieldCheck,
  Trash2,
  Upload,
  X,
} from "lucide-react";

export interface PlannerSavedEntry {
  id: string;
  name: string;
  source: "cloud" | "local";
  updatedAtLabel?: string;
  itemCount?: number;
  detail?: string;
}

interface PlannerSessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  planName: string;
  onPlanNameChange: (value: string) => void;
  plans: PlannerSavedEntry[];
  isAuthenticated: boolean;
  isBusy?: boolean;
  statusMessage?: string | null;
  errorMessage?: string | null;
  canOpen3d?: boolean;
  onSaveCloud: () => void;
  onSaveDraft: () => void;
  onLoadPlan: (plan: PlannerSavedEntry) => void;
  onDeletePlan?: (plan: PlannerSavedEntry) => void;
  onImport: () => void;
  onExportJson?: () => void;
  onOpen3d?: () => void;
  onDismissError?: () => void;
}

export function PlannerSessionDialog({
  open,
  onOpenChange,
  planName,
  onPlanNameChange,
  plans,
  isAuthenticated,
  isBusy = false,
  statusMessage,
  errorMessage,
  canOpen3d = false,
  onSaveCloud,
  onSaveDraft,
  onLoadPlan,
  onDeletePlan,
  onImport,
  onExportJson,
  onOpen3d,
  onDismissError,
}: PlannerSessionDialogProps) {
  const primaryActionClass =
    "flex items-center justify-center gap-2 rounded-[1rem] px-4 py-3 typ-cta transition disabled:cursor-not-allowed disabled:opacity-60";
  const secondaryActionClass =
    "flex items-center justify-center gap-2 rounded-[1rem] border border-theme-soft bg-[color:var(--planner-panel-strong)] px-4 py-3 typ-cta text-body transition hover:bg-[color:var(--planner-primary-soft)] disabled:cursor-not-allowed disabled:opacity-60";

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[180] bg-[color:rgba(7,13,18,0.45)] backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[181] flex max-h-[90svh] w-[min(92vw,980px)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-[1.8rem] border border-theme-soft bg-[color:var(--planner-panel-strong)] shadow-theme-float outline-none">
          <div className="border-b border-theme-soft bg-[linear-gradient(135deg,rgba(255,255,255,0.98)_0%,rgba(237,244,250,0.96)_48%,rgba(232,223,212,0.72)_100%)] px-5 py-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-[color:var(--planner-accent-soft)] bg-[color:var(--planner-accent-soft)]/45 px-2.5 py-1 typ-caption font-semibold uppercase tracking-[0.18em] text-[color:var(--planner-accent-strong)]">
                    Session Hub
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-theme-soft bg-white/80 px-2.5 py-1 typ-caption font-semibold uppercase tracking-[0.14em] text-[color:var(--planner-primary)]">
                    {isAuthenticated ? <Cloud className="h-3 w-3" /> : <ShieldCheck className="h-3 w-3" />}
                    {isAuthenticated ? "Cloud Ready" : "Draft Mode"}
                  </span>
                </div>
                <Dialog.Title className="mt-3 typ-h3 text-[color:var(--planner-text-strong)]">
                  Plan Sessions
                </Dialog.Title>
                <Dialog.Description className="mt-2 max-w-2xl typ-caption-lg leading-6 text-muted">
                  Save into the shared planner workspace, keep a local draft close at hand, import a canonical planner document, or reopen the same plan in 3D.
                </Dialog.Description>
              </div>
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="rounded-full border border-theme-soft bg-[color:var(--planner-panel)] p-2 text-subtle transition hover:bg-[color:var(--planner-primary-soft)] hover:text-[color:var(--planner-primary)]"
                  aria-label="Close session dialog"
                >
                  <X className="h-4 w-4" />
                </button>
              </Dialog.Close>
            </div>
          </div>

          <div className="overflow-y-auto px-5 py-5">
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.8fr)]">
            <section className="rounded-[1.45rem] border border-theme-soft bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(250,251,252,0.96)_100%)] p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="typ-caption-lg font-semibold uppercase tracking-[0.14em] text-muted">
                    Saved Plans
                  </h2>
                  <p className="mt-1 typ-caption-lg text-subtle">
                    {plans.length === 0
                      ? "No local draft or cloud plan yet."
                      : `${plans.length} session${plans.length === 1 ? "" : "s"} available.`}
                  </p>
                </div>
                {isBusy ? <Loader2 className="h-4 w-4 animate-spin text-[color:var(--planner-primary)]" /> : null}
              </div>

              <div className="mt-4 space-y-3">
                {plans.length === 0 ? (
                  <div className="rounded-[1.2rem] border border-dashed border-theme-soft px-4 py-5 text-center typ-caption-lg text-subtle">
                    Save the current planner to create your first session.
                  </div>
                  ) : (
                    plans.map((plan) => (
                      <div
                        key={`${plan.source}:${plan.id}`}
                        className="group flex items-start justify-between gap-3 rounded-[1.2rem] border border-theme-soft bg-[color:var(--planner-panel-strong)] px-4 py-3 shadow-theme-panel transition hover:border-[color:var(--planner-border-hover)] hover:bg-white"
                      >
                        <button
                          type="button"
                          onClick={() => onLoadPlan(plan)}
                          className="min-w-0 flex-1 text-left"
                        >
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-1 typ-caption font-semibold uppercase tracking-[0.14em] ${
                              plan.source === "cloud"
                                ? "bg-[color:var(--planner-primary-soft)] text-[color:var(--planner-primary)]"
                                : "bg-[color:var(--planner-accent-soft)]/55 text-[color:var(--planner-accent-strong)]"
                            }`}
                          >
                            {plan.source === "cloud" ? "Cloud Save" : "Local Draft"}
                          </span>
                          <p className="mt-2 truncate text-[0.98rem] font-semibold tracking-[-0.02em] text-strong">{plan.name}</p>
                          <p className="mt-2 typ-caption-lg text-subtle">
                            {plan.updatedAtLabel ?? "No timestamp"}
                            {typeof plan.itemCount === "number" ? ` | ${plan.itemCount} item${plan.itemCount === 1 ? "" : "s"}` : ""}
                          </p>
                          {plan.detail ? <p className="mt-1 typ-caption-lg text-body">{plan.detail}</p> : null}
                        </button>
                      <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => onLoadPlan(plan)}
                            className="rounded-full border border-theme-soft bg-[color:var(--planner-panel)] p-2 text-subtle transition hover:bg-[color:var(--planner-primary-soft)] hover:text-[color:var(--planner-primary)]"
                            aria-label={`Load ${plan.name}`}
                          >
                            <FolderOpen className="h-4 w-4" />
                        </button>
                        {onDeletePlan ? (
                          <button
                            type="button"
                            onClick={() => onDeletePlan(plan)}
                            className="rounded-full border border-theme-soft bg-[color:var(--planner-panel)] p-2 text-[color:var(--planner-accent-strong)] transition hover:bg-[color:var(--planner-accent-soft)]/45"
                            aria-label={`Delete ${plan.name}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        ) : null}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>

            <section className="space-y-4 rounded-[1.45rem] border border-theme-soft bg-[color:var(--planner-panel)] p-4">
              <div className="rounded-[1.2rem] border border-theme-soft bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(245,247,250,0.96)_100%)] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="typ-caption-lg font-semibold uppercase tracking-[0.14em] text-muted">
                      Current Plan
                    </h2>
                    <p className="mt-1 typ-caption-lg text-subtle">
                      Name the session once, then save, import, or branch from here.
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-theme-soft bg-white/80 px-2.5 py-1 typ-caption font-semibold uppercase tracking-[0.14em] text-[color:var(--planner-primary)]">
                    {isAuthenticated ? <Cloud className="h-3 w-3" /> : <ShieldCheck className="h-3 w-3" />}
                    {isAuthenticated ? "Cloud Access" : "Local Only"}
                  </span>
                </div>
                <label className="mt-3 block typ-caption text-subtle" htmlFor="planner-plan-name">
                  Plan name
                </label>
                <input
                  id="planner-plan-name"
                  value={planName}
                  onChange={(event) => onPlanNameChange(event.target.value)}
                  placeholder="Untitled plan"
                  className="mt-2 w-full rounded-[1rem] border border-theme-soft bg-[color:var(--planner-panel-strong)] px-4 py-3 typ-caption-lg text-body outline-none transition focus:border-[color:var(--planner-primary)]"
                />
              </div>

              <div className="grid gap-3">
                <div className="rounded-[1.2rem] border border-theme-soft bg-[color:var(--planner-panel-strong)] p-3">
                  <p className="typ-caption font-semibold uppercase tracking-[0.14em] text-muted">Save</p>
                  <div className="mt-3 grid gap-3">
                    <button
                      type="button"
                      onClick={onSaveCloud}
                      disabled={!isAuthenticated || isBusy}
                      className={`${primaryActionClass} bg-[color:var(--planner-primary)] text-white hover:bg-[color:var(--planner-primary-hover)] disabled:bg-[color:var(--planner-surface-muted)] disabled:text-[color:var(--planner-text-subtle)]`}
                    >
                      <Save className="h-4 w-4" /> Save to Cloud
                    </button>
                    <button
                      type="button"
                      onClick={onSaveDraft}
                      disabled={isBusy}
                      className={`${primaryActionClass} border border-[color:var(--planner-accent-soft)] bg-[color:var(--planner-accent-soft)]/45 text-[color:var(--planner-accent-strong)] hover:bg-[color:var(--planner-accent-soft)]/75`}
                    >
                      <Download className="h-4 w-4" /> Save Local Draft
                    </button>
                  </div>
                </div>

                <div className="rounded-[1.2rem] border border-theme-soft bg-[color:var(--planner-panel-strong)] p-3">
                  <p className="typ-caption font-semibold uppercase tracking-[0.14em] text-muted">Transfer & Preview</p>
                  <div className="mt-3 grid gap-3">
                    <button
                      type="button"
                      onClick={onImport}
                      disabled={isBusy}
                      className={secondaryActionClass}
                    >
                      <Import className="h-4 w-4" /> Import Plan JSON
                    </button>
                    {onExportJson ? (
                      <button
                        type="button"
                        onClick={onExportJson}
                        disabled={isBusy}
                        className={secondaryActionClass}
                      >
                        <Upload className="h-4 w-4" /> Export Plan JSON
                      </button>
                    ) : null}
                    {onOpen3d ? (
                      <button
                        type="button"
                        onClick={onOpen3d}
                        disabled={!canOpen3d || isBusy}
                        className={secondaryActionClass}
                      >
                        <FolderOpen className="h-4 w-4" /> Open in 3D Viewer
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="rounded-[1.1rem] border border-theme-soft bg-[color:var(--planner-surface-soft)] px-4 py-3">
                <div className="flex items-start gap-2">
                  <ShieldCheck className="mt-0.5 h-4 w-4 text-[color:var(--planner-primary)]" />
                  <div>
                    <p className="typ-caption text-subtle uppercase tracking-[0.12em]">Access mode</p>
                    <p className="mt-1 typ-caption-lg text-body">
                      {isAuthenticated
                        ? "Authenticated session detected. Cloud save/load should follow the shared Supabase identity model."
                        : "No authenticated session detected. Cloud save is disabled, but local draft and import still work."}
                    </p>
                  </div>
                </div>
              </div>

              {errorMessage ? (
                <div className="rounded-[1.1rem] border border-[color:rgba(151,43,26,0.22)] bg-[linear-gradient(180deg,rgba(151,43,26,0.08)_0%,rgba(255,255,255,0.6)_100%)] px-4 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="typ-caption font-semibold uppercase tracking-[0.12em] text-[color:var(--planner-accent-strong)]">
                        Planner error
                      </p>
                      <p className="mt-1 typ-caption-lg text-body">{errorMessage}</p>
                    </div>
                    {onDismissError ? (
                      <button
                        type="button"
                        onClick={onDismissError}
                        className="rounded-full border border-[color:rgba(151,43,26,0.18)] bg-white/70 p-1.5 text-[color:var(--planner-accent-strong)] transition hover:bg-white"
                        aria-label="Dismiss planner error"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    ) : null}
                  </div>
                </div>
              ) : null}

              {statusMessage ? (
                <div className="rounded-[1.1rem] border border-theme-soft bg-[color:var(--planner-surface-soft)] px-4 py-3">
                  <div className="flex items-start gap-2">
                    <BadgeCheck className="mt-0.5 h-4 w-4 text-[color:var(--planner-primary)]" />
                    <p className="typ-caption-lg text-body">{statusMessage}</p>
                  </div>
                </div>
              ) : null}
            </section>
          </div>
        </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
