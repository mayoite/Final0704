"use client";

import { create, type StateCreator } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface ProductCompareItem {
  id: string;
  productUrlKey: string;
  categoryId: string;
  name: string;
  image?: string;
  href?: string;
}

interface ProductCompareState {
  items: ProductCompareItem[];
  addItem: (item: ProductCompareItem) => void;
  removeItem: (id: string) => void;
  toggleItem: (item: ProductCompareItem) => void;
  clear: () => void;
}

const MAX_COMPARE_ITEMS = 4;

const createProductCompareState: StateCreator<ProductCompareState> = (set, get) => ({
  items: [],
  addItem: (incoming) =>
    set((state) => {
      const exists = state.items.some((item) => item.id === incoming.id);
      if (exists) return state;
      const nextItems = [...state.items, incoming].slice(-MAX_COMPARE_ITEMS);
      return { items: nextItems };
    }),
  removeItem: (id) =>
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
    })),
  toggleItem: (incoming) => {
    const exists = get().items.some((item) => item.id === incoming.id);
    if (exists) {
      get().removeItem(incoming.id);
      return;
    }
    get().addItem(incoming);
  },
  clear: () => set({ items: [] }),
});

const createPersistedProductCompareState = persist(createProductCompareState, {
  name: "product-compare-v1",
  storage: createJSONStorage(() => window.localStorage),
  partialize: (state) => ({ items: state.items }),
}) as StateCreator<ProductCompareState>;

const createProductCompareStore = () =>
  create<ProductCompareState>()(
    typeof window === "undefined"
      ? createProductCompareState
      : createPersistedProductCompareState,
  );

export const useProductCompare = createProductCompareStore();

export { MAX_COMPARE_ITEMS };
