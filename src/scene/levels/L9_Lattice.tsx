import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useScaleStore } from '../../store/scaleStore'
import { ELEMENTS } from '../lattice/elements'
import { generatePerovskite } from '../lattice/perovskite'
import { darknessAt } from '../palette'
import { easeInOut, levelFade, smoothstep } from '../utils'

const LEVEL = 3
const N = 3
const SCATTER = 5.2

/** deterministic per-instance random, stable across frames */
function hash(i: number, salt: number): number {
  const s = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453
  return s - Math.floor(s)
}

function makeScatter(count: number, salt: number): Float32Array {
  const out = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    const theta = hash(i, salt) * Math.PI * 2
    const phi = Math.acos(2 * hash(i, salt + 1) - 1)
    const r = 0.55 + hash(i, salt + 2) * 0.45
    out[i * 3] = Math.sin(phi) * Math.cos(theta) * r
    out[i * 3 + 1] = Math.sin(phi) * Math.sin(theta) * r
    out[i * 3 + 2] = Math.cos(phi) * r
  }
  return out
}

const AXIS_QUATS = [
  new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, Math.PI / 2)), // x
  new THREE.Quaternion(), // y — cylinder rest axis
  new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI / 2, 0, 0)), // z
]

/**
 * 10⁻⁹ m — the centerpiece (§3): the KSnX₃ lattice, generated from the
 * cubic ABX₃ prototype. The halide swap changes only the X site — color,
 * radius, and the light inside the crystal. The geometry never changes;
 * that constancy is the thesis.
 */
export function L9_Lattice() {
  const data = useMemo(() => generatePerovskite(N), [])
  const scatterA = useMemo(() => makeScatter(data.aCount, 1), [data])
  const scatterB = useMemo(() => makeScatter(data.bCount, 7), [data])
  const scatterX = useMemo(() => makeScatter(data.xCount, 13), [data])

  const groupRef = useRef<THREE.Group>(null)
  const kRef = useRef<THREE.InstancedMesh>(null)
  const snRef = useRef<THREE.InstancedMesh>(null)
  const xRef = useRef<THREE.InstancedMesh>(null)
  const bondRef = useRef<THREE.InstancedMesh>(null)
  const kMat = useRef<THREE.MeshStandardMaterial>(null)
  const snMat = useRef<THREE.MeshStandardMaterial>(null)
  const xMat = useRef<THREE.MeshStandardMaterial>(null)
  const bondMat = useRef<THREE.MeshStandardMaterial>(null)
  const lightRef = useRef<THREE.PointLight>(null)

  const dummy = useMemo(() => new THREE.Object3D(), [])
  const targetColor = useMemo(() => new THREE.Color(ELEMENTS.Cl.color), [])
  const state = useRef({ s: -1, xScale: 1 })

  const writeAtoms = (
    mesh: THREE.InstancedMesh | null,
    sites: Float32Array,
    count: number,
    scatter: Float32Array,
    s: number,
    scale: number,
  ) => {
    if (!mesh) return
    for (let i = 0; i < count; i++) {
      dummy.position.set(
        sites[i * 3] + scatter[i * 3] * s * SCATTER,
        sites[i * 3 + 1] + scatter[i * 3 + 1] * s * SCATTER,
        sites[i * 3 + 2] + scatter[i * 3 + 2] * s * SCATTER,
      )
      dummy.quaternion.identity()
      dummy.scale.setScalar(scale)
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
    }
    mesh.instanceMatrix.needsUpdate = true
  }

  useLayoutEffect(() => {
    for (const ref of [kRef, snRef, xRef]) {
      ref.current?.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
    }
    // bonds hold their assembled positions; they only fade
    if (bondRef.current) {
      for (let i = 0; i < data.bondCount; i++) {
        dummy.position.set(
          data.bondCenters[i * 3],
          data.bondCenters[i * 3 + 1],
          data.bondCenters[i * 3 + 2],
        )
        dummy.quaternion.copy(AXIS_QUATS[data.bondAxes[i]])
        dummy.scale.setScalar(1)
        dummy.updateMatrix()
        bondRef.current.setMatrixAt(i, dummy.matrix)
      }
      bondRef.current.instanceMatrix.needsUpdate = true
    }
    writeAtoms(kRef.current, data.aSites, data.aCount, scatterA, 1, 1)
    writeAtoms(snRef.current, data.bSites, data.bCount, scatterB, 1, 1)
    writeAtoms(xRef.current, data.xSites, data.xCount, scatterX, 1, 1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

  useFrame((_, dt) => {
    const store = useScaleStore.getState()
    const smooth = store.smoothProgress
    const { opacity, local } = levelFade(smooth, LEVEL)
    const group = groupRef.current
    if (!group) return
    group.visible = opacity > 0.002
    if (!group.visible) return

    group.rotation.y += dt * 0.07
    group.rotation.x = -0.14 + local * 0.12
    // a discrete crystal with space around it; the dive happens only at the end
    const dive = smoothstep(0.85, 1, local)
    const zoom = 0.55 + easeInOut(local) * 0.35 + dive * 1.3
    group.scale.setScalar(zoom)
    group.position.x = -0.9 * (1 - dive) // recentre as we fly in

    // assembly beat: scattered atoms condense onto their sites (§5.4)
    const s = 1 - smoothstep(0.02, 0.3, local)
    const targetXScale = ELEMENTS[store.variant].radius / ELEMENTS.Cl.radius
    const colorLerp = 1 - Math.exp(-Math.min(dt, 0.1) * 5)
    const xScale = state.current.xScale + (targetXScale - state.current.xScale) * colorLerp
    if (Math.abs(s - state.current.s) > 0.0005 || Math.abs(xScale - state.current.xScale) > 0.0005) {
      writeAtoms(kRef.current, data.aSites, data.aCount, scatterA, s, 1)
      writeAtoms(snRef.current, data.bSites, data.bCount, scatterB, s, 1)
      writeAtoms(xRef.current, data.xSites, data.xCount, scatterX, s, xScale)
      state.current.s = s
      state.current.xScale = xScale
    }

    // halide swap: color, emissive, and the light inside the crystal
    targetColor.set(ELEMENTS[store.variant].color)
    if (xMat.current) {
      xMat.current.color.lerp(targetColor, colorLerp)
      xMat.current.emissive.copy(xMat.current.color)
    }

    const d = darknessAt(smooth)
    if (xMat.current) xMat.current.emissiveIntensity = d * 1.1
    if (kMat.current) kMat.current.emissiveIntensity = d * 0.45
    if (snMat.current) snMat.current.emissiveIntensity = d * 0.3
    if (bondMat.current) bondMat.current.emissiveIntensity = d * 0.15

    const bondsIn = 1 - smoothstep(0.05, 0.3, s)
    if (kMat.current) kMat.current.opacity = opacity
    if (snMat.current) snMat.current.opacity = opacity
    if (xMat.current) xMat.current.opacity = opacity
    if (bondMat.current) bondMat.current.opacity = opacity * 0.9 * bondsIn

    if (lightRef.current) {
      lightRef.current.color.copy(targetColor)
      lightRef.current.intensity = d * opacity * 1.8
    }
  })

  return (
    <group ref={groupRef} visible={false}>
      <instancedMesh ref={kRef} args={[undefined, undefined, data.aCount]} frustumCulled={false}>
        <sphereGeometry args={[ELEMENTS.K.radius, 24, 24]} />
        <meshStandardMaterial
          ref={kMat}
          color={ELEMENTS.K.color}
          emissive={ELEMENTS.K.color}
          emissiveIntensity={0}
          roughness={0.35}
          metalness={0.05}
          transparent
        />
      </instancedMesh>
      <instancedMesh ref={snRef} args={[undefined, undefined, data.bCount]} frustumCulled={false}>
        <sphereGeometry args={[ELEMENTS.Sn.radius, 24, 24]} />
        <meshStandardMaterial
          ref={snMat}
          color={ELEMENTS.Sn.color}
          emissive={ELEMENTS.Sn.color}
          emissiveIntensity={0}
          roughness={0.3}
          metalness={0.4}
          transparent
        />
      </instancedMesh>
      <instancedMesh ref={xRef} args={[undefined, undefined, data.xCount]} frustumCulled={false}>
        <sphereGeometry args={[ELEMENTS.Cl.radius, 22, 22]} />
        <meshStandardMaterial
          ref={xMat}
          color={ELEMENTS.Cl.color}
          emissive={ELEMENTS.Cl.color}
          emissiveIntensity={0}
          roughness={0.4}
          metalness={0.05}
          transparent
        />
      </instancedMesh>
      <instancedMesh
        ref={bondRef}
        args={[undefined, undefined, data.bondCount]}
        frustumCulled={false}
      >
        <cylinderGeometry args={[0.032, 0.032, data.bondLength, 10]} />
        <meshStandardMaterial
          ref={bondMat}
          color="#454D55"
          emissive="#454D55"
          emissiveIntensity={0}
          roughness={0.55}
          metalness={0.2}
          transparent
        />
      </instancedMesh>
      <pointLight ref={lightRef} intensity={0} distance={10} decay={1.7} />
    </group>
  )
}
