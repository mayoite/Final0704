import type { Metadata } from "next";

import "../planner.tokens.css";
import "../planner.components.css";

export const metadata: Metadata = {
  title: "Blueprint Planner | One&Only",
  description:
    "Legacy Blueprint workspace planner with 2D layouting, 3D review, import-export, and proposal tooling.",
  robots: { index: false },
};

export default function PlannerBlueprintLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
