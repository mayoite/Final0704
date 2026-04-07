import { SmartdrawPlanner } from "@/components/draw/SmartdrawPlanner";
import { getPlannerCatalogProducts } from "@/app/planner/plannerProducts";

export default async function PlannerSavedPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const products = await getPlannerCatalogProducts();
  const { id } = await params;

  return (
    <div className="flex h-screen flex-1 flex-col overflow-hidden">
      <SmartdrawPlanner catalogProducts={products} initialSaveId={id} />
    </div>
  );
}
