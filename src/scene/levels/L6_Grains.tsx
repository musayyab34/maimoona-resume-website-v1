import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useScaleStore } from '../../store/scaleStore'
import { darknessAt } from '../palette'
import { levelFade, smoothstep } from '../utils'

const LEVEL = 2

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

/*
 * Procedural Voronoi grains in the SEM register (§3): grayscale grain
 * population, boundaries deepening as the beat progresses, a whisper of
 * potassium in the boundaries once the light has dropped.
 */
const fragmentShader = /* glsl */ `
  varying vec2 vUv;
  uniform float uTime;
  uniform float uSeparation;
  uniform float uLight;
  uniform float uGlow;
  uniform float uOpacity;

  vec2 hash2(vec2 p) {
    p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
    return fract(sin(p) * 43758.5453);
  }

  float hash1(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
  }

  void main() {
    vec2 uv = vUv * vec2(13.0, 8.5);
    vec2 n = floor(uv);
    vec2 f = fract(uv);

    float F1 = 8.0;
    float F2 = 8.0;
    vec2 id = vec2(0.0);
    // branchless F1/F2 tracking — dynamic if/else state in loops miscompiles
    // on some weak GPU / software rasterizer stacks
    for (int j = -1; j <= 1; j++) {
      for (int i = -1; i <= 1; i++) {
        vec2 g = vec2(float(i), float(j));
        vec2 o = hash2(n + g);
        o = 0.5 + 0.34 * sin(uTime * 0.12 + 6.2831 * o);
        float d = length(g + o - f);
        float take1 = step(d, F1);
        F2 = mix(min(F2, d), F1, take1);
        id = mix(id, n + g, take1);
        F1 = min(F1, d);
      }
    }

    float edge = F2 - F1;
    float grain = mix(0.22, 0.85, hash1(id));             // per-grain gray
    float dome = 1.0 - F1 * 0.6;                          // interior shading
    float border = smoothstep(0.05 + uSeparation * 0.09, 0.0, edge);

    float v = grain * dome;
    v = mix(v, 0.015, border * (0.55 + 0.45 * uSeparation));
    vec3 col = vec3(v) * mix(0.22, 1.0, uLight);

    // matter starting to light itself: faint potassium in the boundaries
    col += vec3(0.42, 0.19, 0.66) * border * uGlow * 0.22;

    // fine SEM noise
    col += (hash1(vUv * 913.37) - 0.5) * 0.045;

    gl_FragColor = vec4(col, uOpacity);
  }
`

/** 10⁻⁶ m — the film resolves into polycrystalline grains (§3). */
export function L6_Grains() {
  const meshRef = useRef<THREE.Mesh>(null)
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSeparation: { value: 0 },
      uLight: { value: 1 },
      uGlow: { value: 0 },
      uOpacity: { value: 0 },
    }),
    [],
  )

  // Construct the material imperatively: passing `uniforms` as a JSX prop
  // lets the renderer re-wrap them, and per-frame mutations of this object
  // would never reach the GPU.
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms,
        transparent: true,
        depthWrite: false,
      }),
    [uniforms],
  )

  useFrame((_, dt) => {
    const smooth = useScaleStore.getState().smoothProgress
    const { opacity, local } = levelFade(smooth, LEVEL)
    const mesh = meshRef.current
    if (!mesh) return
    mesh.visible = opacity > 0.002
    if (!mesh.visible) return

    const d = darknessAt(smooth)
    uniforms.uTime.value += dt
    uniforms.uSeparation.value = smoothstep(0.15, 0.8, local)
    uniforms.uLight.value = 1 - d
    uniforms.uGlow.value = d
    uniforms.uOpacity.value = opacity

    // slow drift toward the camera — the grains keep growing in view
    mesh.scale.setScalar(1 + local * 0.5)
  })

  return (
    <mesh
      ref={meshRef}
      visible={false}
      position={[0, 0, 0.6]}
      rotation={[-0.06, 0.04, 0]}
      material={material}
    >
      <planeGeometry args={[11.5, 7.2]} />
    </mesh>
  )
}
