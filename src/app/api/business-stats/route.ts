import { NextResponse } from "next/server";
import { getBusinessStats } from "@/lib/businessStats";

export async function GET(request: Request) {
  // `?live=1` bypasses cache and forces a fresh read. Useful for ops diagnostics.
  const forceLive = new URL(request.url).searchParams.get("live") === "1";
  const payload = await getBusinessStats({ forceLive });

  return NextResponse.json(payload, {
    status: 200,
    headers: {
      "Cache-Control": "s-maxage=300, stale-while-revalidate=3600",
    },
  });
}
