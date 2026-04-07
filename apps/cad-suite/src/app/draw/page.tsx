import { SmartdrawPlanner } from "@/components/draw/SmartdrawPlanner";
import { getPlannerCatalogProducts } from "../planner/plannerProducts";

export default async function DrawPage() {
  const products = await getPlannerCatalogProducts();

  return (
    <div className="flex h-screen flex-1 flex-col overflow-hidden">
      <SmartdrawPlanner catalogProducts={products} />
    </div>
  );
}
