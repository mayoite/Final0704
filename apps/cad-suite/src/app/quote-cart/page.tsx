"use client";

import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";

import { useQuoteCart } from "@/lib/store/quoteCart";

export default function QuoteCartPage() {
  const items = useQuoteCart((state) => state.items);
  const totalQty = useQuoteCart((state) => state.totalQty);
  const setQty = useQuoteCart((state) => state.setQty);
  const removeItem = useQuoteCart((state) => state.removeItem);
  const clearCart = useQuoteCart((state) => state.clearCart);

  return (
    <main className="min-h-screen bg-page px-6 py-12 text-body sm:px-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="typ-eyebrow text-[color:var(--planner-accent-strong)]">Quote Cart</p>
            <h1 className="mt-4 max-w-4xl text-4xl font-[300] tracking-[-0.05em] text-[color:var(--planner-text-strong)]">
              Review planner items before the sales handoff.
            </h1>
            <p className="mt-4 max-w-3xl typ-lead text-muted">
              The planner was already routing users here, but the page did not exist in the CAD
              suite. This screen now preserves that flow and lets users adjust quantities before
              moving on.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/planner"
              className="rounded-full border border-theme-soft bg-[color:var(--planner-panel)] px-5 py-3 typ-cta text-[color:var(--planner-primary)] transition hover:bg-[color:var(--planner-primary-soft)]"
            >
              Back to Planner
            </Link>
            <Link
              href="/draw"
              className="rounded-full border border-theme-soft bg-[color:var(--planner-panel)] px-5 py-3 typ-cta text-[color:var(--planner-primary)] transition hover:bg-[color:var(--planner-primary-soft)]"
            >
              Open Draw
            </Link>
            {items.length > 0 ? (
              <button
                type="button"
                onClick={clearCart}
                className="rounded-full border border-[color:var(--planner-accent-soft)] bg-[color:var(--planner-accent-soft)]/55 px-5 py-3 typ-cta text-[color:var(--planner-accent-strong)] transition hover:bg-[color:var(--planner-accent-soft)]"
              >
                Clear Cart
              </button>
            ) : null}
          </div>
        </header>

        {items.length === 0 ? (
          <section className="rounded-[1.9rem] border border-theme-soft bg-[color:var(--planner-panel-strong)] p-8 text-center shadow-theme-panel">
            <h2 className="typ-h3 text-[color:var(--planner-text-strong)]">No items in the cart yet.</h2>
            <p className="mx-auto mt-4 max-w-2xl typ-caption-lg leading-6 text-muted">
              Add products from the planner or draw workspace, then generate the quote again.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                href="/planner"
                className="rounded-full bg-[color:var(--planner-primary)] px-5 py-3 typ-cta text-white transition hover:bg-[color:var(--planner-primary-hover)]"
              >
                Go to Planner
              </Link>
              <Link
                href="/draw"
                className="rounded-full border border-theme-soft bg-[color:var(--planner-panel)] px-5 py-3 typ-cta text-[color:var(--planner-primary)] transition hover:bg-[color:var(--planner-primary-soft)]"
              >
                Go to Draw
              </Link>
            </div>
          </section>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
            <section className="space-y-3">
              {items.map((item) => (
                <article
                  key={item.id}
                  className="rounded-[1.75rem] border border-theme-soft bg-[color:var(--planner-panel-strong)] p-5 shadow-theme-panel"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-lg font-semibold text-strong">{item.name}</p>
                      <p className="mt-1 text-sm text-muted">
                        {item.source === "planner" ? "Added from planner" : "Added from catalog"}
                        {item.plannerFamily ? ` - ${item.plannerFamily}` : ""}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <div className="inline-flex items-center rounded-full border border-theme-soft bg-[color:var(--planner-surface-soft)]">
                        <button
                          type="button"
                          onClick={() => setQty(item.id, item.qty - 1)}
                          className="inline-flex h-10 w-10 items-center justify-center text-muted transition hover:text-[color:var(--planner-primary)]"
                          aria-label={`Decrease quantity for ${item.name}`}
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="min-w-10 text-center text-sm font-semibold text-strong">{item.qty}</span>
                        <button
                          type="button"
                          onClick={() => setQty(item.id, item.qty + 1)}
                          className="inline-flex h-10 w-10 items-center justify-center text-muted transition hover:text-[color:var(--planner-primary)]"
                          aria-label={`Increase quantity for ${item.name}`}
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="inline-flex items-center gap-2 rounded-full border border-theme-soft bg-[color:var(--planner-panel)] px-4 py-2 text-sm font-semibold text-[color:var(--planner-accent-strong)] transition hover:border-[color:var(--planner-accent)] hover:bg-[color:var(--planner-accent-soft)]/45"
                      >
                        <Trash2 className="h-4 w-4" />
                        Remove
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </section>

            <aside className="h-fit rounded-[1.75rem] border border-theme-soft bg-[color:var(--planner-panel-strong)] p-5 shadow-theme-panel">
              <p className="typ-eyebrow text-[color:var(--planner-accent-strong)]">Summary</p>
              <div className="mt-5 space-y-3 text-sm text-muted">
                <p>
                  Line items: <span className="font-semibold text-strong">{items.length}</span>
                </p>
                <p>
                  Total quantity: <span className="font-semibold text-strong">{totalQty}</span>
                </p>
              </div>
              <p className="mt-5 text-sm leading-6 text-muted">
                This app does not yet include the wider catalog checkout flow. Use this page as the
                planning handoff checkpoint after the workspace layout is ready.
              </p>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}
