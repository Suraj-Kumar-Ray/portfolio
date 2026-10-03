/**
 * Theme handling: a saved choice wins, otherwise the visitor's system
 * preference decides. The chosen theme is written to <html data-theme> so all
 * colours (plain CSS, no JS) react instantly. A tiny inline script in
 * index.html applies it before first paint to avoid a flash.
 */
export type Theme = 'dark' | 'light'

const KEY = 'theme'

export function getStoredTheme(): Theme | null {
  try {
    const v = localStorage.getItem(KEY)
    return v === 'light' || v === 'dark' ? v : null
  } catch {
    return null
  }
}

export function systemTheme(): Theme {
  try {
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
  } catch {
    return 'dark'
  }
}

function syncBrowserChrome(theme: Theme) {
  const meta = document.querySelector('meta[name="color-scheme"]')
  if (meta) meta.setAttribute('content', theme === 'light' ? 'light dark' : 'dark light')
  const bar = document.querySelector('meta[name="theme-color"]')
  if (bar) bar.setAttribute('content', theme === 'light' ? '#f6f7fb' : '#060a14')
}

export function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme
  document.documentElement.style.colorScheme = theme
  syncBrowserChrome(theme)
}

export function currentTheme(): Theme {
  return getStoredTheme() || systemTheme()
}

export function initTheme() {
  applyTheme(currentTheme())
}

export function setTheme(theme: Theme) {
  try {
    localStorage.setItem(KEY, theme)
  } catch {
    /* private mode — the choice just won't persist */
  }
  applyTheme(theme)
}
