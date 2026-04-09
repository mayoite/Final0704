import { SmartdrawPlannerShell } from "@/components/draw/SmartdrawPlannerShell";
import { getPlannerCatalogProductsSafe } from "./plannerProducts";

export default async function PlannerPage() {
  const products = await getPlannerCatalogProductsSafe();

  return (
    <div className="flex h-screen flex-1 flex-col overflow-hidden">
      <SmartdrawPlannerShell catalogProducts={products} />
    </div>
  );
}
