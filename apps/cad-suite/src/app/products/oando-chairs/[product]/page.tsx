import { redirect } from "next/navigation";

export default async function OandoChairsProductPage({
  params,
}: {
  params: Promise<{ product: string }>;
}) {
  const { product } = await params;
  redirect(`/products/seating/${product}`);
}
