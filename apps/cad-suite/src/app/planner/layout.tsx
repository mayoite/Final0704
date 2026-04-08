import type { Metadata } from "next";

import "../planner.tokens.css";
import "../planner.components.css";

export const metadata: Metadata = {
  title: "Workspace Planner | One&Only",
  description:
    "Plan your office space with One&Only's interactive floor planner. Draw rooms, place workstations, chairs, tables and storage in 2D and 3D.",
  robots: { index: false },
};

export default function PlannerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
