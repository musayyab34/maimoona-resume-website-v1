import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { identity } from '../../content/cv'
import { useScaleStore } from '../../store/scaleStore'
import { easeInOut, levelFade, smoothstep } from '../utils'

const LEVEL = 5
const COUNT = 1500
const WORLD_WIDTH = 6.6

function hash(i: number, salt: number): number {
  const s = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453
  return s - Math.floor(s)
}

/**
 * Resolution (§3): the atoms converge into her name. Targets are sampled
 * from 2D canvas text once the display face has loaded; until then the
 * particles stay a scattered field.
 */
export function NameAssembly() {
  const pointsRef = useRef<THREE.Points>(null)
  const matRef = useRef<THREE.PointsMaterial>(null)
  const targets = useRef<Float32Array | null>(null)

  const scatter = useMemo(() => {
    const out = new Float32Array(COUNT * 3)
    for (let i = 0; i < COUNT; i++) {
      const theta = hash(i, 3) * Math.PI * 2
      const phi = Math.acos(2 * hash(i, 5) - 1)
      const r = 2 + hash(i, 9) * 3.4
      out[i * 3] = Math.sin(phi) * Math.cos(theta) * r
      out[i * 3 + 1] = Math.sin(phi) * Math.sin(theta) * r * 0.6
      out[i * 3 + 2] = Math.cos(phi) * r * 0.5
    }
    return out
  }, [])

  const positions = useMemo(() => scatter.slice(), [scatter])

  useEffect(() => {
    let cancelled = false
    const sample = () => {
      const canvas = document.createElement('canvas')
      canvas.width = 1000
      canvas.height = 200
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.fillStyle = '#fff'
      let size = 110
      ctx.font = `700 ${size}px Zodiak, Georgia, serif`
      const width = ctx.measureText(identity.name).width
      if (width > 920) {
        size = Math.floor((size * 920) / width)
        ctx.font = `700 ${size}px Zodiak, Georgia, serif`
      }
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(identity.name, canvas.width / 2, canvas.height / 2)
      const img = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const pts: number[] = []
      const step = 3
      for (let y = 0; y < canvas.height; y += step) {
        for (let x = 0; x < canvas.width; x += step) {
          if (img.data[(y * canvas.width + x) * 4 + 3] > 128) {
            pts.push(x, y)
          }
        }
      }
      if (pts.length < 2 || cancelled) return
      const out = new Float32Array(COUNT * 3)
      const total = pts.length / 2
      for (let i = 0; i < COUNT; i++) {
        const src = Math.floor((i / COUNT) * total) % total
        const px = pts[src * 2]
        const py = pts[src * 2 + 1]
        out[i * 3] = ((px - canvas.width / 2) / canvas.width) * WORLD_WIDTH
        out[i * 3 + 1] =
          (-(py - canvas.height / 2) / canvas.width) * WORLD_WIDTH + 0.55
        out[i * 3 + 2] = (hash(i, 21) - 0.5) * 0.12
      }
      targets.current = out
    }
    if (document.fonts?.ready) {
      document.fonts.ready.then(() => sample())
    } else {
      sample()
    }
    return () => {
      cancelled = true
    }
  }, [])

  useFrame((frameState) => {
    const smooth = useScaleStore.getState().smoothProgress
    const { opacity, local } = levelFade(smooth, LEVEL)
    const points = pointsRef.current
    if (!points) return
    points.visible = opacity > 0.002
    if (!points.visible) return

    const t = frameState.clock.elapsedTime
    const geo = points.geometry
    const attr = geo.attributes.position as THREE.BufferAttribute
    const arr = attr.array as Float32Array
    const gather = easeInOut(smoothstep(0.06, 0.62, local))
    const tgt = targets.current

    for (let i = 0; i < COUNT; i++) {
      const shimmer = Math.sin(t * 1.4 + i * 0.7) * 0.008
      const tx = tgt ? tgt[i * 3] : scatter[i * 3]
      const ty = tgt ? tgt[i * 3 + 1] : scatter[i * 3 + 1]
      const tz = tgt ? tgt[i * 3 + 2] : scatter[i * 3 + 2]
      arr[i * 3] = scatter[i * 3] + (tx - scatter[i * 3]) * gather
      arr[i * 3 + 1] = scatter[i * 3 + 1] + (ty - scatter[i * 3 + 1]) * gather + shimmer
      arr[i * 3 + 2] = scatter[i * 3 + 2] + (tz - scatter[i * 3 + 2]) * gather
    }
    attr.needsUpdate = true

    if (matRef.current) matRef.current.opacity = opacity * (0.35 + gather * 0.65)
  })

  return (
    <points ref={pointsRef} visible={false} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        ref={matRef}
        color="#EDE4F9"
        size={0.032}
        sizeAttenuation
        transparent
        opacity={0}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </points>
  )
}
