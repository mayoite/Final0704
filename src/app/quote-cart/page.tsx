"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo } from "react";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useQuoteCart } from "@/lib/store/quoteCart";
import { QUOTE_CART_ROUTE_COPY } from "@/data/site/routeCopy";

function getCompareHref(items: Array<{ href?: string }>) {
  const keys = items
    .map((item) => {
      if (!item.href) return "";
      try {
        const url = new URL(item.href, "https://oando.local");
        const parts = url.pathname.split("/").filter(Boolean);
        return parts[parts.length - 1] || "";
      } catch {
        return "";
      }
    })
    .filter(Boolean);

  const uniqueKeys = Array.from(new Set(keys)).slice(0, 4);
  return uniqueKeys.length >= 2
    ? `/compare?items=${encodeURIComponent(uniqueKeys.join(","))}`
    : null;
}

export default function QuoteCartPage() {
  const items = useQuoteCart((state) => state.items);
  const totalQty = useQuoteCart((state) => state.totalQty);
  const setQty = useQuoteCart((state) => state.setQty);
  const removeItem = useQuoteCart((state) => state.removeItem);
  const clearCart = useQuoteCart((state) => state.clearCart);
  const compareHref = useMemo(() => getCompareHref(items), [items]);

  return (
    <section className="min-h-screen bg-hover pb-14 pt-28">
      <section className="container-wide">
        <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="typ-overline scheme-text-muted">{QUOTE_CART_ROUTE_COPY.kicker}</p>
            <h1 className="mt-2 text-3xl font-light text-strong">
              {QUOTE_CART_ROUTE_COPY.title}
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted">
              {QUOTE_CART_ROUTE_COPY.description}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/products" className="btn-outline">
              {QUOTE_CART_ROUTE_COPY.browseCta}
            </Link>
            {compareHref ? (
              <Link href={compareHref} className="btn-outline">
                {QUOTE_CART_ROUTE_COPY.compareCta}
              </Link>
            ) : null}
            {items.length > 0 ? (
              <button
                type="button"
                onClick={clearCart}
                className="btn-outline"
              >
                {QUOTE_CART_ROUTE_COPY.clearCta}
              </button>
            ) : null}
          </div>
        </header>

        {items.length === 0 ? (
          <div className="rounded-3xl border border-soft bg-panel p-8 text-center">
            <p className="text-lg text-strong">{QUOTE_CART_ROUTE_COPY.emptyTitle}</p>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-muted">
              {QUOTE_CART_ROUTE_COPY.emptyDescription}
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              <Link href="/products" className="btn-primary">
                {QUOTE_CART_ROUTE_COPY.emptyPrimaryCta}
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
            <div className="space-y-3">
              {/* ── Floor plan items ──────────────────────────────── */}
              {items.some((i) => i.source === "planner") && (
                <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <span className="rounded-full bg-primary/10 px-2.5 py-0.5 typ-caption-lg font-semibold text-primary">
                      From your floor plan
                    </span>
                    <p className="text-xs text-muted">
                      Confirm series &amp; finish with our team — renderings below
                    </p>
                  </div>
                  <div className="space-y-2">
                    {items.filter((i) => i.source === "planner").map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 rounded-xl border border-soft bg-panel px-3 py-2.5"
                      >
                        {item.image && (
                          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-hover">
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-strong">{item.name}</p>
                          <p className="text-xs text-muted">
                            {item.plannerFamily && (
                              <span className="mr-1 font-medium">{item.plannerFamily} series</span>
                            )}
                            · finish TBC on quote
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <div className="inline-flex items-center rounded-full border border-soft bg-panel">
                            <button
                              type="button"
                              onClick={() => setQty(item.id, item.qty - 1)}
                              className="inline-flex h-8 w-8 items-center justify-center text-body hover:text-primary"
                              aria-label={`Decrease quantity for ${item.name}`}
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="min-w-7 text-center text-sm font-semibold text-strong">
                              {item.qty}
                            </span>
                            <button
                              type="button"
                              onClick={() => setQty(item.id, item.qty + 1)}
                              className="inline-flex h-8 w-8 items-center justify-center text-body hover:text-primary"
                              aria-label={`Increase quantity for ${item.name}`}
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="inline-flex items-center gap-1 text-xs text-muted hover:text-danger"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Regular cart items ────────────────────────────── */}
              {items.filter((i) => i.source !== "planner").map((item) => (
                <article
                  key={item.id}
                  className="grid grid-cols-[5.5rem_1fr] gap-4 rounded-2xl border border-soft bg-panel p-4 sm:grid-cols-[7rem_1fr]"
                >
                  <div className="relative h-20 w-20 overflow-hidden rounded-xl bg-hover sm:h-24 sm:w-24">
                    <Image
                      src={item.image || "/images/fallback/category.webp"}
                      alt={item.name}
                      fill
                      className="object-contain p-2"
                    />
                  </div>
                  <div>
                    <Link
                      href={item.href || "/products"}
                      className="text-sm font-semibold text-strong hover:text-primary"
                    >
                      {item.name}
                    </Link>
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <div className="inline-flex items-center rounded-full border border-soft bg-panel">
                        <button
                          type="button"
                          onClick={() => setQty(item.id, item.qty - 1)}
                          className="inline-flex h-9 w-9 items-center justify-center text-body hover:text-primary"
                          aria-label={`Decrease quantity for ${item.name}`}
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="min-w-9 text-center text-sm font-semibold text-strong">
                          {item.qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => setQty(item.id, item.qty + 1)}
                          className="inline-flex h-9 w-9 items-center justify-center text-body hover:text-primary"
                          aria-label={`Increase quantity for ${item.name}`}
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="typ-chip scheme-text-muted inline-flex items-center gap-1 hover:text-danger"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        {QUOTE_CART_ROUTE_COPY.removeCta}
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <aside className="rounded-2xl border border-soft bg-panel p-5 h-fit">
              <p className="typ-overline scheme-text-muted">{QUOTE_CART_ROUTE_COPY.summaryTitle}</p>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                {QUOTE_CART_ROUTE_COPY.summaryDescription}
              </p>
              <p className="mt-3 text-sm text-body">
                {QUOTE_CART_ROUTE_COPY.summaryQuantityLabel}: <strong>{totalQty}</strong>
              </p>
              <p className="mt-2 text-sm text-body">
                {QUOTE_CART_ROUTE_COPY.summaryProductsLabel}: <strong>{items.length}</strong>
              </p>
              {compareHref ? (
                <div className="mt-4 rounded-2xl border border-soft bg-hover p-4">
                  <p className="text-sm font-medium text-strong">
                    {QUOTE_CART_ROUTE_COPY.summaryCompareHint}
                  </p>
                  <Link href={compareHref} className="mt-3 inline-flex text-sm font-medium text-primary">
                    {QUOTE_CART_ROUTE_COPY.compareCta}
                  </Link>
                </div>
              ) : null}
              <div className="mt-4 rounded-2xl border border-soft bg-hover p-4">
                <p className="text-sm font-medium text-strong">
                  {QUOTE_CART_ROUTE_COPY.summaryDeskHint}
                </p>
                <div className="mt-3 grid gap-2">
                  <Link href="/planner" className="btn-outline justify-center">
                    {QUOTE_CART_ROUTE_COPY.planningCta}
                  </Link>
                </div>
              </div>
              <Link
                href="/contact?intent=quote&source=quote-cart"
                className="typ-chip mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-primary px-5 py-2.5 text-inverse hover:bg-primary/90"
              >
                {QUOTE_CART_ROUTE_COPY.primaryCta}
              </Link>
            </aside>
          </div>
        )}
      </section>
    </section>
  );
}


