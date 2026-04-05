import type { Editor } from "tldraw";

export type PlannerStep = "room" | "layout" | "review";

export interface BoqItem {
  id: string;
  name: string;
  category: string;
  price: number;
  dimensions?: string;
}

export interface CatalogProduct {
  name: string;
  category?: string;
  price?: number;
  flagship_image?: string;
  images?: string[];
  specs?: { dimensions?: string; [k: string]: any };
  [k: string]: any;
}
