import type { Editor } from "tldraw";

import type { PlannerShapeMeta } from "../../../components/draw/types";
import {
  createPlannerDocument,
  normalizePlannerDocument,
  type PlannerDocument,
  type PlannerJsonValue,
  type PlannerMeasurementSourceUnit,
} from "../model";
import { getShapeMeta, getStructuralShapes, type MeasurementUnit } from "./measurements";

const DEFAULT_ROOM_WIDTH_MM = 6000;
const DEFAULT_ROOM_DEPTH_MM = 8000;
const DEFAULT_ROOM_HEIGHT_MM = 3000;
const DEFAULT_WALL_THICKNESS_MM = 120;
const DEFAULT_FLOOR_THICKNESS_MM = 40;

export interface PlannerSceneRoom {
  widthMm: number;
  depthMm: number;
  wallHeightMm: number;
  wallThicknessMm: number;
  floorThicknessMm: number;
  originMm: {
    xMm: number;
    yMm: number;
  };
}

export interface PlannerSceneItem {
  id: string;
  productId?: string;
  productSlug?: string;
  plannerSourceSlug?: string;
  name: string;
  category: string;
  price: number;
  imageUrl?: string;
  dimensions?: string;
  centerMm: {
    xMm: number;
    yMm: number;
  };
  sizeMm: {
    widthMm: number;
    depthMm: number;
    heightMm: number;
  };
  rotationDeg: number;
}

export interface PlannerSceneEnvelope {
  type: "cad-suite-planner-scene";
  version: 1;
  measurement: {
    canonicalUnit: "mm";
    displayUnit: MeasurementUnit;
    sourceUnit?: PlannerMeasurementSourceUnit;
  };
  room: PlannerSceneRoom;
  items: PlannerSceneItem[];
  tldrawSnapshot: unknown;
}

export interface BuildPlannerDocumentFromEditorOptions {
  documentId?: string | null;
  name?: string;
  projectName?: string | null;
  clientName?: string | null;
  preparedBy?: string | null;
  seatTarget?: number;
  unitSystem: MeasurementUnit;
  thumbnailUrl?: string | null;
}

type PlannerBounds = NonNullable<ReturnType<Editor["getShapePageBounds"]>>;

function clampPositiveInteger(value: number, fallback: number) {
  if (!Number.isFinite(value)) return fallback;
  return Math.max(1, Math.round(value));
}

function mergeBounds(boundsList: PlannerBounds[]) {
  if (boundsList.length === 0) return null;

  const minX = Math.min(...boundsList.map((bounds) => bounds.minX));
  const minY = Math.min(...boundsList.map((bounds) => bounds.minY));
  const maxX = Math.max(...boundsList.map((bounds) => bounds.maxX));
  const maxY = Math.max(...boundsList.map((bounds) => bounds.maxY));

  return {
    minX,
    minY,
    maxX,
    maxY,
    w: maxX - minX,
    h: maxY - minY,
  };
}

function toMillimeters(value: number, rawDimensions?: string) {
  if (!Number.isFinite(value)) return 0;
  const hint = String(rawDimensions ?? "").toLowerCase();

  if (hint.includes("cm") && !hint.includes("mm")) {
    return Math.round(value * 10);
  }

  if (hint.includes("m") && !hint.includes("mm") && !hint.includes("cm")) {
    return Math.round(value * 1000);
  }

  return Math.round(value);
}

function parseDimensionNumbers(rawDimensions?: string) {
  if (!rawDimensions) return [];

  return rawDimensions
    .match(/\d+(?:\.\d+)?/g)
    ?.map((value) => Number.parseFloat(value))
    .filter((value) => Number.isFinite(value)) ?? [];
}

function estimateHeightMm(meta: PlannerShapeMeta, widthMm: number, depthMm: number) {
  const parsed = parseDimensionNumbers(meta.dimensions);
  if (parsed.length >= 3) {
    return clampPositiveInteger(toMillimeters(parsed[2], meta.dimensions), Math.max(widthMm, depthMm));
  }

  const category = String(meta.category ?? "").toLowerCase();
  if (category.includes("storage")) return 2100;
  if (category.includes("table") || category.includes("desk") || category.includes("work")) return 750;
  if (category.includes("seat") || category.includes("sofa") || category.includes("lounge")) return 900;
  return 900;
}

function getSceneRoom(editor: Editor): PlannerSceneRoom {
  const roomBounds = mergeBounds(
    getStructuralShapes(editor)
      .map((shape) => editor.getShapePageBounds(shape.id))
      .filter((bounds): bounds is PlannerBounds => bounds !== null),
  );

  if (!roomBounds) {
    return {
      widthMm: DEFAULT_ROOM_WIDTH_MM,
      depthMm: DEFAULT_ROOM_DEPTH_MM,
      wallHeightMm: DEFAULT_ROOM_HEIGHT_MM,
      wallThicknessMm: DEFAULT_WALL_THICKNESS_MM,
      floorThicknessMm: DEFAULT_FLOOR_THICKNESS_MM,
      originMm: { xMm: 0, yMm: 0 },
    };
  }

  return {
    widthMm: clampPositiveInteger(roomBounds.w * 10, DEFAULT_ROOM_WIDTH_MM),
    depthMm: clampPositiveInteger(roomBounds.h * 10, DEFAULT_ROOM_DEPTH_MM),
    wallHeightMm: DEFAULT_ROOM_HEIGHT_MM,
    wallThicknessMm: DEFAULT_WALL_THICKNESS_MM,
    floorThicknessMm: DEFAULT_FLOOR_THICKNESS_MM,
    originMm: {
      xMm: Math.round(roomBounds.minX * 10),
      yMm: Math.round(roomBounds.minY * 10),
    },
  };
}

function getSceneItems(editor: Editor, room: PlannerSceneRoom): PlannerSceneItem[] {
  return editor
    .getCurrentPageShapes()
    .filter((shape) => getShapeMeta(shape.meta).isPlannerItem)
    .map((shape) => {
      const meta = getShapeMeta(shape.meta);
      const bounds = editor.getShapePageBounds(shape.id);
      const parsed = parseDimensionNumbers(meta.dimensions);

      const widthMm = clampPositiveInteger(
        parsed[0] ? toMillimeters(parsed[0], meta.dimensions) : (bounds?.w ?? 120) * 10,
        1200,
      );
      const depthMm = clampPositiveInteger(
        parsed[1] ? toMillimeters(parsed[1], meta.dimensions) : (bounds?.h ?? 120) * 10,
        1200,
      );
      const heightMm = estimateHeightMm(meta, widthMm, depthMm);
      const centerX = bounds ? bounds.minX * 10 + widthMm / 2 : widthMm / 2;
      const centerY = bounds ? bounds.minY * 10 + depthMm / 2 : depthMm / 2;
      const originRelativeX = Math.round(centerX - room.originMm.xMm);
      const originRelativeY = Math.round(centerY - room.originMm.yMm);
      const rotationRad = typeof shape.rotation === "number" ? shape.rotation : 0;

      return {
        id: String(shape.id),
        productId: meta.productId,
        productSlug: meta.productSlug,
        plannerSourceSlug: meta.plannerSourceSlug,
        name: meta.text || "Planner item",
        category: meta.category || "Workstations",
        price: Number(meta.price ?? 0),
        imageUrl: meta.imageUrl,
        dimensions: meta.dimensions,
        centerMm: {
          xMm: originRelativeX,
          yMm: originRelativeY,
        },
        sizeMm: {
          widthMm,
          depthMm,
          heightMm,
        },
        rotationDeg: Math.round((rotationRad * 180) / Math.PI),
      } satisfies PlannerSceneItem;
    });
}

export function isPlannerSceneEnvelope(value: unknown): value is PlannerSceneEnvelope {
  if (!value || typeof value !== "object") return false;

  const candidate = value as Partial<PlannerSceneEnvelope>;
  return candidate.type === "cad-suite-planner-scene" && candidate.version === 1;
}

export function getPlannerSceneEnvelope(sceneJson: PlannerJsonValue): PlannerSceneEnvelope | null {
  if (isPlannerSceneEnvelope(sceneJson)) return sceneJson;

  if (
    sceneJson &&
    typeof sceneJson === "object" &&
    "plannerScene" in sceneJson &&
    isPlannerSceneEnvelope((sceneJson as { plannerScene?: unknown }).plannerScene)
  ) {
    return (sceneJson as { plannerScene: PlannerSceneEnvelope }).plannerScene;
  }

  return null;
}

export function buildPlannerDocumentFromEditor(
  editor: Editor,
  options: BuildPlannerDocumentFromEditorOptions,
): PlannerDocument {
  const room = getSceneRoom(editor);
  const items = getSceneItems(editor, room);
  const snapshot = editor.getSnapshot();

  const sceneJson = {
    type: "cad-suite-planner-scene",
    version: 1,
    measurement: {
      canonicalUnit: "mm",
      displayUnit: options.unitSystem,
      sourceUnit: "mm",
    },
    room,
    items,
    tldrawSnapshot: snapshot,
  } satisfies PlannerSceneEnvelope;

  return createPlannerDocument({
    id: options.documentId ?? undefined,
    name: options.name,
    projectName: options.projectName ?? null,
    clientName: options.clientName ?? null,
    preparedBy: options.preparedBy ?? null,
    roomWidthMm: room.widthMm,
    roomDepthMm: room.depthMm,
    seatTarget: options.seatTarget ?? 10,
    unitSystem: options.unitSystem === "ft-in" ? "imperial" : "metric",
    sceneJson,
    itemCount: items.length,
    thumbnailUrl: options.thumbnailUrl ?? null,
  });
}

export function loadPlannerDocumentIntoEditor(editor: Editor, document: PlannerDocument) {
  const normalized = normalizePlannerDocument(document);
  const scene = getPlannerSceneEnvelope(normalized.sceneJson);
  const snapshot = scene?.tldrawSnapshot;

  if (!snapshot || typeof snapshot !== "object") return false;

  editor.loadSnapshot(snapshot as Parameters<Editor["loadSnapshot"]>[0]);
  editor.setCurrentTool("select");
  editor.zoomToFit({ animation: { duration: 200 } });
  return true;
}
