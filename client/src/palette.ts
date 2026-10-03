/**
 * Tiny event bus for the command palette, mirroring `navigation.ts`.
 *
 * The navbar's search button and the global ⌘K shortcut both call
 * `openPalette()`; the palette component listens and opens itself, so neither
 * has to know about the other.
 */
export const PALETTE_EVENT = 'sk:palette'

/** The shortcut a visitor actually has: ⌘K on Apple, Ctrl K everywhere else. */
export const PALETTE_SHORTCUT =
  typeof navigator !== 'undefined' && /Mac|iPhone|iPad|iPod/.test(navigator.userAgent)
    ? '⌘K'
    : 'Ctrl K'

/** Ask the command palette to open. */
export function openPalette() {
  window.dispatchEvent(new CustomEvent(PALETTE_EVENT))
}
