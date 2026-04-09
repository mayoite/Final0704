import type {
  PlannerCatalogItem,
  PlannerPresetKey,
  PresetPlacement,
} from "./types";
import { resolveCssColorExpression } from "./cssVars";

export function normalizeBlueprintDesignPayload(rawDesign: string) {
  const parsed = JSON.parse(rawDesign) as Record<string, unknown>;
  const wallColor = resolveCssColorExpression("var(--surface-panel)", "#ffffff");

  if (!parsed.floorplan && parsed.floorplanner) {
    parsed.floorplan = parsed.floorplanner;
  }

  const floorplan = parsed.floorplan as
    | {
        corners?: Record<string, unknown>;
        walls?: Array<{
          corner1?: string;
          corner2?: string;
          frontTexture?: Record<string, unknown>;
          backTexture?: Record<string, unknown>;
        }>;
        newFloorTextures?: Record<string, unknown>;
        floorTextures?: Record<string, unknown>;
      }
    | undefined;

  if (floorplan?.walls && Array.isArray(floorplan.walls)) {
    floorplan.walls = floorplan.walls.map((wall) => ({
      ...wall,
      frontTexture: {
        color: wallColor,
        repeat: 32,
        colormap: "/vendors/blueprint-js/rooms/textures/wallmap.png",
      },
      backTexture: {
        color: wallColor,
        repeat: 32,
        colormap: "/vendors/blueprint-js/rooms/textures/wallmap.png",
      },
    }));
  }

  if (floorplan) {
    floorplan.corners = {
      "starter-nw": { x: -3.5, y: -2.5, elevation: 3 },
      "starter-ne": { x: 5.5, y: -2.5, elevation: 3 },
      "starter-se": { x: 5.5, y: 3.5, elevation: 3 },
      "starter-sw": { x: -3.5, y: 3.5, elevation: 3 },
    };
    floorplan.walls = [
      {
        corner1: "starter-nw",
        corner2: "starter-ne",
        frontTexture: {
          color: wallColor,
          repeat: 32,
          colormap: "/vendors/blueprint-js/rooms/textures/wallmap.png",
        },
        backTexture: {
          color: wallColor,
          repeat: 32,
          colormap: "/vendors/blueprint-js/rooms/textures/wallmap.png",
        },
      },
      {
        corner1: "starter-ne",
        corner2: "starter-se",
        frontTexture: {
          color: wallColor,
          repeat: 32,
          colormap: "/vendors/blueprint-js/rooms/textures/wallmap.png",
        },
        backTexture: {
          color: wallColor,
          repeat: 32,
          colormap: "/vendors/blueprint-js/rooms/textures/wallmap.png",
        },
      },
      {
        corner1: "starter-se",
        corner2: "starter-sw",
        frontTexture: {
          color: wallColor,
          repeat: 32,
          colormap: "/vendors/blueprint-js/rooms/textures/wallmap.png",
        },
        backTexture: {
          color: wallColor,
          repeat: 32,
          colormap: "/vendors/blueprint-js/rooms/textures/wallmap.png",
        },
      },
      {
        corner1: "starter-sw",
        corner2: "starter-nw",
        frontTexture: {
          color: wallColor,
          repeat: 32,
          colormap: "/vendors/blueprint-js/rooms/textures/wallmap.png",
        },
        backTexture: {
          color: wallColor,
          repeat: 32,
          colormap: "/vendors/blueprint-js/rooms/textures/wallmap.png",
        },
      },
    ];
    floorplan.newFloorTextures = {};
    floorplan.floorTextures = {};
  }

  parsed.items = [];

  return JSON.stringify(parsed);
}

export async function loadStarterDesign() {
  const response = await fetch("/vendors/blueprint-js/design.json", {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Starter design request failed with ${response.status}`);
  }

  return normalizeBlueprintDesignPayload(await response.text());
}

export function findCatalogItem(
  items: PlannerCatalogItem[],
  matcher: PresetPlacement["match"],
) {
  return items.find(matcher) ?? null;
}

export function familyIncludes(item: PlannerCatalogItem, value: string) {
  return item.family.toLowerCase().includes(value);
}

export const PRESET_PLACEMENTS: Record<PlannerPresetKey, PresetPlacement[]> = {
  "focus-four": [
    {
      match: (item) =>
        item.categoryLabel === "Workstations" &&
        (familyIncludes(item, "deskpro") ||
          familyIncludes(item, "adaptable")) &&
        (item.width ?? 0) >= 120 &&
        (item.width ?? 0) <= 140,
      x: -140,
      z: -70,
    },
    {
      match: (item) =>
        item.categoryLabel === "Workstations" &&
        (familyIncludes(item, "deskpro") ||
          familyIncludes(item, "adaptable")) &&
        (item.width ?? 0) >= 120 &&
        (item.width ?? 0) <= 140,
      x: 140,
      z: -70,
    },
    {
      match: (item) =>
        item.categoryLabel === "Workstations" &&
        (familyIncludes(item, "deskpro") ||
          familyIncludes(item, "adaptable")) &&
        (item.width ?? 0) >= 120 &&
        (item.width ?? 0) <= 140,
      x: -140,
      z: 110,
    },
    {
      match: (item) =>
        item.categoryLabel === "Workstations" &&
        (familyIncludes(item, "deskpro") ||
          familyIncludes(item, "adaptable")) &&
        (item.width ?? 0) >= 120 &&
        (item.width ?? 0) <= 140,
      x: 140,
      z: 110,
    },
    {
      match: (item) =>
        item.categoryLabel === "Seating" && familyIncludes(item, "accent"),
      x: -140,
      z: -180,
    },
    {
      match: (item) =>
        item.categoryLabel === "Seating" && familyIncludes(item, "accent"),
      x: 140,
      z: -180,
    },
    {
      match: (item) =>
        item.categoryLabel === "Seating" && familyIncludes(item, "accent"),
      x: -140,
      z: 220,
      rotation: Math.PI,
    },
    {
      match: (item) =>
        item.categoryLabel === "Seating" && familyIncludes(item, "accent"),
      x: 140,
      z: 220,
      rotation: Math.PI,
    },
  ],
  "meeting-six": [
    {
      match: (item) =>
        item.categoryLabel === "Tables" &&
        (familyIncludes(item, "academia") ||
          familyIncludes(item, "presidency")) &&
        (item.width ?? 0) >= 180,
      x: 0,
      z: 20,
    },
    {
      match: (item) =>
        item.categoryLabel === "Seating" && familyIncludes(item, "adam"),
      x: -120,
      z: -120,
    },
    {
      match: (item) =>
        item.categoryLabel === "Seating" && familyIncludes(item, "adam"),
      x: 0,
      z: -120,
    },
    {
      match: (item) =>
        item.categoryLabel === "Seating" && familyIncludes(item, "adam"),
      x: 120,
      z: -120,
    },
    {
      match: (item) =>
        item.categoryLabel === "Seating" && familyIncludes(item, "adam"),
      x: -120,
      z: 160,
      rotation: Math.PI,
    },
    {
      match: (item) =>
        item.categoryLabel === "Seating" && familyIncludes(item, "adam"),
      x: 0,
      z: 160,
      rotation: Math.PI,
    },
    {
      match: (item) =>
        item.categoryLabel === "Seating" && familyIncludes(item, "adam"),
      x: 120,
      z: 160,
      rotation: Math.PI,
    },
  ],
  "lounge-pair": [
    {
      match: (item) =>
        item.categoryLabel === "Seating" && familyIncludes(item, "accent"),
      x: -120,
      z: 40,
      rotation: Math.PI / 8,
    },
    {
      match: (item) =>
        item.categoryLabel === "Seating" && familyIncludes(item, "accent"),
      x: 120,
      z: 40,
      rotation: -Math.PI / 8,
    },
    {
      match: (item) =>
        item.categoryLabel === "Tables" &&
        ((familyIncludes(item, "sleek") && (item.width ?? 0) <= 120) ||
          (familyIncludes(item, "apex") && (item.width ?? 0) <= 120)),
      x: 0,
      z: 70,
    },
  ],
};
