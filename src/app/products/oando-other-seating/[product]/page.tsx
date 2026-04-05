import { redirect } from "next/navigation";

export default async function OandoOtherSeatingProductPage({
  params,
}: {
  params: Promise<{ product: string }>;
}) {
  const { product } = await params;
  redirect(`/products/seating/${product}`);
}
