'use client'

import { useFloorPlannerStore } from '@/lib/store'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Trash2, RotateCw, Lock, Unlock, Copy } from 'lucide-react'

export function PropertiesPanel() {
  const { 
    placedFurniture, 
    selectedIds, 
    updateFurniture, 
    removeFurniture,
    pushHistory,
  } = useFloorPlannerStore()

  const selectedItems = placedFurniture.filter(f => selectedIds.includes(f.id))
  const selectedItem = selectedItems.length === 1 ? selectedItems[0] : null

  if (selectedIds.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-6 text-center">
        <p className="text-sm">Select an item on the canvas to view and edit its properties.</p>
      </div>
    )
  }

  if (selectedItems.length > 1) {
    return (
      <div className="p-4">
        <h3 className="font-medium mb-4">{selectedItems.length} items selected</h3>
        <Button
          variant="destructive"
          size="sm"
          className="w-full"
          onClick={() => {
            selectedIds.forEach(id => removeFurniture(id))
            pushHistory()
          }}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Selected
        </Button>
      </div>
    )
  }

  if (!selectedItem || !selectedItem.furniture) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <p className="text-sm">Item not found</p>
      </div>
    )
  }

  const furniture = selectedItem.furniture

  const handleUpdate = (updates: Partial<typeof selectedItem>) => {
    updateFurniture(selectedItem.id, updates)
  }

  const handleDelete = () => {
    removeFurniture(selectedItem.id)
    pushHistory()
  }

  const handleRotate = (degrees: number) => {
    handleUpdate({ rotation: (selectedItem.rotation + degrees) % 360 })
    pushHistory()
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-6">
        {/* Header */}
        <div>
          <h3 className="font-medium truncate">{furniture.name}</h3>
          <p className="text-xs text-muted-foreground capitalize">{furniture.category}</p>
        </div>

        {/* Dimensions */}
        <div className="space-y-3">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Dimensions
          </Label>
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div className="p-2 rounded bg-muted text-center">
              <span className="text-muted-foreground text-xs block">Width</span>
              <span className="font-medium">{furniture.width_cm} cm</span>
            </div>
            <div className="p-2 rounded bg-muted text-center">
              <span className="text-muted-foreground text-xs block">Depth</span>
              <span className="font-medium">{furniture.depth_cm} cm</span>
            </div>
            <div className="p-2 rounded bg-muted text-center">
              <span className="text-muted-foreground text-xs block">Height</span>
              <span className="font-medium">{furniture.height_cm} cm</span>
            </div>
          </div>
        </div>

        {/* Position */}
        <div className="space-y-3">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Position
          </Label>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label htmlFor="pos-x" className="text-xs">X (cm)</Label>
              <Input
                id="pos-x"
                type="number"
                value={Math.round(selectedItem.x_position)}
                onChange={(e) => {
                  handleUpdate({ x_position: Number(e.target.value) })
                }}
                onBlur={pushHistory}
                className="h-8"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="pos-y" className="text-xs">Y (cm)</Label>
              <Input
                id="pos-y"
                type="number"
                value={Math.round(selectedItem.y_position)}
                onChange={(e) => {
                  handleUpdate({ y_position: Number(e.target.value) })
                }}
                onBlur={pushHistory}
                className="h-8"
              />
            </div>
          </div>
        </div>

        {/* Rotation */}
        <div className="space-y-3">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Rotation
          </Label>
          <div className="flex items-center gap-2">
            <Slider
              value={[selectedItem.rotation]}
              min={0}
              max={360}
              step={15}
              onValueChange={([value]) => handleUpdate({ rotation: value })}
              onValueCommit={() => pushHistory()}
              className="flex-1"
            />
            <span className="text-sm w-12 text-right">{selectedItem.rotation}°</span>
          </div>
          <div className="flex gap-1">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 h-8"
              onClick={() => handleRotate(90)}
            >
              <RotateCw className="h-3 w-3 mr-1" />
              90°
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 h-8"
              onClick={() => handleRotate(180)}
            >
              <RotateCw className="h-3 w-3 mr-1" />
              180°
            </Button>
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Notes
          </Label>
          <Input
            id="notes"
            placeholder="Add notes..."
            value={selectedItem.notes || ''}
            onChange={(e) => handleUpdate({ notes: e.target.value })}
            onBlur={pushHistory}
            className="h-8"
          />
        </div>

        {/* Actions */}
        <div className="space-y-2 pt-4 border-t border-border">
          <Button
            variant="outline"
            size="sm"
            className="w-full h-8"
            onClick={() => handleUpdate({ is_locked: !selectedItem.is_locked })}
          >
            {selectedItem.is_locked ? (
              <>
                <Lock className="h-3 w-3 mr-2" />
                Unlock
              </>
            ) : (
              <>
                <Unlock className="h-3 w-3 mr-2" />
                Lock
              </>
            )}
          </Button>
          <Button
            variant="destructive"
            size="sm"
            className="w-full h-8"
            onClick={handleDelete}
          >
            <Trash2 className="h-3 w-3 mr-2" />
            Delete
          </Button>
        </div>
      </div>
    </ScrollArea>
  )
}
