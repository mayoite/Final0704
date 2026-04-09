export type PlannerEngineMode = "blueprint-bridge" | "react-canvas";

export type PlannerViewMode = "2.5d" | "3d";

export type PlannerToolMode = "move" | "draw";

export type PlannerPoint2D = {
  x: number;
  y: number;
};

export type PlannerPoint3D = {
  x: number;
  y: number;
  z: number;
};

export type PlannerSceneSelection =
  | {
      kind: "item" | "wall" | "room";
      id?: string;
      title: string;
      detail?: string;
      areaSqM?: number;
    }
  | null;

export type PlannerWall = {
  id: string;
  start: PlannerPoint2D;
  end: PlannerPoint2D;
  kind: "boundary" | "interior";
};

export type PlannerRoom = {
  id: string;
  name: string;
  outline: PlannerPoint2D[];
  areaSqM?: number;
};

export type PlannerPlacedItem = {
  id: string;
  catalogId: string;
  name: string;
  category?: string;
  color?: string;
  position: PlannerPoint3D;
  rotationDeg: number;
  widthCm: number;
  depthCm: number;
  heightCm: number;
  sourceUrl?: string;
  spec?: string;
  topView?: string;
  shape?: string;
  renderStyle?: string;
};

export type PlannerDocumentMetadata = {
  source: "starter" | "blueprint-bridge" | "react-canvas";
  importedAt: string;
  serializedSource?: string | null;
};

export type PlannerDocument = {
  version: "planner-document.v1";
  units: "cm";
  rooms: PlannerRoom[];
  walls: PlannerWall[];
  items: PlannerPlacedItem[];
  metadata: PlannerDocumentMetadata;
};

export type Opening = {
  id: string;
  type: "door" | "window" | "double-door";
  xMm: number;
  yMm: number;
  widthMm: number;
  rotationDeg: number;
  flipHorizontal: boolean;
};

export type PlannerItem = {
  id: string;
  catalogId: string;
  xMm: number;
  yMm: number;
  rotationDeg: number;
};

export type RoomState = {
  widthMm: number;
  depthMm: number;
};

export type PlannerCategory =
  | "workstations"
  | "seating"
  | "soft-seating"
  | "tables"
  | "storage"
  | "education"
  | "accessories"
  | "all";

export type VariantDefinition = {
  id: string;
  name: string;
  widthMm: number;
  depthMm: number;
  heightMm: number;
  seatCount: number;
  unitCount: number;
  price?: number;
};

export type QueryAction = "what-fits" | "recommend" | "optimize";

export type QuerySuggestion = {
  label: string;
  query: string;
};

export type PlannerHistoryState<T> = {
  past: T[];
  present: T;
  future: T[];
};
