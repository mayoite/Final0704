import "server-only";

import { getCatalog } from "@/lib/getProducts";
import {
  normalizePlannerCatalogProducts,
  type PlannerCatalogIndex,
  type PlannerCatalogProduct,
  type PlannerProductReference,
  buildPlannerCatalogIndex,
  normalizePlannerCatalogProduct,
  resolvePlannerCatalogProductById,
  resolvePlannerCatalogProductByReference,
  resolvePlannerCatalogProductBySlug,
} from "./plannerCatalogCore";

export type { PlannerCatalogIndex, PlannerCatalogProduct, PlannerProductReference };

export {
  buildPlannerCatalogIndex,
  normalizePlannerCatalogProduct,
  normalizePlannerCatalogProducts,
  resolvePlannerCatalogProductById,
  resolvePlannerCatalogProductByReference,
  resolvePlannerCatalogProductBySlug,
};

export async function getPlannerCatalogProducts(): Promise<PlannerCatalogProduct[]> {
  const catalog = await getCatalog();
  return normalizePlannerCatalogProducts(catalog);
}
