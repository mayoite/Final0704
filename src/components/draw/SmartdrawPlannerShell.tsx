"use client";

import dynamic from "next/dynamic";
import type { CatalogProduct } from "./types";
import type { PlannerDocument as SavedPlannerDocument } from "@/features/planner/model";

const SmartdrawPlanner = dynamic(
  () => import("./SmartdrawPlanner").then((module) => module.SmartdrawPlanner),
  {
    ssr: false,
  },
);

export function SmartdrawPlannerShell({
  catalogProducts = [],
  mode = "auto",
  initialDocument = null,
  initialSaveId = null,
}: {
  catalogProducts?: CatalogProduct[];
  mode?: "desktop" | "mobile" | "auto";
  initialDocument?: SavedPlannerDocument | null;
  initialSaveId?: string | null;
}) {
  return (
    <SmartdrawPlanner
      catalogProducts={catalogProducts}
      mode={mode}
      initialDocument={initialDocument}
      initialSaveId={initialSaveId}
    />
  );
}
