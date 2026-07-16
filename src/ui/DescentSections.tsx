import { LEVELS } from '../content/levels'
import {
  closingLine,
  education,
  identity,
  research,
  skillGroups,
  thesis,
  variants,
} from '../content/cv'
import { useScaleStore } from '../store/scaleStore'
import type { SiteMode } from '../store/scaleStore'
import { Eyebrow, LevelSection } from './LevelSection'
import { Formula } from './Formula'
import { HalideSelector, VARIANT_INK } from './HalideSelector'
import { UnitCellSVG } from './UnitCellSVG'

/** 10⁻³ m — education, read as the device stack it produced (§3). */
export function EducationSection({ mode }: { mode: SiteMode }) {
  return (
    <LevelSection level={LEVELS[1]} mode={mode} theme="light" align="right" panel>
      <div data-reveal>
        <Eyebrow theme="light">
          10<sup>−3</sup> m — through the layers
        </Eyebrow>
        <h2 id="l3-heading" className="font-display mt-3 text-3xl sm:text-4xl">
          Education
        </h2>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-slate">
          A thin-film cell is read from its cross-section, substrate up. So is a CV.
        </p>
      </div>
      <div className="mt-8 flex flex-col gap-8">
        {education.map((entry) => (
          <article key={entry.id} data-reveal>
            <p className="font-mono text-[10px] tracking-[0.2em] text-tin uppercase">
              {entry.stackLabel} — {entry.stackNote}
            </p>
            <h3 className="font-display mt-2 text-xl">{entry.degree}</h3>
            <p className="mt-1 text-sm text-ink">
              {entry.institution}, {entry.place}
            </p>
            <p className="mt-0.5 font-mono text-xs text-slate">{entry.period}</p>
            <p className="mt-2 text-sm leading-relaxed text-slate">
              {entry.courses.join(' · ')}
            </p>
          </article>
        ))}
        <p data-reveal className="font-mono text-[10px] leading-relaxed text-slate/80">
          Layer labels follow thin-film device convention.
        </p>
      </div>
    </LevelSection>
  )
}

/** 10⁻⁶ m — research experience at the grain scale (§3). */
export function ResearchSection({ mode }: { mode: SiteMode }) {
  return (
    <LevelSection level={LEVELS[2]} mode={mode} theme="dark" align="left" panel>
      <div data-reveal>
        <Eyebrow theme="dark">
          10<sup>−6</sup> m — grain structure
        </Eyebrow>
        <h2 id="l6-heading" className="font-display mt-3 text-3xl sm:text-4xl">
          Research
        </h2>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-mist">
          At a micron the film stops being a surface and becomes a population of grains —
          the working scale of the electron microscope.
        </p>
      </div>
      <article data-reveal className="mt-8">
        <h3 className="font-display text-xl">{research.role}</h3>
        <p className="mt-1 text-sm text-paper/90">
          {research.org}, {research.place}
        </p>
        <p className="mt-0.5 font-mono text-xs text-mist">{research.period}</p>
        <ul className="mt-4 flex max-w-md flex-col gap-2.5">
          {research.points.map((point) => (
            <li key={point} className="border-l border-paper/15 pl-4 text-sm leading-relaxed text-paper/85">
              {point}
            </li>
          ))}
        </ul>
      </article>
      <p data-reveal className="mt-6 flex flex-wrap gap-2" aria-label="Tools used">
        {research.tools.map((tool) => (
          <span
            key={tool}
            className="border border-paper/15 px-2.5 py-1 font-mono text-[11px] text-mist"
          >
            {tool}
          </span>
        ))}
      </p>
    </LevelSection>
  )
}

/** 10⁻⁹ m — the thesis. The centerpiece and the one interactive room (§3). */
export function ThesisSection({ mode }: { mode: SiteMode }) {
  const variant = useScaleStore((s) => s.variant)
  const info = variants[variant]
  return (
    <LevelSection level={LEVELS[3]} mode={mode} theme="dark" align="right" panel>
      <div data-reveal>
        <Eyebrow theme="dark">
          10<sup>−9</sup> m — the unit cell
        </Eyebrow>
        <h2 id="l9-heading" className="font-display mt-3 text-3xl sm:text-4xl">
          Thesis
        </h2>
        <p className="font-display mt-4 max-w-lg text-lg leading-snug text-paper/95">
          <Formula f={thesis.title} />
        </p>
        <p className="mt-4 font-mono text-xs leading-relaxed text-mist">
          {thesis.degree} · {thesis.institution}
          <br />
          Supervisor: {thesis.supervisor} · Co-supervisor: {thesis.coSupervisor}
        </p>
      </div>
      <div data-reveal className="mt-8">
        <HalideSelector />
        <p
          key={variant}
          className="variant-swap mt-5 max-w-md text-sm leading-relaxed text-paper/85"
        >
          <span className="font-mono" style={{ color: VARIANT_INK[variant] }}>
            <Formula f={info.formula} />
          </span>{' '}
          — {info.caption} The host lattice never changes; only the halide does. That
          substitution is the thesis.
        </p>
        {mode === 'static' && <UnitCellSVG variant={variant} />}
        <p className="mt-6 border-t border-paper/10 pt-4 font-mono text-[10px] leading-relaxed text-mist/80">
          <Formula f={thesis.integrityNote} />
        </p>
      </div>
    </LevelSection>
  )
}

/** 10⁻¹⁰ m — skills and instruments as a field of emissive nodes (§3). */
export function SkillsSection({ mode }: { mode: SiteMode }) {
  const setHighlighted = useScaleStore((s) => s.setHighlightedSkill)
  const enhanced = mode === 'enhanced'
  return (
    <LevelSection level={LEVELS[4]} mode={mode} theme="dark" align="left" panel>
      <div data-reveal>
        <Eyebrow theme="dark">
          10<sup>−10</sup> m — instruments
        </Eyebrow>
        <h2 id="l10-heading" className="font-display mt-3 text-3xl sm:text-4xl">
          Skills &amp; instruments
        </h2>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-mist">
          Below the last bond length, the material dissolves into method.
          {enhanced && ' Hover or focus a tool to find its node.'}
        </p>
      </div>
      <div className="mt-8 flex flex-col gap-6">
        {skillGroups.map((group, g) => (
          <div key={group.id} data-reveal>
            <h3 className="font-mono text-[10px] tracking-[0.2em] text-mist uppercase">
              {group.label}
            </h3>
            <ul className="mt-2.5 flex flex-wrap gap-2">
              {group.items.map((item, i) => {
                const id = `${g}-${i}`
                return (
                  <li key={item}>
                    <button
                      type="button"
                      className="cursor-default border border-paper/15 px-2.5 py-1 font-mono text-[11px] text-paper/85 transition-colors duration-200 hover:border-potassium-ink hover:text-potassium-ink focus-visible:border-potassium-ink"
                      onPointerEnter={() => setHighlighted(id)}
                      onPointerLeave={() => setHighlighted(null)}
                      onFocus={() => setHighlighted(id)}
                      onBlur={() => setHighlighted(null)}
                    >
                      {item}
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </div>
    </LevelSection>
  )
}

/** Resolution — the atoms reassemble into a name, then the closing line (§3). */
export function ResolutionSection({ mode }: { mode: SiteMode }) {
  return (
    <LevelSection level={LEVELS[5]} mode={mode} theme="dark" align="center">
      <div data-reveal>
        {mode === 'static' && (
          <p className="font-display text-4xl text-paper sm:text-5xl">{identity.name}</p>
        )}
        <h2 id="resolution-heading" className="sr-only">
          Resolution
        </h2>
        <p
          className={`font-display text-xl text-paper/90 italic sm:text-2xl ${
            mode === 'enhanced' ? 'mt-[36vh]' : 'mt-8'
          }`}
        >
          {closingLine}
        </p>
        <p className="mt-6 font-mono text-[10px] tracking-[0.22em] text-mist/70 uppercase">
          end of descent · 10<sup>−10</sup> m
        </p>
      </div>
    </LevelSection>
  )
}
