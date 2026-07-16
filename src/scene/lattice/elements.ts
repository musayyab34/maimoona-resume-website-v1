/*
 * Element → color/radius map following the VESTA/CPK rendering convention
 * (§2). These are the true saturated values used for the 3D atoms; the
 * contrast-corrected text variants live in the CSS tokens.
 * Radii are visual, ordered by ionic radius (F < Cl < Br; K largest).
 */

export interface ElementSpec {
  color: string
  radius: number
}

export const ELEMENTS: Record<'K' | 'Sn' | 'Cl' | 'Br' | 'F', ElementSpec> = {
  K: { color: '#8F40D4', radius: 0.24 },
  Sn: { color: '#668080', radius: 0.17 },
  Cl: { color: '#1FF01F', radius: 0.14 },
  Br: { color: '#A62929', radius: 0.16 },
  F: { color: '#90E050', radius: 0.11 },
}
