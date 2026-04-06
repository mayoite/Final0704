import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/db";
import { createSupabaseAdminClient } from "@/lib/supabaseAdmin";

type TrackingPayload = {
  productId?: string;
  userId?: string;
};

async function parseTrackingPayload(req: NextRequest): Promise<TrackingPayload> {
  try {
    return (await req.json()) as TrackingPayload;
  } catch {
    return {};
  }
}

function getBearerToken(req: NextRequest): string | null {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) return null;

  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  if (!match?.[1]) return null;

  return match[1].trim();
}

function normalizeId(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.trim();
}

function isMissingUserHistoryTable(message: string): boolean {
  const normalized = message.toLowerCase();
  return (
    normalized.includes("could not find the table") &&
    normalized.includes("public.user_history")
  );
}

async function resolveUserId(req: NextRequest, bodyUserId: string): Promise<string> {
  const token = getBearerToken(req);
  if (token) {
    const { data: authData } = await supabase.auth.getUser(token);
    const authUserId = normalizeId(authData?.user?.id);
    if (authUserId) return authUserId;
  }

  if (bodyUserId) return bodyUserId;
  return `anon_${randomUUID()}`;
}

export async function POST(req: NextRequest) {
  try {
    const payload = await parseTrackingPayload(req);
    const productId = normalizeId(payload.productId);
    const incomingUserId = normalizeId(payload.userId);

    if (!productId) {
      return NextResponse.json({ error: "Missing productId" }, { status: 400 });
    }

    const userId = await resolveUserId(req, incomingUserId);
    const supabaseAdmin = createSupabaseAdminClient();

    // Write-path safety: tracking is intentionally Supabase-only.
    const { data, error } = await supabaseAdmin
      .from("user_history")
      .select("viewed_products")
      .eq("user_id", userId)
      .maybeSingle();

    if (error && !isMissingUserHistoryTable(error.message)) {
      console.error("Supabase fetch error:", error.message);
    }

    const existing = Array.isArray(data?.viewed_products)
      ? data.viewed_products.filter((item): item is string => typeof item === "string")
      : [];

    const withoutDuplicate = existing.filter((item) => item !== productId);
    const viewedProducts = [...withoutDuplicate, productId].slice(-10);

    const { error: upsertError } = await supabaseAdmin
      .from("user_history")
      .upsert(
        {
          user_id: userId,
          viewed_products: viewedProducts,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" },
      );

    if (upsertError) {
      if (isMissingUserHistoryTable(upsertError.message)) {
        return NextResponse.json({ success: true, userId, viewedProducts });
      }
      console.error("Supabase upsert error:", upsertError.message);
      return NextResponse.json({ error: "Tracking failed" }, { status: 500 });
    }

    return NextResponse.json({ success: true, userId, viewedProducts });
  } catch (err) {
    console.error("Tracking API Error:", err);
    return NextResponse.json({ error: "Tracking failed" }, { status: 500 });
  }
}
