import type { ReactNode } from 'react'
import type { LevelDef } from '../content/levels'
import type { SiteMode } from '../store/scaleStore'

/** Static-mode backgrounds — discrete steps of the light inversion (§1). */
const STATIC_BG: Record<string, string> = {
  l0: '#F2F4F5',
  l3: '#E3E7E9',
  l6: '#3F454C',
  l9: '#1A1D21',
  l10: '#101216',
  resolution: '#0B0C0E',
}

export function ScalePower({ exponent }: { exponent: number }) {
  return (
    <span className="whitespace-nowrap">
      10<sup>{exponent === 0 ? '0' : `−${Math.abs(exponent)}`}</sup>
    </span>
  )
}

interface LevelSectionProps {
  level: LevelDef
  mode: SiteMode
  theme: 'light' | 'dark'
  /** which column the copy occupies on desktop */
  align?: 'left' | 'right' | 'center'
  /** wrap copy in a translucent figure-caption panel (needed over mid-greys) */
  panel?: boolean
  children: ReactNode
}

export function LevelSection({
  level,
  mode,
  theme,
  align = 'left',
  panel = false,
  children,
}: LevelSectionProps) {
  const enhanced = mode === 'enhanced'
  const panelClass = panel
    ? theme === 'dark'
      ? 'border border-paper/10 bg-graphite/60 backdrop-blur-md px-7 py-8 sm:px-9 sm:py-10'
      : 'border border-graphite/10 bg-paper/70 backdrop-blur-md px-7 py-8 sm:px-9 sm:py-10'
    : ''

  return (
    <section
      id={level.id}
      aria-labelledby={`${level.id}-heading`}
      data-theme={theme}
      className={theme === 'dark' ? 'text-paper' : 'text-graphite'}
      style={{
        minHeight: enhanced ? `${level.heightVh}vh` : '100svh',
        backgroundColor: enhanced ? 'transparent' : STATIC_BG[level.id],
      }}
    >
      <div className="sticky top-0 flex min-h-screen items-center">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-8 px-6 sm:px-10 md:grid-cols-2">
          <div
            className={
              align === 'center'
                ? 'col-span-full mx-auto max-w-2xl text-center'
                : align === 'right'
                  ? 'md:col-start-2'
                  : 'md:col-start-1'
            }
          >
            <div className={`rounded-sm ${panelClass}`}>{children}</div>
          </div>
        </div>
      </div>
    </section>
  )
}

export function Eyebrow({
  children,
  theme,
}: {
  children: ReactNode
  theme: 'light' | 'dark'
}) {
  return (
    <p
      className={`font-mono text-[11px] tracking-[0.22em] uppercase ${
        theme === 'dark' ? 'text-mist' : 'text-slate'
      }`}
    >
      {children}
    </p>
  )
}
