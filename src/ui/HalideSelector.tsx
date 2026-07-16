import { variantOrder, variants } from '../content/cv'
import type { HalideVariant } from '../content/cv'
import { useScaleStore } from '../store/scaleStore'
import { Formula } from './Formula'

/** Contrast-safe accents for text on the dark lattice room. */
export const VARIANT_INK: Record<HalideVariant, string> = {
  Cl: 'var(--color-chlorine-ink)',
  Br: 'var(--color-bromine-ink)',
  F: 'var(--color-fluorine-ink)',
}

/**
 * X = Cl / Br / F. Real focusable buttons with aria-pressed (§6) — the one
 * place a halide accent is allowed to appear (§2).
 */
export function HalideSelector() {
  const variant = useScaleStore((s) => s.variant)
  const setVariant = useScaleStore((s) => s.setVariant)

  return (
    <div role="group" aria-label="Halide variant" className="flex flex-wrap gap-3">
      {variantOrder.map((symbol) => {
        const info = variants[symbol]
        const active = symbol === variant
        const ink = VARIANT_INK[symbol]
        return (
          <button
            key={symbol}
            type="button"
            aria-pressed={active}
            onClick={() => setVariant(symbol)}
            className={`cursor-pointer border px-4 py-2.5 text-left font-mono text-xs transition-all duration-300 ${
              active
                ? 'border-current bg-current/10'
                : 'border-paper/20 text-mist hover:border-paper/45 hover:text-paper'
            }`}
            style={active ? { color: ink } : undefined}
          >
            <span className="block text-sm">X = {symbol}</span>
            <span className={`mt-0.5 block text-[10px] tracking-[0.14em] uppercase ${active ? '' : 'opacity-70'}`}>
              {info.name}
            </span>
          </button>
        )
      })}
      <p aria-live="polite" className="sr-only">
        Selected halide: {variants[variant].name},{' '}
        <Formula f={variants[variant].formula} />
      </p>
    </div>
  )
}
