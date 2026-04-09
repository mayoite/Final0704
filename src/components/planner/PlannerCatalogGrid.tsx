"use client";

import { useMemo, useState } from "react";
import {
  Bookmark,
  FolderOpen,
  LayoutPanelLeft,
  Loader2,
  PanelLeftClose,
  Search,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

import { PlannerCatalogImage } from "./PlannerCatalogImage";
import type { PlannerCatalogItem } from "./types";

type RailSection = "library" | "collections" | "recent" | "saved";
type SupportFilter = "all" | "docs" | "specs" | "core";
type SeriesFilter = "all" | string;

interface PlannerCatalogGridProps {
  className?: string;
  catalogSummary: { itemCount: number; phaseOneItemCount: number };
  catalog: PlannerCatalogItem[];
  totalVisibleCount: number;
  displayedCount: number;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  categories: string[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  catalogLoading: boolean;
  catalogError: string | null;
  visibleCatalog: PlannerCatalogItem[];
  selectedItem: PlannerCatalogItem | null;
  onSelectItem: (id: string) => void;
  onAddCatalogItem: (item: PlannerCatalogItem) => void;
  canShowMore: boolean;
  onShowMore: () => void;
  onRetryCatalog?: () => void;
  onCollapse?: () => void;
}

function getDimensionLabel(item: PlannerCatalogItem) {
  const values = [item.width, item.depth, item.height]
    .map((value) => Math.round(value ?? 0))
    .filter((value) => value > 0);

  return values.length > 0 ? `${values.join(" x ")} cm` : "Dimensions pending";
}

function getSupportBadge(item: PlannerCatalogItem) {
  const hasDocs = (item.docs?.length ?? 0) > 0;
  const hasSpecs =
    Boolean(item.spec?.trim()) ||
    (item.specSections?.length ?? 0) > 0 ||
    (item.overviewPairs?.length ?? 0) > 0;

  if (hasDocs) {
    return "Docs ready";
  }

  if (hasSpecs) {
    return "Specs ready";
  }

  return "Core data";
}

function getSeriesLabel(item: PlannerCatalogItem) {
  return (
    item.family?.trim() ||
    item.subcategoryLabel?.trim() ||
    item.categoryLabel?.trim() ||
    item.category
  );
}

function getSecondarySpecCue(item: PlannerCatalogItem) {
  const primaryMaterial = item.materials?.[0]?.trim();
  const finishCount = item.finishOptions?.length ?? 0;
  const docCount = item.docs?.length ?? 0;

  if (primaryMaterial) {
    return primaryMaterial;
  }

  if (finishCount > 0) {
    return `${finishCount} finishes`;
  }

  if (docCount > 0) {
    return `${docCount} docs`;
  }

  return getSupportBadge(item);
}

export function PlannerCatalogGrid({
  className,
  catalogSummary,
  catalog,
  totalVisibleCount,
  displayedCount,
  searchQuery,
  onSearchChange,
  categories,
  activeCategory,
  onCategoryChange,
  catalogLoading,
  catalogError,
  visibleCatalog,
  selectedItem,
  onSelectItem,
  onAddCatalogItem,
  canShowMore,
  onShowMore,
  onRetryCatalog,
  onCollapse,
}: PlannerCatalogGridProps) {
  const [activeSection, setActiveSection] = useState<RailSection>("library");
  const [supportFilter, setSupportFilter] = useState<SupportFilter>("all");
  const [activeSeries, setActiveSeries] = useState<SeriesFilter>("all");
  const catalogCount = catalogSummary.phaseOneItemCount || catalogSummary.itemCount || 0;
  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>();
    catalog.forEach((item) => {
      const label = (item.categoryLabel ?? item.category)?.trim();
      if (!label) return;
      counts.set(label, (counts.get(label) ?? 0) + 1);
    });
    return counts;
  }, [catalog]);
  const supportFilteredCatalog = useMemo(
    () =>
      visibleCatalog.filter((item) => {
        const badge = getSupportBadge(item);
        if (supportFilter === "docs") {
          return badge === "Docs ready";
        }
        if (supportFilter === "specs") {
          return badge === "Specs ready";
        }
        if (supportFilter === "core") {
          return badge === "Core data";
        }
        return true;
      }),
    [supportFilter, visibleCatalog],
  );
  const availableSeries = useMemo(() => {
    const seriesMap = new Map<string, number>();

    supportFilteredCatalog.forEach((item) => {
      const label = getSeriesLabel(item);
      seriesMap.set(label, (seriesMap.get(label) ?? 0) + 1);
    });

    return Array.from(seriesMap.entries())
      .sort((left, right) => {
        if (right[1] !== left[1]) {
          return right[1] - left[1];
        }

        return left[0].localeCompare(right[0]);
      })
      .map(([label]) => label);
  }, [supportFilteredCatalog]);
  const resolvedActiveSeries =
    activeSeries !== "all" && !availableSeries.includes(activeSeries)
      ? "all"
      : activeSeries;
  const filteredCatalog = useMemo(
    () =>
      supportFilteredCatalog.filter(
        (item) =>
          resolvedActiveSeries === "all" ||
          getSeriesLabel(item) === resolvedActiveSeries,
      ),
    [resolvedActiveSeries, supportFilteredCatalog],
  );
  const visibleSeries = useMemo(() => {
    const topSeries = availableSeries.slice(0, 7);

    if (
      resolvedActiveSeries !== "all" &&
      !topSeries.includes(resolvedActiveSeries)
    ) {
      return [resolvedActiveSeries, ...topSeries].slice(0, 8);
    }

    return topSeries;
  }, [resolvedActiveSeries, availableSeries]);
  const shouldChooseCategoryFirst =
    activeSection === "library" && activeCategory.length === 0;
  const shouldChooseSeriesNext =
    activeSection === "library" &&
    activeCategory.length > 0 &&
    resolvedActiveSeries === "all";
  const shouldShowItemList =
    activeSection === "library" &&
    activeCategory.length > 0 &&
    resolvedActiveSeries !== "all";
  const seriesCards = useMemo(
    () =>
      visibleSeries
        .filter((series) => series !== "all")
        .map((series, index) => {
          const seriesItems = supportFilteredCatalog.filter(
            (item) => getSeriesLabel(item) === series,
          );
          const featuredItem = seriesItems[0] ?? null;

          return {
            label: series,
            count: seriesItems.length,
            featuredItem,
            tone:
              index % 2 === 0
                ? "from-[rgba(255,255,255,0.09)] to-transparent"
                : "from-[var(--planner-accent-soft-bg)] to-transparent",
          };
        }),
    [supportFilteredCatalog, visibleSeries],
  );
  const hasSeriesChoices = shouldChooseSeriesNext && seriesCards.length > 0;

  const featuredCollections = useMemo(
    () =>
      categories.slice(0, 6).map((category, index) => {
        const featuredItem =
          supportFilteredCatalog.find(
            (item) => (item.categoryLabel ?? item.category) === category,
          ) ?? supportFilteredCatalog[index] ?? visibleCatalog[index] ?? null;

        return {
          category,
          featuredItem,
          tone: index % 2 === 0 ? "from-white/10 to-white/4" : "from-[var(--planner-accent-soft-bg)] to-white/4",
        };
      }),
    [categories, supportFilteredCatalog, visibleCatalog],
  );
  const railTitle =
    activeSection === "library"
      ? "Product library"
      : activeSection === "collections"
        ? "Curated collections"
        : activeSection === "recent"
          ? "Recent activity"
          : "Saved views";

  const railIntro =
    activeSection === "library"
      ? "Filter the library like a selector: category first, one series next, then a short item list."
      : activeSection === "collections"
        ? "Jump into grouped planning flows instead of browsing generic inventory."
        : activeSection === "recent"
          ? "Keep orientation on the items and categories you just reviewed."
          : "Reserved for reusable planner setups and pinned product groups.";

  const navItems: Array<{
    id: RailSection;
    label: string;
    icon: typeof LayoutPanelLeft;
  }> = [
    { id: "library", label: "Library", icon: LayoutPanelLeft },
    { id: "collections", label: "Sets", icon: Sparkles },
    { id: "recent", label: "Recent", icon: FolderOpen },
    { id: "saved", label: "Saved", icon: Bookmark },
  ];

  return (
    <aside
      className={cn(
        "flex min-h-0 w-full min-w-0 shrink-0 bg-transparent text-body",
        className,
      )}
    >
      <div className="grid min-h-0 w-full grid-cols-[64px_minmax(0,1fr)]">
        <div className="flex min-h-0 flex-col items-center gap-2 border-r border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] px-2 py-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveSection(item.id)}
                className={cn(
                  "flex w-full flex-col items-center gap-1 rounded-[14px] border px-1.5 py-2 text-center transition-all",
                  isActive
                    ? "border-[var(--planner-accent-soft-border)] bg-[var(--planner-accent-soft-bg)] text-white shadow-[var(--planner-shadow-accent)]"
                    : "border-white/8 bg-white/5 text-[var(--planner-shell-muted)] hover:border-white/14 hover:bg-white/8 hover:text-white",
                )}
                title={item.label}
              >
                <Icon className="h-4 w-4" />
                <span className="text-[8px] font-semibold tracking-[0.04em]">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex min-h-0 flex-col">
          <div className="shrink-0 space-y-2.5 border-b border-white/10 px-3.5 py-3 text-[var(--planner-shell-text)]">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-2">
                <p className="text-[11px] font-semibold tracking-[0.24em] text-[var(--planner-shell-muted)] uppercase">
                  {railTitle}
                </p>
                <div className="flex flex-wrap items-center gap-1">
                  <span className="planner-shell-chip rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-[0.04em]">
                    {filteredCatalog.length} visible
                  </span>
                  <span className="planner-shell-chip rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-[0.04em]">
                    {catalogCount} curated
                  </span>
                </div>
                <p className="max-w-sm text-[11px] leading-4.5 text-[var(--planner-shell-muted)]">
                  {railIntro}
                </p>
                {activeSection === "library" ? (
                  <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                    {[
                      { id: "01", label: "Category", active: activeCategory.length === 0 },
                      {
                        id: "02",
                        label: "Series",
                        active:
                          activeCategory.length > 0 &&
                          resolvedActiveSeries === "all",
                      },
                      {
                        id: "03",
                        label: "Item",
                        active: resolvedActiveSeries !== "all",
                      },
                    ].map((step) => (
                      <span
                        key={step.id}
                        className={cn(
                          "rounded-full border px-2 py-1 text-[9px] font-semibold tracking-[0.12em] uppercase",
                          step.active
                            ? "border-[var(--planner-accent-soft-border)] bg-[var(--planner-accent-soft-bg)] text-white"
                            : "border-white/8 bg-black/10 text-[var(--planner-shell-muted)]",
                        )}
                      >
                        {step.id} {step.label}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
              {onCollapse ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 rounded-full border border-white/10 bg-white/5 p-0 text-[var(--planner-shell-muted)] hover:bg-white/10 hover:text-white"
                  onClick={onCollapse}
                  title="Collapse Catalog"
                >
                  <PanelLeftClose className="h-4 w-4" />
                </Button>
              ) : null}
            </div>

            {activeSection === "library" ? (
              <>
                <div className="planner-rail-section transition-focus-within flex items-center gap-2 rounded-xl px-3 py-2 focus-within:border-white/30">
                  <Search className="h-3.5 w-3.5 shrink-0 text-[var(--planner-shell-muted)]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(event) => onSearchChange(event.target.value)}
                    placeholder="Search workstations, seating, tables..."
                    className="w-full bg-transparent text-[13px] font-medium text-white outline-none placeholder:text-[var(--planner-shell-muted)]"
                  />
                </div>

                <div className="flex gap-1.5 overflow-x-auto pb-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveSeries("all");
                      onCategoryChange("");
                    }}
                    className={cn(
                      "rounded-full border px-2.5 py-1 text-[10px] font-semibold tracking-[0.03em] whitespace-nowrap transition-all",
                      activeCategory.length === 0
                        ? "border-[var(--planner-accent-soft-border)] bg-[var(--planner-accent-soft-bg)] text-white"
                        : "border-white/10 bg-white/5 text-[var(--planner-shell-muted)] hover:border-white/16 hover:text-white",
                    )}
                  >
                    All
                  </button>
                  {categories.slice(0, 8).map((category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => {
                        setActiveSeries("all");
                        onCategoryChange(category);
                      }}
                      className={cn(
                        "rounded-full border px-2.5 py-1 text-[10px] font-semibold tracking-[0.03em] whitespace-nowrap transition-all",
                        activeCategory === category
                          ? "border-[var(--planner-accent-soft-border)] bg-[var(--planner-accent-soft-bg)] text-white"
                          : "border-white/10 bg-white/5 text-[var(--planner-shell-muted)] hover:border-white/16 hover:text-white",
                      )}
                    >
                      {category}
                      <span className="ml-2 text-[9px] font-semibold tracking-[0.02em] text-[var(--planner-shell-muted)]">
                        {categoryCounts.get(category) ?? 0}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="flex gap-1.5 overflow-x-auto pb-0.5">
                  {[
                    { id: "all" as const, label: "All data" },
                    { id: "docs" as const, label: "Docs ready" },
                    { id: "specs" as const, label: "Specs ready" },
                    { id: "core" as const, label: "Core data" },
                  ].map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setSupportFilter(option.id)}
                      className={cn(
                        "rounded-full border px-2.5 py-1 text-[9px] font-semibold tracking-[0.06em] whitespace-nowrap transition-all",
                        supportFilter === option.id
                          ? "border-[var(--planner-accent-soft-border)] bg-white/12 text-white"
                          : "border-white/8 bg-black/10 text-[var(--planner-shell-muted)] hover:border-white/14 hover:text-white",
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>

                {activeCategory.length > 0 && visibleSeries.length > 0 ? (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[9px] font-semibold tracking-[0.16em] text-[var(--planner-shell-muted)] uppercase">
                        Series filter
                      </p>
                      {resolvedActiveSeries !== "all" ? (
                        <button
                          type="button"
                          onClick={() => setActiveSeries("all")}
                          className="text-[9px] font-semibold tracking-[0.08em] text-[var(--planner-accent)] uppercase"
                        >
                          Clear
                        </button>
                      ) : null}
                    </div>
                    <div className="flex gap-1.5 overflow-x-auto pb-0.5">
                      <button
                        type="button"
                        onClick={() => setActiveSeries("all")}
                        className={cn(
                          "rounded-full border px-2.5 py-1 text-[9px] font-semibold tracking-[0.06em] whitespace-nowrap transition-all",
                          resolvedActiveSeries === "all"
                            ? "border-[var(--planner-accent-soft-border)] bg-[var(--planner-accent-soft-bg)] text-white"
                            : "border-white/8 bg-black/10 text-[var(--planner-shell-muted)] hover:border-white/14 hover:text-white",
                        )}
                      >
                        All series
                      </button>
                      {visibleSeries.map((series) => (
                        <button
                          key={series}
                          type="button"
                          onClick={() => setActiveSeries(series)}
                          className={cn(
                            "rounded-full border px-2.5 py-1 text-[9px] font-semibold tracking-[0.04em] whitespace-nowrap transition-all",
                            resolvedActiveSeries === series
                              ? "border-[var(--planner-accent-soft-border)] bg-white/12 text-white"
                              : "border-white/8 bg-black/10 text-[var(--planner-shell-muted)] hover:border-white/14 hover:text-white",
                          )}
                        >
                          {series}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}

                {shouldChooseSeriesNext && !catalogLoading && !catalogError && seriesCards.length === 0 ? (
                  <div className="rounded-[22px] border border-dashed border-white/12 bg-[rgba(255,255,255,0.03)] px-4 py-5 text-left">
                    <p className="text-[11px] font-semibold tracking-[0.16em] text-[var(--planner-shell-muted)] uppercase">
                      No series available
                    </p>
                    <p className="mt-2 text-[13px] font-semibold text-white">
                      {activeCategory} has no matches under the current filter.
                    </p>
                    <p className="mt-1 text-[12px] leading-5 text-[var(--planner-shell-muted)]">
                      Switch the support filter back to All data or choose another category.
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        className="h-9 rounded-xl bg-[var(--planner-accent)] px-3 text-[11px] font-semibold tracking-[0.02em] text-[var(--planner-accent-contrast)] shadow-[var(--planner-shadow-accent)] hover:bg-[var(--planner-accent-hover)]"
                        onClick={() => setSupportFilter("all")}
                      >
                        Show all data
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-9 rounded-xl border-white/10 bg-white/6 px-3 text-[11px] font-semibold tracking-[0.02em] text-white/80 hover:bg-white/10 hover:text-white"
                        onClick={() => {
                          setActiveSeries("all");
                          onCategoryChange("");
                        }}
                      >
                        Back to categories
                      </Button>
                    </div>
                  </div>
                ) : null}
              </>
            ) : null}
          </div>

          <div className="shrink-0 border-b border-white/10 bg-white/5 p-3">
            {activeSection === "library" ? (
              <>
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="text-[10px] font-semibold tracking-[0.14em] text-[var(--planner-shell-muted)] uppercase">
                    {selectedItem ? "Staged product" : "Select a product"}
                  </p>
                  {activeCategory ? (
                    <span className="rounded-full border border-white/8 bg-black/10 px-2 py-0.5 text-[9px] font-semibold tracking-[0.06em] text-[var(--planner-shell-muted)]">
                      {activeCategory}
                      {resolvedActiveSeries !== "all"
                        ? ` / ${resolvedActiveSeries}`
                        : ""}
                    </span>
                  ) : null}
                </div>
                {selectedItem ? (
                  <div className="planner-rail-section rounded-[20px] p-2.5 text-[var(--planner-shell-text)]">
                    <div className="flex items-start gap-3">
                      <div className="relative h-14 w-18 shrink-0 overflow-hidden rounded-[16px] border border-white/10 bg-white shadow-theme-soft">
                        <PlannerCatalogImage
                          item={selectedItem}
                          alt={selectedItem.name}
                          sizes="96px"
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[11px] font-semibold tracking-[0.12em] text-[var(--planner-shell-muted)] uppercase">
                          {getSeriesLabel(selectedItem)}
                        </p>
                        <h3 className="mt-1 truncate text-[14px] font-semibold tracking-[0.01em] text-white">
                          {selectedItem.name}
                        </h3>
                        <div className="mt-1 flex flex-wrap gap-1.5 text-[10px] font-semibold tracking-[0.03em] text-[var(--planner-shell-muted)]">
                          <span className="rounded-full border border-white/10 bg-white/8 px-2.5 py-1">
                            {getDimensionLabel(selectedItem)}
                          </span>
                          <span className="rounded-full border border-white/10 bg-white/8 px-2.5 py-1">
                            {getSecondarySpecCue(selectedItem)}
                          </span>
                        </div>
                        <p className="mt-2 text-[11px] leading-5 text-[var(--planner-shell-muted)]">
                          Stage one product at a time so placement stays deliberate.
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      className="mt-2.5 h-9 w-full rounded-xl bg-[var(--planner-accent)] px-3 text-[11px] font-semibold tracking-[0.02em] text-[var(--planner-accent-contrast)] shadow-[var(--planner-shadow-accent)] hover:bg-[var(--planner-accent-hover)]"
                      onClick={() => onAddCatalogItem(selectedItem)}
                    >
                      Stage and add to canvas
                    </Button>
                  </div>
                ) : (
                  <div className="rounded-[24px] border border-dashed border-white/14 bg-white/6 px-4 py-5 text-[var(--planner-shell-text)]">
                    <p className="text-[13px] font-semibold text-white">
                      {shouldChooseCategoryFirst
                        ? "Start with a product category."
                        : shouldChooseSeriesNext
                          ? hasSeriesChoices
                            ? "Choose a series before browsing items."
                            : "Switch filters or choose another category."
                          : "Browse, compare, then stage one product."}
                    </p>
                    <p className="mt-1 text-[12px] leading-5 text-[var(--planner-shell-muted)]">
                      {shouldChooseCategoryFirst
                        ? "Start with the product family you want to design around."
                        : shouldChooseSeriesNext
                          ? hasSeriesChoices
                            ? `The ${activeCategory} collection is active. Pick one series to keep the browse list focused.`
                            : "No results match the current support filter. Try All data."
                          : "Stage one product at a time so placement stays deliberate."}
                    </p>
                  </div>
                )}
              </>
            ) : activeSection === "collections" ? (
              <div className="space-y-3">
                <p className="text-[11px] font-semibold tracking-[0.16em] text-[var(--planner-shell-muted)] uppercase">
                  Plan by collection
                </p>
                <div className="grid gap-3">
                  {featuredCollections.map((collection) => (
                    <button
                      key={collection.category}
                      type="button"
                      onClick={() => {
                        setActiveSection("library");
                        onCategoryChange(collection.category);
                      }}
                      className={cn(
                        "overflow-hidden rounded-[24px] border p-4 text-left transition-all",
                        activeCategory === collection.category
                          ? "border-[var(--planner-accent-soft-border)] bg-[var(--planner-accent-soft-bg)] shadow-[var(--planner-shadow-accent)]"
                          : "border-white/10 bg-white/6 hover:border-white/18 hover:bg-white/10",
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={cn(
                            "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br text-[11px] font-semibold tracking-[0.08em] text-white",
                            collection.tone,
                          )}
                        >
                          {collection.category.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[14px] font-semibold tracking-[0.01em] text-white">
                            {collection.category}
                          </p>
                          <p className="mt-1 text-[12px] leading-5 text-[var(--planner-shell-muted)]">
                            {collection.featuredItem
                              ? `Start from ${collection.featuredItem.name}`
                              : "Open this collection in the library drawer."}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-[24px] border border-dashed border-white/14 bg-white/6 px-4 py-5 text-[var(--planner-shell-text)]">
                <p className="text-[13px] font-semibold text-white">
                  {activeSection === "recent" ? "Recent review is coming next." : "Saved planner sets are not wired yet."}
                </p>
                <p className="mt-1 text-[12px] leading-5 text-[var(--planner-shell-muted)]">
                  {selectedItem
                    ? `Current staged item: ${selectedItem.name}.`
                    : "Use the library or collections rail to keep the placement flow moving."}
                </p>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto">
            {catalogLoading ? (
              <div className="space-y-3 p-4">
                <div className="flex items-center gap-2 text-[var(--planner-shell-muted)]">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-[12px] font-semibold tracking-[0.05em]">
                    Updating inventory
                  </span>
                </div>
                {Array.from({ length: 5 }).map((_, index) => (
                  <div
                    key={`catalog-skeleton-${index}`}
                    className="animate-pulse rounded-[22px] border border-white/8 bg-white/6 px-3 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-16 w-20 rounded-[18px] bg-white/10" />
                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="h-3 w-2/3 rounded-full bg-white/10" />
                        <div className="h-3 w-1/2 rounded-full bg-white/10" />
                        <div className="h-3 w-1/3 rounded-full bg-white/10" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}

            {catalogError ? (
              <div className="mx-4 my-6 rounded-2xl border border-rose-400/20 bg-rose-500/8 px-5 py-5 text-xs text-rose-100">
                <p className="mb-1 font-bold">DATA ERROR</p>
                {catalogError}
                {onRetryCatalog ? (
                  <div className="mt-3">
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full border-rose-500/30 bg-transparent text-rose-200 hover:bg-rose-500/10"
                      onClick={onRetryCatalog}
                    >
                      Retry
                    </Button>
                  </div>
                ) : null}
              </div>
            ) : null}

            {!catalogLoading &&
            !catalogError &&
            shouldShowItemList &&
            filteredCatalog.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-[var(--planner-shell-muted)]">
                <Search className="mb-4 h-12 w-12" />
                <p className="text-center text-[12px] font-semibold tracking-[0.04em]">
                  No matches found
                </p>
                <p className="mt-2 text-center text-[12px] leading-5 text-[var(--planner-shell-muted)]">
                  Try clearing the search, switching filters, or clearing the series.
                </p>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-9 rounded-xl border-white/10 bg-white/6 px-3 text-[11px] font-semibold tracking-[0.02em] text-white/80 hover:bg-white/10 hover:text-white"
                    onClick={() => setSupportFilter("all")}
                  >
                    Show all data
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-9 rounded-xl border-white/10 bg-white/6 px-3 text-[11px] font-semibold tracking-[0.02em] text-white/80 hover:bg-white/10 hover:text-white"
                    onClick={() => setActiveSeries("all")}
                  >
                    Clear series
                  </Button>
                </div>
              </div>
            ) : null}

            {!catalogLoading && !catalogError && shouldChooseCategoryFirst ? (
              <div className="grid grid-cols-1 gap-2.5 px-3.5 pt-3.5 pb-10">
                <div className="rounded-[22px] border border-dashed border-white/12 bg-[rgba(255,255,255,0.03)] px-4 py-5 text-left">
                  <p className="text-[11px] font-semibold tracking-[0.16em] text-[var(--planner-shell-muted)] uppercase">
                    Step 1 · Product Category
                  </p>
                  <p className="mt-2 text-[15px] font-semibold text-white">
                    Choose the planning collection.
                  </p>
                  <p className="mt-1 text-[12px] leading-5 text-[var(--planner-shell-muted)]">
                    Start from the main workspace family, then refine into a series.
                  </p>
                </div>
                {categories.slice(0, 8).map((category, index) => {
                  const categoryItem =
                    supportFilteredCatalog.find(
                      (item) => (item.categoryLabel ?? item.category) === category,
                    ) ?? visibleCatalog[index] ?? null;

                  return (
                    <button
                      key={`category-card-${category}`}
                      type="button"
                      onClick={() => {
                        setActiveSeries("all");
                        onCategoryChange(category);
                      }}
                      className="group flex items-center gap-3 rounded-[22px] border border-white/8 bg-[rgba(255,255,255,0.04)] px-3 py-3 text-left transition-all hover:border-white/16 hover:bg-[rgba(255,255,255,0.07)]"
                    >
                      <div className="relative h-16 w-18 shrink-0 overflow-hidden rounded-[16px] border border-white/10 bg-white">
                        {categoryItem ? (
                          <PlannerCatalogImage
                            item={categoryItem}
                            alt={category}
                            sizes="80px"
                            className="object-cover"
                          />
                        ) : null}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-[13px] font-semibold tracking-[0.01em] text-white">
                            {category}
                          </p>
                          <span className="rounded-full border border-white/10 bg-black/10 px-2 py-0.5 text-[9px] font-semibold tracking-[0.06em] text-[var(--planner-shell-muted)]">
                            {supportFilteredCatalog.filter((item) => (item.categoryLabel ?? item.category) === category).length}
                          </span>
                        </div>
                        <p className="mt-1 text-[11px] leading-5 text-[var(--planner-shell-muted)]">
                          Open the category, then narrow by series.
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : null}

            {!catalogLoading && !catalogError && shouldChooseSeriesNext ? (
              <div className="grid grid-cols-1 gap-2.5 px-3.5 pt-3.5 pb-10">
                <div className="rounded-[22px] border border-dashed border-white/12 bg-[rgba(255,255,255,0.03)] px-4 py-5 text-left">
                  <p className="text-[11px] font-semibold tracking-[0.16em] text-[var(--planner-shell-muted)] uppercase">
                    Step 2 · Series
                  </p>
                  <p className="mt-2 text-[15px] font-semibold text-white">
                    Select the series inside {activeCategory}.
                  </p>
                  <p className="mt-1 text-[12px] leading-5 text-[var(--planner-shell-muted)]">
                    One series keeps the item stage short, premium, and easier to compare.
                  </p>
                </div>
                {seriesCards.map((series) => (
                  <button
                    key={`series-card-${series.label}`}
                    type="button"
                    onClick={() => setActiveSeries(series.label)}
                    className="group overflow-hidden rounded-[22px] border border-white/8 bg-[rgba(255,255,255,0.04)] p-3 text-left transition-all hover:border-white/16 hover:bg-[rgba(255,255,255,0.07)]"
                  >
                    <div className="flex items-start gap-3">
                      {series.featuredItem ? (
                        <div className="relative h-16 w-18 shrink-0 overflow-hidden rounded-[16px] border border-white/10 bg-white">
                          <PlannerCatalogImage
                            item={series.featuredItem}
                            alt={series.label}
                            sizes="80px"
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div
                          className={cn(
                            "flex h-14 w-14 shrink-0 items-center justify-center rounded-[16px] border border-white/10 bg-gradient-to-br text-[11px] font-semibold tracking-[0.06em] text-white",
                            series.tone,
                          )}
                        >
                          {series.label.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate text-[13px] font-semibold text-white">
                            {series.label}
                          </p>
                          <span className="rounded-full border border-white/10 bg-white/6 px-2 py-0.5 text-[10px] font-semibold tracking-[0.04em] text-[var(--planner-shell-muted)]">
                            {series.count}
                          </span>
                        </div>
                        <p className="mt-1 text-[11px] leading-5 text-[var(--planner-shell-muted)]">
                          {series.featuredItem
                            ? `Lead with ${series.featuredItem.name}`
                            : "Open this series"}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : null}

            {!catalogLoading && !catalogError && shouldShowItemList ? (
              <div className="grid grid-cols-1 gap-2.5 px-3.5 pt-3.5 pb-10">
                <div className="rounded-[22px] border border-dashed border-white/12 bg-[rgba(255,255,255,0.03)] px-4 py-5 text-left">
                  <p className="text-[11px] font-semibold tracking-[0.16em] text-[var(--planner-shell-muted)] uppercase">
                    Step 3 · Curated Items
                  </p>
                  <p className="mt-2 text-[15px] font-semibold text-white">
                    Browse the selected series.
                  </p>
                  <p className="mt-1 text-[12px] leading-5 text-[var(--planner-shell-muted)]">
                    Compare the short list, stage one item, then place it deliberately on the canvas.
                  </p>
                </div>
                {filteredCatalog.map((item) => {
                  const isSelected = item.id === selectedItem?.id;
                  const secondarySpecCue = getSecondarySpecCue(item);

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onSelectItem(item.id)}
                      className={cn(
                        "group flex w-full items-center gap-3 rounded-[22px] border px-3 py-3 text-left transition-all",
                        isSelected
                          ? "border-[var(--planner-accent-soft-border)] bg-[var(--planner-accent-soft-bg)] shadow-[var(--planner-shadow-accent)]"
                          : "border-white/8 bg-[rgba(255,255,255,0.04)] hover:border-white/16 hover:bg-[rgba(255,255,255,0.07)]",
                      )}
                    >
                      <div
                        className={cn(
                          "relative h-22 w-24 shrink-0 overflow-hidden rounded-[18px] border transition-colors",
                          isSelected
                            ? "border-white/40 bg-white"
                            : "border-white/10 bg-white group-hover:border-white/25",
                        )}
                      >
                        <PlannerCatalogImage
                          item={item}
                          alt={item.name}
                          sizes="112px"
                          className="object-cover"
                        />
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/45 to-transparent px-2 py-1">
                          <span className="text-[8px] font-semibold tracking-[0.08em] text-white uppercase">
                            {item.categoryLabel ?? item.category}
                          </span>
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="truncate text-[12px] font-semibold tracking-[0.12em] text-[var(--planner-shell-muted)] uppercase">
                            {getSeriesLabel(item)}
                          </p>
                          <span className="rounded-full border border-white/10 bg-white/10 px-2 py-0.5 text-[10px] font-semibold tracking-[0.03em] text-[var(--planner-shell-muted)]">
                            {getSupportBadge(item)}
                          </span>
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                          <p
                            className={cn(
                              "truncate text-[15px] font-semibold tracking-[0.01em] transition-colors",
                              isSelected ? "text-[var(--text-heading)]" : "text-white",
                            )}
                          >
                            {item.name}
                          </p>
                        </div>
                        <p className="mt-1 line-clamp-2 text-[11px] leading-5 text-[var(--planner-shell-muted)]">
                          {item.spec?.trim() ||
                            "Preview dimensions, finish direction, and support readiness before staging."}
                        </p>
                        <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[10px] font-semibold tracking-[0.03em] text-[var(--planner-shell-muted)]">
                          <span
                            className={cn(
                              "rounded-full border px-2 py-0.5",
                              isSelected
                                ? "border-white/14 bg-white/8 text-[var(--text-heading)]/80"
                                : "border-white/8 bg-black/10",
                            )}
                          >
                            {getDimensionLabel(item)}
                          </span>
                          <span className="rounded-full border border-white/8 bg-black/10 px-2 py-0.5">
                            {secondarySpecCue}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : null}

            {canShowMore &&
            supportFilter === "all" &&
            resolvedActiveSeries === "all" &&
            !catalogLoading &&
            !catalogError ? (
              <div className="px-4 pb-12">
                <Button
                  variant="outline"
                  className="w-full rounded-2xl border-white/10 bg-white/6 py-6 text-[12px] font-semibold tracking-[0.05em] text-[var(--planner-shell-muted)] hover:bg-white/10 hover:text-white"
                  onClick={onShowMore}
                >
                  Show {totalVisibleCount - displayedCount} more products
                </Button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </aside>
  );
}
