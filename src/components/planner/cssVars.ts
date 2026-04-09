export function readCssVar(name: string) {
  if (typeof window === "undefined") return "";
  return getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
}

export function readCssVarColor(name: string, fallback: string) {
  const value = readCssVar(name);
  return value.length > 0 ? value : fallback;
}

function parseRgb(input: string) {
  const match = input.match(/rgba?\(([^)]+)\)/);
  if (!match) return null;
  const parts = match[1]
    .split(",")
    .map((part) => Number(part.trim()))
    .filter((value) => Number.isFinite(value));
  if (parts.length < 3) return null;
  return [parts[0], parts[1], parts[2]] as const;
}

export function resolveCssColorExpression(expr: string, fallbackRgb: string) {
  if (typeof window === "undefined") return fallbackRgb;
  const el = document.createElement("span");
  el.style.color = expr;
  el.style.position = "fixed";
  el.style.left = "-9999px";
  el.style.top = "-9999px";
  document.body.appendChild(el);
  const resolved = getComputedStyle(el).color;
  document.body.removeChild(el);
  return resolved || fallbackRgb;
}

export function resolveCssVarRgb(varName: string, fallback: readonly [number, number, number]) {
  const rgb = parseRgb(resolveCssColorExpression(`var(${varName})`, `rgb(${fallback[0]}, ${fallback[1]}, ${fallback[2]})`));
  return rgb ?? fallback;
}
