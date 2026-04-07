import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import type { PlannerCatalogProduct } from "./plannerCatalogCore";
import {
  plannerManagedProductRowSchema,
  plannerManagedProductWriteSchema,
  type PlannerManagedProductRow,
  type PlannerManagedProductWrite,
} from "../model";
import { createClient as createServerSupabaseClient } from "@/lib/supabase/server";

function normalizePlannerManagedProductRow(row: unknown): PlannerManagedProductRow {
  const rowObject = row && typeof row === "object" && !Array.isArray(row) ? row : {};

  return plannerManagedProductRowSchema.parse({
    ...rowObject,
    images: Array.isArray((row as PlannerManagedProductRow | undefined)?.images)
      ? (row as PlannerManagedProductRow).images
      : [],
    specs:
      row && typeof row === "object" && !Array.isArray((row as { specs?: unknown }).specs)
        ? (row as { specs?: Record<string, unknown> }).specs
        : {},
    metadata:
      row && typeof row === "object" && !Array.isArray((row as { metadata?: unknown }).metadata)
        ? (row as { metadata?: Record<string, unknown> }).metadata
        : {},
  });
}

export function plannerManagedProductRowToCatalogProduct(row: PlannerManagedProductRow): PlannerCatalogProduct {
  const metadata = {
    ...row.metadata,
    plannerSourceSlug: row.planner_source_slug,
    plannerCatalogProductId: row.id,
    plannerCatalogSlug: row.slug,
    plannerCatalogCategoryId: row.category_id,
    plannerCatalogCategoryName: row.category_name,
    plannerCatalogSeriesId: row.series_id,
    plannerCatalogSeriesName: row.series_name,
    plannerManaged: true,
    legacyProductId: row.legacy_product_id,
  } satisfies Record<string, unknown>;

  return {
    id: row.id,
    slug: row.slug,
    plannerSourceSlug: row.planner_source_slug,
    name: row.name,
    category: row.category,
    categoryId: row.category_id,
    categoryName: row.category_name,
    seriesId: row.series_id,
    seriesName: row.series_name,
    description: row.description,
    price: row.price,
    flagship_image: row.flagship_image,
    images: row.images,
    specs: row.specs,
    metadata,
    altText: row.name,
    variants: [],
    detailedInfo: {
      overview: row.description,
      features: [],
      dimensions: typeof row.specs.dimensions === "string" ? row.specs.dimensions : "",
      materials: Array.isArray(row.specs.materials)
        ? row.specs.materials.filter((value): value is string => typeof value === "string")
        : [],
    },
    sceneImages: row.images,
    technicalDrawings: [],
    documents: [],
  };
}

async function resolveServerClient() {
  try {
    return await createServerSupabaseClient();
  } catch {
    return null;
  }
}

function isMissingPlannerManagedProductsTable(message: string): boolean {
  const normalized = message.toLowerCase();
  return (
    normalized.includes("planner_managed_products") &&
    (normalized.includes("could not find the table") ||
      normalized.includes("relation") && normalized.includes("does not exist"))
  );
}

export async function listPlannerManagedProductsForPlannerCatalog(): Promise<PlannerCatalogProduct[]> {
  const client = await resolveServerClient();
  if (!client) return [];

  const { data, error } = await client
    .from("planner_managed_products")
    .select("*")
    .eq("active", true)
    .order("updated_at", { ascending: false });

  if (error) {
    if (isMissingPlannerManagedProductsTable(error.message ?? "")) {
      // Deploy-safe fallback until planner-managed product migrations are applied.
      return [];
    }
    throw new Error(`Unable to load planner-managed products: ${error.message}`);
  }

  return (data ?? []).map((row) => plannerManagedProductRowToCatalogProduct(normalizePlannerManagedProductRow(row)));
}

export async function upsertPlannerManagedProduct(
  client: SupabaseClient,
  input: PlannerManagedProductWrite,
): Promise<PlannerManagedProductRow> {
  const payload = plannerManagedProductWriteSchema.parse(input);
  const { data, error } = await client
    .from("planner_managed_products")
    .upsert(payload)
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(`Unable to save planner-managed product: ${error?.message ?? "Unknown error"}`);
  }

  return normalizePlannerManagedProductRow(data);
}

export async function deletePlannerManagedProduct(client: SupabaseClient, id: string): Promise<boolean> {
  const { data, error } = await client
    .from("planner_managed_products")
    .delete()
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) {
    throw new Error(`Unable to delete planner-managed product: ${error.message}`);
  }

  return Boolean(data?.id);
}
