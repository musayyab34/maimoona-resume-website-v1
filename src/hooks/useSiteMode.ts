import { useEffect, useState } from 'react'
import type { SiteMode } from '../store/scaleStore'

function detectMode(): SiteMode {
  if (typeof window === 'undefined') return 'static'
  if (new URLSearchParams(window.location.search).get('mode') === 'static') return 'static'
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return 'static'
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl2') ?? canvas.getContext('webgl')
    if (!gl) return 'static'
  } catch {
    return 'static'
  }
  return 'enhanced'
}

/**
 * 'enhanced' — continuous zoom, WebGL canvas, smooth scroll.
 * 'static' — discrete sections, no autoplay motion (§6: reduced motion,
 * no WebGL, or ?mode=static). Re-evaluates if the OS preference changes.
 */
export function useSiteMode(): SiteMode {
  const [mode, setMode] = useState<SiteMode>(detectMode)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => setMode(detectMode())
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  return mode
}
