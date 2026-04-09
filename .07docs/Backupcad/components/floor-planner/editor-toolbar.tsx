'use client'

import { useFloorPlannerStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Grid3X3,
  Ruler,
  Magnet,
  Save,
  Download,
  Box,
  LayoutGrid,
  MoreVertical,
  Maximize2,
  Settings,
} from 'lucide-react'

interface EditorToolbarProps {
  onSave?: () => void
  onExport?: () => void
  onRoomSettings?: () => void
  isSaving?: boolean
}

export function EditorToolbar({ 
  onSave, 
  onExport, 
  onRoomSettings,
  isSaving 
}: EditorToolbarProps) {
  const {
    editorMode,
    setEditorMode,
    zoom,
    setZoom,
    showGrid,
    toggleGrid,
    showMeasurements,
    toggleMeasurements,
    snapToGrid,
    toggleSnapToGrid,
    canUndo,
    canRedo,
    undo,
    redo,
    isDirty,
  } = useFloorPlannerStore()

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex items-center justify-between h-12 px-3 border-b border-border bg-card">
        <div className="flex items-center gap-1">
          {/* View Mode Toggle */}
          <div className="flex items-center rounded-lg border border-border p-0.5 mr-2">
            <ToolbarButton
              icon={<LayoutGrid className="h-4 w-4" />}
              tooltip="2D View"
              active={editorMode === '2d'}
              onClick={() => setEditorMode('2d')}
            />
            <ToolbarButton
              icon={<Box className="h-4 w-4" />}
              tooltip="3D View"
              active={editorMode === '3d'}
              onClick={() => setEditorMode('3d')}
            />
          </div>

          <Separator orientation="vertical" className="h-6 mx-1" />

          {/* Undo/Redo */}
          <ToolbarButton
            icon={<Undo2 className="h-4 w-4" />}
            tooltip="Undo (Ctrl+Z)"
            onClick={undo}
            disabled={!canUndo()}
          />
          <ToolbarButton
            icon={<Redo2 className="h-4 w-4" />}
            tooltip="Redo (Ctrl+Y)"
            onClick={redo}
            disabled={!canRedo()}
          />

          <Separator orientation="vertical" className="h-6 mx-1" />

          {/* Zoom Controls */}
          <ToolbarButton
            icon={<ZoomOut className="h-4 w-4" />}
            tooltip="Zoom Out"
            onClick={() => setZoom(zoom - 0.1)}
            disabled={zoom <= 0.25}
          />
          <div className="w-16 text-center text-sm font-medium text-muted-foreground">
            {Math.round(zoom * 100)}%
          </div>
          <ToolbarButton
            icon={<ZoomIn className="h-4 w-4" />}
            tooltip="Zoom In"
            onClick={() => setZoom(zoom + 0.1)}
            disabled={zoom >= 3}
          />
          <ToolbarButton
            icon={<Maximize2 className="h-4 w-4" />}
            tooltip="Fit to Screen"
            onClick={() => setZoom(1)}
          />

          <Separator orientation="vertical" className="h-6 mx-1" />

          {/* View Options */}
          <ToolbarButton
            icon={<Grid3X3 className="h-4 w-4" />}
            tooltip="Toggle Grid"
            active={showGrid}
            onClick={toggleGrid}
          />
          <ToolbarButton
            icon={<Ruler className="h-4 w-4" />}
            tooltip="Toggle Measurements"
            active={showMeasurements}
            onClick={toggleMeasurements}
          />
          <ToolbarButton
            icon={<Magnet className="h-4 w-4" />}
            tooltip="Snap to Grid"
            active={snapToGrid}
            onClick={toggleSnapToGrid}
          />
        </div>

        <div className="flex items-center gap-1">
          <ToolbarButton
            icon={<Settings className="h-4 w-4" />}
            tooltip="Room Settings"
            onClick={onRoomSettings}
          />

          <Separator orientation="vertical" className="h-6 mx-1" />

          <Button 
            variant="outline" 
            size="sm" 
            onClick={onSave}
            disabled={isSaving}
            className="h-8"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : isDirty ? 'Save*' : 'Saved'}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onExport}>
                <Download className="h-4 w-4 mr-2" />
                Export as PNG
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </TooltipProvider>
  )
}

interface ToolbarButtonProps {
  icon: React.ReactNode
  tooltip: string
  onClick?: () => void
  active?: boolean
  disabled?: boolean
}

function ToolbarButton({ 
  icon, 
  tooltip, 
  onClick, 
  active, 
  disabled 
}: ToolbarButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant={active ? 'secondary' : 'ghost'}
          size="icon"
          className={`h-8 w-8 ${active ? 'bg-primary/10 text-primary' : ''}`}
          onClick={onClick}
          disabled={disabled}
        >
          {icon}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        <p>{tooltip}</p>
      </TooltipContent>
    </Tooltip>
  )
}
