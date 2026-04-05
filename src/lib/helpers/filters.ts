export const PRICE_RANGES = ["budget", "mid", "premium", "luxury"] as const;
export type PriceRange = (typeof PRICE_RANGES)[number];

export const SUSTAINABILITY_THRESHOLDS = [4, 6, 8] as const;

export type SortOption = "az" | "za" | "ecoDesc" | "ecoAsc";

export interface ActiveFilters {
  series: string;
  subcategory: string[];
  priceRange: string[];
  material: string[];
  hasHeadrest: boolean;
  isHeightAdjustable: boolean;
  bifmaCertified: boolean;
  isStackable: boolean;
  sort: SortOption;
  query: string;
  ecoMin: number | null;
}

export const DEFAULT_FILTERS: ActiveFilters = {
  series: "all",
  subcategory: [],
  priceRange: [],
  material: [],
  hasHeadrest: false,
  isHeightAdjustable: false,
  bifmaCertified: false,
  isStackable: false,
  sort: "az",
  query: "",
  ecoMin: null,
};

function toSearchParams(
  input: URLSearchParams | string | Record<string, string | string[] | undefined>,
): URLSearchParams {
  if (input instanceof URLSearchParams) return new URLSearchParams(input.toString());
  if (typeof input === "string") return new URLSearchParams(input);

  const params = new URLSearchParams();
  for (const [key, rawValue] of Object.entries(input)) {
    if (Array.isArray(rawValue)) {
      rawValue.filter(Boolean).forEach((value) => params.append(key, value));
      continue;
    }
    if (typeof rawValue === "string" && rawValue.length > 0) {
      params.set(key, rawValue);
    }
  }
  return params;
}

export function normalizeOptionValue(value?: string | null): string {
  return (value || "").trim().replace(/\s+/g, " ").toLowerCase();
}

export function normalizeFacetOptions(values: readonly string[]): string[] {
  return Array.from(
    new Set(
      values
        .map((value) => value.trim())
        .filter(Boolean),
    ),
  );
}

export function resolveSortOption(value: string | null | undefined): SortOption {
  if (value === "za" || value === "ecoDesc" || value === "ecoAsc") return value;
  return DEFAULT_FILTERS.sort;
}

export function parseEcoMin(value: string | null | undefined): number | null {
  if (!value) return null;
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) return null;
  if (parsed < 0 || parsed > 10) return null;
  return parsed;
}

export function buildFilterStateFromSearchParams(
  input: URLSearchParams | string | Record<string, string | string[] | undefined>,
): ActiveFilters {
  const params = toSearchParams(input);

  return {
    series: params.get("series") ?? DEFAULT_FILTERS.series,
    query: params.get("q") ?? DEFAULT_FILTERS.query,
    sort: resolveSortOption(params.get("sort")),
    subcategory: normalizeFacetOptions(params.getAll("sub")),
    priceRange: normalizeFacetOptions(
      params.getAll("price").filter((value) => PRICE_RANGES.includes(value as PriceRange)),
    ),
    material: normalizeFacetOptions(params.getAll("mat")),
    hasHeadrest: params.get("headrest") === "1",
    isHeightAdjustable: params.get("heightAdj") === "1" || params.get("height-adj") === "1",
    bifmaCertified: params.get("bifma") === "1",
    isStackable: params.get("stackable") === "1",
    ecoMin: parseEcoMin(params.get("ecoMin")),
  };
}

export function parseFilterState(
  input: URLSearchParams | string | Record<string, string | string[] | undefined>,
): ActiveFilters {
  return buildFilterStateFromSearchParams(input);
}

export function serializeFilterState(filters: ActiveFilters): URLSearchParams {
  const params = new URLSearchParams();

  if (filters.series !== DEFAULT_FILTERS.series) params.set("series", filters.series);
  if (filters.query.trim()) params.set("q", filters.query.trim());
  if (filters.sort !== DEFAULT_FILTERS.sort) params.set("sort", filters.sort);
  normalizeFacetOptions(filters.subcategory).forEach((value) => params.append("sub", value));
  normalizeFacetOptions(filters.priceRange)
    .filter((value) => PRICE_RANGES.includes(value as PriceRange))
    .forEach((value) => params.append("price", value));
  normalizeFacetOptions(filters.material).forEach((value) => params.append("mat", value));
  if (filters.hasHeadrest) params.set("headrest", "1");
  if (filters.isHeightAdjustable) params.set("heightAdj", "1");
  if (filters.bifmaCertified) params.set("bifma", "1");
  if (filters.isStackable) params.set("stackable", "1");
  if (typeof filters.ecoMin === "number") params.set("ecoMin", String(filters.ecoMin));

  return params;
}

export function buildSearchParamsFromFilterState(filters: ActiveFilters): URLSearchParams {
  return serializeFilterState(filters);
}

export function buildFilterQuery(filters: ActiveFilters): string {
  return serializeFilterState(filters).toString();
}

export function buildFilterUrl(pathname: string, filters: ActiveFilters): string {
  const query = buildFilterQuery(filters);
  return query ? `${pathname}?${query}` : pathname;
}

export function getActiveFilterCount(filters: ActiveFilters): number {
  let count = 0;
  if (filters.series !== DEFAULT_FILTERS.series) count++;
  if (filters.query.trim()) count++;
  count += filters.subcategory.length;
  count += filters.priceRange.length;
  count += filters.material.length;
  if (filters.hasHeadrest) count++;
  if (filters.isHeightAdjustable) count++;
  if (filters.bifmaCertified) count++;
  if (filters.isStackable) count++;
  if (filters.ecoMin !== null) count++;
  return count;
}

export function toggleFacetValue(currentValues: readonly string[], value: string): string[] {
  const normalizedValue = value.trim();
  if (!normalizedValue) return [...currentValues];
  const next = currentValues.includes(normalizedValue)
    ? currentValues.filter((item) => item !== normalizedValue)
    : [...currentValues, normalizedValue];
  return normalizeFacetOptions(next);
}

export function clearFilterGroup<K extends keyof ActiveFilters>(
  filters: ActiveFilters,
  key: K,
): ActiveFilters {
  const fallback = DEFAULT_FILTERS[key];
  return {
    ...filters,
    [key]: Array.isArray(fallback) ? [...fallback] : fallback,
  };
}

export function mergeSearchParams(
  current: URLSearchParams | string,
  next: URLSearchParams | string,
): URLSearchParams {
  const merged = toSearchParams(current);
  const incoming = toSearchParams(next);

  incoming.forEach((value, key) => {
    merged.delete(key);
    incoming.getAll(key).forEach((item) => merged.append(key, item));
  });

  return stripEmptyParams(merged);
}

export function stripEmptyParams(
  input: URLSearchParams | string | Record<string, string | string[] | undefined>,
): URLSearchParams {
  const params = toSearchParams(input);
  const next = new URLSearchParams();
  params.forEach((value, key) => {
    if (value.trim().length > 0) next.append(key, value);
  });
  return next;
}
