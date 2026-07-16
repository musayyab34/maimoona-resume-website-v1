import { describe, expect, it } from 'vitest'
import { generatePerovskite } from './perovskite'

describe('generatePerovskite', () => {
  it('produces the correct site counts for a single cell', () => {
    const d = generatePerovskite(1)
    expect(d.aCount).toBe(8) // cube corners
    expect(d.bCount).toBe(1) // body centre
    expect(d.xCount).toBe(6) // face centres
    expect(d.bondCount).toBe(6)
  })

  it('deduplicates shared face-centre atoms when tiling', () => {
    const n = 2
    const d = generatePerovskite(n)
    expect(d.aCount).toBe((n + 1) ** 3)
    expect(d.bCount).toBe(n ** 3)
    // per orientation: (n+1) planes × n × n face centres
    expect(d.xCount).toBe(3 * n * n * (n + 1))
    expect(d.bondCount).toBe(6 * n ** 3)
    const seen = new Set<string>()
    for (let i = 0; i < d.xCount; i++) {
      const key = `${d.xSites[i * 3]},${d.xSites[i * 3 + 1]},${d.xSites[i * 3 + 2]}`
      expect(seen.has(key)).toBe(false)
      seen.add(key)
    }
  })

  it('centres the lattice on the origin', () => {
    const d = generatePerovskite(3)
    for (const sites of [d.aSites, d.bSites, d.xSites]) {
      const centroid = [0, 0, 0]
      for (let i = 0; i < sites.length; i += 3) {
        centroid[0] += sites[i]
        centroid[1] += sites[i + 1]
        centroid[2] += sites[i + 2]
      }
      const count = sites.length / 3
      expect(Math.abs(centroid[0] / count)).toBeLessThan(1e-6)
      expect(Math.abs(centroid[1] / count)).toBeLessThan(1e-6)
      expect(Math.abs(centroid[2] / count)).toBeLessThan(1e-6)
    }
  })

  it('places every B–X bond at half the octahedron arm', () => {
    const a = 1
    const d = generatePerovskite(2, a)
    for (let b = 0; b < d.bCount; b++) {
      for (let arm = 0; arm < 6; arm++) {
        const bondIdx = b * 6 + arm
        const dx = d.bondCenters[bondIdx * 3] - d.bSites[b * 3]
        const dy = d.bondCenters[bondIdx * 3 + 1] - d.bSites[b * 3 + 1]
        const dz = d.bondCenters[bondIdx * 3 + 2] - d.bSites[b * 3 + 2]
        const dist = Math.hypot(dx, dy, dz)
        expect(dist).toBeCloseTo(a / 4, 6)
      }
    }
  })
})
