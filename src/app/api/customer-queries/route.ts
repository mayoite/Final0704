import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/db";
import { rateLimit } from "@/lib/rateLimit";
import { z } from "zod";

/* ── Zod Schema ────────────────────────── */
const CustomerQuerySchema = z
  .object({
    name: z.string().min(1, "Name is required").max(180),
    company: z.string().max(180).optional(),
    email: z.string().email("Invalid email").max(180).optional(),
    phone: z.string().max(50).optional(),
    preferredContact: z
      .enum(["email", "whatsapp", "phone", "any"])
      .default("any"),
    message: z.string().min(1, "Message is required").max(5000),
    requirement: z.string().max(300).optional(),
    budget: z.string().max(120).optional(),
    timeline: z.string().max(120).optional(),
    source: z.string().max(60).default("website"),
    sourcePath: z.string().max(200).optional(),
  })
  .refine((data) => data.email || data.phone, {
    message: "Provide at least one contact method (email or phone).",
  });

function getRequestIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("cf-connecting-ip") || "127.0.0.1";
}

export async function POST(req: NextRequest) {
  const ip = getRequestIp(req);
  const limitRes = rateLimit(`customer-queries:${ip}`, 6, 60 * 60 * 1000);
  if (!limitRes.success) {
    return NextResponse.json(
      { error: "Too many submissions. Please try again after some time." },
      {
        status: 429,
        headers: {
          "X-RateLimit-Reset": limitRes.reset.toString(),
        },
      },
    );
  }

  const raw = await req.json().catch(() => ({}));
  const parsed = CustomerQuerySchema.safeParse(raw);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  }

  const {
    name, company, email, phone,
    preferredContact, message, requirement,
    budget, timeline, source, sourcePath,
  } = parsed.data;

  const normalizePhoneForWhatsApp = (v: string) => v.replace(/[^\d]/g, "");

  const { data, error } = await supabase
    .from("customer_queries")
    .insert({
      name,
      company: company || null,
      email: email || null,
      phone: phone || null,
      preferred_contact: preferredContact,
      message,
      requirement: requirement || null,
      budget: budget || null,
      timeline: timeline || null,
      source,
      source_path: sourcePath || null,
    })
    .select("id, created_at, email, phone")
    .single();

  if (error || !data) {
    console.error("customer_queries insert failed:", error?.message || "unknown");
    return NextResponse.json(
      { error: "Unable to save query right now." },
      { status: 500 },
    );
  }

  const whatsappPhone = data.phone ? normalizePhoneForWhatsApp(data.phone) : "";
  const queryId = data.id;
  const queryRefText = encodeURIComponent(
    `Hello, we received your query ${queryId}.`,
  );

  return NextResponse.json(
    {
      success: true,
      queryId,
      createdAt: data.created_at,
      followUp: {
        email: data.email ? `mailto:${data.email}?subject=Query%20${queryId}` : null,
        whatsapp:
          whatsappPhone.length >= 8
            ? `https://wa.me/${whatsappPhone}?text=${queryRefText}`
            : null,
      },
    },
    { status: 201 },
  );
}
