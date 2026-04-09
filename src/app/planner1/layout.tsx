import type { Metadata } from "next";

import "../planner.tokens.css";
import "../planner.components.css";

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
