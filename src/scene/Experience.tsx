import { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { PerformanceMonitor } from '@react-three/drei'
import { useScaleStore } from '../store/scaleStore'
import { ScaleRig } from './ScaleRig'
import { Post } from './Post'
import { L0_Sample } from './levels/L0_Sample'
import { L3_DeviceStack } from './levels/L3_DeviceStack'
import { L6_Grains } from './levels/L6_Grains'
import { L9_Lattice } from './levels/L9_Lattice'
import { L10_Atoms } from './levels/L10_Atoms'
import { NameAssembly } from './levels/NameAssembly'

/**
 * The persistent full-viewport canvas behind the scrolling DOM (§5.1).
 * All five levels stay mounted; crossfades are opacity, never unmounts
 * (§5.5). PerformanceMonitor sheds DPR first, postprocessing second (§6).
 */
export default function Experience() {
  const descentActive = useScaleStore((s) => s.descentActive)
  const setQuality = useScaleStore((s) => s.setQuality)
  const [dpr, setDpr] = useState<number | [number, number]>([1, 1.75])
  const [postOn, setPostOn] = useState(true)

  return (
    <div className="pointer-events-none fixed inset-0 z-0" aria-hidden="true">
      <Canvas
        camera={{ fov: 36, position: [0, 0, 8], near: 0.1, far: 60 }}
        dpr={dpr}
        frameloop={descentActive ? 'always' : 'never'}
        gl={{ antialias: true, powerPreference: 'high-performance', stencil: false }}
      >
        <PerformanceMonitor
          onDecline={() => {
            setDpr(1)
            setQuality('medium')
          }}
          onIncline={() => {
            setDpr([1, 1.75])
            setQuality('high')
          }}
          flipflops={3}
          onFallback={() => {
            setDpr(1)
            setPostOn(false)
            setQuality('low')
          }}
        >
          <ScaleRig>
            <L0_Sample />
            <L3_DeviceStack />
            <L6_Grains />
            <L9_Lattice />
            <L10_Atoms />
            <NameAssembly />
          </ScaleRig>
          {postOn && <Post />}
        </PerformanceMonitor>
      </Canvas>
    </div>
  )
}
