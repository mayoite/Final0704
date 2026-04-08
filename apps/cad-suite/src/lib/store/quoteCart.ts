"use client";
// @cad-suite:ui-store - UI-peripheral only. Must not hold canvas/editor state.

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface QuoteCartItem {
  id: string;
  name: string;
  qty: number;
  image?: string;
  href?: string;
  price?: number;
  source?: "planner" | "catalog";
  plannerFamily?: string;
  plannerDimensions?: string;
}

interface QuoteCartState {
  items: QuoteCartItem[];
  totalQty: number;
  addItem: (item: Omit<QuoteCartItem, "qty"> & { qty?: number }) => void;
  removeItem: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clearCart: () => void;
}

function totalQty(items: QuoteCartItem[]) {
  return items.reduce((sum, item) => sum + item.qty, 0);
}

const noopStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

const quoteCartStorage = createJSONStorage(() =>
  typeof window !== "undefined" ? window.localStorage : noopStorage,
);

export const useQuoteCart = create<QuoteCartState>()(
  persist(
    (set) => ({
      items: [],
      totalQty: 0,
      addItem: (incoming) =>
        set((state) => {
          const qtyToAdd = Math.max(1, incoming.qty ?? 1);
          const existing = state.items.find((item) => item.id === incoming.id);

          const nextItems = existing
            ? state.items.map((item) =>
                item.id === incoming.id
                  ? { ...item, qty: item.qty + qtyToAdd, price: incoming.price ?? item.price }
                  : item,
              )
            : [
                ...state.items,
                {
                  id: incoming.id,
                  name: incoming.name,
                  qty: qtyToAdd,
                  image: incoming.image,
                  href: incoming.href,
                  price: incoming.price,
                  source: incoming.source,
                  plannerFamily: incoming.plannerFamily,
                  plannerDimensions: incoming.plannerDimensions,
                },
              ];

          return { items: nextItems, totalQty: totalQty(nextItems) };
        }),
      removeItem: (id) =>
        set((state) => {
          const nextItems = state.items.filter((item) => item.id !== id);
          return { items: nextItems, totalQty: totalQty(nextItems) };
        }),
      setQty: (id, qty) =>
        set((state) => {
          const normalizedQty = Math.max(0, Math.floor(qty));
          const nextItems = state.items
            .map((item) => (item.id === id ? { ...item, qty: normalizedQty } : item))
            .filter((item) => item.qty > 0);
          return { items: nextItems, totalQty: totalQty(nextItems) };
        }),
      clearCart: () => ({ items: [], totalQty: 0 }),
    }),
    {
      name: "quote-cart-v1",
      storage: quoteCartStorage,
      partialize: (state) => ({ items: state.items }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        state.totalQty = totalQty(state.items);
      },
    },
  ),
);
