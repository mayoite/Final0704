import type { PlannerDocument } from "@/lib/planner/types";

export type PlannerBoqRow = {
  catalogId: string;
  name: string;
  category: string;
  quantity: number;
  widthCm: number;
  depthCm: number;
  heightCm: number;
  spec: string;
};

export function buildPlannerBoq(document: PlannerDocument): PlannerBoqRow[] {
  const grouped = new Map<string, PlannerBoqRow>();

  for (const item of document.items) {
    const key = item.catalogId || item.name;
    const existing = grouped.get(key);

    if (existing) {
      existing.quantity += 1;
      continue;
    }

    grouped.set(key, {
      catalogId: item.catalogId,
      name: item.name,
      category: item.category ?? "Uncategorized",
      quantity: 1,
      widthCm: item.widthCm,
      depthCm: item.depthCm,
      heightCm: item.heightCm,
      spec: item.spec ?? "Planner-ready product data from the active catalog.",
    });
  }

  return Array.from(grouped.values()).sort((left, right) =>
    left.name.localeCompare(right.name),
  );
}
