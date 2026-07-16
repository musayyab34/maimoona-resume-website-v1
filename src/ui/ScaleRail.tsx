import { useEffect, useRef } from 'react'
import { RAIL_LEVELS, exponentAt } from '../content/levels'
import { useScaleStore } from '../store/scaleStore'
import type { SiteMode } from '../store/scaleStore'
import { scrollToSection } from '../scroll/lenisSingleton'
import { ScalePower } from './LevelSection'

/**
 * The persistent scale indicator — the site's actual table of contents (§1).
 * A thin fixed rail on the left edge tracking 10⁰ → 10⁻¹⁰.
 */
export function ScaleRail({ mode }: { mode: SiteMode }) {
  const activeLevel = useScaleStore((s) => s.activeLevel)
  const fillRef = useRef<HTMLDivElement>(null)
  const readoutRef = useRef<HTMLSpanElement>(null)
  // rail sits over the darkening canvas; flip its palette once the descent dims
  const dark = activeLevel >= 2

  useEffect(() => {
    if (mode !== 'enhanced') return
    let raf = 0
    const tick = () => {
      const p = useScaleStore.getState().smoothProgress
      if (fillRef.current) fillRef.current.style.transform = `scaleY(${p})`
      if (readoutRef.current) {
        const e = exponentAt(p)
        const rounded = Math.abs(e) < 0.05 ? '0' : `−${Math.abs(e).toFixed(1)}`
        readoutRef.current.innerHTML = `10<sup>${rounded}</sup>&thinsp;m`
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [mode])

  return (
    <nav
      aria-label="Scale"
      className="fixed top-1/2 left-3 z-40 -translate-y-1/2 sm:left-6"
    >
      <div className="flex items-stretch gap-3">
        <div
          aria-hidden="true"
          className={`relative w-px ${dark ? 'bg-paper/20' : 'bg-graphite/20'}`}
        >
          <div
            ref={fillRef}
            className={`absolute inset-x-0 top-0 h-full origin-top ${
              dark ? 'bg-potassium-ink' : 'bg-potassium'
            }`}
            style={{ transform: `scaleY(${mode === 'static' ? activeLevel / 4 : 0})` }}
          />
        </div>
        <ol className="flex flex-col gap-5">
          {RAIL_LEVELS.map((level, i) => {
            const isActive = activeLevel === i || (i === 4 && activeLevel === 5)
            return (
              <li key={level.id}>
                <button
                  type="button"
                  onClick={() => scrollToSection(level.id, mode === 'static')}
                  aria-current={isActive ? 'true' : undefined}
                  className={`block cursor-pointer font-mono text-[11px] leading-none transition-colors duration-300 sm:text-xs ${
                    isActive
                      ? dark
                        ? 'text-potassium-ink'
                        : 'text-potassium'
                      : dark
                        ? 'text-mist/70 hover:text-paper'
                        : 'text-slate/80 hover:text-graphite'
                  }`}
                >
                  <ScalePower exponent={level.exponent as number} />
                  <span className="sr-only"> m — {level.name}</span>
                </button>
              </li>
            )
          })}
        </ol>
      </div>
      {mode === 'enhanced' && (
        <span
          ref={readoutRef}
          aria-hidden="true"
          className={`mt-5 block pl-4 font-mono text-[10px] transition-colors duration-300 ${
            dark ? 'text-mist/60' : 'text-slate/70'
          }`}
        />
      )}
    </nav>
  )
}
