import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import { applyTheme, currentTheme, setTheme, type Theme } from '../theme'

/** Dark/light switch — remembers the choice, defaults to the system setting. */
export default function ThemeToggle({ className = '' }: { className?: string }) {
  const [theme, setThemeState] = useState<Theme>('dark')

  // read the theme that the inline head script already applied
  useEffect(() => {
    const initial = (document.documentElement.dataset.theme as Theme) || currentTheme()
    setThemeState(initial === 'light' ? 'light' : 'dark')
  }, [])

  const toggle = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    setThemeState(next)
  }

  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      className={`theme-toggle ${className}`.trim()}
      onClick={toggle}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={isDark ? 'Light theme' : 'Dark theme'}
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  )
}

// keep the applied theme in sync if the OS preference changes while the tab is
// open and the visitor has not picked one explicitly
if (typeof window !== 'undefined') {
  const mq = window.matchMedia?.('(prefers-color-scheme: light)')
  mq?.addEventListener?.('change', () => {
    try {
      if (!localStorage.getItem('theme')) applyTheme(currentTheme())
    } catch {
      /* ignore */
    }
  })
}
