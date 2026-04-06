import { getCatalog } from "@/lib/getProducts";
import { SmartdrawPlanner } from "@/components/draw/SmartdrawPlanner";

export default async function DrawPage() {
  const catalog = await getCatalog();
  const products = catalog.flatMap((cat) => 
    cat.series.flatMap((ser) => ser.products)
  ).map(p => ({
    ...p,
    price: p.metadata.priceRange === "premium" ? 45000 : 25000,
    category: p.metadata.category || "Workstations"
  }));

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden">
      <SmartdrawPlanner catalogProducts={products} />
    </div>
  );
}
