export type PlannerStep = "room" | "catalog" | "measure" | "review";
export type PlannerDrawingTool = "select" | "hand" | "draw" | "line" | "geo" | "eraser";

export interface BoqItem {
  id: string;
  name: string;
  category: string;
  price: number;
  dimensions?: string;
}

export interface ProductSpecs {
  dimensions?: string;
  [key: string]: unknown;
}

export interface CatalogProduct {
  name: string;
  category?: string;
  price?: number;
  flagship_image?: string;
  images?: string[];
  specs?: ProductSpecs;
  [k: string]: unknown;
}

export interface PlannerShapeMeta {
  text?: string;
  category?: string;
  price?: number;
  dimensions?: string;
  presetId?: string;
  isPlannerItem?: boolean;
  isRoomShell?: boolean;
  isRoomDimension?: boolean;
}

export interface RoomPreset {
  id: string;
  name: string;
  summary: string;
  widthMm: number;
  heightMm: number;
}
