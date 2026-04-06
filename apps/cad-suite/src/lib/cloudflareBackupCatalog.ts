import "server-only";

import type { Product, ProductMetadata } from "@/lib/getProducts";
import { normalizeAssetList, normalizeAssetPath } from "@/lib/assetPaths";
import { repairProductSlug } from "@/lib/catalogSlug";

type BackupProductRow = {
  id?: string | null;
  category_id?: string | null;
  series?: string | null;
  name?: string | null;
  slug?: string | null;
  description?: string | null;
  images?: unknown;
  flagship_image?: string | null;
  map_layout?: string | null;
  features?: unknown;
  finishes?: unknown;
  metadata?: ProductMetadata | null;
  specs?: unknown;
  series_id?: string | null;
  series_name?: string | null;
  created_at?: string | null;
  alt_text?: string | null;
};

interface D1PreparedStatement {
  bind: (...values: unknown[]) => D1PreparedStatement;
  all: <T = unknown>() => Promise<{ results?: T[] }>;
}

interface D1LikeDatabase {
  prepare: (sql: string) => D1PreparedStatement;
}

let loggedCloudflareCatalogError = false;

function isEnabled(): boolean {
  return process.env.CLOUDFLARE_BACKUP_ENABLED === "true";
}

async function getBackupDb(): Promise<D1LikeDatabase | null> {
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const context = await getCloudflareContext({ async: true });
    const bindingName = process.env.CLOUDFLARE_BACKUP_D1_BINDING?.trim() || "CATALOG_BACKUP_D1";
    const db = (context.env as Record<string, unknown>)[bindingName];
    if (!db || typeof db !== "object" || !("prepare" in (db as object))) return null;
    return db as D1LikeDatabase;
  } catch {
    return null;
  }
}

function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => String(item || "").trim()).filter(Boolean);
  }
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed.map((item) => String(item || "").trim()).filter(Boolean);
      }
    } catch {
      return [];
    }
  }
  return [];
}

function parseMaybeJsonObject(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return parsed as Record<string, unknown>;
      }
    } catch {
      return {};
    }
  }
  return {};
}

function toSpecs(value: unknown): Product["specs"] {
  const source = parseMaybeJsonObject(value);
  return {
    dimensions: typeof source.dimensions === "string" ? source.dimensions.trim() : "",
    materials: toStringArray(source.materials),
    features: toStringArray(source.features),
    sustainability_score:
      typeof source.sustainability_score === "number" ? source.sustainability_score : undefined,
  };
}

function toMetadata(value: unknown): ProductMetadata | undefined {
  const metadata = parseMaybeJsonObject(value);
  return Object.keys(metadata).length > 0 ? (metadata as ProductMetadata) : undefined;
}

function toProduct(row: BackupProductRow): Product | null {
  const repairedSlug = repairProductSlug({
    slug: row.slug,
    categoryId: row.category_id,
    name: row.name,
  });
  if (!row.id || !repairedSlug || !row.name || !row.category_id) return null;

  return {
    id: row.id,
    category_id: row.category_id,
    series: row.series || row.series_name || "",
    name: row.name,
    slug: repairedSlug,
    description: row.description || "",
    images: normalizeAssetList(toStringArray(row.images)),
    flagship_image: normalizeAssetPath(row.flagship_image),
    map_layout: row.map_layout || undefined,
    features: toStringArray(row.features),
    finishes: toStringArray(row.finishes),
    "3d_model": undefined,
    metadata: toMetadata(row.metadata),
    specs: toSpecs(row.specs),
    series_id: row.series_id || `${row.category_id}-series`,
    series_name: row.series_name || "Series",
    created_at: row.created_at || new Date().toISOString(),
    alt_text: row.alt_text || undefined,
  };
}

async function queryProducts(db: D1LikeDatabase, sql: string, params: unknown[] = []) {
  const statement = db.prepare(sql).bind(...params);
  const result = await statement.all<BackupProductRow>();
  return (result.results ?? []).map(toProduct).filter((item): item is Product => Boolean(item));
}

export async function fetchCloudflareBackupProducts(options?: {
  categoryId?: string;
  productUrlKey?: string;
}): Promise<Product[] | null> {
  if (!isEnabled()) return null;

  const db = await getBackupDb();
  if (!db) return null;

  try {
    if (options?.productUrlKey) {
      let products = await queryProducts(
        db,
        "select * from products where slug = ? order by name asc",
        [options.productUrlKey],
      );
      if (products.length > 0) return products;

      const aliasResult = await db
        .prepare(
          "select canonical_slug from product_slug_aliases where alias_slug = ? and is_active = 1 limit 1",
        )
        .bind(options.productUrlKey)
        .all<{ canonical_slug?: string | null }>();
      const canonicalSlug = String(aliasResult.results?.[0]?.canonical_slug || "").trim();
      if (!canonicalSlug) return [];

      products = await queryProducts(
        db,
        "select * from products where slug = ? order by name asc",
        [canonicalSlug],
      );
      return products;
    }

    if (options?.categoryId) {
      return queryProducts(
        db,
        "select * from products where category_id = ? order by name asc",
        [options.categoryId],
      );
    }

    return queryProducts(db, "select * from products order by name asc");
  } catch (error) {
    if (!loggedCloudflareCatalogError) {
      loggedCloudflareCatalogError = true;
      const reason = error instanceof Error ? error.message : String(error);
      console.error(`[cloudflare-backup-catalog] fallback fetch failed: ${reason}`);
    }
    return null;
  }
}
