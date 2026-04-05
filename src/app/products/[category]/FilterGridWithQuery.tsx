"use client";

import QueryProvider from "@/app/providers/QueryProvider";
import type { CompatCategory } from "@/lib/getProducts";
import { FilterGrid } from "./FilterGrid";

export function FilterGridWithQuery({
  category,
  categoryId,
}: {
  category: CompatCategory;
  categoryId: string;
}) {
  return (
    <QueryProvider>
      <FilterGrid category={category} categoryId={categoryId} />
    </QueryProvider>
  );
}

