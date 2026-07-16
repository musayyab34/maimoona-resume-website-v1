/*
 * The journey map (§3): five orders of magnitude plus the resolution beat.
 * Section scroll heights drive both the DOM layout and the normalized
 * progress windows the 3D levels fade through — one source for both.
 */

export interface LevelDef {
  id: string
  /** power of ten, in metres; null for the resolution beat (stays at -10) */
  exponent: number | null
  name: string
  /** scroll distance the level occupies in the enhanced mode */
  heightVh: number
}

export const LEVELS: LevelDef[] = [
  { id: 'l0', exponent: 0, name: 'The sample', heightVh: 150 },
  { id: 'l3', exponent: -3, name: 'Education', heightVh: 200 },
  { id: 'l6', exponent: -6, name: 'Research', heightVh: 200 },
  { id: 'l9', exponent: -9, name: 'Thesis', heightVh: 280 },
  { id: 'l10', exponent: -10, name: 'Instruments', heightVh: 220 },
  { id: 'resolution', exponent: null, name: 'Resolution', heightVh: 150 },
]

/** Levels shown on the scale rail (the resolution beat shares 10⁻¹⁰). */
export const RAIL_LEVELS = LEVELS.slice(0, 5)

export const TOTAL_VH = LEVELS.reduce((acc, l) => acc + l.heightVh, 0)

export interface ProgressWindow {
  start: number
  end: number
}

/**
 * Scroll progress (0..1 across the master trigger) at which each level's
 * section occupies the viewport. The denominator subtracts one viewport
 * because ScrollTrigger's `bottom bottom` end stops a screen early.
 */
export function computeWindows(viewportVh = 100): ProgressWindow[] {
  const denom = TOTAL_VH - viewportVh
  let acc = 0
  return LEVELS.map((level) => {
    const start = acc / denom
    acc += level.heightVh
    return { start, end: Math.min(1, acc / denom) }
  })
}

export const WINDOWS = computeWindows()

/**
 * Continuous exponent readout for the scale rail: sweeps between each
 * level's power of ten as the descent progresses, holding at -10 through
 * the resolution beat.
 */
export function exponentAt(progress: number): number {
  const anchors = LEVELS.filter((l) => l.exponent !== null).map((l, i) => ({
    p: WINDOWS[i].start,
    e: l.exponent as number,
  }))
  if (progress <= anchors[0].p) return anchors[0].e
  for (let i = 0; i < anchors.length - 1; i++) {
    const a = anchors[i]
    const b = anchors[i + 1]
    if (progress < b.p) {
      const t = (progress - a.p) / (b.p - a.p)
      return a.e + (b.e - a.e) * t
    }
  }
  return anchors[anchors.length - 1].e
}
