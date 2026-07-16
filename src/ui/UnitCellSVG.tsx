import type { HalideVariant } from '../content/cv'

const X_FILL: Record<HalideVariant, string> = {
  Cl: '#1FF01F',
  Br: '#A62929',
  F: '#90E050',
}

/**
 * 2D projection of the cubic ABX₃ unit cell — the no-WebGL / reduced-motion
 * stand-in for the 3D lattice room (§6: never a blank page).
 * K at the corners, Sn at the body centre, X on the visible face centres.
 */
export function UnitCellSVG({ variant }: { variant: HalideVariant }) {
  const x = X_FILL[variant]
  // isometric-ish cube: front square F, back square B offset (+40, −40)
  const F = { x0: 30, y0: 70, x1: 130, y1: 170 }
  const B = { x0: 70, y0: 30, x1: 170, y1: 130 }
  const edges = [
    // front + back squares
    `M${F.x0},${F.y0} H${F.x1} V${F.y1} H${F.x0} Z`,
    `M${B.x0},${B.y0} H${B.x1} V${B.y1} H${B.x0} Z`,
    // connectors
    `M${F.x0},${F.y0} L${B.x0},${B.y0}`,
    `M${F.x1},${F.y0} L${B.x1},${B.y0}`,
    `M${F.x1},${F.y1} L${B.x1},${B.y1}`,
    `M${F.x0},${F.y1} L${B.x0},${B.y1}`,
  ]
  const corners = [
    [F.x0, F.y0], [F.x1, F.y0], [F.x1, F.y1], [F.x0, F.y1],
    [B.x0, B.y0], [B.x1, B.y0], [B.x1, B.y1], [B.x0, B.y1],
  ]
  // visible face centres: front, top, right
  const faces: Array<[number, number]> = [
    [80, 120],
    [100, 50],
    [150, 100],
  ]

  return (
    <figure className="mt-8">
      <svg viewBox="0 0 200 200" className="h-44 w-44" aria-hidden="true">
        {edges.map((d, i) => (
          <path key={i} d={d} fill="none" stroke="#5A626B" strokeWidth="1" />
        ))}
        {corners.map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r="9" fill="#8F40D4" />
        ))}
        <circle cx="100" cy="100" r="7" fill="#668080" />
        {faces.map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r="5.5" fill={x} />
        ))}
      </svg>
      <figcaption className="mt-2 font-mono text-[10px] text-mist">
        cubic ABX<sub>3</sub> unit cell — K corners · Sn centre · {variant} faces
      </figcaption>
    </figure>
  )
}
