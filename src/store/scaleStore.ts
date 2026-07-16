import { create } from 'zustand'
import type { HalideVariant } from '../content/cv'

export type SiteMode = 'enhanced' | 'static'
export type Quality = 'high' | 'medium' | 'low'

interface ScaleState {
  /** raw scroll progress across the descent, written by the master ScrollTrigger */
  progress: number
  /** frame-smoothed progress, written by the ScaleRig each frame */
  smoothProgress: number
  /** index into LEVELS whose section currently occupies the viewport */
  activeLevel: number
  variant: HalideVariant
  /** `${groupIndex}-${itemIndex}` of the hovered/focused skill chip, or null */
  highlightedSkill: string | null
  /** false once the visitor has scrolled past the descent into the dossier */
  descentActive: boolean
  quality: Quality
  setVariant: (v: HalideVariant) => void
  setActiveLevel: (i: number) => void
  setHighlightedSkill: (id: string | null) => void
  setDescentActive: (active: boolean) => void
  setQuality: (q: Quality) => void
}

export const useScaleStore = create<ScaleState>()((set) => ({
  progress: 0,
  smoothProgress: 0,
  activeLevel: 0,
  variant: 'Cl',
  highlightedSkill: null,
  descentActive: true,
  quality: 'high',
  setVariant: (variant) => set({ variant }),
  setActiveLevel: (activeLevel) => set({ activeLevel }),
  setHighlightedSkill: (highlightedSkill) => set({ highlightedSkill }),
  setDescentActive: (descentActive) => set({ descentActive }),
  setQuality: (quality) => set({ quality }),
}))

/** High-frequency write path for the scroll engine; no React subscribers read `progress`. */
export function setProgress(progress: number) {
  useScaleStore.setState({ progress })
}

// ?debug exposes the store for inspection (used by the headless test harness)
if (typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('debug')) {
  ;(window as unknown as Record<string, unknown>).__scaleStore = useScaleStore
}
