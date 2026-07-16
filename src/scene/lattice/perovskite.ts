/*
 * Procedural ABX₃ perovskite generator (§4 of the stack notes). A cubic
 * perovskite is a mathematical object: A on the corners, B at the body
 * centre, X on the face centres — corner-sharing BX₆ octahedra. Positions
 * are generated, not modeled; the halide swap is a one-parameter change.
 */

export interface LatticeData {
  /** A-site (K) positions, xyz-interleaved */
  aSites: Float32Array
  /** B-site (Sn) positions */
  bSites: Float32Array
  /** X-site (halide) positions, shared face-centre atoms deduplicated */
  xSites: Float32Array
  /** midpoints of each B–X bond */
  bondCenters: Float32Array
  /** bond direction per bond: 0 = x, 1 = y, 2 = z */
  bondAxes: Uint8Array
  aCount: number
  bCount: number
  xCount: number
  bondCount: number
  /** bond length: half the cell edge */
  bondLength: number
}

const DIRS: Array<[number, number, number]> = [
  [1, 0, 0],
  [-1, 0, 0],
  [0, 1, 0],
  [0, -1, 0],
  [0, 0, 1],
  [0, 0, -1],
]

/**
 * Generate an n×n×n tiling of the cubic ABX₃ cell with edge `a`,
 * centred on the origin.
 */
export function generatePerovskite(n: number, a = 1): LatticeData {
  const half = (n * a) / 2
  const aPos: number[] = []
  const bPos: number[] = []
  const bondCenters: number[] = []
  const bondAxes: number[] = []
  const xMap = new Map<string, [number, number, number]>()

  for (let i = 0; i <= n; i++)
    for (let j = 0; j <= n; j++)
      for (let k = 0; k <= n; k++) aPos.push(i * a - half, j * a - half, k * a - half)

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      for (let k = 0; k < n; k++) {
        const bx = (i + 0.5) * a - half
        const by = (j + 0.5) * a - half
        const bz = (k + 0.5) * a - half
        bPos.push(bx, by, bz)
        for (const [dx, dy, dz] of DIRS) {
          const xx = bx + (dx * a) / 2
          const xy = by + (dy * a) / 2
          const xz = bz + (dz * a) / 2
          xMap.set(`${xx.toFixed(4)},${xy.toFixed(4)},${xz.toFixed(4)}`, [xx, xy, xz])
          bondCenters.push(bx + (dx * a) / 4, by + (dy * a) / 4, bz + (dz * a) / 4)
          bondAxes.push(dx !== 0 ? 0 : dy !== 0 ? 1 : 2)
        }
      }
    }
  }

  const xPos: number[] = []
  for (const [x, y, z] of xMap.values()) xPos.push(x, y, z)

  return {
    aSites: new Float32Array(aPos),
    bSites: new Float32Array(bPos),
    xSites: new Float32Array(xPos),
    bondCenters: new Float32Array(bondCenters),
    bondAxes: new Uint8Array(bondAxes),
    aCount: aPos.length / 3,
    bCount: bPos.length / 3,
    xCount: xPos.length / 3,
    bondCount: bondAxes.length,
    bondLength: a / 2,
  }
}
