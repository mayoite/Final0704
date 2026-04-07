import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type { 
  PlacedFurniture, 
  FurnitureItem, 
  FloorPlan, 
  EditorMode, 
  CameraMode,
  RoomConfig 
} from './types'

interface FloorPlannerState {
  // Current floor plan
  currentPlan: FloorPlan | null
  setCurrentPlan: (plan: FloorPlan | null) => void
  
  // Placed furniture
  placedFurniture: PlacedFurniture[]
  setPlacedFurniture: (furniture: PlacedFurniture[]) => void
  addFurniture: (furniture: PlacedFurniture) => void
  updateFurniture: (id: string, updates: Partial<PlacedFurniture>) => void
  removeFurniture: (id: string) => void
  
  // Selection
  selectedIds: string[]
  setSelectedIds: (ids: string[]) => void
  clearSelection: () => void
  
  // Editor mode
  editorMode: EditorMode
  setEditorMode: (mode: EditorMode) => void
  
  // Camera mode for 3D
  cameraMode: CameraMode
  setCameraMode: (mode: CameraMode) => void
  
  // Room configuration
  roomConfig: RoomConfig
  setRoomConfig: (config: Partial<RoomConfig>) => void
  
  // Canvas state
  zoom: number
  setZoom: (zoom: number) => void
  panOffset: { x: number; y: number }
  setPanOffset: (offset: { x: number; y: number }) => void
  
  // Grid and measurements
  showGrid: boolean
  toggleGrid: () => void
  showMeasurements: boolean
  toggleMeasurements: () => void
  snapToGrid: boolean
  toggleSnapToGrid: () => void
  
  // History for undo/redo
  history: PlacedFurniture[][]
  historyIndex: number
  pushHistory: () => void
  undo: () => void
  redo: () => void
  canUndo: () => boolean
  canRedo: () => boolean
  
  // Furniture library
  furnitureLibrary: FurnitureItem[]
  setFurnitureLibrary: (items: FurnitureItem[]) => void
  selectedCategory: string | null
  setSelectedCategory: (category: string | null) => void
  searchQuery: string
  setSearchQuery: (query: string) => void
  
  // UI state
  isSidebarOpen: boolean
  toggleSidebar: () => void
  isPropertiesPanelOpen: boolean
  togglePropertiesPanel: () => void
  isMobileMenuOpen: boolean
  setMobileMenuOpen: (open: boolean) => void
  activeTab: 'library' | 'canvas' | 'properties'
  setActiveTab: (tab: 'library' | 'canvas' | 'properties') => void
  
  // Dirty state (unsaved changes)
  isDirty: boolean
  setDirty: (dirty: boolean) => void
}

export const useFloorPlannerStore = create<FloorPlannerState>()(
  immer((set, get) => ({
    // Current floor plan
    currentPlan: null,
    setCurrentPlan: (plan) => set((state) => { state.currentPlan = plan }),
    
    // Placed furniture
    placedFurniture: [],
    setPlacedFurniture: (furniture) => set((state) => { 
      state.placedFurniture = furniture 
      state.isDirty = false
    }),
    addFurniture: (furniture) => set((state) => { 
      state.placedFurniture.push(furniture)
      state.isDirty = true
    }),
    updateFurniture: (id, updates) => set((state) => {
      const index = state.placedFurniture.findIndex(f => f.id === id)
      if (index !== -1) {
        state.placedFurniture[index] = { ...state.placedFurniture[index], ...updates }
        state.isDirty = true
      }
    }),
    removeFurniture: (id) => set((state) => {
      state.placedFurniture = state.placedFurniture.filter(f => f.id !== id)
      state.selectedIds = state.selectedIds.filter(sid => sid !== id)
      state.isDirty = true
    }),
    
    // Selection
    selectedIds: [],
    setSelectedIds: (ids) => set((state) => { state.selectedIds = ids }),
    clearSelection: () => set((state) => { state.selectedIds = [] }),
    
    // Editor mode
    editorMode: '2d',
    setEditorMode: (mode) => set((state) => { state.editorMode = mode }),
    
    // Camera mode
    cameraMode: 'orbit',
    setCameraMode: (mode) => set((state) => { state.cameraMode = mode }),
    
    // Room configuration
    roomConfig: {
      width: 1000, // 10 meters
      depth: 800,  // 8 meters
      height: 280, // 2.8 meters
      wallColor: '#e5e7eb',
      floorColor: '#f3f4f6',
      gridSize: 50, // 50cm grid
    },
    setRoomConfig: (config) => set((state) => {
      state.roomConfig = { ...state.roomConfig, ...config }
      state.isDirty = true
    }),
    
    // Canvas state
    zoom: 1,
    setZoom: (zoom) => set((state) => { state.zoom = Math.max(0.1, Math.min(3, zoom)) }),
    panOffset: { x: 0, y: 0 },
    setPanOffset: (offset) => set((state) => { state.panOffset = offset }),
    
    // Grid and measurements
    showGrid: true,
    toggleGrid: () => set((state) => { state.showGrid = !state.showGrid }),
    showMeasurements: true,
    toggleMeasurements: () => set((state) => { state.showMeasurements = !state.showMeasurements }),
    snapToGrid: true,
    toggleSnapToGrid: () => set((state) => { state.snapToGrid = !state.snapToGrid }),
    
    // History
    history: [[]],
    historyIndex: 0,
    pushHistory: () => set((state) => {
      const newHistory = state.history.slice(0, state.historyIndex + 1)
      newHistory.push([...state.placedFurniture])
      state.history = newHistory.slice(-50) // Keep last 50 states
      state.historyIndex = state.history.length - 1
    }),
    undo: () => set((state) => {
      if (state.historyIndex > 0) {
        state.historyIndex--
        state.placedFurniture = [...state.history[state.historyIndex]]
        state.isDirty = true
      }
    }),
    redo: () => set((state) => {
      if (state.historyIndex < state.history.length - 1) {
        state.historyIndex++
        state.placedFurniture = [...state.history[state.historyIndex]]
        state.isDirty = true
      }
    }),
    canUndo: () => get().historyIndex > 0,
    canRedo: () => get().historyIndex < get().history.length - 1,
    
    // Furniture library
    furnitureLibrary: [],
    setFurnitureLibrary: (items) => set((state) => { state.furnitureLibrary = items }),
    selectedCategory: null,
    setSelectedCategory: (category) => set((state) => { state.selectedCategory = category }),
    searchQuery: '',
    setSearchQuery: (query) => set((state) => { state.searchQuery = query }),
    
    // UI state
    isSidebarOpen: true,
    toggleSidebar: () => set((state) => { state.isSidebarOpen = !state.isSidebarOpen }),
    isPropertiesPanelOpen: true,
    togglePropertiesPanel: () => set((state) => { state.isPropertiesPanelOpen = !state.isPropertiesPanelOpen }),
    isMobileMenuOpen: false,
    setMobileMenuOpen: (open) => set((state) => { state.isMobileMenuOpen = open }),
    activeTab: 'canvas',
    setActiveTab: (tab) => set((state) => { state.activeTab = tab }),
    
    // Dirty state
    isDirty: false,
    setDirty: (dirty) => set((state) => { state.isDirty = dirty }),
  }))
)
