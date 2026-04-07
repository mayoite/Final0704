// Database types for floor planner

export type UserRole = 'user' | 'admin'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  role: UserRole
  created_at: string
  updated_at: string
}

export type FurnitureCategory = 
  | 'workstations'
  | 'desks'
  | 'chairs'
  | 'tables'
  | 'storage'
  | 'soft_seating'
  | 'accessories'

export interface FurnitureItem {
  id: string
  name: string
  category: FurnitureCategory
  description: string | null
  width_cm: number
  depth_cm: number
  height_cm: number
  image_url: string | null
  model_3d_url: string | null
  color_options: string[]
  price_inr: number | null
  sku: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface FloorPlan {
  id: string
  user_id: string
  name: string
  description: string | null
  room_width_cm: number
  room_depth_cm: number
  room_height_cm: number
  grid_size_cm: number
  is_template: boolean
  is_public: boolean
  thumbnail_url: string | null
  created_at: string
  updated_at: string
}

export interface PlacedFurniture {
  id: string
  floor_plan_id: string
  furniture_id: string
  x_position: number
  y_position: number
  rotation: number
  scale_x: number
  scale_y: number
  color: string | null
  z_index: number
  is_locked: boolean
  notes: string | null
  created_at: string
  updated_at: string
  // Joined data
  furniture?: FurnitureItem
}

// Canvas state types
export interface CanvasState {
  zoom: number
  panX: number
  panY: number
  selectedIds: string[]
  isGridVisible: boolean
  isMeasurementsVisible: boolean
  snapToGrid: boolean
}

export interface HistoryState {
  past: PlacedFurniture[][]
  present: PlacedFurniture[]
  future: PlacedFurniture[][]
}

// 3D viewer types
export type CameraMode = 'orbit' | 'firstPerson'

export interface ViewerState {
  cameraMode: CameraMode
  showWireframe: boolean
  showDimensions: boolean
  ambientIntensity: number
}

// Editor mode
export type EditorMode = '2d' | '3d'

// Room configuration
export interface RoomConfig {
  width: number
  depth: number
  height: number
  wallColor: string
  floorColor: string
  gridSize: number
}

// Export options
export interface ExportOptions {
  format: 'png' | 'pdf' | 'json'
  includeGrid: boolean
  includeMeasurements: boolean
  scale: number
}
