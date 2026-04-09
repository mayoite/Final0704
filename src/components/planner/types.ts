export type PlannerCatalogItem = {
  id: string;
  name: string;
  family: string;
  category: string;
  categoryLabel?: string;
  subcategoryLabel?: string;
  imageUrl?: string;
  heroImageUrl?: string;
  galleryImages?: string[];
  width?: number;
  depth?: number;
  height?: number;
  color?: string;
  shape?: string;
  renderStyle?: string;
  topView?: string;
  spec?: string;
  materials?: string[];
  accessories?: string[];
  finishOptions?: string[];
  certifications?: string[];
  docs?: Array<{ title?: string; url?: string } | string>;
  overviewPairs?: Array<{ heading?: string; body?: string }>;
  specSections?: Array<{ heading?: string; lines?: string[] }>;
  plannerPhase?: string;
  sourceUrl?: string;
};

export type PlannerCatalogPayload = {
  itemCount: number;
  phaseOneItemCount: number;
  items: PlannerCatalogItem[];
};

export type SceneSelection =
  | { kind: "item"; id?: string; title: string; detail?: string; areaSqM?: number }
  | { kind: "wall"; id?: string; title: string; detail?: string; areaSqM?: number }
  | { kind: "room"; id?: string; title: string; detail?: string; areaSqM?: number }
  | null;

export type PresetPlacement = {
  match: (item: PlannerCatalogItem) => boolean;
  x: number;
  z: number;
  rotation?: number;
};

export type PlannerPresetKey = "focus-four" | "meeting-six" | "lounge-pair";
