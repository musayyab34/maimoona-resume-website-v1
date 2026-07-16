import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import type { ReactNode } from 'react'
import { useScaleStore } from '../store/scaleStore'
import { darknessAt, sampleBackground } from './palette'

/**
 * Owner of the descent choreography (§5.3): one place converts scroll
 * progress into background color, fog, light level, and camera micro-motion.
 * Level scenes read the smoothed progress it publishes to the store.
 */
export function ScaleRig({ children }: { children: ReactNode }) {
  const scene = useThree((s) => s.scene)
  const camera = useThree((s) => s.camera)

  const bg = useMemo(() => new THREE.Color('#F4F6F7'), [])
  const fog = useMemo(() => new THREE.FogExp2('#F4F6F7', 0.012), [])
  const hemiRef = useRef<THREE.HemisphereLight>(null)
  const keyRef = useRef<THREE.DirectionalLight>(null)
  const fillRef = useRef<THREE.DirectionalLight>(null)
  const pointer = useRef({ x: 0, y: 0 })

  useEffect(() => {
    scene.background = bg
    scene.fog = fog
    return () => {
      scene.background = null
      scene.fog = null
    }
  }, [scene, bg, fog])

  // The canvas sits behind the DOM and receives no events — track the
  // pointer at the window for the parallax drift instead.
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  useFrame((_, dt) => {
    const state = useScaleStore.getState()
    // real dt (capped, not clamped low) so convergence is framerate-independent
    const k = 1 - Math.exp(-Math.min(dt, 0.5) * 9)
    let smooth = state.smoothProgress + (state.progress - state.smoothProgress) * k
    if (Math.abs(smooth - state.progress) < 0.0004) smooth = state.progress
    if (smooth !== state.smoothProgress) useScaleStore.setState({ smoothProgress: smooth })

    sampleBackground(smooth, bg)
    fog.color.copy(bg)
    const d = darknessAt(smooth)
    fog.density = 0.012 + d * 0.045

    const light = 1 - d
    if (hemiRef.current) hemiRef.current.intensity = 0.15 + light * 1.1
    if (keyRef.current) keyRef.current.intensity = 0.06 + light * 2.4
    if (fillRef.current) fillRef.current.intensity = 0.03 + light * 0.7

    // camera stays put; the world approaches (§5). Only a whisper of parallax.
    camera.position.x += (pointer.current.x * 0.16 - camera.position.x) * 0.035
    camera.position.y += (-pointer.current.y * 0.11 - camera.position.y) * 0.035
    camera.lookAt(0, 0, 0)
  })

  return (
    <>
      <hemisphereLight ref={hemiRef} args={['#FFFFFF', '#B7BEC5', 1.2]} />
      <directionalLight ref={keyRef} position={[4, 7, 5]} intensity={2.4} color="#FFFFFF" />
      <directionalLight ref={fillRef} position={[-5, -2, 4]} intensity={0.7} color="#DCE4EA" />
      {children}
    </>
  )
}
