import type { Metadata } from "next";

import "../planner-blueprint.tokens.css";
import "../planner-blueprint.components.css";

export const metadata: Metadata = {
  title: "Planner 1 | One&Only",
  description: "Preserved planner1 route inside the main app.",
  robots: { index: false },
};

export default function PlannerOneLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
