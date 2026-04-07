'use client'

import { useRef, useState, useCallback, useEffect } from 'react'

interface MobileJoystickProps {
  onMove: (direction: { x: number; y: number }) => void
  size?: number
}

export function MobileJoystick({ onMove, size = 120 }: MobileJoystickProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const maxDistance = size / 2 - 20

  const handleStart = useCallback((clientX: number, clientY: number) => {
    setIsDragging(true)
  }, [])

  const handleMove = useCallback((clientX: number, clientY: number) => {
    if (!isDragging || !containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    let deltaX = clientX - centerX
    let deltaY = clientY - centerY

    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
    
    if (distance > maxDistance) {
      deltaX = (deltaX / distance) * maxDistance
      deltaY = (deltaY / distance) * maxDistance
    }

    setPosition({ x: deltaX, y: deltaY })
    onMove({ 
      x: deltaX / maxDistance, 
      y: -deltaY / maxDistance // Invert Y for forward/backward
    })
  }, [isDragging, maxDistance, onMove])

  const handleEnd = useCallback(() => {
    setIsDragging(false)
    setPosition({ x: 0, y: 0 })
    onMove({ x: 0, y: 0 })
  }, [onMove])

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    handleStart(touch.clientX, touch.clientY)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    handleMove(touch.clientX, touch.clientY)
  }

  return (
    <div
      ref={containerRef}
      className="relative rounded-full bg-muted/50 backdrop-blur border border-border touch-none"
      style={{ width: size, height: size }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleEnd}
      onMouseDown={(e) => handleStart(e.clientX, e.clientY)}
      onMouseMove={(e) => handleMove(e.clientX, e.clientY)}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
    >
      {/* Base */}
      <div 
        className="absolute inset-4 rounded-full bg-muted/30"
      />
      
      {/* Stick */}
      <div
        className={`
          absolute rounded-full bg-primary shadow-lg
          transition-transform duration-75
          ${isDragging ? 'scale-90' : 'scale-100'}
        `}
        style={{
          width: 40,
          height: 40,
          left: size / 2 - 20 + position.x,
          top: size / 2 - 20 + position.y,
        }}
      />
    </div>
  )
}
