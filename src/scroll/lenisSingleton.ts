import type Lenis from 'lenis'

/** Shared handle so the scale rail can drive smooth anchor scrolls. */
export const lenisRef: { current: Lenis | null } = { current: null }

export function scrollToSection(id: string, reduced = false) {
  const el = document.getElementById(id)
  if (!el) return
  if (lenisRef.current) {
    lenisRef.current.scrollTo(el, { duration: 1.6 })
  } else {
    el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' })
  }
}
