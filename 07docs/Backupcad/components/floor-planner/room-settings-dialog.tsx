'use client'

import { useState, useEffect } from 'react'
import { useFloorPlannerStore } from '@/lib/store'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'

interface RoomSettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  isNew?: boolean
}

export function RoomSettingsDialog({ 
  open, 
  onOpenChange,
  isNew 
}: RoomSettingsDialogProps) {
  const { roomConfig, setRoomConfig } = useFloorPlannerStore()
  
  const [width, setWidth] = useState(roomConfig.width)
  const [depth, setDepth] = useState(roomConfig.depth)
  const [height, setHeight] = useState(roomConfig.height)
  const [gridSize, setGridSize] = useState(roomConfig.gridSize)

  useEffect(() => {
    if (open) {
      setWidth(roomConfig.width)
      setDepth(roomConfig.depth)
      setHeight(roomConfig.height)
      setGridSize(roomConfig.gridSize)
    }
  }, [open, roomConfig])

  const handleSave = () => {
    setRoomConfig({
      width,
      depth,
      height,
      gridSize,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isNew ? 'Create Floor Plan' : 'Room Settings'}
          </DialogTitle>
          <DialogDescription>
            Configure the room dimensions for your floor plan.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="width">Width (cm)</Label>
              <Input
                id="width"
                type="number"
                value={width}
                onChange={(e) => setWidth(Number(e.target.value))}
                min={100}
                max={5000}
              />
              <p className="text-xs text-muted-foreground">
                {(width / 100).toFixed(1)} meters
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="depth">Depth (cm)</Label>
              <Input
                id="depth"
                type="number"
                value={depth}
                onChange={(e) => setDepth(Number(e.target.value))}
                min={100}
                max={5000}
              />
              <p className="text-xs text-muted-foreground">
                {(depth / 100).toFixed(1)} meters
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="height">Ceiling Height (cm)</Label>
            <Input
              id="height"
              type="number"
              value={height}
              onChange={(e) => setHeight(Number(e.target.value))}
              min={200}
              max={500}
            />
            <p className="text-xs text-muted-foreground">
              {(height / 100).toFixed(1)} meters
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Grid Size</Label>
              <span className="text-sm text-muted-foreground">{gridSize} cm</span>
            </div>
            <Slider
              value={[gridSize]}
              min={10}
              max={100}
              step={10}
              onValueChange={([value]) => setGridSize(value)}
            />
            <p className="text-xs text-muted-foreground">
              Snap furniture placement to grid
            </p>
          </div>

          {/* Room Preview */}
          <div className="rounded-lg border border-border p-4 bg-muted/50">
            <div className="text-xs text-muted-foreground mb-2">Preview</div>
            <div 
              className="bg-background border-2 border-foreground/20 mx-auto"
              style={{
                width: `${Math.min(width / 10, 200)}px`,
                height: `${Math.min(depth / 10, 150)}px`,
              }}
            >
              <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                {(width / 100).toFixed(1)}m x {(depth / 100).toFixed(1)}m
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          {!isNew && (
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          )}
          <Button onClick={handleSave}>
            {isNew ? 'Create Floor Plan' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
