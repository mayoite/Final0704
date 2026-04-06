import { unstable_cache } from "next/cache";
import Link from "next/link";
import { CategoryImage } from "@/components/home/CategoryImage";
import { getCatalog } from "@/lib/getProducts";
import {
  buildRequestedCategoryCatalog,
  getCatalogCategoryHref,
  getCatalogCategoryLabel,
} from "@/lib/catalogCategories";
import { PRODUCTS_PAGE_COPY } from "@/data/site/routeCopy";

const getCachedCatalog = unstable_cache(async () => getCatalog(), ["home-category-grid-v2"], {
  revalidate: 3600,
  tags: ["catalog"],
});

export async function CategoryGrid() {
  const requestedCatalog = buildRequestedCategoryCatalog(await getCachedCatalog());

  return (
    <section className="scheme-page w-full py-20 md:py-28">
      <div className="container px-6 2xl:px-0">
        <div className="mb-12 max-w-2xl md:mb-16">
          <p className="typ-label mb-3 scheme-text-brand">
            {PRODUCTS_PAGE_COPY.rangeKicker}
          </p>
          <h2 className="typ-section max-w-xl scheme-text-strong">
            {PRODUCTS_PAGE_COPY.rangeTitle}
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {requestedCatalog.map((category) => {
            const allProducts = category.series.flatMap((series) => series.products);
            const categoryName = getCatalogCategoryLabel(category.id, category.name);
            const categoryHref = getCatalogCategoryHref(category.id);
            const firstProductWithImage = allProducts.find(
              (product) => (product.images && product.images.length > 0) || product.flagshipImage,
            );
            const flagshipImage =
              firstProductWithImage?.images?.[0] ||
              firstProductWithImage?.flagshipImage ||
              "/images/hero/hero-1.webp";

            return (
              <Link
                key={category.id}
                href={categoryHref}
                className="group scheme-panel scheme-border relative block overflow-hidden rounded-[1.9rem] border transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_26px_60px_-42px_var(--overlay-inverse-24)]"
              >
                <div className="scheme-section-soft scheme-border relative aspect-square overflow-hidden border-b">
                  <CategoryImage src={flagshipImage} alt="" />
                  <div className="absolute inset-0 bg-[color:transparent] transition-colors duration-500 group-hover:bg-[color:var(--overlay-inverse-12)]" />
                </div>

                <div className="flex items-center justify-between gap-4 px-5 py-5 md:px-6 md:py-6">
                  <div>
                    <h3 className="text-[clamp(1.8rem,2.4vw,2.5rem)] font-medium leading-[0.96] tracking-tight scheme-text-strong transition-colors duration-200 group-hover:text-primary">
                      {categoryName}
                    </h3>
                    <p className="page-copy-sm mt-1 scheme-text-body">
                      {allProducts.length} products
                    </p>
                  </div>
                  <svg
                    className="h-4 w-4 shrink-0 scheme-text-subtle transition-all duration-300 group-hover:translate-x-1 group-hover:text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}


