import { WINDOWS } from '../content/levels'

export function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v))
}

export function smoothstep(a: number, b: number, v: number): number {
  const t = clamp((v - a) / (b - a), 0, 1)
  return t * t * (3 - 2 * t)
}

export function easeInOut(t: number): number {
  return t * t * (3 - 2 * t)
}

export interface LevelFade {
  /** crossfade opacity for the level's scene (§5.5) */
  opacity: number
  /** 0..1 through the level's own scroll window — drives local beats */
  local: number
}

/**
 * Whether a level owns the frame outright. Crossfading levels must stop
 * writing depth while they dissolve: a `transparent` material still writes
 * depth by default, so a level at 3% opacity will happily z-clip the level
 * it is dissolving into and shear it along its own silhouette.
 */
export function isSolid(opacity: number): boolean {
  return opacity > 0.995
}

/**
 * Where a level sits relative to the smoothed descent progress. Adjacent
 * levels overlap inside the feather band, producing the crossfade seam.
 */
export function levelFade(p: number, index: number, feather = 0.045): LevelFade {
  const w = WINDOWS[index]
  const local = clamp((p - w.start) / (w.end - w.start), 0, 1)
  const fadeIn = index === 0 ? 1 : smoothstep(w.start - feather, w.start + feather, p)
  const fadeOut =
    index === WINDOWS.length - 1 ? 1 : 1 - smoothstep(w.end - feather, w.end + feather, p)
  return { opacity: fadeIn * fadeOut, local }
}
