import { Suspense, lazy, useEffect, useState } from 'react'
import { useSiteMode } from './hooks/useSiteMode'
import { SceneBoundary } from './scene/SceneBoundary'
import { useScaleStore } from './store/scaleStore'
import { LEVELS } from './content/levels'
import { ScaleRail } from './ui/ScaleRail'
import { Hero } from './ui/Hero'
import {
  EducationSection,
  ResearchSection,
  ResolutionSection,
  SkillsSection,
  ThesisSection,
} from './ui/DescentSections'
import { Dossier } from './ui/Dossier'
import { DescentScroll } from './scroll/DescentScroll'

// Canvas hydrates after first paint so the hero text lands fast (§6)
const Experience = lazy(() => import('./scene/Experience'))

export default function App() {
  const detectedMode = useSiteMode()
  const [sceneFailed, setSceneFailed] = useState(false)
  const mode = sceneFailed ? 'static' : detectedMode
  const setActiveLevel = useScaleStore((s) => s.setActiveLevel)

  // The rail's active entry follows whichever section crosses mid-viewport.
  useEffect(() => {
    const sections = LEVELS.map((l) => document.getElementById(l.id)).filter(
      (el): el is HTMLElement => el !== null,
    )
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          const idx = LEVELS.findIndex((l) => l.id === entry.target.id)
          if (idx >= 0) setActiveLevel(idx)
        }
      },
      { rootMargin: '-45% 0px -45%', threshold: 0 },
    )
    sections.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [setActiveLevel, mode])

  return (
    <div data-mode={mode}>
      <a
        href="#dossier"
        className="sr-only z-50 bg-graphite px-4 py-3 font-mono text-sm text-paper focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip the descent — go to the record
      </a>
      {mode === 'enhanced' && (
        <SceneBoundary onFail={() => setSceneFailed(true)}>
          <Suspense fallback={null}>
            <Experience />
          </Suspense>
          <DescentScroll />
        </SceneBoundary>
      )}
      <ScaleRail mode={mode} />
      <main className="relative z-10">
        <div id="descent">
          <Hero mode={mode} />
          <EducationSection mode={mode} />
          <ResearchSection mode={mode} />
          <ThesisSection mode={mode} />
          <SkillsSection mode={mode} />
          <ResolutionSection mode={mode} />
        </div>
        <Dossier />
      </main>
    </div>
  )
}
