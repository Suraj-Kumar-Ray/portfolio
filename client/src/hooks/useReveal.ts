import { useEffect } from 'react'

/**
 * Reveals every `.reveal` element once it scrolls into view.
 *
 * Three deliberate choices here, each fixing a real bug on this site:
 *
 * 1. The revealed state lives on the element as `data-revealed`, not as a class.
 *    React rewrites `className` on every re-render, so a class added from the
 *    outside gets wiped — which made the FAQ answers drop back to `opacity: 0`
 *    the moment you clicked a question. React never touches a data attribute it
 *    did not set, so the state survives.
 *
 * 2. A MutationObserver picks up `.reveal` nodes that appear later — the project
 *    category filter, for example, replaces every card when you click a tab.
 *
 * 3. A scroll/resize sweep runs alongside IntersectionObserver. IO is efficient
 *    but is not guaranteed to fire (throttled tabs, restored bfcache pages), and
 *    when it does not, content stays stuck at `opacity: 0`. The sweep only
 *    touches elements that are on screen and still hidden, so it never changes
 *    how the animation looks in a normal browser.
 */
export function useReveal(active: boolean) {
  useEffect(() => {
    if (!active) return

    const mark = (el: Element) => el.setAttribute('data-revealed', '1')

    if (!('IntersectionObserver' in window)) {
      document.querySelectorAll('.reveal').forEach(mark)
      return
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            mark(entry.target)
            io.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    )

    const pending = () => document.querySelectorAll<HTMLElement>('.reveal:not([data-revealed])')

    const observe = () => pending().forEach((el) => io.observe(el))

    /** Safety net: reveal anything already on screen that IO has not handled. */
    const sweep = () => {
      const vh = window.innerHeight || 0
      pending().forEach((el) => {
        const { top, bottom } = el.getBoundingClientRect()
        if (top < vh && bottom > 0) {
          mark(el)
          io.unobserve(el)
        }
      })
    }

    let frame = 0
    const scheduleSweep = () => {
      if (frame) return
      frame = requestAnimationFrame(() => {
        frame = 0
        sweep()
      })
      // rAF is paused in background tabs, so a timed fallback guarantees the
      // sweep still runs if the page is loaded while hidden.
      timers.push(window.setTimeout(() => {
        frame = 0
        sweep()
      }, 400))
    }

    const timers: number[] = []

    // Deliberately not inside requestAnimationFrame: rAF does not fire in a
    // background tab, and depending on it would leave the whole page at
    // `opacity: 0` for anyone who opens the site in a new (unfocused) tab.
    observe()
    sweep()
    timers.push(window.setTimeout(sweep, 300), window.setTimeout(sweep, 1200))

    window.addEventListener('scroll', scheduleSweep, { passive: true })
    window.addEventListener('resize', scheduleSweep, { passive: true })

    const mo = new MutationObserver((records) => {
      if (records.some((r) => r.addedNodes.length > 0)) {
        observe()
        scheduleSweep()
      }
    })
    mo.observe(document.body, { childList: true, subtree: true })

    return () => {
      if (frame) cancelAnimationFrame(frame)
      timers.forEach(clearTimeout)
      window.removeEventListener('scroll', scheduleSweep)
      window.removeEventListener('resize', scheduleSweep)
      mo.disconnect()
      io.disconnect()
    }
  }, [active])
}