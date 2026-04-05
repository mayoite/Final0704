import { getCatalog } from "@/lib/getProducts";
import type { CompatCategory } from "@/lib/getProducts";
import { notFound, redirect } from "next/navigation";
import { Hero } from "@/components/home/Hero";
import { FilterGrid } from "./FilterGrid";
import { supabase } from "@/lib/db";
import { fetchWithSupabaseRetry } from "@/lib/supabaseSafe";
import type { Metadata } from "next";
import { Suspense } from "react";
import {
  Catalog_CATEGORY_ORDER,
  buildRequestedCategoryCatalog,
  getCatalogCategoryDescription,
  getCatalogCategoryLabel,
  normalizeRequestedCategoryId,
} from "@/lib/catalogCategories";
import { SITE_URL } from "@/lib/siteUrl";
import { CATEGORY_ROUTE_COPY } from "@/data/site/routeCopy";
import { buildBreadcrumbJsonLd, buildPageJsonLd, buildPageMetadata } from "@/data/site/seo";

const BASE_URL = SITE_URL;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category: categoryId } = await params;
  const canonicalCategoryId = normalizeRequestedCategoryId(categoryId) || categoryId;
  const requestedCatalog = buildRequestedCategoryCatalog(await getCatalog());
  const category = requestedCatalog.find(
    (c: CompatCategory) => c.id === canonicalCategoryId,
  );
  if (!category) return {};
  const displayName = getCatalogCategoryLabel(canonicalCategoryId, category.name);
  const displayDescription = getCatalogCategoryDescription(
    canonicalCategoryId,
    category.description,
  );
  const title = displayName;
  const description = `${displayDescription} ${CATEGORY_ROUTE_COPY.metadataTail.replace(
    "{category}",
    displayName.toLowerCase(),
  )}`;
  return buildPageMetadata(BASE_URL, {
    title,
    description,
    path: `/products/${canonicalCategoryId}`,
  });
}

export async function generateStaticParams() {
  const data = await fetchWithSupabaseRetry<Array<{ category_id: string | null }>>(
    "category-static-params",
    async () => supabase.from("products").select("category_id"),
    [],
  );
  const categoryIds = [
    ...new Set(
      (data ?? [])
        .map((p) => (p.category_id ? normalizeRequestedCategoryId(p.category_id) : null))
        .filter(Boolean),
    ),
  ] as string[];
  const merged = [...new Set([...Catalog_CATEGORY_ORDER, ...categoryIds])];
  return merged.map((category) => ({ category }));
}

// Loading skeleton for the grid while Supabase data resolves
function GridSkeleton() {
  return (
    <div className="container-wide py-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="aspect-4/3 animate-pulse rounded-giant border scheme-border bg-panel"
          />
        ))}
      </div>
    </div>
  );
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category: categoryId } = await params;
  const canonicalCategoryId = normalizeRequestedCategoryId(categoryId);
  if (!canonicalCategoryId) {
    notFound();
  }
  if (canonicalCategoryId !== categoryId) {
    redirect(`/products/${canonicalCategoryId}`);
  }
  const requestedCatalog = buildRequestedCategoryCatalog(await getCatalog());
  const category = requestedCatalog.find(
    (c: CompatCategory) => c.id === canonicalCategoryId,
  );

  if (requestedCatalog.length === 0) {
    return (
      <div className="scheme-page flex min-h-screen flex-col items-center justify-center p-8 text-center">
        <div className="scheme-panel rounded-[1.8rem] border px-8 py-10">
        <h1 className="mb-4 text-2xl font-light text-strong">
          {CATEGORY_ROUTE_COPY.offlineTitle}
        </h1>
        <p className="mb-8 max-w-md text-muted">
          {CATEGORY_ROUTE_COPY.offlineDescription}
        </p>
        </div>
      </div>
    );
  }

  if (!category) {
    notFound();
  }
  const normalizedCategory: CompatCategory = {
    ...category,
    name: getCatalogCategoryLabel(canonicalCategoryId, category.name),
    description: getCatalogCategoryDescription(canonicalCategoryId, category.description),
  };

  const firstProductWithImage = normalizedCategory.series
    .flatMap((series) => series.products)
    .find((product) => product.images?.[0] || product.flagshipImage);
  const heroImage =
    firstProductWithImage?.images?.[0] ||
    firstProductWithImage?.flagshipImage ||
    "/images/hero/hero-1.webp";
  const categoryPath = `/products/${canonicalCategoryId}`;
  const categoryJsonLd = buildPageJsonLd(BASE_URL, {
    path: categoryPath,
    title: `${normalizedCategory.name} | ${CATEGORY_ROUTE_COPY.metadataSuffix}`,
    description: normalizedCategory.description,
    pageType: "CollectionPage",
  });
  const breadcrumbJsonLd = buildBreadcrumbJsonLd(BASE_URL, [
    { name: "Home", path: "/" },
    { name: "Products", path: "/products" },
    { name: normalizedCategory.name, path: categoryPath },
  ]);

  return (
    <div className="flex min-h-screen flex-col items-center scheme-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(categoryJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Hero
        variant="small"
        title={normalizedCategory.name}
        subtitle={normalizedCategory.description}
        showButton={false}
        backgroundImage={heroImage}
      />
      <Suspense fallback={<GridSkeleton />}>
        <FilterGrid category={normalizedCategory} categoryId={canonicalCategoryId} />
      </Suspense>
    </div>
  );
}


