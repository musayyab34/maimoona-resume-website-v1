import {
  certifications,
  identity,
  languages,
  leadership,
  otherExperience,
} from '../content/cv'
import { Formula } from './Formula'

function SectionLabel({ children }: { children: string }) {
  return (
    <h3 className="font-mono text-[11px] tracking-[0.22em] text-slate uppercase">
      {children}
    </h3>
  )
}

/**
 * Below the descent the page returns to conventional documentation —
 * plain, fast, readable, fully crawlable (§3). Back on paper.
 */
export function Dossier() {
  return (
    <section
      id="dossier"
      aria-labelledby="dossier-heading"
      className="relative z-10 border-t border-graphite/10 bg-paper text-graphite"
    >
      <div className="mx-auto max-w-6xl px-6 py-20 sm:px-10 sm:py-28">
        <p className="font-mono text-[11px] tracking-[0.22em] text-slate uppercase">
          below the descent
        </p>
        <h2 id="dossier-heading" className="font-display mt-3 text-4xl sm:text-5xl">
          The record
        </h2>

        <div className="mt-14 grid grid-cols-1 gap-14 md:grid-cols-2">
          <div>
            <SectionLabel>Certifications</SectionLabel>
            <ul className="mt-5 flex flex-col gap-6">
              {certifications.map((cert) => (
                <li key={cert.name} className="border-l-2 border-graphite/10 pl-5">
                  <p className="font-medium">{cert.name}</p>
                  <p className="mt-0.5 font-mono text-xs text-slate">
                    {cert.issuer} · {cert.date}
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate">
                    <Formula f={cert.note} />
                  </p>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-14">
            <div>
              <SectionLabel>Other experience</SectionLabel>
              <ul className="mt-5 flex flex-col gap-6">
                {otherExperience.map((entry) => (
                  <li key={entry.role} className="border-l-2 border-graphite/10 pl-5">
                    <p className="font-medium">{entry.role}</p>
                    <p className="mt-0.5 font-mono text-xs text-slate">
                      {entry.org} · {entry.period}
                    </p>
                    <p className="mt-1.5 text-sm leading-relaxed text-slate">{entry.note}</p>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <SectionLabel>Leadership</SectionLabel>
              <div className="mt-5 border-l-2 border-graphite/10 pl-5">
                <p className="font-medium">{leadership.role}</p>
                <p className="mt-0.5 font-mono text-xs text-slate">
                  {leadership.org} · {leadership.period}
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-slate">{leadership.note}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Languages get real visual weight (§3) — this profile is uncommon. */}
        <div className="mt-20">
          <SectionLabel>Languages</SectionLabel>
          <ul className="mt-6 grid grid-cols-2 gap-px border border-graphite/10 bg-graphite/10 sm:grid-cols-3 lg:grid-cols-6">
            {languages.map((entry) => (
              <li key={entry.lang} className="bg-paper px-5 py-6">
                <p className="font-display text-2xl">{entry.lang}</p>
                <p className="mt-2 inline-block bg-potassium/10 px-2 py-0.5 font-mono text-[11px] text-potassium">
                  {entry.level}
                </p>
                {entry.detail && (
                  <p className="mt-1.5 font-mono text-[10px] text-slate">{entry.detail}</p>
                )}
              </li>
            ))}
          </ul>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate">
            A physicist from Rawalpindi doing a master's in Xi'an — reading the literature in
            English, the lab in Chinese, and the field's history in more languages than most
            research groups hold between them.
          </p>
        </div>

        <div className="mt-20">
          <SectionLabel>Contact</SectionLabel>
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <a
              href={`mailto:${identity.email}`}
              className="border border-graphite bg-graphite px-6 py-3 font-mono text-sm text-paper transition-colors hover:bg-potassium hover:border-potassium"
            >
              {identity.email}
            </a>
            <a
              href={identity.linkedin}
              target="_blank"
              rel="noreferrer"
              className="border border-graphite/25 px-6 py-3 font-mono text-sm transition-colors hover:border-potassium hover:text-potassium"
            >
              LinkedIn ↗
            </a>
          </div>
          <p className="mt-5 font-mono text-xs text-slate">
            {identity.location} · References available on request.
          </p>
        </div>

        <footer className="mt-24 border-t border-graphite/10 pt-8">
          <p className="font-mono text-[11px] leading-relaxed text-slate">
            10<sup>0</sup> → 10<sup>−10</sup> — A Journey Into Matter · ©{' '}
            {new Date().getFullYear()} Maimoona Mushtaq
          </p>
          <p className="mt-2 max-w-2xl font-mono text-[10px] leading-relaxed text-slate/80">
            The lattice is generated procedurally from the cubic ABX<sub>3</sub> prototype;
            atom colors follow the VESTA/CPK convention. Structural visualization only — no
            computed thesis values appear on this site. Set in Zodiak, Switzer, and Fragment
            Mono.
          </p>
        </footer>
      </div>
    </section>
  )
}
