import "server-only";

import { unstable_cache } from "next/cache";
import { supabase } from "./db";
import { normalizeAssetList, normalizeAssetPath } from "./assetPaths";
import { fetchNhostProducts } from "./nhostCatalog";
import { CATALOG_REVALIDATE_SECONDS } from "@/data/site/fallbacks";

// ── Supabase-sourced Product types ──────────────────────────────────────────

export interface ProductVariant {
    id: string;
    variantName: string;
    galleryImages: string[];
    threeDModelUrl?: string;
}

export interface ProductDetailedInfo {
    overview: string;
    features: string[];
    dimensions: string;
    materials: string[];
}

export interface ProductMetadata {
    source?: string;
    category?: string;
    subcategory?: string;
    categoryIdCanonical?: string;
    subcategoryId?: string;
    subcategoryLabel?: string;
    canonicalSlugV2?: string;
    canonicalSeriesId?: string;
    bifmaCertified?: boolean;
    warrantyYears?: number;
    sustainabilityScore?: number;
    tags?: string[];
    priceRange?: "budget" | "mid" | "premium" | "luxury";
    useCase?: string[];
    material?: string[];
    colorOptions?: string[];
    hasHeadrest?: boolean;
    isHeightAdjustable?: boolean;
    isStackable?: boolean;
    isNestable?: boolean;
    isBifoldable?: boolean;
    seriesId?: string;
    ai_alt_text?: string;
    aiAltText?: string;
}

export interface Product {
    id: string;
    category_id: string;
    series: string;
    name: string;
    slug: string;
    description?: string;
    images: string[];
    flagship_image?: string;
    // Fallback map layout
    map_layout?: string;
    features?: string[];
    finishes?: string[];
    "3d_model"?: string; // Optional 3D model path (e.g. .glb)
    metadata?: ProductMetadata;
    specs: {
        dimensions: string;
        materials: string[];
        features: string[];
        sustainability_score?: number;
    };
    series_id: string;
    series_name: string;
    created_at: string;
    alt_text?: string;
}

// ── Compatibility types that match the old catalog.ts shape ─────────────────
// These let existing components work without changes to their prop types.

export interface CompatProduct {
    id: string;
    slug?: string;
    name: string;
    description: string;
    flagshipImage: string;
    sceneImages: string[];
    variants: ProductVariant[];
    detailedInfo: ProductDetailedInfo;
    metadata: ProductMetadata;
    "3d_model"?: string;
    threeDModelUrl?: string;
    technicalDrawings?: string[];
    documents?: string[];
    images?: string[];
    altText?: string;
    specs?: Record<string, unknown>;
}

export interface CompatSeries {
    id: string;
    name: string;
    description: string;
    products: CompatProduct[];
}

export interface CompatCategory {
    id: string;
    name: string;
    description: string;
    series: CompatSeries[];
}

/** Map a Supabase row to the shape the old catalog.ts used */
function toCompatProduct(p: Product): CompatProduct {
    const specsObject =
        p.specs && typeof p.specs === "object" && !Array.isArray(p.specs)
            ? (p.specs as Record<string, unknown>)
            : {};
    const specsDimensions =
        typeof specsObject.dimensions === "string" ? specsObject.dimensions.trim() : "";
    const specsMaterials = Array.isArray(specsObject.materials)
        ? specsObject.materials
              .map((item) => String(item).trim())
              .filter(Boolean)
        : [];
    const specsFeatures = Array.isArray(specsObject.features)
        ? specsObject.features
              .map((item) => String(item).trim())
              .filter(Boolean)
        : [];
    const modelPath = normalizeAssetPath(p["3d_model"]);
    const explicitAlt =
        p.alt_text ||
        p.metadata?.ai_alt_text ||
        p.metadata?.aiAltText ||
        `${p.name} product image`;
    const normalizedImages = normalizeAssetList(p.images);
    const normalizedFlagshipImage = normalizeAssetPath(p.flagship_image);

    return {
        id: p.id,
        slug: p.slug,
        name: p.name,
        description: p.description || "",
        flagshipImage: normalizedFlagshipImage,
        sceneImages: [],
        variants: [],
        detailedInfo: {
            overview: p.description || "",
            features: specsFeatures,
            dimensions: specsDimensions,
            materials: specsMaterials,
        },
        metadata: {
            ...(p.metadata ?? {}),
            sustainabilityScore: p.specs?.sustainability_score ?? 5, // fallback if missing
        },
        "3d_model": modelPath,
        threeDModelUrl: modelPath,
        images: normalizedImages,
        altText: explicitAlt.replace(/\s+/g, " ").trim().slice(0, 140),
        specs: specsObject,
    };
}

// ── Query helpers ──────────────────────────────────────────────────────────

/** Fetch ALL products from Supabase */
async function fetchAllProductsLive(): Promise<Product[]> {
    const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("name", { ascending: true });

    if (error) {
        console.error("[getProducts] Supabase error:", error.message);
        const nhostProducts = await fetchNhostProducts();
        if (nhostProducts && nhostProducts.length > 0) {
            return nhostProducts.map((p) => ({
                ...p,
                images: normalizeAssetList(p.images),
                flagship_image: normalizeAssetPath(p.flagship_image),
                "3d_model": normalizeAssetPath(p["3d_model"]),
            }));
        }
        return [];
    }
    return ((data ?? []) as Product[]).map(p => ({
        ...p,
        images: normalizeAssetList(p.images),
        flagship_image: normalizeAssetPath(p.flagship_image),
        "3d_model": normalizeAssetPath(p["3d_model"]),
        category_id: p.category_id,
    }));
}

const getCachedProducts = unstable_cache(fetchAllProductsLive, ["catalog-products-v2"], {
    revalidate: CATALOG_REVALIDATE_SECONDS,
    tags: ["catalog", "catalog-products"],
});

export async function getProducts(): Promise<Product[]> {
    return getCachedProducts();
}

/** Fetch products filtered by category id, with category join */
async function fetchProductsByCategoryLive(categoryId: string): Promise<Product[]> {
    const { data, error } = await supabase
        .from("products")
        .select("*, categories(name)")
        .eq("category_id", categoryId)
        .order("name", { ascending: true });

    if (error) {
        console.error("[getProductsByCategory] Supabase error:", error.message);
        const nhostProducts = await fetchNhostProducts({ categoryId });
        if (nhostProducts && nhostProducts.length > 0) {
            return nhostProducts.map((p) => ({
                ...p,
                images: normalizeAssetList(p.images),
                flagship_image: normalizeAssetPath(p.flagship_image),
                "3d_model": normalizeAssetPath(p["3d_model"]),
            }));
        }
        return [];
    }
    return ((data ?? []) as Product[]).map(p => ({
        ...p,
        images: normalizeAssetList(p.images),
        flagship_image: normalizeAssetPath(p.flagship_image),
        "3d_model": normalizeAssetPath(p["3d_model"]),
        category_id: p.category_id,
    }));
}

const getCachedProductsByCategory = unstable_cache(
    async (categoryId: string) => fetchProductsByCategoryLive(categoryId),
    ["catalog-products-by-category-v2"],
    {
        revalidate: CATALOG_REVALIDATE_SECONDS,
        tags: ["catalog", "catalog-products"],
    },
);

export async function getProductsByCategory(categoryId: string): Promise<Product[]> {
    return getCachedProductsByCategory(categoryId);
}

/** Fetch a single product by its product URL key (stored internally in `slug`). */
async function fetchProductByUrlKeyLive(productUrlKey: string): Promise<Product | null> {
    const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("slug", productUrlKey)
        .single();

    if (error) {
        console.error("[getProductByUrlKey] Supabase error:", error.message);
        const nhostProducts = await fetchNhostProducts({ productUrlKey });
        if (nhostProducts && nhostProducts.length > 0) {
            const nhostProduct = nhostProducts[0];
            return {
                ...nhostProduct,
                images: normalizeAssetList(nhostProduct.images),
                flagship_image: normalizeAssetPath(nhostProduct.flagship_image),
                "3d_model": normalizeAssetPath(nhostProduct["3d_model"]),
            };
        }
        return null;
    }
    if (!data) return null;
    const row = data as Product;
    return {
        ...row,
        images: normalizeAssetList(row.images),
        flagship_image: normalizeAssetPath(row.flagship_image),
        "3d_model": normalizeAssetPath(row["3d_model"]),
    };
}

const getCachedProductByUrlKey = unstable_cache(
    async (productUrlKey: string) => fetchProductByUrlKeyLive(productUrlKey),
    ["catalog-product-by-url-key-v2"],
    {
        revalidate: CATALOG_REVALIDATE_SECONDS,
        tags: ["catalog", "catalog-products"],
    },
);

export async function getProductByUrlKey(productUrlKey: string): Promise<Product | null> {
    return getCachedProductByUrlKey(productUrlKey);
}

/** Backward-compatible alias. Prefer `getProductByUrlKey` in new code. */
export async function getProductBySlug(slug: string): Promise<Product | null> {
    return getProductByUrlKey(slug);
}

interface CategoryRow {
    id: string;
    name: string;
}

const CATALOG_FETCH_RETRIES = 3;
const CATALOG_RETRY_DELAY_MS = 500;
const CATALOG_FAILURE_COOLDOWN_MS = 60_000;

let lastCatalogFailureAt = 0;
const loggedCatalogErrors = new Set<string>();

function summarizeSupabaseError(message?: string): string {
    if (!message) return "Unknown Supabase error";
    const singleLine = message.replace(/\s+/g, " ").trim();
    return singleLine.length > 260 ? `${singleLine.slice(0, 260)}...` : singleLine;
}

function isTransientCatalogError(message?: string): boolean {
    if (!message) return false;
    const normalized = message.toLowerCase();
    return (
        normalized.includes("ssl handshake failed") ||
        normalized.includes("error code 525") ||
        normalized.includes("fetch failed") ||
        normalized.includes("network") ||
        normalized.includes("timeout") ||
        normalized.includes("<!doctype html") ||
        normalized.includes("<html") ||
        normalized.includes("cloudflare") ||
        normalized.includes("origin is unreachable") ||
        normalized.includes("temporarily unavailable")
    );
}

function wait(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Fetch all products and group them into the old Category[] shape.
 *  This is the main bridge used by pages during migration. */
async function buildCatalogLive(): Promise<CompatCategory[]> {
    let categories: CategoryRow[] = [];
    let products: Product[] = [];
    let lastError = "";

    const now = Date.now();
    const hasRecentFailure =
        lastCatalogFailureAt > 0 && now - lastCatalogFailureAt < CATALOG_FAILURE_COOLDOWN_MS;
    if (hasRecentFailure) {
        return [];
    }

    for (let attempt = 1; attempt <= CATALOG_FETCH_RETRIES; attempt += 1) {
        const [catRes, prodRes] = await Promise.all([
            supabase.from("categories").select("*"),
            supabase.from("products").select("*, categories(name)").order("name", { ascending: true }),
        ]);

        const categoryError = catRes.error?.message;
        const productError = prodRes.error?.message;

        if (!categoryError && !productError) {
            categories = catRes.data as CategoryRow[];
            products = prodRes.data as Product[];
            lastCatalogFailureAt = 0;
            break;
        }

        const summarizedCategoryError = summarizeSupabaseError(categoryError);
        const summarizedProductError = summarizeSupabaseError(productError);
        const combinedError = categoryError || productError || "Unknown fetch error";
        lastError = combinedError;

        if (categoryError) {
            console.error(`[getCatalog] Categories error (attempt ${attempt}/${CATALOG_FETCH_RETRIES}):`, summarizedCategoryError);
        }
        if (productError) {
            console.error(`[getCatalog] Products error (attempt ${attempt}/${CATALOG_FETCH_RETRIES}):`, summarizedProductError);
        }

        if (attempt < CATALOG_FETCH_RETRIES && isTransientCatalogError(combinedError)) {
            await wait(CATALOG_RETRY_DELAY_MS * attempt);
            continue;
        }

        const summarized = summarizeSupabaseError(combinedError);
        lastCatalogFailureAt = Date.now();
        if (!loggedCatalogErrors.has(summarized)) {
            loggedCatalogErrors.add(summarized);
            console.error(`[getCatalog] failed: ${summarized}`);
        }
        break;
    }

    if (categories.length === 0 && products.length === 0 && lastError) {
        const nhostProducts = await fetchNhostProducts();
        if (nhostProducts && nhostProducts.length > 0) {
            products = nhostProducts;
            const categoryIds = [...new Set(nhostProducts.map((p) => p.category_id).filter(Boolean))];
            categories = categoryIds.map((id) => ({ id, name: id }));
            lastCatalogFailureAt = 0;
        } else {
            const summarized = summarizeSupabaseError(lastError);
            lastCatalogFailureAt = Date.now();
            if (!loggedCatalogErrors.has(summarized)) {
                loggedCatalogErrors.add(summarized);
                console.error(`[getCatalog] failed: ${summarized}`);
            }
            return [];
        }
    }

    // Group by category, then by series
    const catMap = new Map<string, { info: CategoryRow; products: Product[] }>();

    for (const cat of categories) {
        catMap.set(cat.id, { info: cat, products: [] });
    }

    for (const p of products) {
        const catId = p.category_id;
        if (!catMap.has(catId)) {
            // Should not happen if data is clean, but handle gracefully
            continue;
        }
        catMap.get(catId)!.products.push(p);
    }

    const result: CompatCategory[] = [];

    for (const [catId, catData] of catMap) {
        if (catData.products.length === 0) continue;

        // Group products by series
        const seriesMap = new Map<string, Product[]>();
        for (const p of catData.products) {
            const sId = p.series_id || `${catId}-series`;
            if (!seriesMap.has(sId)) seriesMap.set(sId, []);
            seriesMap.get(sId)!.push(p);
        }

        const series: CompatSeries[] = [];
        for (const [sId, sProducts] of seriesMap) {
            series.push({
                id: sId,
                name: sProducts[0]?.series_name || "Series",
                description: `Premium ${catData.info.name.toLowerCase()} solutions`,
                products: sProducts.map(toCompatProduct),
            });
        }

        result.push({
            id: catId,
            name: catData.info.name,
            description: `Professional furniture systems for ${catData.info.name.toLowerCase()}`,
            series,
        });
    }

    if (result.length === 0) {
        const msg = "Supabase catalog returned no usable categories";
        if (!loggedCatalogErrors.has(msg)) {
            loggedCatalogErrors.add(msg);
            console.error(`[getCatalog] ${msg}`);
        }
        return [];
    }
    return result;
}

const getCachedCatalog = unstable_cache(buildCatalogLive, ["catalog-tree-v2"], {
    revalidate: CATALOG_REVALIDATE_SECONDS,
    tags: ["catalog", "catalog-tree"],
});

export async function getCatalog(): Promise<CompatCategory[]> {
    return getCachedCatalog();
}

/** Get all unique category IDs from Supabase (for generateStaticParams) */
export async function getCategoryIds(): Promise<string[]> {
    const { data, error } = await supabase
        .from("products")
        .select("category_id")
        .order("category_id");

    if (error) {
        console.error("[getCategoryIds] Supabase error:", error.message);
        const nhostProducts = await fetchNhostProducts();
        if (!nhostProducts || nhostProducts.length === 0) return [];
        return [...new Set(nhostProducts.map((p) => p.category_id).filter(Boolean))];
    }

    const unique: string[] = [
        ...new Set(
            (data ?? [])
                .map((r: { category_id?: string | null }) => (typeof r.category_id === "string" ? r.category_id : ""))
                .filter(Boolean),
        ),
    ];
    return unique;
}
