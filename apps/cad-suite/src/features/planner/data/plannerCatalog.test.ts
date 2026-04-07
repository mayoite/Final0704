import { beforeEach, describe, expect, it, vi } from "vitest";

import type { CompatCategory } from "@/lib/getProducts";

import {
  mergePlannerCatalogProducts,
  normalizePlannerCatalogProducts,
  type PlannerCatalogProduct,
  resolvePlannerCatalogProductById,
  resolvePlannerCatalogProductByReference,
  resolvePlannerCatalogProductBySlug,
} from "./plannerCatalogCore";
import { getPlannerCatalogProducts } from "./plannerCatalog";

const getCatalogMock = vi.fn<() => Promise<CompatCategory[]>>();
const listPlannerManagedProductsForPlannerCatalogMock = vi.fn<() => Promise<PlannerCatalogProduct[]>>();

vi.mock("@/lib/getProducts", () => ({
  getCatalog: getCatalogMock,
}));

vi.mock("./plannerManagedProducts", () => ({
  listPlannerManagedProductsForPlannerCatalog: listPlannerManagedProductsForPlannerCatalogMock,
}));

describe("planner catalog adapter", () => {
  const catalog: CompatCategory[] = [
    {
      id: "cat-1",
      name: "Workstations",
      description: "Planner source category",
      series: [
        {
          id: "series-1",
          name: "Executive",
          description: "Series description",
          products: [
            {
              id: "prod-1",
              slug: "alpha-desk",
              name: "Alpha Desk",
              description: "Desk description",
              flagshipImage: "/desk.png",
              sceneImages: ["/desk-scene.png"],
              variants: [],
              detailedInfo: {
                overview: "Desk overview",
                features: ["Cable tray"],
                dimensions: "1600 x 800 x 750 mm",
                materials: ["Wood"],
              },
              metadata: {
                category: "Desks",
                categoryIdCanonical: "cat-1",
                canonicalSlugV2: "alpha-desk",
                canonicalSeriesId: "series-1",
                priceRange: "premium",
              },
              "3d_model": "/desk.glb",
              threeDModelUrl: "/desk.glb",
              technicalDrawings: [],
              documents: [],
              images: ["/desk-1.png"],
              altText: "Alpha Desk",
              specs: {
                dimensions: "1600 x 800 x 750 mm",
                features: ["Cable tray"],
                materials: ["Wood"],
              },
            },
          ],
        },
      ],
    },
  ];

  beforeEach(() => {
    getCatalogMock.mockReset();
    getCatalogMock.mockResolvedValue(catalog);
    listPlannerManagedProductsForPlannerCatalogMock.mockReset();
    listPlannerManagedProductsForPlannerCatalogMock.mockResolvedValue([]);
  });

  function buildManagedProduct(legacyProduct: PlannerCatalogProduct): PlannerCatalogProduct {
    return {
      ...legacyProduct,
      id: "managed-prod-1",
      slug: "alpha-desk-v2",
      price: 52000,
      images: [],
      flagship_image: "",
      metadata: {
        ...legacyProduct.metadata,
        source: "planner-managed",
        rollout: "managed",
      },
    };
  }

  it("normalizes the legacy catalog into planner-ready products", () => {
    const products = normalizePlannerCatalogProducts(catalog);

    expect(products).toHaveLength(1);
    expect(products[0]).toMatchObject({
      id: "prod-1",
      slug: "alpha-desk",
      name: "Alpha Desk",
      category: "Desks",
      categoryId: "cat-1",
      categoryName: "Workstations",
      seriesId: "series-1",
      seriesName: "Executive",
      plannerSourceSlug: "alpha-desk",
      price: 45000,
      flagship_image: "/desk.png",
      images: ["/desk-1.png"],
    });
    expect(products[0].metadata).toMatchObject({
      plannerCatalogProductId: "prod-1",
      plannerCatalogSlug: "alpha-desk",
      plannerCatalogCategoryId: "cat-1",
      plannerCatalogSeriesId: "series-1",
      plannerCatalogLookupIds: ["prod-1"],
      plannerCatalogLookupSlugs: ["alpha-desk"],
      plannerCatalogLookupSourceSlugs: ["alpha-desk"],
    });
  });

  it("merges managed products over legacy data and preserves legacy aliases for lookup", () => {
    const legacyProducts = normalizePlannerCatalogProducts(catalog);
    const managedProducts = [buildManagedProduct(legacyProducts[0])];
    const products = mergePlannerCatalogProducts(legacyProducts, managedProducts);

    expect(products).toHaveLength(1);
    expect(products[0]).toMatchObject({
      id: "managed-prod-1",
      slug: "alpha-desk-v2",
      plannerSourceSlug: "alpha-desk",
      price: 52000,
      flagship_image: "/desk.png",
      images: ["/desk-1.png"],
    });

    expect(resolvePlannerCatalogProductById(products, "managed-prod-1")?.name).toBe("Alpha Desk");
    expect(resolvePlannerCatalogProductById(products, "prod-1")?.name).toBe("Alpha Desk");
    expect(resolvePlannerCatalogProductBySlug(products, "alpha-desk-v2")?.name).toBe("Alpha Desk");
    expect(resolvePlannerCatalogProductBySlug(products, "alpha-desk")?.name).toBe("Alpha Desk");
    expect(
      resolvePlannerCatalogProductByReference(products, { plannerSourceSlug: "alpha-desk" })?.name,
    ).toBe("Alpha Desk");
    expect(products[0].metadata).toMatchObject({
      source: "planner-managed",
      rollout: "managed",
      plannerCatalogLookupIds: ["managed-prod-1", "prod-1"],
      plannerCatalogLookupSlugs: ["alpha-desk-v2", "alpha-desk"],
    });
  });

  it("keeps the legacy fetch path by default and merges an optional managed source when supplied", async () => {
    const legacyOnlyProducts = await getPlannerCatalogProducts();
    const mergedProducts = await getPlannerCatalogProducts({
      plannerManagedProducts: async () => [buildManagedProduct(normalizePlannerCatalogProducts(catalog)[0])],
    });

    expect(getCatalogMock).toHaveBeenCalledTimes(2);
    expect(legacyOnlyProducts).toHaveLength(1);
    expect(legacyOnlyProducts[0].id).toBe("prod-1");
    expect(mergedProducts).toHaveLength(1);
    expect(mergedProducts[0].id).toBe("managed-prod-1");
    expect(resolvePlannerCatalogProductById(mergedProducts, "prod-1")?.id).toBe("managed-prod-1");
  });

  it("uses the planner-managed product source when present in the write-side store", async () => {
    listPlannerManagedProductsForPlannerCatalogMock.mockResolvedValueOnce([
      buildManagedProduct(normalizePlannerCatalogProducts(catalog)[0]),
    ]);

    const products = await getPlannerCatalogProducts();

    expect(products).toHaveLength(1);
    expect(products[0].id).toBe("managed-prod-1");
    expect(resolvePlannerCatalogProductById(products, "prod-1")?.id).toBe("managed-prod-1");
    expect(listPlannerManagedProductsForPlannerCatalogMock).toHaveBeenCalledTimes(1);
  });
});
