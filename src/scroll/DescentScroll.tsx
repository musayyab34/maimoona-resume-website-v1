import { useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { setProgress, useScaleStore } from '../store/scaleStore'
import { lenisRef } from './lenisSingleton'

gsap.registerPlugin(ScrollTrigger)

/**
 * The scroll engine (§5): Lenis smoothing + one master ScrollTrigger with
 * scrub across the whole descent. Only mounted in enhanced mode.
 */
export function DescentScroll() {
  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.11 })
    lenisRef.current = lenis
    lenis.on('scroll', ScrollTrigger.update)
    const tick = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)

    const master = ScrollTrigger.create({
      trigger: '#descent',
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onUpdate: (self) => setProgress(self.progress),
    })

    // Keep the canvas rendering while any descent pixel is on screen; only
    // sleep once the visitor is fully into the dossier.
    const activity = ScrollTrigger.create({
      trigger: '#descent',
      start: 'top bottom',
      end: 'bottom top',
      onToggle: (self) => useScaleStore.getState().setDescentActive(self.isActive),
    })

    // Figure-caption reveals: per-block fades, local beats only (§5.4)
    const reveals = gsap.utils.toArray<HTMLElement>('[data-reveal]').map((el) =>
      gsap.fromTo(
        el,
        { autoAlpha: 0, y: 26 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.9,
          ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 84%' },
        },
      ),
    )

    const refresh = () => ScrollTrigger.refresh()
    if (document.fonts?.ready) document.fonts.ready.then(refresh)
    const raf = requestAnimationFrame(refresh)

    return () => {
      cancelAnimationFrame(raf)
      reveals.forEach((tween) => {
        tween.scrollTrigger?.kill()
        tween.kill()
      })
      // never leave content inline-hidden (e.g. scene failure → static mode)
      gsap.set('[data-reveal]', { clearProps: 'opacity,visibility,transform' })
      activity.kill()
      master.kill()
      gsap.ticker.remove(tick)
      lenis.destroy()
      lenisRef.current = null
    }
  }, [])

  return null
}
