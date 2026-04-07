import { useRef, useCallback, useEffect } from 'react'

interface TouchGestureHandlers {
  onPinch?: (scale: number, center: { x: number; y: number }) => void
  onPan?: (delta: { x: number; y: number }) => void
  onRotate?: (angle: number) => void
  onTap?: (position: { x: number; y: number }) => void
  onDoubleTap?: (position: { x: number; y: number }) => void
  onLongPress?: (position: { x: number; y: number }) => void
}

export function useTouchGestures(
  ref: React.RefObject<HTMLElement>,
  handlers: TouchGestureHandlers
) {
  const touchesRef = useRef<Touch[]>([])
  const initialDistanceRef = useRef<number>(0)
  const initialAngleRef = useRef<number>(0)
  const lastTapRef = useRef<number>(0)
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null)

  const getDistance = (t1: Touch, t2: Touch) => {
    const dx = t1.clientX - t2.clientX
    const dy = t1.clientY - t2.clientY
    return Math.sqrt(dx * dx + dy * dy)
  }

  const getAngle = (t1: Touch, t2: Touch) => {
    return Math.atan2(t2.clientY - t1.clientY, t2.clientX - t1.clientX)
  }

  const getCenter = (t1: Touch, t2: Touch) => ({
    x: (t1.clientX + t2.clientX) / 2,
    y: (t1.clientY + t2.clientY) / 2,
  })

  const handleTouchStart = useCallback((e: TouchEvent) => {
    touchesRef.current = Array.from(e.touches)

    if (e.touches.length === 1) {
      // Start long press timer
      const touch = e.touches[0]
      longPressTimerRef.current = setTimeout(() => {
        handlers.onLongPress?.({ x: touch.clientX, y: touch.clientY })
      }, 500)
    }

    if (e.touches.length === 2) {
      initialDistanceRef.current = getDistance(e.touches[0], e.touches[1])
      initialAngleRef.current = getAngle(e.touches[0], e.touches[1])
    }
  }, [handlers])

  const handleTouchMove = useCallback((e: TouchEvent) => {
    // Clear long press on move
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }

    if (e.touches.length === 1 && touchesRef.current.length === 1) {
      // Pan
      const deltaX = e.touches[0].clientX - touchesRef.current[0].clientX
      const deltaY = e.touches[0].clientY - touchesRef.current[0].clientY
      handlers.onPan?.({ x: deltaX, y: deltaY })
    }

    if (e.touches.length === 2) {
      // Pinch zoom
      const currentDistance = getDistance(e.touches[0], e.touches[1])
      const scale = currentDistance / initialDistanceRef.current
      const center = getCenter(e.touches[0], e.touches[1])
      handlers.onPinch?.(scale, center)

      // Two-finger rotate
      const currentAngle = getAngle(e.touches[0], e.touches[1])
      const angleDelta = currentAngle - initialAngleRef.current
      handlers.onRotate?.(angleDelta * (180 / Math.PI))
    }

    touchesRef.current = Array.from(e.touches)
  }, [handlers])

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    // Clear long press timer
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }

    // Detect tap / double tap
    if (e.changedTouches.length === 1 && touchesRef.current.length === 1) {
      const touch = e.changedTouches[0]
      const now = Date.now()
      const timeSinceLastTap = now - lastTapRef.current

      if (timeSinceLastTap < 300) {
        handlers.onDoubleTap?.({ x: touch.clientX, y: touch.clientY })
      } else {
        handlers.onTap?.({ x: touch.clientX, y: touch.clientY })
      }

      lastTapRef.current = now
    }

    touchesRef.current = Array.from(e.touches)
    
    if (e.touches.length === 2) {
      initialDistanceRef.current = getDistance(e.touches[0], e.touches[1])
      initialAngleRef.current = getAngle(e.touches[0], e.touches[1])
    }
  }, [handlers])

  useEffect(() => {
    const element = ref.current
    if (!element) return

    element.addEventListener('touchstart', handleTouchStart, { passive: true })
    element.addEventListener('touchmove', handleTouchMove, { passive: true })
    element.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchmove', handleTouchMove)
      element.removeEventListener('touchend', handleTouchEnd)
      
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current)
      }
    }
  }, [ref, handleTouchStart, handleTouchMove, handleTouchEnd])
}
