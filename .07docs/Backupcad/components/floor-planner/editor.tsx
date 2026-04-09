'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { v4 as uuid } from 'uuid'
import { createClient } from '@/lib/supabase/client'
import { useFloorPlannerStore } from '@/lib/store'
import { EditorToolbar } from './editor-toolbar'
import { FurnitureLibrary } from './furniture-library'
import { PropertiesPanel } from './properties-panel'
import { RoomSettingsDialog } from './room-settings-dialog'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { PanelLeftClose, PanelRightClose, ChevronLeft } from 'lucide-react'
import type { FloorPlan, PlacedFurniture, FurnitureItem } from '@/lib/types'
import Link from 'next/link'

// Dynamic import Canvas2D to avoid SSR issues with Fabric.js
const Canvas2D = dynamic(
  () => import('./canvas-2d').then(mod => mod.Canvas2D),
  { ssr: false, loading: () => <div className="w-full h-full bg-muted animate-pulse" /> }
)

// Dynamic import 3D Viewer
const Viewer3D = dynamic(
  () => import('./viewer-3d').then(mod => mod.Viewer3D),
  { ssr: false, loading: () => <div className="w-full h-full bg-muted animate-pulse" /> }
)

interface FloorPlanEditorProps {
  plan?: FloorPlan
  placedFurniture?: PlacedFurniture[]
  isNew?: boolean
  userId: string
}

export function FloorPlanEditor({ 
  plan, 
  placedFurniture: initialFurniture = [], 
  isNew,
  userId,
}: FloorPlanEditorProps) {
  const router = useRouter()
  const supabase = createClient()
  
  const [isSaving, setIsSaving] = useState(false)
  const [showRoomSettings, setShowRoomSettings] = useState(isNew)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isPropertiesOpen, setIsPropertiesOpen] = useState(true)

  const {
    editorMode,
    currentPlan,
    setCurrentPlan,
    setPlacedFurniture,
    placedFurniture,
    addFurniture,
    roomConfig,
    setRoomConfig,
    setDirty,
    isDirty,
    pushHistory,
  } = useFloorPlannerStore()

  // Initialize store with plan data
  useEffect(() => {
    if (plan) {
      setCurrentPlan(plan)
      setRoomConfig({
        width: plan.room_width_cm,
        depth: plan.room_depth_cm,
        height: plan.room_height_cm,
        gridSize: plan.grid_size_cm,
      })
    }
    
    if (initialFurniture.length > 0) {
      setPlacedFurniture(initialFurniture)
    }
  }, [plan, initialFurniture, setCurrentPlan, setRoomConfig, setPlacedFurniture])

  // Handle adding furniture from library
  const handleAddFurniture = useCallback((item: FurnitureItem) => {
    const newFurniture: PlacedFurniture = {
      id: uuid(),
      floor_plan_id: currentPlan?.id || '',
      furniture_id: item.id,
      x_position: roomConfig.width / 2,
      y_position: roomConfig.depth / 2,
      rotation: 0,
      scale_x: 1,
      scale_y: 1,
      color: item.color_options?.[0] || null,
      z_index: placedFurniture.length,
      is_locked: false,
      notes: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      furniture: item,
    }
    
    addFurniture(newFurniture)
    pushHistory()
  }, [currentPlan, roomConfig, placedFurniture.length, addFurniture, pushHistory])

  // Save floor plan
  const handleSave = useCallback(async () => {
    setIsSaving(true)
    
    try {
      let planId = currentPlan?.id

      // Create or update floor plan
      if (isNew || !planId) {
        const { data: newPlan, error } = await supabase
          .from('floor_plans')
          .insert({
            user_id: userId,
            name: 'Untitled Floor Plan',
            room_width_cm: roomConfig.width,
            room_depth_cm: roomConfig.depth,
            room_height_cm: roomConfig.height,
            grid_size_cm: roomConfig.gridSize,
          })
          .select()
          .single()

        if (error) throw error
        planId = newPlan.id
        setCurrentPlan(newPlan)
        
        // Update URL without reload
        window.history.replaceState({}, '', `/dashboard/editor/${planId}`)
      } else {
        await supabase
          .from('floor_plans')
          .update({
            room_width_cm: roomConfig.width,
            room_depth_cm: roomConfig.depth,
            room_height_cm: roomConfig.height,
            grid_size_cm: roomConfig.gridSize,
            updated_at: new Date().toISOString(),
          })
          .eq('id', planId)
      }

      // Delete existing furniture and re-insert
      await supabase
        .from('placed_furniture')
        .delete()
        .eq('floor_plan_id', planId)

      if (placedFurniture.length > 0) {
        const furnitureToInsert = placedFurniture.map(f => ({
          floor_plan_id: planId,
          furniture_id: f.furniture_id,
          x_position: f.x_position,
          y_position: f.y_position,
          rotation: f.rotation,
          scale_x: f.scale_x,
          scale_y: f.scale_y,
          color: f.color,
          z_index: f.z_index,
          is_locked: f.is_locked,
          notes: f.notes,
        }))

        await supabase
          .from('placed_furniture')
          .insert(furnitureToInsert)
      }

      setDirty(false)
    } catch (error) {
      console.error('Error saving floor plan:', error)
    } finally {
      setIsSaving(false)
    }
  }, [currentPlan, isNew, userId, roomConfig, placedFurniture, supabase, setCurrentPlan, setDirty])

  // Export as PNG
  const handleExport = useCallback(() => {
    // TODO: Implement export
    console.log('Export to PNG')
  }, [])

  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col overflow-hidden">
      {/* Top Toolbar */}
      <div className="flex items-center gap-2 px-2 border-b border-border bg-background">
        <Button variant="ghost" size="icon" asChild className="h-8 w-8">
          <Link href="/dashboard">
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <span className="text-sm font-medium truncate max-w-[200px]">
          {currentPlan?.name || 'New Floor Plan'}
        </span>
      </div>
      
      <EditorToolbar 
        onSave={handleSave}
        onExport={handleExport}
        onRoomSettings={() => setShowRoomSettings(true)}
        isSaving={isSaving}
      />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Furniture Library */}
        <div 
          className={`
            hidden md:flex flex-col border-r border-border bg-card
            transition-all duration-200 ease-in-out
            ${isSidebarOpen ? 'w-64' : 'w-0'}
          `}
        >
          {isSidebarOpen && (
            <>
              <div className="flex items-center justify-between px-3 py-2 border-b border-border">
                <span className="text-sm font-medium">Furniture</span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7"
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <PanelLeftClose className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex-1 overflow-hidden">
                <FurnitureLibrary onAddFurniture={handleAddFurniture} />
              </div>
            </>
          )}
        </div>

        {/* Sidebar Toggle (when collapsed) */}
        {!isSidebarOpen && (
          <Button
            variant="ghost"
            size="icon"
            className="hidden md:flex h-10 w-10 absolute left-2 top-[120px] z-10 bg-card border border-border"
            onClick={() => setIsSidebarOpen(true)}
          >
            <PanelLeftClose className="h-4 w-4 rotate-180" />
          </Button>
        )}

        {/* Canvas */}
        <div className="flex-1 relative">
          {editorMode === '2d' ? (
            <Canvas2D />
          ) : (
            <Viewer3D />
          )}
        </div>

        {/* Right Sidebar - Properties Panel */}
        <div 
          className={`
            hidden lg:flex flex-col border-l border-border bg-card
            transition-all duration-200 ease-in-out
            ${isPropertiesOpen ? 'w-64' : 'w-0'}
          `}
        >
          {isPropertiesOpen && (
            <>
              <div className="flex items-center justify-between px-3 py-2 border-b border-border">
                <span className="text-sm font-medium">Properties</span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7"
                  onClick={() => setIsPropertiesOpen(false)}
                >
                  <PanelRightClose className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex-1 overflow-hidden">
                <PropertiesPanel />
              </div>
            </>
          )}
        </div>

        {/* Properties Toggle (when collapsed) */}
        {!isPropertiesOpen && (
          <Button
            variant="ghost"
            size="icon"
            className="hidden lg:flex h-10 w-10 absolute right-2 top-[120px] z-10 bg-card border border-border"
            onClick={() => setIsPropertiesOpen(true)}
          >
            <PanelRightClose className="h-4 w-4 rotate-180" />
          </Button>
        )}
      </div>

      {/* Mobile Furniture Sheet */}
      <div className="md:hidden fixed bottom-4 left-4 z-50">
        <Sheet>
          <SheetTrigger asChild>
            <Button size="lg" className="rounded-full shadow-lg">
              Add Furniture
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 p-0">
            <FurnitureLibrary onAddFurniture={handleAddFurniture} />
          </SheetContent>
        </Sheet>
      </div>

      {/* Room Settings Dialog */}
      <RoomSettingsDialog 
        open={showRoomSettings} 
        onOpenChange={setShowRoomSettings}
        isNew={isNew}
      />
    </div>
  )
}
