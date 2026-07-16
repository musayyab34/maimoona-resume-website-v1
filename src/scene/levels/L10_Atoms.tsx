import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { skillGroups } from '../../content/cv'
import { useScaleStore } from '../../store/scaleStore'
import { levelFade } from '../utils'

const LEVEL = 4

/*
 * Cluster accents (§2 discipline: halide colors stay in the lattice room —
 * this field speaks potassium, tin, and neutrals only).
 */
const GROUP_COLORS = ['#B583EA', '#E8ECEF', '#8FA8A8', '#98A2AC']
/* clusters live right of the copy panel, which owns the left half */
const CENTERS = [
  new THREE.Vector3(0.7, 1.1, 0),
  new THREE.Vector3(3.0, 0.85, -0.35),
  new THREE.Vector3(0.9, -1.15, -0.15),
  new THREE.Vector3(2.8, -1.2, 0.2),
]

interface Node {
  id: string
  group: number
  base: THREE.Vector3
  color: THREE.Color
  phase: number
  speed: number
}

function buildNodes(): Node[] {
  const nodes: Node[] = []
  skillGroups.forEach((group, g) => {
    group.items.forEach((_, i) => {
      // golden-angle ring around the cluster centre, deterministic
      const angle = i * 2.399963 + g * 1.7
      const r = 0.55 + ((i * 37 + g * 11) % 5) * 0.11
      const y = Math.sin(angle * 1.3) * 0.55
      nodes.push({
        id: `${g}-${i}`,
        group: g,
        base: new THREE.Vector3(
          CENTERS[g].x + Math.cos(angle) * r,
          CENTERS[g].y + y,
          CENTERS[g].z + Math.sin(angle) * r * 0.6,
        ),
        color: new THREE.Color(GROUP_COLORS[g]),
        phase: (i * 2.7 + g * 1.3) % (Math.PI * 2),
        speed: 0.5 + ((i + g) % 4) * 0.13,
      })
    })
  })
  return nodes
}

/**
 * 10⁻¹⁰ m — full darkness; the lattice has dissolved into a field of
 * emissive nodes, one per instrument she actually uses (§3). Hovering a
 * tool name in the DOM isolates its node and dims the rest.
 */
export function L10_Atoms() {
  const nodes = useMemo(buildNodes, [])
  const groupRef = useRef<THREE.Group>(null)
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const matRef = useRef<THREE.MeshBasicMaterial>(null)
  const lineMatRef = useRef<THREE.LineBasicMaterial>(null)
  const linePositions = useMemo(() => new Float32Array(nodes.length * 6), [nodes])
  const lineGeom = useRef<THREE.BufferGeometry>(null)

  const dummy = useMemo(() => new THREE.Object3D(), [])
  const scratch = useMemo(() => new THREE.Color(), [])
  const scales = useMemo(() => new Float32Array(nodes.length).fill(1), [nodes])

  // seed instance colors before first compile so the shader includes them
  useLayoutEffect(() => {
    const mesh = meshRef.current
    if (!mesh) return
    nodes.forEach((node, i) => mesh.setColorAt(i, node.color))
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
  }, [nodes])

  useFrame((frameState, dt) => {
    const store = useScaleStore.getState()
    const { opacity } = levelFade(store.smoothProgress, LEVEL)
    const group = groupRef.current
    const mesh = meshRef.current
    if (!group || !mesh) return
    group.visible = opacity > 0.002
    if (!group.visible) return

    const t = frameState.clock.elapsedTime
    const highlighted = store.highlightedSkill
    const lerp = 1 - Math.exp(-Math.min(dt, 0.1) * 8)

    nodes.forEach((node, i) => {
      const targetScale =
        highlighted === null ? 1 : highlighted === node.id ? 1.75 : 0.7
      scales[i] += (targetScale - scales[i]) * lerp

      const dx = Math.sin(t * node.speed + node.phase) * 0.09
      const dy = Math.cos(t * node.speed * 0.8 + node.phase * 1.7) * 0.08
      const dz = Math.sin(t * node.speed * 0.6 + node.phase * 0.6) * 0.07
      dummy.position.set(node.base.x + dx, node.base.y + dy, node.base.z + dz)
      dummy.quaternion.identity()
      dummy.scale.setScalar(scales[i] * 0.1)
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)

      const dim = highlighted === null || highlighted === node.id ? 1 : 0.22
      scratch.copy(node.color).multiplyScalar(dim)
      mesh.setColorAt(i, scratch)

      linePositions[i * 6] = CENTERS[node.group].x
      linePositions[i * 6 + 1] = CENTERS[node.group].y
      linePositions[i * 6 + 2] = CENTERS[node.group].z
      linePositions[i * 6 + 3] = dummy.position.x
      linePositions[i * 6 + 4] = dummy.position.y
      linePositions[i * 6 + 5] = dummy.position.z
    })
    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
    if (lineGeom.current) {
      lineGeom.current.attributes.position.needsUpdate = true
    }

    if (matRef.current) matRef.current.opacity = opacity
    if (lineMatRef.current) {
      lineMatRef.current.opacity = opacity * (highlighted === null ? 0.14 : 0.05)
    }
  })

  return (
    <group ref={groupRef} visible={false}>
      <instancedMesh
        ref={meshRef}
        args={[undefined, undefined, nodes.length]}
        frustumCulled={false}
      >
        <sphereGeometry args={[1, 18, 18]} />
        <meshBasicMaterial ref={matRef} transparent toneMapped={false} />
      </instancedMesh>
      <lineSegments frustumCulled={false}>
        <bufferGeometry ref={lineGeom}>
          <bufferAttribute
            attach="attributes-position"
            args={[linePositions, 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial
          ref={lineMatRef}
          color="#5A626B"
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </lineSegments>
    </group>
  )
}
