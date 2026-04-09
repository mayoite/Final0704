import { findCatalogItem, PRESET_PLACEMENTS } from "@/components/planner/plannerHelpers";
import type { PlannerCatalogItem, PlannerPresetKey } from "@/components/planner/types";
import { roomsFromWalls } from "@/lib/planner/roomOutline";
import type {
  PlannerDocument,
  PlannerPlacedItem,
  PlannerPoint2D,
  PlannerWall,
} from "@/lib/planner/types";

function createPlacedItemId(catalogId: string, index?: number) {
  const suffix =
    index === undefined
      ? `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
      : `preset-${index + 1}`;

  return `${catalogId}-${suffix}`;
}

import { PLANNER_CONFIG } from "./planner.config";

function getWallAxis(wall: PlannerWall) {
  return Math.abs(wall.start.x - wall.end.x) <= Math.abs(wall.start.y - wall.end.y)
    ? "vertical"
    : "horizontal";
}

function clampWallCoordinate(
  walls: PlannerWall[],
  targetWall: PlannerWall,
  nextCoordinate: number,
) {
  const wallAxis = getWallAxis(targetWall);
  const wallCoordinate =
    wallAxis === "vertical" ? targetWall.start.x : targetWall.start.y;
  const parallelCoordinates = walls
    .filter((wall) => wall.id !== targetWall.id && getWallAxis(wall) === wallAxis)
    .map((wall) => (wallAxis === "vertical" ? wall.start.x : wall.start.y))
    .sort((left, right) => left - right);
  const lowerLimit =
    parallelCoordinates
      .filter((coordinate) => coordinate < wallCoordinate)
      .at(-1) ?? Number.NEGATIVE_INFINITY;
  const upperLimit =
    parallelCoordinates.find((coordinate) => coordinate > wallCoordinate) ??
    Number.POSITIVE_INFINITY;
  const minimumGapCm = PLANNER_CONFIG.logic.minimumWallGapCm;

  return Math.min(
    Math.max(nextCoordinate, lowerLimit + minimumGapCm),
    upperLimit - minimumGapCm,
  );
}

export function createPlacedItemFromCatalog(
  item: PlannerCatalogItem,
  overrides?: {
    id?: string;
    x?: number;
    z?: number;
    rotationDeg?: number;
  },
): PlannerPlacedItem {
  return {
    id: overrides?.id ?? createPlacedItemId(item.id),
    catalogId: item.id,
    name: item.name,
    category: item.categoryLabel ?? item.category,
    color: item.color,
    position: {
      x: overrides?.x ?? 40,
      y: 0,
      z: overrides?.z ?? 40,
    },
    rotationDeg: overrides?.rotationDeg ?? 0,
    widthCm: item.width ?? 120,
    depthCm: item.depth ?? 60,
    heightCm: item.height ?? 75,
    sourceUrl: item.sourceUrl,
    spec: item.spec,
    topView: item.topView,
    shape: item.shape,
    renderStyle: item.renderStyle,
  };
}

export function appendPlannerItem(
  document: PlannerDocument,
  item: PlannerCatalogItem,
) {
  return {
    ...document,
    items: [
      ...document.items,
      createPlacedItemFromCatalog(item, {
        x: 40 + document.items.length * 24,
        z: 40 + document.items.length * 18,
      }),
    ],
    metadata: {
      ...document.metadata,
      source: "react-canvas",
      serializedSource: null,
    },
  } satisfies PlannerDocument;
}

export function movePlannerItem(
  document: PlannerDocument,
  itemId: string,
  position: { x: number; z: number },
) {
  return {
    ...document,
    items: document.items.map((item) =>
      item.id === itemId
        ? {
            ...item,
            position: {
              ...item.position,
              x: position.x,
              z: position.z,
            },
          }
        : item,
    ),
    metadata: {
      ...document.metadata,
      source: "react-canvas",
      serializedSource: null,
    },
  } satisfies PlannerDocument;
}

export function rotatePlannerItem(
  document: PlannerDocument,
  itemId: string,
  rotationDeg: number,
) {
  return {
    ...document,
    items: document.items.map((item) =>
      item.id === itemId
        ? {
            ...item,
            rotationDeg: ((rotationDeg % 360) + 360) % 360,
          }
        : item,
    ),
    metadata: {
      ...document.metadata,
      source: "react-canvas",
      serializedSource: null,
    },
  } satisfies PlannerDocument;
}

export function duplicatePlannerItem(document: PlannerDocument, itemId: string) {
  const targetItem = document.items.find((item) => item.id === itemId);

  if (!targetItem) {
    return document;
  }

  const duplicate = {
    ...targetItem,
    id: createPlacedItemId(targetItem.catalogId),
    position: {
      ...targetItem.position,
      x: targetItem.position.x + 24,
      z: targetItem.position.z + 18,
    },
  };

  return {
    ...document,
    items: [...document.items, duplicate],
    metadata: {
      ...document.metadata,
      source: "react-canvas",
      serializedSource: null,
    },
  } satisfies PlannerDocument;
}

export function removePlannerItem(document: PlannerDocument, itemId: string) {
  return {
    ...document,
    items: document.items.filter((item) => item.id !== itemId),
    metadata: {
      ...document.metadata,
      source: "react-canvas",
      serializedSource: null,
    },
  } satisfies PlannerDocument;
}

export function movePlannerWall(
  document: PlannerDocument,
  wallId: string,
  nextCoordinate: number,
) {
  const targetWall = document.walls.find((wall) => wall.id === wallId);

  if (!targetWall) {
    return document;
  }

  const wallAxis = getWallAxis(targetWall);
  const clampedCoordinate = clampWallCoordinate(
    document.walls,
    targetWall,
    Math.round(nextCoordinate),
  );
  const pointKeys = new Set([
    `${targetWall.start.x}:${targetWall.start.y}`,
    `${targetWall.end.x}:${targetWall.end.y}`,
  ]);

  const movePoint = (point: PlannerPoint2D): PlannerPoint2D => {
    if (!pointKeys.has(`${point.x}:${point.y}`)) {
      return point;
    }

    return wallAxis === "vertical"
      ? { ...point, x: clampedCoordinate }
      : { ...point, y: clampedCoordinate };
  };

  const walls = document.walls.map((wall) => ({
    ...wall,
    start: movePoint(wall.start),
    end: movePoint(wall.end),
  }));

  return {
    ...document,
    walls,
    rooms: roomsFromWalls(walls),
    metadata: {
      ...document.metadata,
      source: "react-canvas",
      serializedSource: null,
    },
  } satisfies PlannerDocument;
}

export function resizePlannerRoom(
  document: PlannerDocument,
  nextWidthCm: number,
  nextDepthCm: number,
) {
  if (document.walls.length === 0) {
    return document;
  }

  const xs = document.walls.flatMap((wall) => [wall.start.x, wall.end.x]);
  const ys = document.walls.flatMap((wall) => [wall.start.y, wall.end.y]);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const clampedWidth = Math.max(180, Math.round(nextWidthCm));
  const clampedDepth = Math.max(180, Math.round(nextDepthCm));
  const targetMaxX = minX + clampedWidth;
  const targetMaxY = minY + clampedDepth;

  const movePoint = (point: PlannerPoint2D): PlannerPoint2D => ({
    x: point.x === maxX ? targetMaxX : point.x,
    y: point.y === maxY ? targetMaxY : point.y,
  });

  const walls = document.walls.map((wall) => ({
    ...wall,
    start: movePoint(wall.start),
    end: movePoint(wall.end),
  }));

  return {
    ...document,
    walls,
    rooms: roomsFromWalls(walls),
    metadata: {
      ...document.metadata,
      source: "react-canvas",
      serializedSource: null,
    },
  } satisfies PlannerDocument;
}

export function applyPlannerPreset(
  baseDocument: PlannerDocument,
  catalog: PlannerCatalogItem[],
  presetName: PlannerPresetKey,
) {
  const placedItems = PRESET_PLACEMENTS[presetName]
    .map((placement, index) => {
      const item = findCatalogItem(catalog, placement.match);

      if (!item) {
        return null;
      }

      return createPlacedItemFromCatalog(item, {
        id: createPlacedItemId(item.id, index),
        x: placement.x,
        z: placement.z,
        rotationDeg: Math.round(((placement.rotation ?? 0) * 180) / Math.PI),
      });
    })
    .filter((item): item is PlannerPlacedItem => item !== null);

  return {
    ...baseDocument,
    items: placedItems,
    metadata: {
      ...baseDocument.metadata,
      source: "react-canvas",
      serializedSource: null,
    },
  } satisfies PlannerDocument;
}
