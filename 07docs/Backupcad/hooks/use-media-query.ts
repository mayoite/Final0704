import { useState, useEffect } from 'react'

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(query)
    
    const updateMatches = () => {
      setMatches(media.matches)
    }

    // Set initial value
    updateMatches()

    // Listen for changes
    media.addEventListener('change', updateMatches)

    return () => {
      media.removeEventListener('change', updateMatches)
    }
  }, [query])

  return matches
}

// Preset breakpoints
export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 767px)')
}

export function useIsTablet(): boolean {
  return useMediaQuery('(min-width: 768px) and (max-width: 1023px)')
}

export function useIsDesktop(): boolean {
  return useMediaQuery('(min-width: 1024px)')
}

export function useIsLandscape(): boolean {
  return useMediaQuery('(orientation: landscape)')
}
