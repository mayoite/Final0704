import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabaseAdmin";

type QueryStatus = "new" | "in_progress" | "closed" | "spam";
type FollowUpChannel = "email" | "whatsapp" | "phone" | "none";

type PatchPayload = {
  id?: string;
  status?: QueryStatus;
  followUpChannel?: FollowUpChannel;
  followUpTarget?: string;
  followUpNotes?: string;
};

const allowedStatuses: QueryStatus[] = ["new", "in_progress", "closed", "spam"];
const allowedFollowUpChannels: FollowUpChannel[] = [
  "email",
  "whatsapp",
  "phone",
  "none",
];

function normalizeText(value: unknown, max = 5000): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, max);
}

function isAuthorized(req: NextRequest): boolean {
  const required = process.env.CUSTOMER_QUERIES_ADMIN_TOKEN?.trim();
  if (!required) return false;

  const provided = req.headers.get("x-admin-token")?.trim() || "";
  return provided.length > 0 && provided === required;
}

function ensureAuthorized(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

export async function GET(req: NextRequest) {
  const unauthorized = ensureAuthorized(req);
  if (unauthorized) return unauthorized;

  const statusFilter = normalizeText(req.nextUrl.searchParams.get("status"), 20);
  const limitRaw = Number(req.nextUrl.searchParams.get("limit") || "100");
  const limit = Number.isFinite(limitRaw)
    ? Math.max(1, Math.min(limitRaw, 200))
    : 100;

  try {
    const supabaseAdmin = createSupabaseAdminClient();
    let query = supabaseAdmin
      .from("customer_queries")
      .select(
        "id, created_at, updated_at, source, source_path, name, company, email, phone, preferred_contact, message, requirement, budget, timeline, status, followup_channel, followup_target, followup_notes",
      )
      .order("created_at", { ascending: false })
      .limit(limit);

    if (allowedStatuses.includes(statusFilter as QueryStatus)) {
      query = query.eq("status", statusFilter);
    }

    const { data, error } = await query;
    if (error) {
      console.error("customer_queries list failed:", error.message);
      return NextResponse.json({ error: "Unable to load queries." }, { status: 500 });
    }

    return NextResponse.json({ items: data ?? [] });
  } catch (error) {
    console.error("customer_queries list exception:", error);
    return NextResponse.json({ error: "Unable to load queries." }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const unauthorized = ensureAuthorized(req);
  if (unauthorized) return unauthorized;

  let payload: PatchPayload = {};
  try {
    payload = (await req.json()) as PatchPayload;
  } catch {
    payload = {};
  }

  const id = normalizeText(payload.id, 80);
  const status = normalizeText(payload.status, 20) as QueryStatus;
  const followUpChannel = normalizeText(
    payload.followUpChannel,
    20,
  ) as FollowUpChannel;
  const followUpTarget = normalizeText(payload.followUpTarget, 250);
  const followUpNotes = normalizeText(payload.followUpNotes, 2000);

  if (!id) {
    return NextResponse.json({ error: "Missing query id." }, { status: 400 });
  }

  if (!allowedStatuses.includes(status)) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }

  if (!allowedFollowUpChannels.includes(followUpChannel)) {
    return NextResponse.json(
      { error: "Invalid follow-up channel." },
      { status: 400 },
    );
  }

  try {
    const supabaseAdmin = createSupabaseAdminClient();
    const { data, error } = await supabaseAdmin
      .from("customer_queries")
      .update({
        status,
        followup_channel: followUpChannel,
        followup_target: followUpTarget || null,
        followup_notes: followUpNotes || null,
      })
      .eq("id", id)
      .select(
        "id, created_at, updated_at, source, source_path, name, company, email, phone, preferred_contact, message, requirement, budget, timeline, status, followup_channel, followup_target, followup_notes",
      )
      .single();

    if (error) {
      console.error("customer_queries update failed:", error.message);
      return NextResponse.json({ error: "Unable to update query." }, { status: 500 });
    }

    return NextResponse.json({ item: data });
  } catch (error) {
    console.error("customer_queries update exception:", error);
    return NextResponse.json({ error: "Unable to update query." }, { status: 500 });
  }
}
