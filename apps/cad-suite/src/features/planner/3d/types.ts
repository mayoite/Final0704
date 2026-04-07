import {
  normalizePlannerDocument,
  type PlannerDocument as CanonicalPlannerDocument,
} from "../model";
import { getPlannerSceneEnvelope } from "../lib/documentBridge";

export type PlannerDocument = CanonicalPlannerDocument;

export interface Planner3DRoom {
  widthMm: number;
  depthMm: number;
  wallHeightMm: number;
  wallThicknessMm: number;
  floorThicknessMm: number;
}

export interface Planner3DItemSize {
  widthMm: number;
  depthMm: number;
  heightMm: number;
}

export interface Planner3DItemPosition {
  xMm: number;
  yMm: number;
}

export interface Planner3DItem {
  id: string;
  name: string;
  category: string;
  centerMm: Planner3DItemPosition;
  sizeMm: Planner3DItemSize;
  rotationDeg?: number;
  color?: string;
}

export interface Planner3DSceneDocument {
  id: string;
  title: string;
  note?: string;
  room: Planner3DRoom;
  items: Planner3DItem[];
}

export interface PlannerDocumentSummary {
  roomAreaSqm: number;
  totalFootprintSqm: number;
  itemCount: number;
  largestItemName: string | null;
}

const MM_TO_WORLD = 0.001;

function resolveFallbackColor(category: string) {
  const normalized = category.toLowerCase();
  if (normalized.includes("storage")) return "#4b5563";
  if (normalized.includes("seat") || normalized.includes("sofa") || normalized.includes("lounge")) return "#8d6b4f";
  if (normalized.includes("table")) return "#c08a45";
  if (normalized.includes("desk") || normalized.includes("work")) return "#6f8594";
  return "#6f7e87";
}

export function buildPlanner3DSceneDocument(document: PlannerDocument): Planner3DSceneDocument {
  const normalized = normalizePlannerDocument(document);
  const scene = getPlannerSceneEnvelope(normalized.sceneJson);

  const room: Planner3DRoom = scene?.room
    ? {
        widthMm: scene.room.widthMm,
        depthMm: scene.room.depthMm,
        wallHeightMm: scene.room.wallHeightMm,
        wallThicknessMm: scene.room.wallThicknessMm,
        floorThicknessMm: scene.room.floorThicknessMm,
      }
    : {
        widthMm: normalized.roomWidthMm,
        depthMm: normalized.roomDepthMm,
        wallHeightMm: 3000,
        wallThicknessMm: 120,
        floorThicknessMm: 40,
      };

  const items: Planner3DItem[] =
    scene?.items.map((item) => ({
      id: item.id,
      name: item.name,
      category: item.category,
      centerMm: item.centerMm,
      sizeMm: item.sizeMm,
      rotationDeg: item.rotationDeg,
      color: resolveFallbackColor(item.category),
    })) ?? [];

  return {
    id: normalized.id ?? "planner-preview",
    title: normalized.name,
    note: normalized.projectName ?? normalized.clientName ?? undefined,
    room,
    items,
  };
}

export function mmToWorld(mm: number) {
  return mm * MM_TO_WORLD;
}

export function formatMm(mm: number) {
  return `${Math.round(mm).toLocaleString("en-IN")} mm`;
}

export function formatMeters(mm: number) {
  return `${(mm / 1000).toFixed(mm >= 10000 ? 0 : 1)} m`;
}

export function formatAreaSqm(areaMm2: number) {
  return `${(areaMm2 / 1000000).toFixed(1)} m2`;
}

export function summarizePlannerDocument(document: PlannerDocument): PlannerDocumentSummary {
  const scene = buildPlanner3DSceneDocument(document);
  const roomAreaMm2 = scene.room.widthMm * scene.room.depthMm;
  const totalFootprintMm2 = scene.items.reduce(
    (total, item) => total + item.sizeMm.widthMm * item.sizeMm.depthMm,
    0,
  );

  const largestItem = scene.items.reduce<{ name: string; areaMm2: number } | null>((best, item) => {
    const areaMm2 = item.sizeMm.widthMm * item.sizeMm.depthMm;
    if (!best || areaMm2 > best.areaMm2) {
      return { name: item.name, areaMm2 };
    }
    return best;
  }, null);

  return {
    roomAreaSqm: roomAreaMm2 / 1000000,
    totalFootprintSqm: totalFootprintMm2 / 1000000,
    itemCount: scene.items.length,
    largestItemName: largestItem?.name ?? null,
  };
}

