import type { Metadata } from "next";

import { PlannerViewportGate } from "@/components/planner/PlannerViewportGate";

export const metadata: Metadata = {
  title: "Blueprint Planner | One&Only",
  description:
    "Open the legacy Blueprint planner inside the main One&Only app.",
};

export default function PlannerBlueprintPage() {
  return (
    <div className="planner-shell pointer-events-auto relative isolate z-10 h-full">
      <PlannerViewportGate />
    </div>
  );
}
