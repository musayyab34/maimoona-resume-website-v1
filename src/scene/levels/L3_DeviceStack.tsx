import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useScaleStore } from '../../store/scaleStore'
import { easeInOut, isSolid, levelFade, smoothstep } from '../utils'

const LEVEL = 1
const W = 3.4
const D = 2.3

/*
 * The real structure of the device her thesis was about (§3): the layers
 * separate on scroll, each carrying part of the academic record in the DOM.
 * Bottom-up, following thin-film convention.
 */
const LAYERS = [
  { h: 0.15, color: '#9AA1A7', metalness: 0.85, roughness: 0.3, opacity: 1 }, // metal back contact
  { h: 0.08, color: '#4A5158', metalness: 0.1, roughness: 0.6, opacity: 1 }, // hole transport
  { h: 0.2, color: '#5C4580', metalness: 0.15, roughness: 0.35, opacity: 1 }, // perovskite absorber
  { h: 0.08, color: '#668080', metalness: 0.3, roughness: 0.5, opacity: 1 }, // electron transport
  { h: 0.06, color: '#AEBBBB', metalness: 0.2, roughness: 0.2, opacity: 0.8 }, // transparent contact
  { h: 0.11, color: '#D9E0E4', metalness: 0, roughness: 0.12, opacity: 0.5 }, // glass substrate
]

export function L3_DeviceStack() {
  const groupRef = useRef<THREE.Group>(null)
  const meshRefs = useRef<Array<THREE.Mesh | null>>([])
  const materials = useMemo(
    () =>
      LAYERS.map(
        (layer) =>
          new THREE.MeshStandardMaterial({
            color: layer.color,
            metalness: layer.metalness,
            roughness: layer.roughness,
            transparent: true,
            opacity: 0,
          }),
      ),
    [],
  )

  useFrame((_, dt) => {
    const smooth = useScaleStore.getState().smoothProgress
    const { opacity, local } = levelFade(smooth, LEVEL)
    const group = groupRef.current
    if (!group) return
    group.visible = opacity > 0.002
    if (!group.visible) return

    group.rotation.y += dt * 0.05
    const scale = 0.95 + easeInOut(local) * 0.45
    group.scale.setScalar(scale)

    // the beat: layers separate through the middle of the window
    const gap = easeInOut(smoothstep(0.12, 0.72, local)) * 0.4
    const totalH =
      LAYERS.reduce((acc, l) => acc + l.h, 0) + gap * (LAYERS.length - 1)
    let cursor = -totalH / 2
    // Depth only while this level owns the frame. While it dissolves in over
    // the 10⁰ coupon, a depth-writing layer at 3% opacity would shear the
    // coupon along its silhouette; renderOrder (bottom-up = back-to-front
    // from this camera) keeps the layers themselves stacked correctly.
    const solid = isSolid(opacity)
    LAYERS.forEach((layer, i) => {
      const mesh = meshRefs.current[i]
      if (mesh) mesh.position.y = cursor + layer.h / 2
      cursor += layer.h + gap
      materials[i].opacity = opacity * layer.opacity
      materials[i].depthWrite = solid && layer.opacity > 0.99
    })
  })

  return (
    <group ref={groupRef} visible={false} position={[-1.5, 0.1, 0]} rotation={[0.42, 0.55, 0]}>
      {LAYERS.map((layer, i) => (
        <mesh
          key={i}
          ref={(el) => {
            meshRefs.current[i] = el
          }}
          material={materials[i]}
          renderOrder={i}
        >
          <boxGeometry args={[W, layer.h, D]} />
        </mesh>
      ))}
    </group>
  )
}
