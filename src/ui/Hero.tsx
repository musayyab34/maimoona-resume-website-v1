import { identity } from '../content/cv'
import { LEVELS } from '../content/levels'
import type { SiteMode } from '../store/scaleStore'
import { LevelSection } from './LevelSection'

/** 10⁰ m — the researcher. Bright, cool, documentary (§3). */
export function Hero({ mode }: { mode: SiteMode }) {
  return (
    <LevelSection level={LEVELS[0]} mode={mode} theme="light" align="left">
      <div className="relative">
        <p className="hero-rise font-mono text-[11px] tracking-[0.22em] text-slate uppercase">
          {identity.role} · {identity.location}
        </p>
        <h1
          id="l0-heading"
          className="hero-rise font-display mt-5 text-5xl leading-[1.02] font-normal tracking-tight text-balance sm:text-6xl lg:text-7xl"
        >
          {identity.name}
        </h1>
        <p className="hero-rise-2 mt-6 max-w-md text-lg leading-relaxed text-ink sm:text-xl">
          {identity.tagline}
        </p>
        <p className="hero-rise-3 mt-8 font-mono text-xs leading-relaxed text-slate">
          {identity.position}
        </p>
        <div className="hero-rise-3 mt-10 flex gap-6 font-mono text-xs">
          <a
            href={`mailto:${identity.email}`}
            className="text-slate underline decoration-graphite/25 underline-offset-4 transition-colors hover:text-potassium"
          >
            email
          </a>
          <a
            href={identity.linkedin}
            target="_blank"
            rel="noreferrer"
            className="text-slate underline decoration-graphite/25 underline-offset-4 transition-colors hover:text-potassium"
          >
            linkedin
          </a>
          <a
            href="#dossier"
            className="text-slate underline decoration-graphite/25 underline-offset-4 transition-colors hover:text-potassium"
          >
            the record
          </a>
        </div>
      </div>
      <p
        aria-hidden="true"
        className="scroll-cue pointer-events-none absolute inset-x-0 bottom-8 text-center font-mono text-[11px] tracking-[0.2em] text-slate/80"
      >
        ↓ begin the descent · 10<sup>0</sup> m
      </p>
    </LevelSection>
  )
}
