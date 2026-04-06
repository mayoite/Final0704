import type { ImageProps } from "next/image";

const configuredAssetBaseUrl = (
  process.env.NEXT_PUBLIC_ASSET_BASE_URL ||
  process.env.ASSET_BASE_URL ||
  ""
)
  .trim()
  .replace(/\/+$/, "");

export type MediaType =
  | "hero"
  | "project"
  | "product"
  | "logo"
  | "portrait"
  | "gallery"
  | "thumbnail";

function hasAbsoluteUrl(value: string): boolean {
  return /^(?:https?:)?\/\//i.test(value) || /^[a-z][a-z0-9+.-]*:/i.test(value);
}

function applyAssetBase(value: string): string {
  if (!configuredAssetBaseUrl) return value;
  if (!value.startsWith("/")) return value;
  return `${configuredAssetBaseUrl}${value}`;
}

export function normalizeAssetPath(path: string | null | undefined): string {
  if (!path) return "";
  const normalized = String(path).trim();
  if (!normalized) return "";
  if (hasAbsoluteUrl(normalized)) return normalized;
  return applyAssetBase(normalized);
}

export function normalizeImageSource(path: string | null | undefined): string {
  if (!path) return "";
  const normalized = String(path).trim();
  if (!normalized) return "";
  if (hasAbsoluteUrl(normalized)) return normalized;

  const hasImageExtension = /\.(webp|png|jpe?g|gif|avif|svg)$/i.test(normalized);
  let candidatePath = normalized;
  let candidateLower = candidatePath.toLowerCase();

  if (candidateLower.startsWith("/images/afc/")) {
    candidatePath = `/images/catalog/${candidatePath.slice("/images/afc/".length)}`;
    candidateLower = candidatePath.toLowerCase();
  }

  if (hasImageExtension && candidateLower.startsWith("/products/")) {
    candidatePath = `/images/products/${candidatePath.slice("/products/".length)}`;
    candidateLower = candidatePath.toLowerCase();
  }

  if (
    candidateLower.startsWith("/images/catalog/oando-seating--phoenix/image-") &&
    candidateLower.endsWith(".webp")
  ) {
    const match = candidateLower.match(/image-(\d+)\.webp$/);
    const imageIndex = match ? Number.parseInt(match[1], 10) : Number.NaN;
    if (Number.isNaN(imageIndex) || imageIndex < 1 || imageIndex > 3) return "";
    return applyAssetBase(`/images/catalog/oando-seating--phoenix/image-${imageIndex}.jpg`);
  }

  if (candidatePath.startsWith("/images/") && hasImageExtension) {
    if (
      candidateLower.startsWith("/images/products/imported/") &&
      (candidateLower.endsWith(".jpg") || candidateLower.endsWith(".jpeg"))
    ) {
      return applyAssetBase(candidatePath.replace(/\.(jpe?g)$/i, ".webp"));
    }

    if (candidateLower.startsWith("/images/catalog/") && candidateLower.endsWith(".webp")) {
      return applyAssetBase(candidatePath.replace(/\.webp$/i, ".jpg"));
    }

    return applyAssetBase(candidatePath);
  }

  return applyAssetBase(candidatePath);
}

export function normalizeImageSourceList(
  values: Array<string | null | undefined> | null | undefined,
): string[] {
  if (!Array.isArray(values)) return [];
  return values.map((value) => normalizeImageSource(value)).filter(Boolean);
}

export function getImageSizes(type: MediaType): string {
  switch (type) {
    case "hero":
      return "100vw";
    case "project":
      return "(max-width: 1280px) 100vw, 50vw";
    case "product":
      return "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw";
    case "logo":
      return "(max-width: 768px) 140px, 220px";
    case "portrait":
      return "(max-width: 1024px) 100vw, 30vw";
    case "gallery":
      return "(max-width: 768px) 100vw, 70vw";
    case "thumbnail":
      return "(max-width: 768px) 18vw, 80px";
    default:
      return "100vw";
  }
}

export function getAspectRatioByMediaType(type: MediaType): string {
  switch (type) {
    case "hero":
      return "16 / 9";
    case "project":
      return "16 / 10";
    case "product":
      return "4 / 3";
    case "portrait":
      return "4 / 5";
    case "logo":
      return "5 / 2";
    case "gallery":
      return "16 / 11";
    case "thumbnail":
      return "1 / 1";
    default:
      return "16 / 9";
  }
}

export function getObjectPositionByAssetType(type: MediaType): ImageProps["style"] {
  if (type === "logo") return { objectPosition: "center center" };
  if (type === "portrait") return { objectPosition: "center top" };
  return { objectPosition: "center center" };
}

export function shouldPrioritizeImage(index: number, aboveFold = false): boolean {
  return aboveFold || index === 0;
}

export function getPriorityImageProps(index: number, aboveFold = false): {
  priority: boolean;
  loading?: "eager" | "lazy";
  fetchPriority?: "high" | "low" | "auto";
} {
  const priority = shouldPrioritizeImage(index, aboveFold);
  return priority
    ? { priority: true, loading: "eager", fetchPriority: "high" }
    : { priority: false, loading: "lazy", fetchPriority: "auto" };
}

export function getBlurPlaceholder(seed = "#dfe7ed"): string {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 9">
      <defs>
        <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
          <stop stop-color="${seed}" offset="0%"/>
          <stop stop-color="#f4f7fa" offset="100%"/>
        </linearGradient>
      </defs>
      <rect width="16" height="9" fill="url(#g)"/>
    </svg>
  `.trim();

  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

export function buildImageAlt(primary: string, context?: string): string {
  const lead = primary.trim();
  const suffix = context?.trim();
  if (!lead) return suffix || "Image";
  return suffix ? `${lead} - ${suffix}` : lead;
}

export function buildResponsiveSources(src: string | null | undefined): string[] {
  const normalized = normalizeImageSource(src);
  return normalized ? [normalized] : [];
}
