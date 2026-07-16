import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Bloom, EffectComposer, ToneMapping, Vignette } from '@react-three/postprocessing'
import { ToneMappingMode } from 'postprocessing'
import type { BloomEffect, VignetteEffect } from 'postprocessing'
import { useScaleStore } from '../store/scaleStore'
import { darknessAt } from './palette'

/**
 * Bloom intensity rides the scroll timeline (§4 of the stack notes): near
 * zero in the conventionally lit lab, real work at 10⁻¹⁰ where matter is
 * the only light source.
 */
export function Post() {
  const bloomRef = useRef<BloomEffect>(null)
  const vignetteRef = useRef<VignetteEffect>(null)

  useFrame(() => {
    const d = darknessAt(useScaleStore.getState().smoothProgress)
    if (bloomRef.current) bloomRef.current.intensity = d * d * 1.15
    if (vignetteRef.current) vignetteRef.current.darkness = 0.2 + d * 0.38
  })

  // Callback refs, deliberately: @react-three/postprocessing memoizes effect
  // props via JSON.stringify, and in React 19 `ref` is a plain prop — an
  // object ref holding the live effect is circular and crashes the memo.
  // Functions are skipped by JSON.stringify, so callback refs are safe.
  const setBloom = (e: BloomEffect | null) => {
    bloomRef.current = e
  }
  const setVignette = (e: VignetteEffect | null) => {
    vignetteRef.current = e
  }

  return (
    <EffectComposer multisampling={0}>
      <Bloom
        ref={setBloom}
        mipmapBlur
        intensity={0}
        luminanceThreshold={0.22}
        luminanceSmoothing={0.3}
      />
      <Vignette ref={setVignette} eskil={false} offset={0.18} darkness={0.2} />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
    </EffectComposer>
  )
}
