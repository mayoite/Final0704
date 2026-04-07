import type { Metadata } from "next";
import { SmartPlanner } from "@/components/planner/SmartPlanner";

export const metadata: Metadata = {
  title: "Workspace Planner | One&Only",
  description:
    "Plan your office space with One&Only's interactive floor planner. Draw rooms, place furniture, and generate quotes — all in one page.",
};

export default function PlannerPage() {
  return <SmartPlanner />;
}
