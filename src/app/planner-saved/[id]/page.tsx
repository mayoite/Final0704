import { SmartdrawPlannerShell } from "@/components/draw/SmartdrawPlannerShell";
import { getPlannerCatalogProductsSafe } from "@/app/planner/plannerProducts";

export default async function PlannerSavedPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const products = await getPlannerCatalogProductsSafe();
  const { id } = await params;

  return (
    <div className="flex h-screen flex-1 flex-col overflow-hidden">
      <SmartdrawPlannerShell catalogProducts={products} initialSaveId={id} />
    </div>
  );
}
