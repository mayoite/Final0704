import { getCatalog } from "@/lib/getProducts";
import { SmartdrawPlanner } from "@/components/draw/SmartdrawPlanner";

export default async function PlannerPage() {
  const catalog = await getCatalog();
  // Flatten products for the planner
  const products = catalog.flatMap((cat) => 
    cat.series.flatMap((ser) => ser.products)
  ).map(p => ({
    ...p,
    price: p.metadata.priceRange === "premium" ? 45000 : 25000, // Fallback price logic
    category: p.metadata.category || "Workstations"
  }));

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden">
      <SmartdrawPlanner catalogProducts={products} />
    </div>
  );
}
