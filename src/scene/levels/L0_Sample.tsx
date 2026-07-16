import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { ContactShadows, RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import { useScaleStore } from '../../store/scaleStore'
import { easeInOut, levelFade } from '../utils'

const LEVEL = 0
const FINGERS = 15

/**
 * 10⁰ m — a thin-film solar cell coupon in bright, even lab light (§3).
 * Documentary, almost still. The local beat tilts it toward top-down and
 * closes in, so the seam into the layer stack reads as crossing the surface.
 */
export function L0_Sample() {
  const groupRef = useRef<THREE.Group>(null)
  const couponRef = useRef<THREE.Group>(null)
  const shadowRef = useRef<THREE.Group>(null)
  const glassMat = useRef<THREE.MeshPhysicalMaterial>(null)
  const filmMat = useRef<THREE.MeshPhysicalMaterial>(null)
  const fingerRef = useRef<THREE.InstancedMesh>(null)

  const dummy = useMemo(() => new THREE.Object3D(), [])
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
    // documentary stillness: a breath, not a float
    coupon.position.y = Math.sin(t * 0.45) * 0.018
    coupon.rotation.y = -0.35 + Math.sin(t * 0.22) * 0.02 + approach * 0.18
    coupon.rotation.x = 0.02 + approach * 0.85 // tilt toward top-down
    const scale = 1 + approach * 1.7
    coupon.scale.setScalar(scale)
    coupon.position.z = approach * 1.6 // and closer

    if (glassMat.current) glassMat.current.opacity = opacity * 0.55
    if (filmMat.current) filmMat.current.opacity = opacity
    silver.opacity = opacity
    if (shadowRef.current) shadowRef.current.visible = opacity > 0.55 && local < 0.5
  })

  return (
    // the bench tips toward the viewer — a lab product shot, not an edge-on sliver
    <group ref={groupRef} position={[1.15, -0.1, 0]} rotation={[0.45, 0, 0]}>
      <group ref={couponRef}>
        {/* substrate glass */}
        <RoundedBox args={[3.08, 0.09, 2.04]} radius={0.02} position={[0, -0.075, 0]}>
          <meshPhysicalMaterial
            ref={glassMat}
            color="#D9DFE3"
            roughness={0.12}
            metalness={0}
            transparent
            opacity={0.55}
          />
        </RoundedBox>
        {/* absorber film — dark, faintly glossy */}
        <RoundedBox args={[2.96, 0.08, 1.94]} radius={0.015}>
          <meshPhysicalMaterial
            ref={filmMat}
            color="#23272D"
            roughness={0.34}
            metalness={0.22}
            clearcoat={0.6}
            clearcoatRoughness={0.3}
            transparent
          />
        </RoundedBox>
        {/* silver contact grid: two busbars + fingers */}
        <mesh position={[0, 0.047, -0.62]} material={silver}>
          <boxGeometry args={[2.9, 0.014, 0.05]} />
        </mesh>
        <mesh position={[0, 0.047, 0.62]} material={silver}>
          <boxGeometry args={[2.9, 0.014, 0.05]} />
        </mesh>
        <instancedMesh
          ref={fingerRef}
          args={[undefined, undefined, FINGERS]}
          material={silver}
          frustumCulled={false}
        >
          <boxGeometry args={[0.013, 0.012, 1.86]} />
        </instancedMesh>
      </group>
      <group ref={shadowRef}>
        <ContactShadows
          position={[0, -0.6, 0]}
          opacity={0.36}
          scale={9}
          blur={2.6}
          far={2.4}
          resolution={256}
          color="#3B4147"
        />
      </group>
    </group>
  )
}
