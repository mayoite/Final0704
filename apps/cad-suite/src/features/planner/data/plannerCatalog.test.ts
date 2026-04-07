import { describe, expect, it } from "vitest";

import type { CompatCategory } from "@/lib/getProducts";

import {
  normalizePlannerCatalogProducts,
  resolvePlannerCatalogProductById,
  resolvePlannerCatalogProductByReference,
  resolvePlannerCatalogProductBySlug,
} from "./plannerCatalogCore";

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
    });
  });

  it("resolves planner catalog products by id, slug, and source slug", () => {
    const products = normalizePlannerCatalogProducts(catalog);

    expect(resolvePlannerCatalogProductById(products, "prod-1")?.name).toBe("Alpha Desk");
    expect(resolvePlannerCatalogProductBySlug(products, "alpha-desk")?.name).toBe("Alpha Desk");
    expect(
      resolvePlannerCatalogProductByReference(products, { plannerSourceSlug: "alpha-desk" })?.name,
    ).toBe("Alpha Desk");
  });
});
