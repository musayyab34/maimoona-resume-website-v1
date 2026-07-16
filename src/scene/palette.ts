import * as THREE from 'three'

/*
 * The signature move (§1): light inverts as you descend. Background stops,
 * sampled by scroll progress — bright cool lab paper at 10⁰, near-black by
 * the atomic scale. Everything photometric (lights, fog, bloom) derives
 * from this one ramp so the inversion stays coherent.
 */
const STOPS: Array<[number, string]> = [
  [0.0, '#F4F6F7'],
  [0.13, '#EBEEF0'],
  [0.3, '#D9DDE0'],
  [0.36, '#AEB4BA'],
  [0.44, '#6E757D'],
  [0.5, '#3A4046'],
  [0.58, '#232830'],
  [0.7, '#16181D'],
  [0.8, '#101216'],
  [0.9, '#0B0C0F'],
  [1.0, '#080909'],
]

const stops = STOPS.map(([t, hex]) => ({ t, c: new THREE.Color(hex) }))
const PAPER_LUMINANCE = luminance(stops[0].c)

function luminance(c: THREE.Color): number {
  return 0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b
}

export function sampleBackground(p: number, out: THREE.Color): THREE.Color {
  if (p <= stops[0].t) return out.copy(stops[0].c)
  for (let i = 0; i < stops.length - 1; i++) {
    const a = stops[i]
    const b = stops[i + 1]
    if (p < b.t) {
      return out.copy(a.c).lerp(b.c, (p - a.t) / (b.t - a.t))
    }
  }
  return out.copy(stops[stops.length - 1].c)
}

const scratch = new THREE.Color()

/** 0 in the bright lab, →1 in atomic darkness. Drives lights, fog, bloom. */
export function darknessAt(p: number): number {
  const lum = luminance(sampleBackground(p, scratch))
  return 1 - Math.min(1, lum / PAPER_LUMINANCE)
}
