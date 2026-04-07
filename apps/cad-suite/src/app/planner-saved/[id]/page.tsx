import { SmartdrawPlanner } from "@/components/draw/SmartdrawPlanner";
import { getPlannerCatalogProducts } from "@/app/planner/plannerProducts";

export default async function PlannerSavedPage({
  params,
}: {
  params: { id: string };
}) {
  const products = await getPlannerCatalogProducts();

  return (
    <div className="flex h-screen flex-1 flex-col overflow-hidden">
      <SmartdrawPlanner catalogProducts={products} initialSaveId={params.id} />
    </div>
  );
}
