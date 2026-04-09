'use client'

import { useState, useEffect } from 'react'
import { RotateCcw, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function OrientationPrompt() {
  const [showPrompt, setShowPrompt] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const checkOrientation = () => {
      const isPortrait = window.innerHeight > window.innerWidth
      const isMobile = window.innerWidth < 768
      setShowPrompt(isPortrait && isMobile && !dismissed)
    }

    checkOrientation()
    window.addEventListener('resize', checkOrientation)
    window.addEventListener('orientationchange', checkOrientation)

    return () => {
      window.removeEventListener('resize', checkOrientation)
      window.removeEventListener('orientationchange', checkOrientation)
    }
  }, [dismissed])

  if (!showPrompt) return null

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur z-[100] flex flex-col items-center justify-center p-6 text-center md:hidden">
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4"
        onClick={() => setDismissed(true)}
      >
        <X className="h-5 w-5" />
      </Button>

      <div className="animate-pulse mb-6">
        <RotateCcw className="h-16 w-16 text-primary mx-auto" />
      </div>

      <h2 className="text-xl font-semibold mb-2">Rotate Your Device</h2>
      <p className="text-muted-foreground max-w-sm">
        For the best floor planning experience, please rotate your device to landscape mode.
      </p>

      <Button 
        variant="outline" 
        className="mt-6"
        onClick={() => setDismissed(true)}
      >
        Continue in Portrait
      </Button>
    </div>
  )
}
