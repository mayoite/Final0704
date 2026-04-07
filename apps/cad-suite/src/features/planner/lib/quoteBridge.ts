import type { QuoteCartItem } from "@/lib/store/quoteCart";

import type { BoqItem } from "../../../components/draw/types";

interface GroupedPlannerBoqItem extends BoqItem {
  qty: number;
}

export function calculatePlannerBoqTotal(items: BoqItem[]) {
  return items.reduce((total, item) => total + item.price, 0);
}

export function groupPlannerBoqItems(items: BoqItem[]) {
  return items.reduce(
    (accumulator, item) => {
      const key =
        item.productId ??
        item.productSlug ??
        item.plannerSourceSlug ??
        item.name.trim().toLowerCase().replace(/\s+/g, "-");

      if (!accumulator[key]) {
        accumulator[key] = { ...item, qty: 1 };
      } else {
        accumulator[key].qty += 1;
      }

      return accumulator;
    },
    {} as Record<string, GroupedPlannerBoqItem>,
  );
}

export function buildPlannerQuoteCartItems(items: BoqItem[]): QuoteCartItem[] {
  return Object.entries(groupPlannerBoqItems(items)).map(([groupKey, item]) => ({
    id: `planner-${groupKey}`,
    name: item.name,
    qty: item.qty,
    image: item.imageUrl,
    source: "planner",
    plannerFamily: item.category,
    plannerDimensions: item.dimensions,
  }));
}
