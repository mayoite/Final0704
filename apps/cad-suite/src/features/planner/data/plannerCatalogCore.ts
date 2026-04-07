import type { CatalogProduct, ProductSpecs } from "@/components/draw/types";
import { normalizeAssetList, normalizeAssetPath } from "@/lib/assetPaths";
import type { CompatCategory, CompatProduct } from "@/lib/getProducts";

export interface PlannerCatalogProduct extends CatalogProduct {
  id: string;
  slug: string;
  category: string;
  price: number;
  flagship_image: string;
  images: string[];
  specs: ProductSpecs;
  metadata: Record<string, unknown>;
  categoryId: string;
  categoryName: string;
  seriesId: string;
  seriesName: string;
  plannerSourceSlug: string;
}

export interface PlannerProductReference {
  productId?: string;
  productSlug?: string;
  plannerSourceSlug?: string;
}

export interface PlannerCatalogIndex {
  byId: Map<string, PlannerCatalogProduct>;
  bySlug: Map<string, PlannerCatalogProduct>;
  bySourceSlug: Map<string, PlannerCatalogProduct>;
}

function normalizeLookupKey(value: string | undefined | null): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed.toLowerCase() : null;
}

function pickFallbackPriceRange(product: CompatProduct) {
  return String(product.metadata?.priceRange ?? "").toLowerCase();
}

function resolvePlannerProductPrice(product: CompatProduct): number {
  const priceRange = pickFallbackPriceRange(product);

  if (priceRange === "budget") return 18000;
  if (priceRange === "mid") return 25000;
  if (priceRange === "premium") return 45000;
  if (priceRange === "luxury") return 65000;
  return 25000;
}

function resolvePlannerSourceSlug(product: CompatProduct): string {
  const slug = normalizeLookupKey(product.slug) ?? normalizeLookupKey(product.metadata?.canonicalSlugV2);
  return slug ?? product.id;
}

function resolvePlannerSpecs(product: CompatProduct): ProductSpecs {
  const specs =
    product.specs && typeof product.specs === "object" && !Array.isArray(product.specs)
      ? product.specs
      : {};

  return {
    ...specs,
    dimensions:
      typeof specs.dimensions === "string" && specs.dimensions.trim().length > 0
        ? specs.dimensions.trim()
        : product.detailedInfo.dimensions,
    features: Array.isArray(specs.features) && specs.features.length > 0 ? specs.features : product.detailedInfo.features,
    materials: Array.isArray(specs.materials) && specs.materials.length > 0 ? specs.materials : product.detailedInfo.materials,
  };
}

export function normalizePlannerCatalogProduct(
  category: CompatCategory,
  series: CompatCategory["series"][number],
  product: CompatProduct,
): PlannerCatalogProduct {
  const plannerSourceSlug = resolvePlannerSourceSlug(product);
  const flagshipImage = normalizeAssetPath(product.flagshipImage);
  const images = normalizeAssetList(product.images ?? product.sceneImages);
  const categoryName = category.name.trim();
  const seriesName = series.name.trim();
  const resolvedCategory = String((product.metadata?.category ?? categoryName) || "Workstations").trim() || "Workstations";
  const resolvedCategoryId = normalizeLookupKey(product.metadata?.categoryIdCanonical ?? category.id) ?? category.id;
  const resolvedSeriesId =
    normalizeLookupKey(product.metadata?.canonicalSeriesId ?? product.metadata?.seriesId ?? series.id) ?? series.id;
  const resolvedSlug =
    normalizeLookupKey(product.slug) ??
    normalizeLookupKey(product.metadata?.canonicalSlugV2) ??
    product.id;

  return {
    ...product,
    id: product.id,
    slug: resolvedSlug,
    name: product.name,
    category: resolvedCategory,
    price: resolvePlannerProductPrice(product),
    flagship_image: flagshipImage,
    images,
    specs: resolvePlannerSpecs(product),
    metadata: {
      ...product.metadata,
      plannerSourceSlug,
      plannerCatalogProductId: product.id,
      plannerCatalogSlug: resolvedSlug,
      plannerCatalogCategoryId: resolvedCategoryId,
      plannerCatalogCategoryName: categoryName,
      plannerCatalogSeriesId: resolvedSeriesId,
      plannerCatalogSeriesName: seriesName,
    },
    categoryId: resolvedCategoryId,
    categoryName,
    seriesId: resolvedSeriesId,
    seriesName,
    plannerSourceSlug,
  };
}

export function normalizePlannerCatalogProducts(catalog: CompatCategory[]): PlannerCatalogProduct[] {
  return catalog.flatMap((category) =>
    category.series.flatMap((series) =>
      series.products.map((product) => normalizePlannerCatalogProduct(category, series, product)),
    ),
  );
}

export function buildPlannerCatalogIndex(products: readonly PlannerCatalogProduct[]): PlannerCatalogIndex {
  const byId = new Map<string, PlannerCatalogProduct>();
  const bySlug = new Map<string, PlannerCatalogProduct>();
  const bySourceSlug = new Map<string, PlannerCatalogProduct>();

  for (const product of products) {
    const normalizedId = normalizeLookupKey(product.id);
    const normalizedSlug = normalizeLookupKey(product.slug);
    const normalizedSourceSlug = normalizeLookupKey(product.plannerSourceSlug);

    if (normalizedId && !byId.has(normalizedId)) byId.set(normalizedId, product);
    if (normalizedSlug && !bySlug.has(normalizedSlug)) bySlug.set(normalizedSlug, product);
    if (normalizedSourceSlug && !bySourceSlug.has(normalizedSourceSlug)) bySourceSlug.set(normalizedSourceSlug, product);
  }

  return { byId, bySlug, bySourceSlug };
}

export function resolvePlannerCatalogProductByReference(
  products: readonly PlannerCatalogProduct[],
  reference: PlannerProductReference | null | undefined,
): PlannerCatalogProduct | null {
  if (!reference) return null;
  const index = buildPlannerCatalogIndex(products);

  const candidateId = normalizeLookupKey(reference.productId);
  if (candidateId) {
    const byId = index.byId.get(candidateId);
    if (byId) return byId;
  }

  const candidateSlug = normalizeLookupKey(reference.productSlug);
  if (candidateSlug) {
    const bySlug = index.bySlug.get(candidateSlug);
    if (bySlug) return bySlug;
  }

  const candidateSourceSlug = normalizeLookupKey(reference.plannerSourceSlug);
  if (candidateSourceSlug) {
    const bySourceSlug = index.bySourceSlug.get(candidateSourceSlug);
    if (bySourceSlug) return bySourceSlug;
  }

  return null;
}

export function resolvePlannerCatalogProductById(
  products: readonly PlannerCatalogProduct[],
  productId: string,
): PlannerCatalogProduct | null {
  return resolvePlannerCatalogProductByReference(products, { productId });
}

export function resolvePlannerCatalogProductBySlug(
  products: readonly PlannerCatalogProduct[],
  productSlug: string,
): PlannerCatalogProduct | null {
  return resolvePlannerCatalogProductByReference(products, { productSlug });
}

