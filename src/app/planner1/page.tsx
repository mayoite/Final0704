import { PlannerViewportGate } from "@/components/planner/PlannerViewportGate";

export default function PlannerOnePage() {
  return (
    <div className="planner-shell pointer-events-auto relative isolate z-10 h-full">
      <PlannerViewportGate />
    </div>
  );
}
