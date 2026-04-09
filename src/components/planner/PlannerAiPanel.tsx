"use client";

import { useState } from "react";
import { Loader2, Sparkles, MessageSquare, BrainCircuit } from "lucide-react";

import { AI_ASSISTANT_STARTERS, AI_CHATBOT_COPY } from "@/data/site/assistant";
import type { AdvisorResult } from "@/lib/aiAdvisor";
import { usePlannerStore } from "@/lib/planner/store";
import { formatAreaPair } from "@/lib/planner/units";
import { Button } from "@/components/ui/Button";

function getRoomBounds(
  room:
    | ReturnType<
        typeof usePlannerStore.getState
      >["history"]["present"]["rooms"][number]
    | null,
) {
  if (!room || room.outline.length === 0) {
    return null;
  }

  return {
    minX: Math.min(...room.outline.map((point) => point.x)),
    maxX: Math.max(...room.outline.map((point) => point.x)),
    minY: Math.min(...room.outline.map((point) => point.y)),
    maxY: Math.max(...room.outline.map((point) => point.y)),
  };
}

export function PlannerAiPanel() {
  const document = usePlannerStore((state) => state.history.present);
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<AdvisorResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const room = document.rooms[0] ?? null;
  const roomBounds = getRoomBounds(room);
  const context = {
    source: "planner" as const,
    mode: "technical-planner" as const,
    sourcePath: "/planner",
    seatOrUnitCount: document.items.length,
    roomWidthMm: roomBounds
      ? Math.round((roomBounds.maxX - roomBounds.minX) * 10)
      : undefined,
    roomLengthMm: roomBounds
      ? Math.round((roomBounds.maxY - roomBounds.minY) * 10)
      : undefined,
    fitStatus:
      document.items.length > 0
        ? "Items placed in current workspace"
        : "No items placed yet",
    keyOptions: document.items.slice(0, 6).map((item) => item.name),
  };

  async function submitPlannerQuery(nextQuery: string) {
    const trimmed = nextQuery.trim();

    if (!trimmed) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/ai-advisor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: trimmed,
          userId: "planner-ui",
          context,
        }),
      });

      const json = (await response.json()) as AdvisorResult & {
        error?: string;
      };

      if (!response.ok || !Array.isArray(json.recommendations)) {
        throw new Error(json.error || AI_CHATBOT_COPY.advisorUnavailable);
      }

      setResult(json);
    } catch (submitError) {
      setResult(null);
      setError(
        submitError instanceof Error
          ? submitError.message
          : AI_CHATBOT_COPY.advisorNetwork,
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="home-frame home-frame--roomy animate-in fade-in transition-all">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-8 border-b border-soft pb-8">
        <div className="min-w-0 flex-1">
          <div className="mb-3 flex items-center gap-2">
            <BrainCircuit className="h-5 w-5 text-[var(--planner-accent)]" />
            <p className="text-[12px] font-semibold tracking-[0.05em] text-subtle">
              AI LAYOUT ADVISOR
            </p>
          </div>
          <h3 className="font-display text-[clamp(1.95rem,2.8vw,2.9rem)] font-[400] tracking-[-0.035em] text-[var(--text-heading-soft)]">
            Analytic Engine
          </h3>
          <p className="mt-3 max-w-2xl text-[15px] leading-7 text-muted font-medium">
            Retrieve immediate feedback on spacing, ergonomics, and budget
            allocation based on the current canvas state.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            {AI_ASSISTANT_STARTERS.slice(0, 3).map((starter) => (
              <button
                key={starter}
                type="button"
                className="home-chip home-chip--accent max-w-none px-4 py-2.5 text-[12px] text-subtle transition-all hover:border-strong hover:bg-hover hover:text-strong"
                onClick={() => {
                  setQuery(starter);
                  void submitPlannerQuery(starter);
                }}
              >
                {starter}
              </button>
            ))}
          </div>
        </div>

        <div className="grid min-w-[280px] grid-cols-2 gap-4">
          <div className="flex min-w-0 flex-col rounded-[24px] border border-soft bg-[var(--surface-soft)] p-5 shadow-theme-soft">
            <span className="mb-1 font-sans text-[12px] text-subtle font-semibold tracking-[0.04em]">
              Units
            </span>
            <span className="text-xl text-strong font-semibold tracking-tight">
              {document.items.length} placed
            </span>
          </div>
          <div className="flex min-w-0 flex-col rounded-[24px] border border-soft bg-[var(--surface-soft)] p-5 shadow-theme-soft">
            <span className="mb-1 font-sans text-[12px] text-subtle font-semibold tracking-[0.04em]">
              Live Area
            </span>
            <span className="text-xl font-semibold tracking-tight text-[var(--color-accent2)]">
              {room?.areaSqM
                ? formatAreaPair(room.areaSqM).split(" ")[0]
                : "--"}{" "}
              SQM
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-8">
        <div className="contact-teaser rounded-[28px] p-5 transition-colors focus-within:border-strong">
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask AI for layout refinement..."
            className="max-h-[180px] min-h-[64px] flex-1 resize-none border-none bg-transparent text-[15px] leading-7 font-medium text-strong outline-none placeholder:text-subtle"
          />
          <Button
            size="lg"
            className="h-14 shrink-0 rounded-2xl bg-primary px-8 text-[12px] text-inverse font-semibold tracking-[0.04em] shadow-theme-soft transition-all hover:bg-primary-hover"
            disabled={loading || !query.trim()}
            onClick={() => submitPlannerQuery(query)}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin text-inverse" />
            ) : (
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                GET ADVICE
              </div>
            )}
          </Button>
        </div>

        {error && (
          <div className="animate-in fade-in slide-in-from-top-2 rounded-2xl border border-rose-500/20 bg-rose-500/5 p-5 text-[11px] font-semibold tracking-[0.03em] text-rose-500">
            <span className="mr-3 rounded bg-rose-500 px-2 py-0.5 text-inverse">
              Error
            </span>
            {error}
          </div>
        )}

        {result && (
          <div className="animate-in fade-in slide-in-from-bottom-4 space-y-8 pb-12">
            <div className="rounded-[28px] border border-soft bg-[var(--surface-page)] p-8 shadow-theme-soft">
              <div className="mb-4 flex items-center gap-2 text-[var(--color-accent2)]">
                <MessageSquare className="h-4 w-4" />
                <span className="text-[12px] font-semibold tracking-[0.04em]">
                  Analytic Summary
                </span>
              </div>
              <p className="text-[19px] leading-8 text-strong font-semibold tracking-tight">
                {result.summary}
              </p>
              <div className="mt-8 flex gap-4">
                <div className="rounded-xl border border-soft bg-hover px-5 py-3">
                  <p className="mb-1 text-[11px] font-semibold tracking-[0.03em] text-subtle">
                    Estimated Budget
                  </p>
                  <p className="text-xl font-semibold tracking-tight text-strong">
                    {result.totalBudget}
                  </p>
                </div>
                <div className="rounded-xl border border-soft bg-hover px-5 py-3">
                  <p className="mb-1 text-[11px] font-semibold tracking-[0.03em] text-subtle">
                    Catalog Matches
                  </p>
                  <p className="text-xl font-semibold tracking-tight text-strong">
                    {result.recommendations.length} options
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {result.recommendations.map((item, i) => (
                <div
                  key={i}
                  className="home-step-card group p-6 transition-all duration-300 hover:border-strong hover:shadow-theme-float"
                >
                  <div className="mb-4 flex items-start justify-between">
                    <span className="text-[12px] font-semibold tracking-[0.03em] text-subtle transition-colors group-hover:text-[var(--planner-selection)]">
                      {item.category}
                    </span>
                    <span className="rounded-lg border border-soft bg-hover px-2 py-1 text-[11px] font-semibold text-subtle transition-colors group-hover:text-strong">
                      {item.budgetEstimate}
                    </span>
                  </div>
                  <h4 className="mb-4 text-[19px] font-semibold leading-tight tracking-tight text-strong">
                    {item.productName}
                  </h4>
                  <div className="mb-4 h-px bg-[var(--border-soft)] transition-colors group-hover:bg-[var(--border-strong)]" />
                  <p className="text-[14px] leading-7 text-muted font-medium transition-colors group-hover:text-body">
                    {item.why}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
