import { PlannerViewportGate } from "@/components/planner/PlannerViewportGate";

export default function PlannerLabPage() {
  return (
    <div className="planner-shell pointer-events-auto relative isolate z-10 h-full">
      <PlannerViewportGate />
    </div>
  );
}
