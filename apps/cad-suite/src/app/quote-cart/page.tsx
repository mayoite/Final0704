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
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-slate-50 sm:px-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-sky-200/80">
              Quote Cart
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white">
              Review planner items before the sales handoff.
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-300">
              The planner was already routing users here, but the page did not exist in the CAD
              suite. This screen now preserves that flow and lets users adjust quantities before
              moving on.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/planner"
              className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:border-sky-300/40 hover:bg-white/10"
            >
              Back to Planner
            </Link>
            <Link
              href="/draw"
              className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:border-sky-300/40 hover:bg-white/10"
            >
              Open Draw
            </Link>
            {items.length > 0 ? (
              <button
                type="button"
                onClick={clearCart}
                className="rounded-full border border-rose-300/20 bg-rose-400/10 px-5 py-3 text-sm font-semibold text-rose-100 transition hover:border-rose-300/40 hover:bg-rose-400/15"
              >
                Clear Cart
              </button>
            ) : null}
          </div>
        </header>

        {items.length === 0 ? (
          <section className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center">
            <h2 className="text-2xl font-semibold text-white">No items in the cart yet.</h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-slate-300">
              Add products from the planner or draw workspace, then generate the quote again.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                href="/planner"
                className="rounded-full bg-sky-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-200"
              >
                Go to Planner
              </Link>
              <Link
                href="/draw"
                className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:border-sky-300/40 hover:bg-white/10"
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
                  className="rounded-3xl border border-white/10 bg-white/5 p-5"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-lg font-semibold text-white">{item.name}</p>
                      <p className="mt-1 text-sm text-slate-300">
                        {item.source === "planner" ? "Added from planner" : "Added from catalog"}
                        {item.plannerFamily ? ` · ${item.plannerFamily}` : ""}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <div className="inline-flex items-center rounded-full border border-white/10 bg-black/20">
                        <button
                          type="button"
                          onClick={() => setQty(item.id, item.qty - 1)}
                          className="inline-flex h-10 w-10 items-center justify-center text-slate-200 transition hover:text-white"
                          aria-label={`Decrease quantity for ${item.name}`}
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="min-w-10 text-center text-sm font-semibold text-white">
                          {item.qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => setQty(item.id, item.qty + 1)}
                          className="inline-flex h-10 w-10 items-center justify-center text-slate-200 transition hover:text-white"
                          aria-label={`Increase quantity for ${item.name}`}
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-rose-300/40 hover:text-rose-100"
                      >
                        <Trash2 className="h-4 w-4" />
                        Remove
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </section>

            <aside className="h-fit rounded-3xl border border-white/10 bg-white/5 p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-200/80">
                Summary
              </p>
              <div className="mt-5 space-y-3 text-sm text-slate-300">
                <p>
                  Line items: <span className="font-semibold text-white">{items.length}</span>
                </p>
                <p>
                  Total quantity: <span className="font-semibold text-white">{totalQty}</span>
                </p>
              </div>
              <p className="mt-5 text-sm leading-6 text-slate-300">
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
