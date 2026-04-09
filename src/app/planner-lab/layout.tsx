import type { Metadata } from "next";

import "../planner.tokens.css";
import "../planner.components.css";

export const metadata: Metadata = {
  title: "Planner Lab | One&Only",
  description: "Preserved planner lab route inside the main app.",
  robots: { index: false },
};

export default function PlannerLabLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
