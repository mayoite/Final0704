"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Search, Sparkles, X } from "lucide-react";
import { OneAndOnlyLogo } from "@/components/ui/Logo";
import { type GroupedCategory } from "@/lib/navigation";
import { SITE_NAV_LINKS, SITE_CTA_LINKS } from "@/lib/siteNav";
import { cn } from "@/lib/utils";

interface NavSearchResult {
  id: string;
  title: string;
  href: string;
  type: "product" | "category" | "page";
  source: "ai" | "local";
}

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

interface MobileNavDrawerProps {
  open: boolean;
  onClose: () => void;
  closeButtonRef: React.RefObject<HTMLButtonElement | null>;
  groupedCategories: GroupedCategory[];
}

const drawerSearchClass =
  "flex items-center gap-2 rounded-[var(--radius-lg)] border px-3 py-2.5 [border-color:var(--border-soft)] [background:var(--surface-glass-strong)] [box-shadow:var(--shadow-soft)]";
const drawerGroupLabelClass =
  "px-3 pb-1 pt-2 text-muted [font-size:var(--type-body-size)] font-semibold uppercase tracking-widest [line-height:1.25]";
const drawerLinkClass =
  "flex min-h-12 items-center rounded-xl px-3 font-normal text-strong hover:bg-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary [font-size:var(--type-body-size)]";
const drawerSubtleLinkClass =
  "flex min-h-11 items-center justify-between rounded-lg px-3 text-base text-body hover:bg-panel";
const drawerSubcategoryLinkClass =
  "flex min-h-9 items-center justify-between rounded-md px-2 py-1 text-sm text-muted hover:bg-panel";
const drawerCallLinkClass =
  "mb-3 flex min-h-12 items-center justify-center rounded-lg border border-soft font-semibold text-primary transition-colors hover:border-primary hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary [font-size:var(--type-body-size)] [letter-spacing:var(--type-letter-copy)] [line-height:1.6]";
const drawerSearchNoteClass =
  "text-muted [font-size:var(--type-body-size)] font-medium [letter-spacing:0.04em] [line-height:1.35]";
const drawerCountClass =
  "text-muted [font-size:var(--type-body-size)] font-medium [letter-spacing:0.04em] [line-height:1.35]";
const drawerShellClass =
  "border-l shadow-2xl [border-color:var(--border-soft)] [background:var(--surface-panel-strong)] [box-shadow:-22px_0_54px_-34px_var(--overlay-inverse-12)]";

export function MobileNavDrawer({ open, onClose, closeButtonRef, groupedCategories }: MobileNavDrawerProps) {
  const router = useRouter();
  const drawerRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const [accordion, setAccordion] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<NavSearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSearchPanel, setShowSearchPanel] = useState(false);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (open) {
      setTimeout(() => closeBtnRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      setSearchQuery("");
      setSearchResults([]);
      setSearchLoading(false);
      setShowSearchPanel(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab" || !drawerRef.current) return;

      const focusable = drawerRef.current.querySelectorAll<HTMLElement>(
        "a[href], button:not([disabled]), input, [tabindex]:not([tabindex='-1'])",
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const query = searchQuery.trim();
    if (query.length < 2) {
      setSearchResults([]);
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
          body: JSON.stringify({ query, limit: 8, context: "mobile" }),
          signal: controller.signal,
        });

        const payload = (await response.json()) as {
          results?: NavSearchResult[];
        };

        if (!response.ok) {
          setSearchResults([]);
          return;
        }
        setSearchResults(Array.isArray(payload.results) ? payload.results : []);
      } catch {
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 260);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [open, searchQuery]);

  const handleClose = () => {
    onClose();
    setTimeout(() => closeButtonRef.current?.focus(), 50);
  };

  const onSearchResultClick = () => {
    setShowSearchPanel(false);
    setSearchQuery("");
    handleClose();
  };

  const submitSearch = async () => {
    const query = searchQuery.trim();
    const destination = await resolveSearchDestination(query, "mobile", searchResults);
    router.push(destination);
    setShowSearchPanel(false);
    setSearchQuery("");
    handleClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] bg-[var(--surface-inverse)]/30 backdrop-blur-sm lg:hidden"
            aria-hidden="true"
            onClick={handleClose}
          />

          <motion.div
            ref={drawerRef}
            id="mobile-nav-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.24, ease: "easeInOut" }}
            className={`${drawerShellClass} fixed inset-y-0 right-0 z-[70] flex w-[92vw] max-w-md flex-col overflow-y-auto lg:hidden`}
          >
            <div className="flex items-center justify-between border-b border-soft px-5 py-4">
              <OneAndOnlyLogo className="h-8" variant="orange" />
              <button
                ref={closeBtnRef}
                type="button"
                onClick={handleClose}
                aria-label="Close navigation"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-soft text-muted hover:bg-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto px-5 py-4" aria-label="Mobile primary navigation">
              <div className="mb-4">
                <form
                  className={drawerSearchClass}
                  onSubmit={(event) => {
                    event.preventDefault();
                    void submitSearch();
                  }}
                >
                  <Search className="h-4 w-4 text-muted" />
                  <input
                    id="mobile-nav-search"
                    name="search"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    onFocus={() => setShowSearchPanel(true)}
                    placeholder="AI search products..."
                    className="w-full bg-transparent text-sm text-strong outline-none placeholder:text-subtle"
                    aria-label="Mobile AI product search"
                  />
                  <Sparkles className="h-4 w-4 text-accent1" />
                  <button type="submit" className="sr-only">
                    Submit mobile search
                  </button>
                </form>

                {(showSearchPanel || searchQuery.trim().length >= 2) && (
                  <div className="mt-2 rounded-2xl border border-soft bg-hover p-3">
                    <p className={drawerSearchNoteClass}>
                      {searchLoading
                        ? "Searching"
                        : searchResults.length > 0
                          ? "Results"
                          : "No results"}
                    </p>
                    {searchLoading ? (
                      <p className="text-sm text-muted">Searching...</p>
                    ) : searchResults.length > 0 ? (
                      <ul className="space-y-1">
                        {searchResults.map((result) => (
                          <li key={result.id}>
                            <Link
                              href={result.href}
                              onClick={onSearchResultClick}
                              className="flex items-center justify-between rounded-lg bg-panel px-3 py-2 text-sm text-body"
                            >
                              <span>{result.title}</span>
                              <span className={drawerCountClass}>
                                {result.type}
                              </span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted">
                        Type at least 2 characters to search.
                      </p>
                    )}
                  </div>
                )}
              </div>

              <ul className="space-y-1">
                {SITE_NAV_LINKS.map((link) => {
                  if ("hasMega" in link && link.hasMega) {
                    const isOpen = Boolean(accordion.products);
                    return (
                      <li key={link.label}>
                        <button
                          type="button"
                          aria-expanded={isOpen}
                          onClick={() =>
                            setAccordion((prev) => ({ ...prev, products: !prev.products }))
                          }
                          className={`${drawerLinkClass} w-full justify-between`}
                        >
                          {link.label}
                          <ChevronDown
                            className={cn(
                              "h-4 w-4 text-subtle transition-transform",
                              isOpen && "rotate-180",
                            )}
                          />
                        </button>

                        {isOpen && (
                          <div className="mt-1 space-y-2 rounded-xl border border-soft bg-hover p-2">
                            <Link
                              href="/products"
                              onClick={handleClose}
                              className={`${drawerSubtleLinkClass} text-primary`}
                            >
                              All Products
                            </Link>

                            {groupedCategories.map((group) => (
                              <div key={group.groupId}>
                                <p className={drawerGroupLabelClass}>
                                  {group.groupLabel}
                                </p>
                                <ul className="space-y-1">
                                  {group.items.map((item) => (
                                    <li key={item.id}>
                                      {item.name.trim().toLowerCase() !== group.groupLabel.trim().toLowerCase() && (
                                        <Link
                                          href={item.href}
                                          onClick={handleClose}
                                          className={drawerSubtleLinkClass}
                                        >
                                          <span>{item.name}</span>
                                          {typeof item.count === "number" && (
                                            <span className={drawerCountClass}>{item.count}</span>
                                          )}
                                        </Link>
                                      )}

                                      {Array.isArray(item.subcategories) &&
                                        item.subcategories.length > 0 && (
                                        <ul className="ml-5 mt-1 space-y-0.5 border-l border-soft pl-3">
                                          {item.subcategories.map((subcategory) => (
                                            <li key={`${item.id}-${subcategory.id}`}>
                                              <Link
                                                href={subcategory.href}
                                                onClick={handleClose}
                                                className={drawerSubcategoryLinkClass}
                                              >
                                                <span>{subcategory.name}</span>
                                                {typeof subcategory.count === "number" && (
                                                  <span className={drawerCountClass}>
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
                          </div>
                        )}
                      </li>
                    );
                  }

                  return (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        onClick={handleClose}
                        className={drawerLinkClass}
                      >
                        {link.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="sticky bottom-0 border-t border-soft bg-panel px-5 py-4">
              <a
                href="tel:+919835630940"
                onClick={handleClose}
                className={drawerCallLinkClass}
                aria-label="Call +91 98356 30940"
              >
                Call +91 98356 30940
              </a>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {SITE_CTA_LINKS.map((cta) => (
                  <Link
                    key={cta.label}
                    href={cta.href}
                    onClick={handleClose}
                    className={cn(
                      cta.variant === "primary" ? "btn-primary" : "btn-outline",
                      "w-full justify-center",
                    )}
                  >
                    {cta.label}
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}


