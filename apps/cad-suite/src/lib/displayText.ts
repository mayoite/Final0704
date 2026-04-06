export function sanitizeDisplayText(value: string): string {
  return String(value || "")
    .replace(/[�]+/g, "")
    .replace(/Ã¢â‚¬â€|â€”|—/g, "-")
    .replace(/Ã¢â‚¬â€œ|â€“|–/g, "-")
    .replace(/Ã¢â‚¬Ëœ|Ã¢â‚¬â„¢|â€˜|â€™|’/g, "'")
    .replace(/Ã¢â‚¬Å“|Ã¢â‚¬\u009d|Ã¢â‚¬"|â€œ|â€\u009d|â€"|“|”/g, "\"")
    .replace(/â€¦|…/g, "...")
    .replace(/(?:â‚¹|₹)\s*/g, "Rs. ")
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeDimensionText(value: string): string {
  return sanitizeDisplayText(value)
    .replace(
      /\bW\s*(\d{2,4})\s*D\s*(\d{2,4})\s*H\s*(\d{3,4})\s*[-/]?\s*(\d{3,4})\s*mm\b/gi,
      "W $1 x D $2 x H $3-$4 mm",
    )
    .replace(
      /\bW\s*(\d{2,4})\s*D\s*(\d{2,4})\s*H\s*(\d{2,4})\s*mm\b/gi,
      "W $1 x D $2 x H $3 mm",
    )
    .replace(/([0-9])([A-Z])/g, "$1 $2")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b([WDHL])\s*(\d)/g, "$1 $2")
    .replace(/(\d)(mm)\b/gi, "$1 $2")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export function filterMeaningfulDimensionText(value: string): string {
  const normalized = normalizeDimensionText(value);
  return /\d/.test(normalized) ? normalized : "";
}

/**
 * Splits a semicolon-separated dimension string into distinct variant lines.
 * Deduplicates identical lines and returns at most `maxLines` entries.
 */
export function splitDimensionVariants(value: string, maxLines = 4): string[] {
  if (!value) return [];
  const parts = value.split(";").map((s) => s.trim()).filter(Boolean);
  if (parts.length <= 1) return parts;

  // Group into variant chunks: each chunk starts with "L 1" (first length dimension)
  const variants: string[] = [];
  let current: string[] = [];
  for (const part of parts) {
    // New variant starts when we see "L 1" (the first length dimension of a config)
    const isVariantStart = /^L\s*1\s*[-–]/i.test(part);
    if (isVariantStart && current.length > 0) {
      variants.push(current.join("; "));
      current = [];
    }
    current.push(part);
  }
  if (current.length > 0) variants.push(current.join("; "));

  // Deduplicate
  const seen = new Set<string>();
  const deduped = variants.filter((v) => {
    if (seen.has(v)) return false;
    seen.add(v);
    return true;
  });

  return deduped.slice(0, maxLines);
}

const GENERIC_MATERIAL_TOKENS = new Set([
  "fabric",
  "foam",
  "nylon",
  "chrome",
  "metal",
  "wood",
  "steel",
  "mesh",
  "leather",
  "plastic",
  "plywood",
  "pu",
]);

function isGenericMaterialValue(value: string): boolean {
  const normalized = sanitizeDisplayText(value)
    .toLowerCase()
    .replace(/[^a-z0-9\s/-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!normalized) return true;
  return normalized
    .split(/[\/\s-]+/)
    .filter(Boolean)
    .every((token) => GENERIC_MATERIAL_TOKENS.has(token));
}

export function filterMeaningfulMaterialList(values: string[]): string[] {
  const cleaned = values.map((value) => sanitizeDisplayText(value)).filter(Boolean);
  if (cleaned.length === 0) return [];
  return cleaned.every(isGenericMaterialValue) ? [] : cleaned;
}
