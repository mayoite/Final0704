"use client";

import { createElement, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import type {
  CompatProduct as Product,
  ProductVariant,
} from "@/lib/getProducts";
import {
  ArrowLeft,
  ChevronRight,
  Share2,
  MessageSquare,
  GitCompareArrows,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import clsx from "clsx";
import ThreeViewer from "@/components/ThreeViewer";
import { Reviews } from "@/components/Reviews";
import { ProductGallery } from "@/components/ProductGallery";
import { useProductCompare } from "@/lib/store/productCompare";
import { CompareDock } from "@/components/products/CompareDock";
import {
  sanitizeDisplayText as normalizeDisplayText,
  filterMeaningfulDimensionText,
  filterMeaningfulMaterialList,
  splitDimensionVariants,
} from "@/lib/displayText";
import { PDP_ROUTE_COPY } from "@/data/site/routeCopy";

interface ProductViewerProps {
  product: Product;
  categoryRoute: string;
  categoryId?: string;
  categoryName: string;
  productRoute: string;
}

export function sanitizeDisplayText(value: string): string {
  return String(value || "")
    .replace(/[�]+/g, "")
    .replace(/â€”/g, "—")
    .replace(/â€“/g, "–")
    .replace(/â€˜|â€™/g, "'")
    .replace(/â€œ|â€\u009d|â€"/g, "\"")
    .replace(/\s+/g, " ")
    .trim();
}

function sanitizeDisplayList(values: string[]): string[] {
  return values.map((item) => normalizeDisplayText(item)).filter(Boolean);
}

export function ProductViewer({
  product,
  categoryRoute,
  categoryId,
  categoryName,
  productRoute,
}: ProductViewerProps) {
  const compareItems = useProductCompare((state) => state.items);
  const toggleCompareItem = useProductCompare((state) => state.toggleItem);
  const searchParams = useSearchParams();
  const cleanName = (raw: string) => {
    if (!raw) return raw;
    const m = raw.match(/^([A-Z][a-z]+(?:[- ][A-Z][a-z0-9]*)?)\1/);
    if (m && m[1]) return m[1];
    if (raw.length > 30 && !raw.includes(" ")) {
      const cap = raw.match(/^[A-Z][a-z]+/);
      if (cap) return cap[0];
    }
    return raw;
  };

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    product.variants && product.variants.length > 0
      ? product.variants[0]
      : null,
  );
  const displayName = cleanName(normalizeDisplayText(product.name));

  const modelPath =
    selectedVariant?.threeDModelUrl ||
    product["3d_model"] ||
    product.threeDModelUrl ||
    "";
  const hasModelPath = modelPath.length > 0;

  const allImages = [
    ...(product.images || []),
    product.flagshipImage,
    ...(selectedVariant?.galleryImages || []),
    ...(product.sceneImages || []),
  ].filter(Boolean) as string[];

  const uniqueImages = Array.from(new Set(allImages));
  const swatchFallbackImage =
    product.flagshipImage ||
    product.images?.find(Boolean) ||
    product.sceneImages?.find(Boolean) ||
    uniqueImages[0] ||
    "";
  const productImageAlt =
    (product as unknown as { altText?: string }).altText ||
    (product.metadata as Record<string, unknown> | undefined)?.ai_alt_text?.toString() ||
    (product.metadata as Record<string, unknown> | undefined)?.aiAltText?.toString() ||
    `Product image of ${displayName} in ${categoryName} category`;
  const metadataRecord = product.metadata as Record<string, unknown> | undefined;

  useEffect(() => {
    // Basic anonymous tracking for recommendations
    let userId = localStorage.getItem("oando_user_id");
    if (!userId) {
      userId = "user_" + Math.random().toString(36).substring(2, 9);
      localStorage.setItem("oando_user_id", userId);
    }

    fetch("/api/tracking/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, productId: product.id }),
    }).catch(console.error);
  }, [product.id]);

  const handleVariantChange = (variant: ProductVariant) => {
    setSelectedVariant(variant);
    // When variants change, uniqueImages will update which resets the ProductGallery index implicitly
  };

  const [is3DMode, setIs3DMode] = useState(false);
  const [isModelAvailable, setIsModelAvailable] = useState(false);
  const [isCheckingModel, setIsCheckingModel] = useState(false);

  useEffect(() => {
    let cancelled = false;

    if (!hasModelPath) {
      setIsModelAvailable(false);
      setIsCheckingModel(false);
      setIs3DMode(false);
      return;
    }

    const validateModel = async () => {
      setIsCheckingModel(true);
      try {
        const response = await fetch(modelPath, { method: "HEAD" });
        if (!cancelled) {
          const ok = response.ok;
          setIsModelAvailable(ok);
          if (!ok) setIs3DMode(false);
        }
      } catch {
        if (!cancelled) {
          setIsModelAvailable(false);
          setIs3DMode(false);
        }
      } finally {
        if (!cancelled) setIsCheckingModel(false);
      }
    };

    validateModel();
    return () => {
      cancelled = true;
    };
  }, [hasModelPath, modelPath]);

  const toText = (value: unknown): string => {
    if (typeof value === "string") return normalizeDisplayText(value);
    if (typeof value === "number") return String(value);
    return "";
  };
  const toStringList = (value: unknown): string[] => {
    if (!Array.isArray(value)) return [];
    return sanitizeDisplayList(value.map((item) => String(item)));
  };
  const routeKey = (product.slug || product.id || "").trim();
  const isDeskBasedWorkstation =
    categoryId === "workstations" &&
    /\b(desk|desking|bench|panel|workstation)\b/i.test(
      [
        product.slug || "",
        product.name || "",
        String(product.metadata?.subcategory || ""),
        String(product.metadata?.subcategoryId || ""),
      ].join(" "),
    );
  const workstationSizeText =
    "Available in sizes 900mm, 1050mm, 1200mm, 1500mm and more.";
  const compareId = `compare-${categoryId || "products"}-${routeKey}`;
  const inCompare = compareItems.some((item) => item.id === compareId);
  const rawFrom = searchParams.get("from");
  const safeFrom = rawFrom && rawFrom.length > 0 ? rawFrom.slice(0, 1500) : "";
  const encodedFrom = safeFrom ? encodeURIComponent(safeFrom) : "";
  const categoryRouteWithContext = safeFrom
    ? `${categoryRoute}?${safeFrom}`
    : categoryRoute;
  const productRouteWithContext = encodedFrom
    ? `${productRoute}?from=${encodedFrom}`
    : productRoute;
  const enquiryHref = `/contact?intent=quote&source=product&product=${encodeURIComponent(
    displayName,
  )}&ref=${encodeURIComponent(productRouteWithContext)}`;

  const rawSpecs =
    product.specs && typeof product.specs === "object" && !Array.isArray(product.specs)
      ? (product.specs as Record<string, unknown>)
      : {};

  const overview = normalizeDisplayText(
    product.detailedInfo?.overview || product.description || "",
  );
  const dimensionsRaw = filterMeaningfulDimensionText(
    toText(rawSpecs.dimensions) ||
      toText(rawSpecs.dimension) ||
      product.detailedInfo?.dimensions ||
      "",
  );
  const dimensionVariants = splitDimensionVariants(dimensionsRaw);
  const dimensions = dimensionVariants.length > 1
    ? dimensionVariants.join(" | ")
    : dimensionsRaw;
  const specMaterials = filterMeaningfulMaterialList(toStringList(rawSpecs.materials));
  const finishOptions = toStringList(rawSpecs.finish_options);
  const primaryMaterials = filterMeaningfulMaterialList(
    sanitizeDisplayList(product.detailedInfo?.materials?.filter(Boolean) || []),
  );
  const materials =
    specMaterials.length > 0
      ? specMaterials
      : primaryMaterials.length > 0
        ? primaryMaterials
        : [];
  const features = sanitizeDisplayList(
    product.detailedInfo?.features?.filter(
      (f: string) => f && f !== "MANUFACTURING" && f !== "Sustainability",
    ) || [],
  );
  const useCases = sanitizeDisplayList(
    Array.isArray(product.metadata?.useCase)
      ? product.metadata.useCase
      : toStringList(rawSpecs.use_case),
  );
  const warrantyYears = product.metadata?.warrantyYears;
  const warrantyRaw = toText(rawSpecs.warranty_text);
  const warrantyText = warrantyYears
    ? `${warrantyYears}-Year Warranty`
    : warrantyRaw;
  const certifications = sanitizeDisplayList([
    ...toStringList(rawSpecs.certifications),
    ...toStringList(metadataRecord?.certifications),
    ...(product.metadata?.bifmaCertified ? ["BIFMA Certified"] : []),
  ]);
  const certificationText = certifications.join(", ");
  const sustainabilityText =
    typeof product.metadata?.sustainabilityScore === "number"
      ? `Eco Score ${product.metadata.sustainabilityScore}/10`
      : toText(rawSpecs.sustainability_text);
  const quickConfig =
    toText(rawSpecs.configuration) ||
    toText(rawSpecs.type);
  const shortOverview = (() => {
    if (!overview) return "";
    const clean = overview.replace(/\s+/g, " ").trim();
    const sentenceMatch = clean.match(/^[^.!?]+[.!?]\s*[^.!?]*[.!?]?/);
    if (sentenceMatch?.[0]) return sentenceMatch[0].trim();
    return clean.length > 180 ? `${clean.slice(0, 180).trim()}...` : clean;
  })();
  const fullOverview =
    overview && shortOverview && overview !== shortOverview ? overview : "";
  const specRows = [
    {
      label: isDeskBasedWorkstation ? "Sizes" : "Dimensions",
      value: isDeskBasedWorkstation ? workstationSizeText : dimensions,
    },
    ...(materials.length > 0
      ? [
          {
            label: "Materials",
            value: materials.slice(0, 3).join(", "),
          },
        ]
      : []),
    ...(finishOptions.length > 0
      ? [
          {
            label: "Finish Options",
            value: finishOptions.slice(0, 3).join(", "),
          },
        ]
      : []),
    { label: "Warranty", value: warrantyText },
    { label: "Certification", value: certificationText },
    { label: "Configuration", value: quickConfig },
    {
      label: "Use Case",
      value: useCases.length > 0 ? useCases.slice(0, 3).join(", ") : "",
    },
    { label: "Sustainability", value: sustainabilityText },
  ].filter((row) => row.value);
  const formatSpecLabel = (key: string) =>
    key
      .replace(/_/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/\b\w/g, (c) => c.toUpperCase());
  const toSpecText = (value: unknown): string => {
    if (value === null || value === undefined) return "";
    if (Array.isArray(value)) return sanitizeDisplayList(value.map((v) => String(v))).join(", ");
    if (typeof value === "object") return "";
    return normalizeDisplayText(String(value));
  };
  const inlineSpecs = (() => {
    const entries: Array<{ label: string; value: string }> = [];
    const seen = new Set<string>();
    const blocked = new Set([
      "category",
      "subcategory",
      "dimensions",
      "materials",
      "finish_options",
      "features",
      "documents",
      "document_titles",
      "certifications",
      "warranty_text",
      "warranty_years",
      "bifma_certified",
      "price_range",
      "overview_sections",
      "dimension_sections",
      "sustainability_text",
      "sustainability_score",
    ]);

    const addEntriesFromObject = (source: unknown) => {
      if (!source || typeof source !== "object" || Array.isArray(source)) return;
      for (const [rawKey, rawValue] of Object.entries(
        source as Record<string, unknown>,
      )) {
        const key = rawKey.toLowerCase();
        if (blocked.has(key) || seen.has(key)) continue;
        const value = toSpecText(rawValue);
        if (!value) continue;
        entries.push({ label: formatSpecLabel(rawKey), value });
        seen.add(key);
      }
    };

    addEntriesFromObject(product.specs);
    addEntriesFromObject(
      metadataRecord?.specifications,
    );
    return entries.slice(0, 16);
  })();

  const hasReturnContext = Boolean(encodedFrom);
  const returnLabel = hasReturnContext
    ? PDP_ROUTE_COPY.ctas.returnToResults
    : PDP_ROUTE_COPY.ctas.returnToCategory;
  const useCasePreview = useCases.slice(0, 4);
  const materialPreview = materials.slice(0, 3).join(", ");
  const finishPreview = finishOptions.slice(0, 3).join(", ");
  const summaryCards = [
    { label: PDP_ROUTE_COPY.summary.bestFor, value: useCasePreview.join(", ") },
    { label: PDP_ROUTE_COPY.ctas.configuration, value: quickConfig },
    {
      label: isDeskBasedWorkstation ? "Sizes" : PDP_ROUTE_COPY.summary.dimensions,
      value: isDeskBasedWorkstation ? workstationSizeText : dimensions,
    },
    {
      label:
        materials.length > 0
          ? PDP_ROUTE_COPY.summary.materials
          : finishOptions.length > 0
            ? "Finish Options"
            : PDP_ROUTE_COPY.summary.materials,
      value: materials.length > 0 ? materialPreview : finishPreview,
    },
  ].filter((card) => card.value);
  const assuranceCards = [
    warrantyText ? { label: "Warranty", value: warrantyText } : null,
    certificationText ? { label: "Certification", value: certificationText } : null,
    sustainabilityText ? { label: "Sustainability", value: sustainabilityText } : null,
  ].filter(Boolean) as Array<{ label: string; value: string }>;
  const handleCompareToggle = () =>
    toggleCompareItem({
      id: compareId,
      productUrlKey: routeKey,
      categoryId: categoryId || "products",
      name: displayName,
      image: uniqueImages[0],
      href: productRouteWithContext,
    });

  return (
    <section className="pdp-page min-h-screen pb-24 sm:pb-28 lg:pb-0">
      {/* Breadcrumb bar */}
      <div className="pdp-breadcrumb-bar">
        <div className="pdp-breadcrumb container flex h-10 items-center gap-1.5 px-6 2xl:px-0">
          <Link
            href="/products"
            className="hover:text-strong transition-colors"
          >
            Products
          </Link>
          <ChevronRight className="w-3 h-3" />
          <Link
            href={categoryRouteWithContext}
            className="hover:text-strong transition-colors"
          >
            {categoryName}
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="scheme-text-strong font-semibold">
            {displayName}
          </span>
        </div>
      </div>

      <div className="pdp-shell">
        {/* Left: image gallery */}
        <div className="pdp-media-pane pdp-media-column">
          <div className="mx-auto flex-1 w-full max-w-200 p-4 lg:p-8">
            <ProductGallery
              images={uniqueImages}
              productName={displayName}
            />
          </div>
          {/* 3D viewer toggle wrapper */}
          {hasModelPath && (
            <div className="pdp-viewer-shell group">
              <div className="absolute top-4 left-4 z-20 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (!isModelAvailable) return;
                    setIs3DMode((prev) => !prev);
                  }}
                  disabled={!isModelAvailable}
                  className={clsx(
                    "pdp-chip pdp-chip--viewer-toggle px-3 py-1.5 backdrop-blur",
                    isModelAvailable
                      ? "scheme-text-body hover:bg-inverse hover:text-inverse transition-colors"
                      : "scheme-text-subtle cursor-not-allowed",
                  )}
                >
                  {is3DMode ? PDP_ROUTE_COPY.ctas.viewImage : PDP_ROUTE_COPY.ctas.view3d}
                </button>
              </div>
              {!isModelAvailable && !isCheckingModel && (
                <div className="absolute inset-0 z-10 flex items-center justify-center px-6 text-center">
                  <p className="typ-overline scheme-text-muted">
                    {PDP_ROUTE_COPY.ctas.modelUnavailable}
                  </p>
                </div>
              )}
              {isCheckingModel && (
                <div className="absolute inset-0 z-10 flex items-center justify-center px-6 text-center">
                  <p className="typ-overline scheme-text-muted">
                    {PDP_ROUTE_COPY.ctas.modelChecking}
                  </p>
                </div>
              )}

              {is3DMode && isModelAvailable ? (
                <div className="w-full h-full absolute inset-0 z-10 flex items-center justify-center bg-transparent">
                  <div className="hidden md:block w-full h-full">
                    <ThreeViewer
                      modelUrl={modelPath}
                      fallback={
                        <Image
                          src={uniqueImages[0]}
                          alt={productImageAlt}
                          width={1200}
                          height={900}
                          className="w-full h-full object-contain"
                        />
                      }
                    />
                  </div>
                  <div className="block md:hidden w-full h-full">
                    {createElement("model-viewer", {
                      src: modelPath,
                      ar: true,
                      "ios-src": modelPath.replace(".glb", ".usdz"),
                      "camera-controls": true,
                      "shadow-intensity": "1",
                      alt: `3D model of ${displayName}`,
                      className: "pdp-model-viewer",
                    })}
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>

        {/* Right: details panel */}
        <div className="pdp-detail-pane pdp-detail-column">
          <div className="max-w-sm mx-auto lg:max-w-none">
            {/* Title block */}
            <div className="mb-8">
              <h1 className="pdp-title mb-5 scheme-text-strong">
                {displayName}
              </h1>
              {shortOverview ? (
                <p className="text-sm sm:text-base scheme-text-body leading-relaxed font-light mb-6 max-w-prose">
                  {shortOverview}
                </p>
              ) : null}
              <div className="flex flex-wrap gap-2 mb-6">
                {warrantyText ? (
                  <span className="pdp-chip pdp-chip--soft px-2.5">
                    {warrantyText}
                  </span>
                ) : null}
                {product.metadata?.bifmaCertified && (
                  <span className="pdp-chip pdp-chip--solid px-2.5">
                    BIFMA
                  </span>
                )}
                {typeof product.metadata?.sustainabilityScore === "number" && (
                  <span className="pdp-chip pdp-chip--success px-2.5">
                    Eco {product.metadata.sustainabilityScore}/10
                  </span>
                )}
              </div>
              <div className="pdp-card">
                {summaryCards.length > 0 ? (
                  <>
                    <p className="mb-2 text-sm font-medium scheme-text-strong">
                      Product snapshot
                    </p>
                    <p className="mb-4 text-sm leading-relaxed scheme-text-body">
                      The quickest way to judge fit before drawings, quantities,
                      and commercial follow-up.
                    </p>
                    <div className="pdp-info-grid">
                      {summaryCards.map((card) => {
                        const isDimCard = (card.label === PDP_ROUTE_COPY.summary.dimensions || card.label === "Sizes") && dimensionVariants.length > 1;
                        return (
                          <div
                            key={card.label}
                            className="pdp-info-row"
                          >
                            <p className="pdp-card-label mb-2">
                              {card.label}
                            </p>
                            {isDimCard ? (
                              <ul className="flex flex-col gap-0.5">
                                {dimensionVariants.map((v, i) => (
                                  <li key={i} className="text-sm leading-relaxed scheme-text-body">{v}</li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-sm leading-relaxed scheme-text-body">
                                {card.value}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : null}
                {assuranceCards.length > 0 ? (
                  <div className="mt-5 border-t scheme-border pt-5">
                    <p className="pdp-card-label mb-3">Verified product facts</p>
                    <div className="pdp-info-grid">
                      {assuranceCards.map((item) => (
                        <div
                          key={item.label}
                          className="pdp-info-row text-sm leading-relaxed scheme-text-body"
                        >
                          <span className="font-medium scheme-text-strong">
                            {item.label}:
                          </span>{" "}
                          {item.value}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            {/* Variant swatches */}
            {product.variants && product.variants.length > 0 && (
              <div className="pdp-divider pt-7 mb-8">
                <div className="flex items-center justify-between mb-4">
                  <p className="pdp-section-label">
                    {PDP_ROUTE_COPY.ctas.configuration}
                  </p>
                  <span className="scheme-text-muted text-xs">
                    {product.variants.length} options
                  </span>
                </div>
                <div className="flex flex-wrap gap-2.5 mb-4">
                  {product.variants.map((variant: ProductVariant) => {
                    const isSelected = selectedVariant?.id === variant.id;
                    return (
                      <button
                        type="button"
                        key={variant.id}
                        onClick={() => handleVariantChange(variant)}
                        title={variant.variantName}
                        className={clsx(
                          "pdp-swatch",
                          isSelected
                            ? "pdp-swatch--active"
                            : "pdp-swatch--idle",
                        )}
                      >
                        <Image
                          src={variant.galleryImages?.[0] || product.flagshipImage || swatchFallbackImage || ""}
                          alt={variant.variantName}
                          fill
                          sizes="44px"
                          className="object-cover scale-150"
                        />
                      </button>
                    );
                  })}
                </div>
                {selectedVariant && (
                  <p className="text-xs scheme-text-muted">
                    <span className="font-semibold scheme-text-body">
                      Selected:
                    </span>{" "}
                    {selectedVariant.variantName}
                  </p>
                )}
              </div>
            )}

            {/* CTA */}
            <div className="mb-8">
              <div className="pdp-card pdp-card--plain">
                <p className="mb-2 text-sm font-medium scheme-text-strong">
                  Take the next step
                </p>
                <p className="mb-4 text-sm leading-relaxed scheme-text-body">
                  Start with one enquiry, compare options, and move into planning support
                  depending on where your team is in the decision.
                </p>
                <Link
                  href={enquiryHref}
                  className="pdp-cta-primary group mb-2"
                >
                  <span className="pdp-action-label">
                    {PDP_ROUTE_COPY.ctas.addToQuote}
                  </span>
                  <MessageSquare className="w-4 h-4" />
                </Link>
                {routeKey ? (
                  <button
                    type="button"
                    onClick={handleCompareToggle}
                    className={clsx(
                      "mb-2 flex w-full items-center justify-between rounded-2xl border px-6 py-4 transition-colors",
                      inCompare
                        ? "border-primary bg-primary text-inverse hover:bg-primary-hover"
                        : "scheme-border bg-panel scheme-text-body hover:border-primary hover:text-primary",
                    )}
                  >
                    <span className="pdp-action-label">
                      {inCompare
                        ? PDP_ROUTE_COPY.ctas.addedToCompare
                        : PDP_ROUTE_COPY.ctas.addToCompare}
                    </span>
                    <GitCompareArrows className="w-4 h-4" />
                  </button>
                ) : null}
                <Link
                  href="/contact"
                  className="pdp-cta-dark group"
                >
                  <span className="pdp-action-label">
                    {PDP_ROUTE_COPY.ctas.requestQuote}
                  </span>
                  <ArrowLeft className="w-4 h-4 rotate-180 transition-transform group-hover:translate-x-1" />
                </Link>
                <div className="mt-2 grid gap-2">
                  <Link
                    href="/planning"
                    className="pdp-cta-secondary group"
                  >
                    <span className="pdp-action-label">
                      {PDP_ROUTE_COPY.ctas.planning}
                    </span>
                    <ArrowLeft className="w-4 h-4 rotate-180 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
                <div className="mt-4 border-t scheme-border pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                    }}
                    aria-label={PDP_ROUTE_COPY.ctas.copyLink}
                    className="pdp-copy-link inline-flex items-center gap-2 text-sm scheme-text-body transition-colors hover:text-strong"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    {PDP_ROUTE_COPY.ctas.copyLink}
                  </button>
                  <Link
                    href={categoryRouteWithContext}
                    className="pdp-action-label mt-3 inline-flex items-center gap-2 scheme-text-muted transition-colors hover:text-strong"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    {returnLabel}
                  </Link>
                </div>
              </div>
            </div>

            {useCasePreview.length > 0 && (
              <div className="mt-8 pdp-divider pt-7">
                <h2 className="mb-4 text-xl font-semibold scheme-text-strong">
                  {PDP_ROUTE_COPY.summary.useCases}
                </h2>
                <div className="pdp-inline-list">
                  {useCasePreview.map((useCase) => (
                    <span
                      key={useCase}
                      className="pdp-inline-pill"
                    >
                      {useCase}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Specifications */}
            <div className="mt-8 pdp-divider pt-7">
              <h2 className="mb-4 text-xl font-semibold scheme-text-strong">
                {PDP_ROUTE_COPY.ctas.specifications}
              </h2>
              <div className="mb-7 grid gap-3">
                {specRows.map((row) => {
                  const isDimRow = (row.label === "Dimensions" || row.label === "Sizes") && dimensionVariants.length > 1;
                  return (
                    <div
                      key={row.label}
                      className="pdp-info-row"
                    >
                      <span className="pdp-card-label mb-2 block">
                        {row.label}
                      </span>
                      {isDimRow ? (
                        <ul className="flex flex-col gap-0.5">
                          {dimensionVariants.map((v, i) => (
                            <li key={i} className="text-sm leading-relaxed scheme-text-body">{v}</li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-sm leading-relaxed scheme-text-body">
                          {row.value}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {features.length > 0 && (
                <div>
                  <p className="pdp-section-label mb-3 scheme-text-muted">
                    {PDP_ROUTE_COPY.ctas.keyFeatures}
                  </p>
                  <ul className="grid gap-3">
                    {features.slice(0, 8).map((f: string, i: number) => (
                      <li
                        key={i}
                        className="pdp-feature-item"
                      >
                        <span className="scheme-text-subtle mt-0.5 shrink-0">-</span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {inlineSpecs.length > 0 && (
                <div className="mt-7 pdp-divider pt-7">
                  <h3 className="pdp-section-label mb-3 scheme-text-muted">
                    {PDP_ROUTE_COPY.ctas.technicalDetails}
                  </h3>
                  <div className="grid gap-3">
                    {inlineSpecs.map((row) => (
                      <div
                        key={row.label}
                        className="pdp-info-row"
                      >
                        <span className="pdp-card-label mb-2 block">
                          {row.label}
                        </span>
                        <span className="text-sm leading-relaxed scheme-text-body">
                          {row.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {fullOverview ? (
                <div className="mt-7 pdp-divider pt-7">
                  <h3 className="pdp-section-label mb-3 scheme-text-muted">Overview</h3>
                  <div className="pdp-overview-panel">
                    {fullOverview}
                  </div>
                </div>
              ) : null}

              {materials.length > 0 && (
                <div className="mt-7 pdp-divider pt-7">
                  <h3 className="pdp-section-label mb-3 scheme-text-muted">Materials</h3>
                  <div className="pdp-inline-list">
                    {materials.map((material) => (
                      <span
                        key={material}
                        className="pdp-inline-pill"
                      >
                        {material}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {finishOptions.length > 0 && (
                <div className="mt-7 pdp-divider pt-7">
                  <h3 className="pdp-section-label mb-3 scheme-text-muted">Finish Options</h3>
                  <div className="pdp-inline-list">
                    {finishOptions.map((finish) => (
                      <span
                        key={finish}
                        className="pdp-inline-pill"
                      >
                        {finish}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container-wide px-6 2xl:px-0 pb-24">
        <Reviews productId={product.id} />
      </div>
      <CompareDock />

    </section>
  );
}


