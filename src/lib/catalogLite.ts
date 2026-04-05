import { createClient } from "@supabase/supabase-js";

export type CatalogLiteProduct = {
  id: string;
  slug: string;
  name: string;
  description: string;
  category_id: string;
  series_name: string;
  metadata: Record<string, unknown>;
};

function createCatalogClient() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ??
    process.env.SUPABASE_URL?.trim() ??
    "";
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ??
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ??
    "";

  if (!supabaseUrl || !supabaseKey) return null;

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

function toText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function toMetadata(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as Record<string, unknown>;
}

export async function fetchCatalogLiteProducts(
  limit?: number,
): Promise<CatalogLiteProduct[]> {
  const client = createCatalogClient();
  if (!client) return [];

  let query = client
    .from("products")
    .select("id, slug, name, description, category_id, series_name, metadata")
    .order("name", { ascending: true });

  if (typeof limit === "number" && Number.isFinite(limit) && limit > 0) {
    query = query.limit(Math.floor(limit));
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(error.message);
  }

  return (data ?? [])
    .map((row) => {
      const id = toText(row?.id);
      const slug = toText(row?.slug);
      const name = toText(row?.name);
      const categoryId = toText(row?.category_id);
      if (!id || !slug || !name || !categoryId) return null;

      return {
        id,
        slug,
        name,
        description: toText(row?.description),
        category_id: categoryId,
        series_name: toText(row?.series_name),
        metadata: toMetadata(row?.metadata),
      } satisfies CatalogLiteProduct;
    })
    .filter((item): item is CatalogLiteProduct => Boolean(item));
}
