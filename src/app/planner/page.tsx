import type { Metadata } from "next";
import { PlannerClient } from "./PlannerClient";
import { getProducts } from "@/lib/getProducts";

export const metadata: Metadata = {
  title: "Smart Configurator | One&Only",
  description: "Advanced React 2D CAD Planner and Configurator.",
};

export default async function PlannerPage() {
  const products = await getProducts();
  return (
    <div className="absolute inset-0 overflow-hidden">
      <PlannerClient catalogProducts={products} />
    </div>
  );
}
