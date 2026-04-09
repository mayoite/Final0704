import type {
  PlannerDocument,
  PlannerPlacedItem,
  PlannerPoint2D,
  PlannerWall,
} from "@/lib/planner/types";
import { roomsFromWalls } from "@/lib/planner/roomOutline";

type RawBlueprintMetadata = {
  plannerId?: unknown;
  itemName?: unknown;
  category?: unknown;
  widthCm?: unknown;
  depthCm?: unknown;
  heightCm?: unknown;
  sourceUrl?: unknown;
  specInfo?: unknown;
  topView?: unknown;
  shape?: unknown;
};

type RawBlueprintItem = {
  item_name?: unknown;
  xpos?: unknown;
  ypos?: unknown;
  zpos?: unknown;
  rotation?: unknown;
  metadata?: RawBlueprintMetadata;
};

type RawBlueprintDocument = {
  floorplan?: RawBlueprintFloorplan;
  floorplanner?: RawBlueprintFloorplan;
  items?: RawBlueprintItem[];
};

type RawBlueprintCorner = {
  x?: unknown;
  y?: unknown;
};

type RawBlueprintWall = {
  corner1?: unknown;
  corner2?: unknown;
};

type RawBlueprintFloorplan = {
  corners?: Record<string, RawBlueprintCorner>;
  walls?: RawBlueprintWall[];
};

function numberOrFallback(value: unknown, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function stringOrUndefined(value: unknown) {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function rotationToDegrees(rotation: unknown) {
  if (!Array.isArray(rotation)) {
    return 0;
  }

  const yRotation = numberOrFallback(rotation[1], 0);
  return Math.round((yRotation * 180) / Math.PI);
}

function cornerToPoint(corner: RawBlueprintCorner | undefined): PlannerPoint2D {
  return {
    x: numberOrFallback(corner?.x) * 100,
    y: numberOrFallback(corner?.y) * 100,
  };
}

function plannerWallsFromBlueprint(
  floorplan: RawBlueprintFloorplan | undefined,
): PlannerWall[] {
  if (!floorplan?.corners || !Array.isArray(floorplan.walls)) {
    return [];
  }

  const corners = floorplan.corners;

  return floorplan.walls
    .map<PlannerWall | null>((wall, index) => {
      const startId =
        typeof wall.corner1 === "string" ? wall.corner1 : undefined;
      const endId = typeof wall.corner2 === "string" ? wall.corner2 : undefined;

      if (!startId || !endId) {
        return null;
      }

      const start = cornerToPoint(corners[startId]);
      const end = cornerToPoint(corners[endId]);

      return {
        id: `wall-${index + 1}`,
        start,
        end,
        kind: "boundary" as const,
      };
    })
    .filter((wall): wall is PlannerWall => wall !== null);
}

function blueprintItemToPlannerItem(
  item: RawBlueprintItem,
  index: number,
): PlannerPlacedItem {
  const metadata = item.metadata ?? {};
  const catalogId =
    stringOrUndefined(metadata.plannerId) ?? `scene-item-${index + 1}`;
  const name =
    stringOrUndefined(metadata.itemName) ??
    stringOrUndefined(item.item_name) ??
    `Scene item ${index + 1}`;

  return {
    id: `${catalogId}-import-${index + 1}`,
    catalogId,
    name,
    category: stringOrUndefined(metadata.category),
    position: {
      x: numberOrFallback(item.xpos),
      y: numberOrFallback(item.ypos),
      z: numberOrFallback(item.zpos),
    },
    rotationDeg: rotationToDegrees(item.rotation),
    widthCm: numberOrFallback(metadata.widthCm),
    depthCm: numberOrFallback(metadata.depthCm),
    heightCm: numberOrFallback(metadata.heightCm),
    sourceUrl: stringOrUndefined(metadata.sourceUrl),
    spec: stringOrUndefined(metadata.specInfo),
    topView: stringOrUndefined(metadata.topView),
    shape: stringOrUndefined(metadata.shape),
  };
}

export function createEmptyPlannerDocument(
  metadata?: Partial<PlannerDocument["metadata"]>,
): PlannerDocument {
  return {
    version: "planner-document.v1",
    units: "cm",
    rooms: [],
    walls: [],
    items: [],
    metadata: {
      source: metadata?.source ?? "starter",
      importedAt: metadata?.importedAt ?? new Date().toISOString(),
      serializedSource: metadata?.serializedSource ?? null,
    },
  };
}

export function serializePlannerDocument(document: PlannerDocument) {
  return JSON.stringify(document, null, 2);
}

export function parsePlannerDocument(raw: string): PlannerDocument {
  const parsed = JSON.parse(raw) as Partial<PlannerDocument>;
  const version =
    typeof parsed.version === "string"
      ? parsed.version
      : "planner-document.v1";

  if (version !== "planner-document.v1") {
    throw new Error(
      `Unsupported planner document version: ${
        typeof parsed.version === "string" ? parsed.version : "unknown"
      }`,
    );
  }

  return {
    version: "planner-document.v1",
    units: "cm",
    rooms: Array.isArray(parsed.rooms) ? parsed.rooms : [],
    walls: Array.isArray(parsed.walls) ? parsed.walls : [],
    items: Array.isArray(parsed.items) ? parsed.items : [],
    metadata: {
      source: parsed.metadata?.source ?? "react-canvas",
      importedAt: parsed.metadata?.importedAt ?? new Date().toISOString(),
      serializedSource: parsed.metadata?.serializedSource ?? null,
    },
  };
}

export function plannerDocumentFromBlueprintSerialized(serialized: string) {
  const parsed = JSON.parse(serialized) as RawBlueprintDocument;
  const floorplan = parsed.floorplan ?? parsed.floorplanner;

  if (!floorplan && !Array.isArray(parsed.items)) {
    throw new Error("Not a supported blueprint document");
  }

  const walls = plannerWallsFromBlueprint(floorplan);
  const rooms = roomsFromWalls(walls);
  const items = Array.isArray(parsed.items)
    ? parsed.items.map(blueprintItemToPlannerItem)
    : [];

  if (walls.length > 0 && rooms.length === 0) {
    throw new Error("Blueprint walls could not be reconstructed into a room outline");
  }

  if (walls.length === 0 && rooms.length === 0 && items.length === 0) {
    throw new Error("Blueprint import produced an empty plan");
  }

  return {
    ...createEmptyPlannerDocument({
      source: "blueprint-bridge",
      serializedSource: serialized,
    }),
    rooms,
    walls,
    items,
  };
}
