"use client";

import React from "react";
import dynamic from "next/dynamic";

const SmartdrawPlanner = dynamic(
  () => import("@/components/smartdraw/SmartdrawPlanner").then((mod) => mod.SmartdrawPlanner),
  { ssr: false, loading: () => <div className="flex items-center justify-center h-screen w-full scheme-section-soft text-muted font-medium">Loading SmartDraw Engine...</div> }
);

export function PlannerClient({ catalogProducts }: { catalogProducts: any[] }) {
  return <SmartdrawPlanner catalogProducts={catalogProducts} />;
}
