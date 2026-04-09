'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { fabric } from 'fabric'
import { useFloorPlannerStore } from '@/lib/store'
import type { FurnitureItem, PlacedFurniture } from '@/lib/types'

interface Canvas2DProps {
  onSelectionChange?: (ids: string[]) => void
}

export function Canvas2D({ onSelectionChange }: Canvas2DProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fabricRef = useRef<fabric.Canvas | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isReady, setIsReady] = useState(false)

  const {
    placedFurniture,
    roomConfig,
    showGrid,
    showMeasurements,
    snapToGrid,
    zoom,
    setZoom,
    panOffset,
    setPanOffset,
    updateFurniture,
    removeFurniture,
    selectedIds,
    setSelectedIds,
    pushHistory,
  } = useFloorPlannerStore()

  // Initialize canvas
  useEffect(() => {
    if (!canvasRef.current || fabricRef.current) return

    const canvas = new fabric.Canvas(canvasRef.current, {
      backgroundColor: 'var(--canvas-bg)',
      selection: true,
      preserveObjectStacking: true,
      enableRetinaScaling: true,
    })

    fabricRef.current = canvas
    setIsReady(true)

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current || !fabricRef.current) return
      const { width, height } = containerRef.current.getBoundingClientRect()
      fabricRef.current.setDimensions({ width, height })
      drawGrid()
      fabricRef.current.renderAll()
    }

    const resizeObserver = new ResizeObserver(handleResize)
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current)
    }

    handleResize()

    return () => {
      resizeObserver.disconnect()
      canvas.dispose()
      fabricRef.current = null
    }
  }, [])

  // Draw grid
  const drawGrid = useCallback(() => {
    const canvas = fabricRef.current
    if (!canvas) return

    // Remove existing grid
    const gridObjects = canvas.getObjects().filter(obj => obj.data?.type === 'grid')
    gridObjects.forEach(obj => canvas.remove(obj))

    if (!showGrid) return

    const gridSize = roomConfig.gridSize * (zoom || 1)
    const width = canvas.getWidth()
    const height = canvas.getHeight()

    // Draw vertical lines
    for (let x = 0; x <= width; x += gridSize) {
      const line = new fabric.Line([x, 0, x, height], {
        stroke: 'var(--canvas-grid)',
        strokeWidth: x % (gridSize * 5) === 0 ? 1 : 0.5,
        selectable: false,
        evented: false,
        data: { type: 'grid' },
      })
      canvas.add(line)
      canvas.sendToBack(line)
    }

    // Draw horizontal lines
    for (let y = 0; y <= height; y += gridSize) {
      const line = new fabric.Line([0, y, width, y], {
        stroke: 'var(--canvas-grid)',
        strokeWidth: y % (gridSize * 5) === 0 ? 1 : 0.5,
        selectable: false,
        evented: false,
        data: { type: 'grid' },
      })
      canvas.add(line)
      canvas.sendToBack(line)
    }
  }, [showGrid, roomConfig.gridSize, zoom])

  // Draw room boundary
  const drawRoom = useCallback(() => {
    const canvas = fabricRef.current
    if (!canvas) return

    // Remove existing room
    const roomObjects = canvas.getObjects().filter(obj => obj.data?.type === 'room')
    roomObjects.forEach(obj => canvas.remove(obj))

    const scale = zoom || 1
    const roomWidth = roomConfig.width * scale
    const roomDepth = roomConfig.depth * scale

    // Center room in canvas
    const canvasWidth = canvas.getWidth()
    const canvasHeight = canvas.getHeight()
    const offsetX = (canvasWidth - roomWidth) / 2
    const offsetY = (canvasHeight - roomDepth) / 2

    // Room walls
    const room = new fabric.Rect({
      left: offsetX,
      top: offsetY,
      width: roomWidth,
      height: roomDepth,
      fill: 'transparent',
      stroke: 'var(--canvas-wall)',
      strokeWidth: 4,
      selectable: false,
      evented: false,
      data: { type: 'room' },
    })

    canvas.add(room)
    canvas.sendToBack(room)

    // Room dimensions label
    if (showMeasurements) {
      const widthLabel = new fabric.Text(
        `${roomConfig.width} cm`,
        {
          left: offsetX + roomWidth / 2,
          top: offsetY - 25,
          fontSize: 12,
          fill: 'var(--foreground)',
          originX: 'center',
          selectable: false,
          evented: false,
          data: { type: 'room' },
        }
      )

      const depthLabel = new fabric.Text(
        `${roomConfig.depth} cm`,
        {
          left: offsetX - 25,
          top: offsetY + roomDepth / 2,
          fontSize: 12,
          fill: 'var(--foreground)',
          angle: -90,
          originX: 'center',
          selectable: false,
          evented: false,
          data: { type: 'room' },
        }
      )

      canvas.add(widthLabel, depthLabel)
    }
  }, [roomConfig, zoom, showMeasurements])

  // Sync furniture to canvas
  const syncFurniture = useCallback(() => {
    const canvas = fabricRef.current
    if (!canvas) return

    // Remove existing furniture objects
    const furnitureObjects = canvas.getObjects().filter(
      obj => obj.data?.type === 'furniture'
    )
    furnitureObjects.forEach(obj => canvas.remove(obj))

    const scale = zoom || 1
    const canvasWidth = canvas.getWidth()
    const canvasHeight = canvas.getHeight()
    const roomWidth = roomConfig.width * scale
    const roomDepth = roomConfig.depth * scale
    const offsetX = (canvasWidth - roomWidth) / 2
    const offsetY = (canvasHeight - roomDepth) / 2

    placedFurniture.forEach(item => {
      if (!item.furniture) return

      const width = item.furniture.width_cm * scale * item.scale_x
      const depth = item.furniture.depth_cm * scale * item.scale_y

      const rect = new fabric.Rect({
        left: offsetX + item.x_position * scale,
        top: offsetY + item.y_position * scale,
        width,
        height: depth,
        fill: getCategoryColor(item.furniture.category),
        stroke: getCategoryStroke(item.furniture.category),
        strokeWidth: 2,
        rx: 4,
        ry: 4,
        angle: item.rotation,
        originX: 'center',
        originY: 'center',
        data: { 
          type: 'furniture',
          id: item.id,
          furnitureId: item.furniture_id,
        },
        lockScalingFlip: true,
        hasControls: true,
        hasBorders: true,
        cornerStyle: 'circle',
        cornerColor: 'var(--primary)',
        cornerStrokeColor: 'var(--primary)',
        borderColor: 'var(--primary)',
        transparentCorners: false,
      })

      // Add label
      const label = new fabric.Text(item.furniture.name, {
        fontSize: 10,
        fill: 'var(--foreground)',
        originX: 'center',
        originY: 'center',
        selectable: false,
        evented: false,
      })

      const group = new fabric.Group([rect, label], {
        left: offsetX + item.x_position * scale,
        top: offsetY + item.y_position * scale,
        angle: item.rotation,
        originX: 'center',
        originY: 'center',
        data: { 
          type: 'furniture',
          id: item.id,
          furnitureId: item.furniture_id,
        },
        lockScalingFlip: true,
        hasControls: true,
        hasBorders: true,
        cornerStyle: 'circle',
        cornerColor: '#3B82F6',
        cornerStrokeColor: '#3B82F6',
        borderColor: '#3B82F6',
        transparentCorners: false,
      })

      canvas.add(group)
    })

    canvas.renderAll()
  }, [placedFurniture, zoom, roomConfig])

  // Setup canvas events
  useEffect(() => {
    const canvas = fabricRef.current
    if (!canvas || !isReady) return

    // Selection events
    canvas.on('selection:created', (e) => {
      const selected = e.selected?.map(obj => obj.data?.id).filter(Boolean) || []
      setSelectedIds(selected)
      onSelectionChange?.(selected)
    })

    canvas.on('selection:updated', (e) => {
      const selected = e.selected?.map(obj => obj.data?.id).filter(Boolean) || []
      setSelectedIds(selected)
      onSelectionChange?.(selected)
    })

    canvas.on('selection:cleared', () => {
      setSelectedIds([])
      onSelectionChange?.([])
    })

    // Object modification
    canvas.on('object:modified', (e) => {
      const obj = e.target
      if (!obj || obj.data?.type !== 'furniture') return

      const scale = zoom || 1
      const canvasWidth = canvas.getWidth()
      const canvasHeight = canvas.getHeight()
      const roomWidth = roomConfig.width * scale
      const roomDepth = roomConfig.depth * scale
      const offsetX = (canvasWidth - roomWidth) / 2
      const offsetY = (canvasHeight - roomDepth) / 2

      let x = ((obj.left || 0) - offsetX) / scale
      let y = ((obj.top || 0) - offsetY) / scale
      let rotation = obj.angle || 0

      // Snap to grid if enabled
      if (snapToGrid) {
        x = Math.round(x / roomConfig.gridSize) * roomConfig.gridSize
        y = Math.round(y / roomConfig.gridSize) * roomConfig.gridSize
        rotation = Math.round(rotation / 15) * 15
      }

      updateFurniture(obj.data.id, {
        x_position: x,
        y_position: y,
        rotation,
        scale_x: obj.scaleX || 1,
        scale_y: obj.scaleY || 1,
      })

      pushHistory()
    })

    // Zoom with mouse wheel
    canvas.on('mouse:wheel', (opt) => {
      const delta = opt.e.deltaY
      let newZoom = zoom - delta * 0.001
      newZoom = Math.max(0.25, Math.min(3, newZoom))
      setZoom(newZoom)
      opt.e.preventDefault()
      opt.e.stopPropagation()
    })

    // Keyboard events
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const activeObjects = canvas.getActiveObjects()
        activeObjects.forEach(obj => {
          if (obj.data?.type === 'furniture' && obj.data?.id) {
            removeFurniture(obj.data.id)
          }
        })
        canvas.discardActiveObject()
        pushHistory()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      canvas.off('selection:created')
      canvas.off('selection:updated')
      canvas.off('selection:cleared')
      canvas.off('object:modified')
      canvas.off('mouse:wheel')
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isReady, zoom, snapToGrid, roomConfig, setSelectedIds, onSelectionChange, updateFurniture, removeFurniture, pushHistory, setZoom])

  // Redraw when dependencies change
  useEffect(() => {
    if (!isReady) return
    drawGrid()
    drawRoom()
    syncFurniture()
  }, [isReady, drawGrid, drawRoom, syncFurniture, showGrid, showMeasurements, zoom])

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full bg-canvas-bg relative overflow-hidden"
    >
      <canvas ref={canvasRef} />
    </div>
  )
}

function getCategoryColor(category: string): string {
  switch (category) {
    case 'workstation': return 'rgba(59, 130, 246, 0.15)'
    case 'desk': return 'rgba(245, 158, 11, 0.15)'
    case 'chair': return 'rgba(34, 197, 94, 0.15)'
    case 'table': return 'rgba(168, 85, 247, 0.15)'
    case 'storage': return 'rgba(249, 115, 22, 0.15)'
    case 'seating': return 'rgba(236, 72, 153, 0.15)'
    default: return 'rgba(107, 114, 128, 0.15)'
  }
}

function getCategoryStroke(category: string): string {
  switch (category) {
    case 'workstation': return '#3B82F6'
    case 'desk': return '#F59E0B'
    case 'chair': return '#22C55E'
    case 'table': return '#A855F7'
    case 'storage': return '#F97316'
    case 'seating': return '#EC4899'
    default: return '#6B7280'
  }
}
