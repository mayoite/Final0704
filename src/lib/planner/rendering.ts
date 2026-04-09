import type { PlannerPlacedItem } from "@/lib/planner/types";

export type PlannerRenderFamily =
  | "task-chair"
  | "lounge-chair"
  | "sofa"
  | "desk-rect"
  | "desk-l"
  | "table-round"
  | "table-rect"
  | "storage-locker"
  | "storage-cabinet"
  | "screen"
  | "column-round"
  | "column-square"
  | "plant"
  | "door"
  | "window"
  | "utility-box";

export type PlannerRenderPalette = {
  primary: string;
  secondary: string;
  accent: string;
  metal: string;
  outline: string;
  labelFill: string;
  labelText: string;
};

export type PlannerRenderSpec = {
  family: PlannerRenderFamily;
  label: string;
  category: string;
  color: string | null;
  topView: string | null;
  shape: string | null;
  renderStyle: string | null;
  palette: PlannerRenderPalette;
};

function getBasePalette(
  item: PlannerPlacedItem,
  category: string,
): PlannerRenderPalette {
  const color = item.color?.trim() || null;

  if (category.includes("seating")) {
    return {
      primary: color ?? "#7d9cc7",
      secondary: "#d4b29f",
      accent: "#eef4fb",
      metal: "#526173",
      outline: "rgba(30,41,59,0.24)",
      labelFill: "rgba(255,255,255,0.96)",
      labelText: "#172235",
    };
  }

  if (category.includes("table") || category.includes("workstation")) {
    return {
      primary: color ?? "#d5bfaa",
      secondary: "#8d6549",
      accent: "#425168",
      metal: "#61748b",
      outline: "rgba(71,54,40,0.24)",
      labelFill: "rgba(255,255,255,0.96)",
      labelText: "#172235",
    };
  }

  if (category.includes("storage")) {
    return {
      primary: color ?? "#d7dfe8",
      secondary: "#eff4f8",
      accent: "#60758c",
      metal: "#7c8ea3",
      outline: "rgba(58,75,96,0.24)",
      labelFill: "rgba(255,255,255,0.96)",
      labelText: "#172235",
    };
  }

  if (category.includes("screen") || category.includes("infrastructure")) {
    return {
      primary: color ?? "#2b3648",
      secondary: "#536176",
      accent: "#8fd2c8",
      metal: "#95a4b8",
      outline: "rgba(23,34,53,0.28)",
      labelFill: "rgba(255,255,255,0.96)",
      labelText: "#172235",
    };
  }

  return {
    primary: color ?? "#9cb2cc",
    secondary: "#d7e3f1",
    accent: "#5b6d84",
    metal: "#7b8ca0",
    outline: "rgba(35,55,84,0.22)",
    labelFill: "rgba(255,255,255,0.96)",
    labelText: "#172235",
  };
}

function detectRenderFamily(item: PlannerPlacedItem, category: string): PlannerRenderFamily {
  const shape = item.shape?.toLowerCase() ?? "";
  const topView = item.topView?.toLowerCase() ?? "";
  const renderStyle = item.renderStyle?.toLowerCase() ?? "";
  const name = item.name.toLowerCase();

  if (shape.includes("column")) {
    return topView.includes("circle") ? "column-round" : "column-square";
  }

  if (shape.includes("plant") || name.includes("plant")) {
    return "plant";
  }

  if (shape.includes("window")) {
    return "window";
  }

  if (shape.includes("door")) {
    return "door";
  }

  if (shape.includes("screen") || category.includes("screen") || category.includes("infrastructure")) {
    return "screen";
  }

  if (shape.includes("locker")) {
    return "storage-locker";
  }

  if (shape.includes("storage") || shape.includes("cabinet") || category.includes("storage")) {
    return "storage-cabinet";
  }

  if (
    shape.includes("sofa") ||
    name.includes("sofa") ||
    name.includes("cocoon") ||
    name.includes("lounge")
  ) {
    return "sofa";
  }

  if (
    shape.includes("chair") ||
    category.includes("seating") ||
    renderStyle.includes("seating")
  ) {
    if (
      name.includes("executive") ||
      name.includes("task") ||
      name.includes("mesh") ||
      name.includes("office")
    ) {
      return "task-chair";
    }

    return "lounge-chair";
  }

  if (shape.includes("curved") || name.includes("l-shape") || name.includes("l shape")) {
    return "desk-l";
  }

  if (topView.includes("circle") || shape.includes("round")) {
    return "table-round";
  }

  if (
    shape.includes("desk") ||
    shape.includes("executive-desk") ||
    category.includes("workstation")
  ) {
    return "desk-rect";
  }

  if (category.includes("table")) {
    return "table-rect";
  }

  return "utility-box";
}

export function getPlannerRenderSpec(item: PlannerPlacedItem): PlannerRenderSpec {
  const category = (item.category ?? "").toLowerCase();
  const family = detectRenderFamily(item, category);

  return {
    family,
    label: item.name.trim(),
    category,
    color: item.color?.trim() || null,
    topView: item.topView?.trim() || null,
    shape: item.shape?.trim() || null,
    renderStyle: item.renderStyle?.trim() || null,
    palette: getBasePalette(item, category),
  };
}
