import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useScaleStore } from '../../store/scaleStore'
import { easeInOut, isSolid, levelFade, smoothstep } from '../utils'

const LEVEL = 0
const FINGERS = 15

/**
 * Baked soft shadow. Deliberately not drei's ContactShadows: that re-renders
 * the whole scene into a depth texture every frame, and since every level
 * stays mounted (§5.5) it captures the lattice and grain field too, then
 * paints those imprints under the hero coupon.
 */
function makeShadowTexture(): THREE.CanvasTexture {
  const size = 256
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  g.addColorStop(0, 'rgba(58,64,70,0.75)')
  g.addColorStop(0.4, 'rgba(58,64,70,0.36)')
  g.addColorStop(0.75, 'rgba(58,64,70,0.08)')
  g.addColorStop(1, 'rgba(58,64,70,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)
  return new THREE.CanvasTexture(canvas)
}

/**
 * 10⁰ m — a thin-film solar cell coupon in bright, even lab light (§3).
 * Documentary, almost still. The local beat drifts it toward the device
 * stack's position and yaw so the crossfade into 10⁻³ reads as one move
 * rather than two objects sharing a frame.
 */
export function L0_Sample() {
  const groupRef = useRef<THREE.Group>(null)
  const couponRef = useRef<THREE.Group>(null)
  const shadowRef = useRef<THREE.Mesh>(null)
  const glassMat = useRef<THREE.MeshPhysicalMaterial>(null)
  const filmMat = useRef<THREE.MeshPhysicalMaterial>(null)
  const shadowMat = useRef<THREE.MeshBasicMaterial>(null)
  const fingerRef = useRef<THREE.InstancedMesh>(null)

  const dummy = useMemo(() => new THREE.Object3D(), [])
  const shadowTex = useMemo(makeShadowTexture, [])
  // one silver for busbars + fingers so the fade stays in lockstep
  const silver = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#C9CFD4',
        metalness: 0.9,
        roughness: 0.28,
        transparent: true,
      }),
    [],
  )

  useFrame((frameState, _dt) => {
    const t = frameState.clock.elapsedTime
    const smooth = useScaleStore.getState().smoothProgress
    const { opacity, local } = levelFade(smooth, LEVEL)
    const group = groupRef.current
    const coupon = couponRef.current
    if (!group || !coupon) return
    group.visible = opacity > 0.002
    if (!group.visible) return

    // lay fingers once
    if (fingerRef.current && fingerRef.current.userData.laid !== true) {
      for (let i = 0; i < FINGERS; i++) {
        dummy.position.set(-1.35 + (i * 2.7) / (FINGERS - 1), 0.047, 0)
        dummy.rotation.set(0, 0, 0)
        dummy.scale.setScalar(1)
        dummy.updateMatrix()
        fingerRef.current.setMatrixAt(i, dummy.matrix)
      }
      fingerRef.current.instanceMatrix.needsUpdate = true
      fingerRef.current.userData.laid = true
    }

    const approach = easeInOut(local)
    const scale = 1 + approach * 0.18
    // documentary stillness: a breath, not a float
    coupon.position.y = Math.sin(t * 0.45) * 0.018
    // drift left onto the device stack's mark, and settle into its yaw (0.55),
    // so the seam is a match cut instead of a collision with the copy panel
    coupon.position.x = approach * -2.3
    coupon.position.z = approach * 0.42
    coupon.rotation.y = -0.35 + Math.sin(t * 0.22) * 0.02 + approach * 0.9
    coupon.rotation.x = 0.02 + approach * 0.1
    coupon.scale.setScalar(scale)

    // depth only while this level owns the frame; during the dissolve the
    // explicit renderOrder above keeps the coupon's own parts stacked right
    const solid = isSolid(opacity)
    if (glassMat.current) glassMat.current.opacity = opacity * 0.55
    if (filmMat.current) {
      filmMat.current.opacity = opacity
      filmMat.current.depthWrite = solid
    }
    silver.opacity = opacity
    silver.depthWrite = solid

    // the shadow tracks the coupon and lifts away as the descent begins
    const shadow = shadowRef.current
    if (shadow) {
      shadow.position.x = coupon.position.x
      shadow.scale.setScalar(scale)
      if (shadowMat.current) {
        shadowMat.current.opacity = opacity * (1 - smoothstep(0.25, 0.7, local))
      }
    }
  })

  return (
    // the bench tips toward the viewer — a lab product shot, not an edge-on sliver
    <group ref={groupRef} position={[1.15, -0.1, 0]} rotation={[0.45, 0, 0]}>
      {/*
        Plain boxes, not drei's RoundedBox: RoundedBox extrudes a bevelled
        shape, and on slabs this thin (0.08 tall, 0.015 bevel) it emits
        degenerate faces that the yaw rotation turns toward the camera —
        the panel shears into a triangle mid-descent. A 0.015 radius on a
        3-unit panel is sub-pixel here, so nothing is lost.
        Draw order is explicit and the glass does not write depth: every
        material must be transparent for the crossfade, and transparent
        meshes are sorted by centroid, so any depth-writing overlap gets
        clipped along the intersection. The layers are also spaced apart.
      */}
      <group ref={couponRef}>
        {/* substrate glass — y ∈ [-0.14, -0.05], clear of the film above it */}
        <mesh position={[0, -0.095, 0]} renderOrder={0}>
          <boxGeometry args={[3.08, 0.09, 2.04]} />
          <meshPhysicalMaterial
            ref={glassMat}
            color="#D9DFE3"
            roughness={0.12}
            metalness={0}
            transparent
            opacity={0.55}
            depthWrite={false}
          />
        </mesh>
        {/* absorber film — dark, faintly glossy — y ∈ [-0.04, 0.04] */}
        <mesh renderOrder={1}>
          <boxGeometry args={[2.96, 0.08, 1.94]} />
          <meshPhysicalMaterial
            ref={filmMat}
            color="#23272D"
            roughness={0.34}
            metalness={0.22}
            clearcoat={0.6}
            clearcoatRoughness={0.3}
            transparent
          />
        </mesh>
        {/* silver contact grid: two busbars + fingers, sitting on the film */}
        <mesh position={[0, 0.047, -0.62]} material={silver} renderOrder={2}>
          <boxGeometry args={[2.9, 0.014, 0.05]} />
        </mesh>
        <mesh position={[0, 0.047, 0.62]} material={silver} renderOrder={2}>
          <boxGeometry args={[2.9, 0.014, 0.05]} />
        </mesh>
        <instancedMesh
          ref={fingerRef}
          args={[undefined, undefined, FINGERS]}
          material={silver}
          renderOrder={2}
          frustumCulled={false}
        >
          <boxGeometry args={[0.013, 0.012, 1.86]} />
        </instancedMesh>
      </group>
      <mesh ref={shadowRef} position={[0, -0.42, 0.1]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[7.4, 5.4]} />
        <meshBasicMaterial
          ref={shadowMat}
          map={shadowTex}
          transparent
          opacity={0}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </group>
  )
}
