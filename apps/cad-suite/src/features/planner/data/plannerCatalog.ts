import "server-only";

import { getCatalog } from "@/lib/getProducts";
import {
  normalizePlannerCatalogProducts,
  mergePlannerCatalogProducts,
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
export interface GetPlannerCatalogProductsOptions {
  plannerManagedProducts?:
    | readonly PlannerCatalogProduct[]
    | null
    | undefined
    | Promise<readonly PlannerCatalogProduct[] | null | undefined>
    | (() => Promise<readonly PlannerCatalogProduct[] | null | undefined>);
}

export {
  buildPlannerCatalogIndex,
  mergePlannerCatalogProducts,
  normalizePlannerCatalogProduct,
  normalizePlannerCatalogProducts,
  resolvePlannerCatalogProductById,
  resolvePlannerCatalogProductByReference,
  resolvePlannerCatalogProductBySlug,
};

async function resolvePlannerManagedProductsInput(
  plannerManagedProducts: GetPlannerCatalogProductsOptions["plannerManagedProducts"],
): Promise<readonly PlannerCatalogProduct[]> {
  if (!plannerManagedProducts) return [];
  if (typeof plannerManagedProducts === "function") {
    return (await plannerManagedProducts()) ?? [];
  }
  return (await plannerManagedProducts) ?? [];
}

export async function getPlannerCatalogProducts(
  options?: GetPlannerCatalogProductsOptions,
): Promise<PlannerCatalogProduct[]> {
  const catalog = await getCatalog();
  const legacyProducts = normalizePlannerCatalogProducts(catalog);
  const plannerManagedProducts = await resolvePlannerManagedProductsInput(options?.plannerManagedProducts);

  return mergePlannerCatalogProducts(legacyProducts, plannerManagedProducts);
}
