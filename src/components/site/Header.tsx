"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Menu, Search, Sparkles } from "lucide-react";
import { OneAndOnlyLogo } from "@/components/ui/Logo";
import {
  NAV_CATEGORY_GROUP_ORDER,
  NAV_CATEGORY_GROUPS,
  groupCategories,
  type GroupedCategory,
} from "@/lib/navigation";
import { SITE_NAV_LINKS } from "@/lib/siteNav";
import { MobileNavDrawer } from "@/components/site/MobileNavDrawer";
import { cn } from "@/lib/utils";

function prettify(id: string): string {
  return id
    .split("-")
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(" ");
}

const FALLBACK_CATEGORY_GROUPS: GroupedCategory[] = NAV_CATEGORY_GROUP_ORDER.map((groupId) => ({
  groupId,
  groupLabel: NAV_CATEGORY_GROUPS[groupId].label,
  items: NAV_CATEGORY_GROUPS[groupId].ids.map((id) => ({
    id,
    name: prettify(id),
    count: undefined,
    href: `/products/${id}`,
  })),
}));

interface NavSearchResult {
  id: string;
  title: string;
  href: string;
  type: "product" | "category" | "page";
  source: "ai" | "local";
}

type NavSearchMode = "ai" | "local" | "static-fallback";

async function resolveSearchDestination(
  query: string,
  context: "header" | "mobile",
  currentResults: NavSearchResult[],
) {
  if (currentResults[0]?.href) {
    return currentResults[0].href;
  }

  if (query.length < 2) {
    return "/products";
  }

  try {
    const response = await fetch(
      `/api/nav-search/?q=${encodeURIComponent(query)}&limit=1&context=${context}`,
    );
    if (!response.ok) {
      return "/products";
    }
    const payload = (await response.json()) as { results?: NavSearchResult[] };
    return payload.results?.[0]?.href || "/products";
  } catch {
    return "/products";
  }
}

const siteHeaderBaseClass =
  "fixed top-0 left-0 z-50 w-full border-b border-soft backdrop-blur-xl transition-shadow [background-color:var(--surface-glass-strong)] [transition-duration:var(--motion-fast)] [transition-timing-function:var(--ease-standard)]";
const siteHeaderScrolledClass = "[box-shadow:var(--shadow-panel)]";
const headerSearchShellClass =
  "border [border-color:var(--border-soft)] [background:var(--surface-glass-strong)] [box-shadow:var(--shadow-soft)] [backdrop-filter:blur(12px)]";
const headerSearchPanelClass =
  "absolute right-0 mt-2 w-[24rem] overflow-hidden border p-4 [border-radius:var(--radius-xl)] [border-color:var(--border-soft)] [background:var(--surface-glass-strong)] [box-shadow:var(--shadow-panel)] [backdrop-filter:blur(18px)]";
const headerSearchMetaClass =
  "mb-2 flex items-center justify-between text-muted [font-size:var(--type-body-size)] font-medium [letter-spacing:0.04em] [line-height:1.35]";
const headerSearchBadgeClass =
  "rounded-full bg-hover px-2 py-0.5 text-body [font-size:var(--type-body-size)] font-medium [letter-spacing:0.04em] [line-height:1.35]";
const headerSearchKindClass =
  "text-muted [font-size:var(--type-body-size)] font-semibold uppercase [letter-spacing:0.14em] [line-height:1.25]";
const OTHERS_SUBCATEGORY_NAMES = new Set(["Cafe chairs", "Cafe Tables"]);
const OTHERS_SUBCATEGORY_ORDER = ["Cafe Tables", "Cafe chairs"] as const;

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeMega, setActiveMega] = useState<string | null>(null);
  const [groupedCategories, setGroupedCategories] = useState<GroupedCategory[]>(
    FALLBACK_CATEGORY_GROUPS,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<NavSearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchSource, setSearchSource] = useState<NavSearchMode | null>(null);
  const [showSearchPanel, setShowSearchPanel] = useState(false);

  const hamburgerRef = useRef<HTMLButtonElement>(null);
  const searchPanelRef = useRef<HTMLDivElement>(null);

  // Fetch real product categories for mega menu
  useEffect(() => {
    fetch("/api/nav-categories/")
      .then((res) => res.json())
      .then((payload: { groups?: GroupedCategory[]; categories?: Array<{ id: string; name: string; count?: number }> }) => {
        if (Array.isArray(payload.groups) && payload.groups.length > 0) {
          setGroupedCategories(payload.groups);
          return;
        }
        if (Array.isArray(payload.categories) && payload.categories.length > 0) {
          setGroupedCategories(groupCategories(payload.categories));
          return;
        }
      })
      .catch(() => {});
  }, []);

  // Scroll shadow
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) setMobileOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Esc closes mega menu
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveMega(null);
        setShowSearchPanel(false);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!searchPanelRef.current) return;
      if (!searchPanelRef.current.contains(event.target as Node)) {
        setShowSearchPanel(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  useEffect(() => {
    setShowSearchPanel(false);
  }, [pathname]);

  useEffect(() => {
    const query = searchQuery.trim();
    if (query.length < 2) {
      setSearchResults([]);
      setSearchSource(null);
      setSearchLoading(false);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const response = await fetch("/api/nav-search/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query, limit: 8, context: "header" }),
          signal: controller.signal,
        });
        const payload = (await response.json()) as {
          results?: NavSearchResult[];
          fallbackUsed?: boolean;
          rankingMode?: NavSearchMode;
        };

        if (!response.ok) {
          setSearchResults([]);
          setSearchSource(null);
          return;
        }

        const results = Array.isArray(payload.results) ? payload.results : [];
        setSearchResults(results);
        setSearchSource(payload.rankingMode || null);
      } catch {
        setSearchResults([]);
        setSearchSource(null);
      } finally {
        setSearchLoading(false);
      }
    }, 260);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [searchQuery]);

  const searchSectionTitle = !searchQuery.trim()
    ? "Quick links"
    : searchLoading
      ? "Searching"
      : searchResults.length > 0
        ? "Results"
        : "No results";

  const onSearchResultClick = () => {
    setShowSearchPanel(false);
    setSearchQuery("");
  };

  const submitSearch = async () => {
    const query = searchQuery.trim();
    const destination = await resolveSearchDestination(query, "header", searchResults);
    router.push(destination);
    setShowSearchPanel(false);
    setSearchQuery("");
  };

  const megaMenuGroups = useMemo(
    () =>
      groupedCategories.map((group) => ({
        ...group,
        items: group.items.map((item) => ({
          ...item,
          subcategories: Array.isArray(item.subcategories)
            ? item.subcategories.filter(
                (subcategory) => !OTHERS_SUBCATEGORY_NAMES.has(subcategory.name),
              )
            : [],
        })),
      })),
    [groupedCategories],
  );

  const megaMenuOthers = useMemo(() => {
    const extracted = new Map<
      string,
      { id: string; name: string; href: string; count?: number }
    >();

    for (const group of groupedCategories) {
      for (const item of group.items) {
        if (!Array.isArray(item.subcategories)) continue;
        for (const subcategory of item.subcategories) {
          if (!OTHERS_SUBCATEGORY_NAMES.has(subcategory.name)) continue;
          extracted.set(subcategory.name, {
            id: subcategory.id,
            name: subcategory.name,
            href: subcategory.href,
            count: subcategory.count,
          });
        }
      }
    }

    const values = Array.from(extracted.values());
    values.sort((a, b) => {
      const aIndex = OTHERS_SUBCATEGORY_ORDER.indexOf(
        a.name as (typeof OTHERS_SUBCATEGORY_ORDER)[number],
      );
      const bIndex = OTHERS_SUBCATEGORY_ORDER.indexOf(
        b.name as (typeof OTHERS_SUBCATEGORY_ORDER)[number],
      );
      const ai = aIndex === -1 ? Number.MAX_SAFE_INTEGER : aIndex;
      const bi = bIndex === -1 ? Number.MAX_SAFE_INTEGER : bIndex;
      return ai - bi;
    });

    return values;
  }, [groupedCategories]);

  const openGuidedPlanner = () => {
    window.dispatchEvent(new CustomEvent("oando-assistant:open"));
  };

  return (
    <>
      <header className={cn(siteHeaderBaseClass, scrolled ? siteHeaderScrolledClass : "shadow-none")}>
        <div className="container-wide px-4 sm:px-6">
          <div className="flex h-16 items-center justify-between gap-3">

            {/* Logo */}
            <Link
              href="/"
              aria-label="One&Only - home"
              className="inline-flex h-full shrink-0 items-center rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              <OneAndOnlyLogo className="h-7.5 md:h-8.5 xl:h-9" variant="orange" />
            </Link>

            {/* Center nav — desktop only */}
            <nav
              className="hidden h-full min-w-0 flex-1 items-center justify-center gap-0 lg:flex xl:gap-0.5"
              aria-label="Primary navigation"
            >
              {SITE_NAV_LINKS.map((link) => {
                const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
                const hasMega = "hasMega" in link && link.hasMega;

                if (hasMega) {
                  return (
                    <div
                      key={link.label}
                      className="relative"
                      onMouseEnter={() => setActiveMega(link.label)}
                      onMouseLeave={() => setActiveMega(null)}
                    >
                      <button
                        type="button"
                        aria-expanded={activeMega === link.label}
                        aria-controls="products-mega-menu"
                        onFocus={() => setActiveMega(link.label)}
                        className={cn(
                          "typ-nav relative inline-flex items-center gap-1 whitespace-nowrap rounded-lg px-2 py-2 text-[0.95rem] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary xl:px-2.5 xl:text-[1rem]",
                          isActive
                            ? "text-primary after:absolute after:bottom-0 after:left-3 after:right-3 after:h-0.5 after:rounded-full after:bg-(--color-contrast-accent) after:content-['']"
                            : activeMega === link.label
                              ? "text-primary"
                              : "text-body hover:text-primary",
                        )}
                      >
                        {link.label}
                        <ChevronDown
                          className={cn(
                            "h-3.5 w-3.5 transition-transform",
                            activeMega === link.label && "rotate-180",
                          )}
                        />
                      </button>
                    </div>
                  );
                }

                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    className={cn(
                      "typ-nav relative whitespace-nowrap rounded-lg px-2 py-2 text-[0.95rem] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary xl:px-2.5 xl:text-[1rem]",
                      isActive
                        ? "text-primary after:absolute after:bottom-0 after:left-3 after:right-3 after:h-0.5 after:rounded-full after:bg-(--color-contrast-accent) after:content-['']"
                        : "text-body hover:text-primary",
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* Right CTAs */}
            <div className="flex h-full shrink-0 items-center gap-1.5">
              <div ref={searchPanelRef} className="relative hidden 2xl:block">
                <form
                  className={`${headerSearchShellClass} flex h-11 items-center gap-2.5 rounded-full px-4`}
                  onSubmit={(event) => {
                    event.preventDefault();
                    void submitSearch();
                  }}
                >
                  <Search className="h-4 w-4 text-muted" />
                  <input
                    id="site-header-search"
                    name="search"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    onFocus={() => setShowSearchPanel(true)}
                    placeholder="AI search products..."
                    className="w-44 bg-transparent text-sm text-strong outline-none placeholder:text-subtle"
                    aria-label="Search products with AI"
                  />
                  <Sparkles className="h-4 w-4 text-(--color-contrast-accent)" />
                  <button type="submit" className="sr-only">
                    Submit header search
                  </button>
                </form>

                <AnimatePresence>
                  {showSearchPanel && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.15 }}
                      className={headerSearchPanelClass}
                    >
                      <div className={headerSearchMetaClass}>
                        <span>{searchSectionTitle}</span>
                        {searchSource && (
                          <span className={headerSearchBadgeClass}>
                            {searchSource === "ai"
                              ? "AI ranked"
                              : searchSource === "static-fallback"
                                ? "Static fallback"
                                : "Local search"}
                          </span>
                        )}
                      </div>
                      {searchLoading ? (
                        <p className="py-6 text-sm text-muted">Searching...</p>
                      ) : searchResults.length > 0 ? (
                        <ul className="space-y-1">
                          {searchResults.map((result) => (
                            <li key={result.id}>
                              <Link
                                href={result.href}
                                onClick={onSearchResultClick}
                                className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm text-body hover:bg-hover hover:text-strong"
                              >
                                <span>{result.title}</span>
                                <span className={headerSearchKindClass}>
                                  {result.type}
                                </span>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="space-y-1 py-2">
                          <Link
                            href="/products"
                            onClick={onSearchResultClick}
                            className="flex items-center justify-between rounded-xl px-3 py-2 text-sm text-body hover:bg-hover"
                          >
                            All Products
                          </Link>
                          <Link
                            href="/solutions"
                            onClick={onSearchResultClick}
                            className="flex items-center justify-between rounded-xl px-3 py-2 text-sm text-body hover:bg-hover"
                          >
                            Solutions
                          </Link>
                          <Link
                            href="/projects"
                            onClick={onSearchResultClick}
                            className="flex items-center justify-between rounded-xl px-3 py-2 text-sm text-body hover:bg-hover"
                          >
                            Projects
                          </Link>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button
                type="button"
                onClick={openGuidedPlanner}
                className="btn-hero-primary btn-hero-accent"
              >
                Guided Planner
              </button>

              {/* Hamburger — mobile only */}
              <button
                ref={hamburgerRef}
                type="button"
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileOpen}
                aria-controls="mobile-nav-drawer"
                onClick={() => setMobileOpen((prev) => !prev)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-soft text-body lg:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Products mega menu */}
        <AnimatePresence>
          {activeMega === "Products" && (
            <motion.div
              id="products-mega-menu"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.15 }}
              onMouseEnter={() => setActiveMega("Products")}
              onMouseLeave={() => setActiveMega(null)}
              className="hidden lg:block border-t border-soft [background:var(--surface-panel-strong)] backdrop-blur-md shadow-theme-soft"
            >
              <div className="container-wide px-6 py-8">
                <div className={cn("grid gap-5", megaMenuOthers.length > 0 ? "grid-cols-7" : "grid-cols-6")}>
                  {megaMenuGroups.map((group, groupIndex) => (
                    <div
                      key={group.groupId}
                      className={cn(
                        "min-w-0 px-3",
                        groupIndex > 0 && "border-l border-soft",
                      )}
                    >
                      <Link
                        href={group.items[0]?.href || `/products/${group.groupId}`}
                        onClick={() => setActiveMega(null)}
                        className="typ-overline mb-2 inline-flex text-strong transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      >
                        {group.groupLabel}
                      </Link>
                      <ul className="space-y-1.5">
                        {group.items.map((item) => (
                          <li key={item.id}>
                            {item.name.trim().toLowerCase() !== group.groupLabel.trim().toLowerCase() && (
                              <Link
                                href={item.href}
                                onClick={() => setActiveMega(null)}
                                className="flex items-center justify-between rounded-lg px-2 py-1.5 text-[0.96rem] text-strong hover:bg-soft hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                              >
                                <span>{item.name}</span>
                                {typeof item.count === "number" && (
                                  <span className="text-xs font-medium text-muted">
                                    {item.count}
                                  </span>
                                )}
                              </Link>
                            )}

                            {Array.isArray(item.subcategories) &&
                              item.subcategories.length > 0 && (
                              <ul className="ml-2 mt-1.5 space-y-1 border-l border-soft pl-2.5">
                                {item.subcategories.map((subcategory) => (
                                  <li key={`${item.id}-${subcategory.id}`}>
                                    <Link
                                      href={subcategory.href}
                                      onClick={() => setActiveMega(null)}
                                      className="flex items-center justify-between rounded-md px-2 py-1 text-[0.88rem] text-body hover:bg-soft hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                                    >
                                      <span>{subcategory.name}</span>
                                      {typeof subcategory.count === "number" && (
                                        <span className="text-xs text-subtle">
                                          {subcategory.count}
                                        </span>
                                      )}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                              )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}

                  {megaMenuOthers.length > 0 && (
                    <div className="min-w-0 border-l border-soft px-3">
                      <Link
                        href="/products"
                        onClick={() => setActiveMega(null)}
                        className="typ-overline mb-2 inline-flex text-strong transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      >
                        Others
                      </Link>
                      <ul className="space-y-1.5">
                        {megaMenuOthers.map((subcategory) => (
                          <li key={subcategory.name}>
                            <Link
                              href={subcategory.href}
                              onClick={() => setActiveMega(null)}
                              className="flex items-center justify-between rounded-lg px-2 py-1.5 text-[0.96rem] text-strong hover:bg-soft hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                            >
                              <span>{subcategory.name}</span>
                              {typeof subcategory.count === "number" && (
                                <span className="text-xs font-medium text-muted">
                                  {subcategory.count}
                                </span>
                              )}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                </div>
                <div className="mt-4 border-t border-soft pt-3">
                  <Link
                    href="/products"
                    onClick={() => setActiveMega(null)}
                    className="inline-flex items-center rounded-lg px-3 py-2 text-sm font-semibold text-primary hover:bg-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    All Products &gt;
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Mobile drawer — rendered outside header to avoid z-index conflicts */}
      <MobileNavDrawer
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        closeButtonRef={hamburgerRef}
        groupedCategories={groupedCategories}
      />
    </>
  );
}
