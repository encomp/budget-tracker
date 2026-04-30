import { useState, useEffect } from 'react'

export type Breakpoint = 'desktop' | 'tablet' | 'mobile'

function getBreakpoint(): Breakpoint {
  if (window.innerWidth >= 1024) return 'desktop'
  if (window.innerWidth >= 768) return 'tablet'
  return 'mobile'
}

export function useBreakpoint(): Breakpoint {
  const [bp, setBp] = useState<Breakpoint>(getBreakpoint)
  useEffect(() => {
    const handler = () => setBp(getBreakpoint())
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  return bp
}
