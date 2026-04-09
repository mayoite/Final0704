import { Armchair, Archive, Table2 } from "lucide-react";
import { normalizeImageSource, normalizeImageSourceList } from "@/lib/helpers/images";

import { PlannerCatalogItem } from "./types";

function normalizeText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeDimension(value: unknown, fallback?: number) {
  return typeof value === "number" && Number.isFinite(value) && value > 0
    ? value
    : fallback;
}

function normalizeDocs(
  docs: PlannerCatalogItem["docs"],
): PlannerCatalogItem["docs"] {
  if (!Array.isArray(docs)) {
    return [];
  }

  return docs.filter((entry) => {
    if (typeof entry === "string") {
      return normalizeText(entry).length > 0;
    }

    return normalizeText(entry?.title).length > 0 || normalizeText(entry?.url).length > 0;
  });
}

function buildSpecSummary(item: PlannerCatalogItem) {
  const directSpec = normalizeText(item.spec);

  if (directSpec) {
    return directSpec;
  }

  const overviewSummary = (item.overviewPairs ?? [])
    .flatMap((pair) => [normalizeText(pair.heading), normalizeText(pair.body)])
    .filter(Boolean)
    .slice(0, 4)
    .join(" | ");

  if (overviewSummary) {
    return overviewSummary;
  }

  const specSectionSummary = (item.specSections ?? [])
    .flatMap((section) => [
      normalizeText(section.heading),
      ...(section.lines ?? []).map((line) => normalizeText(line)),
    ])
    .filter(Boolean)
    .slice(0, 4)
    .join(" | ");

  return specSectionSummary || undefined;
}

export function normalizePlannerCatalogItems(items: PlannerCatalogItem[]) {
  const seenIds = new Map<string, number>();

  return items.map((item, index) => {
    const baseId = normalizeText(item.id) || `planner-item-${index + 1}`;
    const nextSeenCount = (seenIds.get(baseId) ?? 0) + 1;
    seenIds.set(baseId, nextSeenCount);
    const normalizedId =
      nextSeenCount === 1 ? baseId : `${baseId}-${nextSeenCount}`;
    const galleryImages = normalizeImageSourceList(item.galleryImages ?? []);
    const heroImageUrl = normalizeImageSource(item.heroImageUrl);
    const imageUrl = normalizeImageSource(item.imageUrl);
    const spec = buildSpecSummary(item);

    return {
      ...item,
      id: normalizedId,
      name: normalizeText(item.name) || `Catalog item ${index + 1}`,
      family: normalizeText(item.family) || "General",
      category: normalizeText(item.category) || "Misc",
      categoryLabel: normalizeText(item.categoryLabel) || undefined,
      subcategoryLabel: normalizeText(item.subcategoryLabel) || undefined,
      heroImageUrl: heroImageUrl || galleryImages[0] || imageUrl || undefined,
      imageUrl: imageUrl || galleryImages[0] || heroImageUrl || undefined,
      galleryImages,
      width: normalizeDimension(item.width, 120),
      depth: normalizeDimension(item.depth, 60),
      height: normalizeDimension(item.height, 75),
      color: normalizeText(item.color) || undefined,
      shape: normalizeText(item.shape) || undefined,
      renderStyle: normalizeText(item.renderStyle) || undefined,
      topView: normalizeImageSource(item.topView) || undefined,
      spec,
      materials: Array.isArray(item.materials)
        ? item.materials.map((value) => normalizeText(value)).filter(Boolean)
        : [],
      accessories: Array.isArray(item.accessories)
        ? item.accessories.map((value) => normalizeText(value)).filter(Boolean)
        : [],
      finishOptions: Array.isArray(item.finishOptions)
        ? item.finishOptions.map((value) => normalizeText(value)).filter(Boolean)
        : [],
      certifications: Array.isArray(item.certifications)
        ? item.certifications.map((value) => normalizeText(value)).filter(Boolean)
        : [],
      docs: normalizeDocs(item.docs),
      sourceUrl: normalizeText(item.sourceUrl) || undefined,
    } satisfies PlannerCatalogItem;
  });
}

export function getCatalogImageSrc(item: PlannerCatalogItem) {
  const candidate =
    item.heroImageUrl || item.imageUrl || item.galleryImages?.[0] || null;

  if (candidate && candidate.trim().length > 0) {
    return candidate;
  }

  return null;
}

export function getCatalogPlaceholderTone(item: PlannerCatalogItem) {
  if (item.color && item.color.trim().length > 0) {
    return item.color;
  }

  const category = (item.categoryLabel ?? item.category).toLowerCase();

  if (category.includes("seating")) {
    return "var(--planner-placeholder-seating)";
  }

  if (category.includes("table") || category.includes("workstation")) {
    return "var(--planner-placeholder-tables)";
  }

  if (category.includes("storage")) {
    return "var(--planner-placeholder-storage)";
  }

  return "var(--planner-placeholder-default)";
}

export function getCategoryIcon(category: string) {
  const normalized = category.toLowerCase();

  if (normalized.includes("seating")) {
    return Armchair;
  }

  if (normalized.includes("table") || normalized.includes("workstation")) {
    return Table2;
  }

  return Archive;
}

export function getCategoryIconKey(category: string) {
  const normalized = category.toLowerCase();

  if (normalized.includes("seating")) {
    return "armchair" as const;
  }

  if (normalized.includes("table") || normalized.includes("workstation")) {
    return "table" as const;
  }

  return "archive" as const;
}
