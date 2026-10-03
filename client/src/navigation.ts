/**
 * One navigation entry point for the whole site.
 *
 * Hero buttons, navbar links and footer links all go through `goToSection` so
 * scrolling behaves the same everywhere and honours `prefers-reduced-motion`.
 */

export const NAV_EVENT = 'sk:navigate'

/** Fire-and-forget jump to a section — the app decides how to scroll. */
export function goToSection(id: string) {
  window.dispatchEvent(new CustomEvent(NAV_EVENT, { detail: id }))
}
