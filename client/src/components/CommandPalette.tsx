import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from 'react'
import {
  ArrowUpRight,
  Briefcase,
  CornerDownLeft,
  Download,
  FileText,
  Hash,
  Mail,
  MessageCircle,
  Moon,
  Search,
  Sun,
} from 'lucide-react'
import { PALETTE_EVENT } from '../palette'
import { goToSection } from '../navigation'
import { currentTheme, setTheme } from '../theme'
import type { BlogBlock, Profile, Project } from '../types'

export interface PaletteLink {
  id: string
  label: string
}

interface Item {
  id: string
  label: string
  group: 'Sections' | 'Projects' | 'Notes' | 'Actions'
  hint?: string
  keywords?: string
  icon: ReactNode
  run: () => void
}

/** Letters in order inside a single word — the loosest match we accept. */
function inOrder(word: string, query: string) {
  let i = 0
  for (const ch of word) {
    if (ch === query[i]) i++
    if (i === query.length) return true
  }
  return false
}

/**
 * Relative score for a single word against one item — 0 means "no match".
 *
 * Deliberately strict: a loose subsequence match would return half the site for
 * any three-letter query. Instead the acronym of a label matches directly, so
 * "tms" finds "Teachers Management System".
 */
function scoreToken(item: Item, q: string) {
  if (!q) return 1

  const label = item.label.toLowerCase()
  const haystack = `${label} ${(item.hint || '').toLowerCase()} ${(item.keywords || '').toLowerCase()}`
  const words = haystack.split(/\s+/).filter(Boolean)

  if (label === q) return 120
  if (label.startsWith(q)) return 100
  if (words.some((w) => w.startsWith(q))) return 80

  // acronym of the visible label: "Teachers Management System" → "tms"
  const initials = label
    .split(/[^a-z0-9]+/)
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
  if (initials.length > 1 && initials.startsWith(q)) return 75

  if (haystack.includes(q)) return 60
  if (q.length >= 4 && words.some((w) => inOrder(w, q))) return 25
  return 0
}

/**
 * Score a whole query. Every word has to match (so "free review" finds "Free
 * website review") and the item's rank is the average of the word scores.
 */
function score(item: Item, query: string) {
  const tokens = query.toLowerCase().trim().split(/\s+/).filter(Boolean)
  if (!tokens.length) return 1
  if (tokens.length === 1) return scoreToken(item, tokens[0])
  let total = 0
  for (const token of tokens) {
    const s = scoreToken(item, token)
    if (!s) return 0
    total += s
  }
  return total / tokens.length
}

/**
 * Ctrl/Cmd + K command palette: one place to search and jump to any section,
 * project, note or action. Opened by the shortcut, the navbar search button, or
 * `openPalette()` from anywhere.
 */
export default function CommandPalette({
  profile,
  projects = [],
  blog,
  links = [],
}: {
  profile: Profile
  projects?: Project[]
  blog?: BlogBlock
  links?: PaletteLink[]
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const restoreFocus = useRef<HTMLElement | null>(null)

  const close = useCallback(() => {
    setOpen(false)
    setQuery('')
    setActive(0)
  }, [])

  const items = useMemo<Item[]>(() => {
    const pathname = window.location.pathname.replace(/\/+$/, '')
    const onHome = pathname === ''
    const waNumber = (profile.phone || '').replace(/\D/g, '')
    const posts = blog?.posts || []

    const list: Item[] = [
      ...links.map<Item>((link) => ({
        id: `section:${link.id}`,
        label: link.label,
        group: 'Sections',
        icon: <Hash size={15} />,
        run: () => (onHome ? goToSection(link.id) : window.location.assign(`/#${link.id}`)),
      })),
      ...projects.map<Item>((project) => ({
        id: `project:${project.id}`,
        label: project.title,
        group: 'Projects',
        hint: [project.category, project.year].filter(Boolean).join(' · '),
        keywords: (project.tech || []).join(' '),
        icon: <Briefcase size={15} />,
        run: () => window.location.assign(`/work/${project.id}`),
      })),
      ...posts.map<Item>((post) => ({
        id: `note:${post.slug}`,
        label: post.title,
        group: 'Notes',
        hint: post.date,
        keywords: (post.tags || []).join(' '),
        icon: <FileText size={15} />,
        run: () => window.location.assign(`/blog/${post.slug}`),
      })),
    ]

    const actions: Item[] = [
      {
        id: 'action:quote',
        label: 'Get a quote',
        group: 'Actions',
        hint: 'Websites & web apps',
        icon: <Spark size={15} />,
        run: () => window.location.assign('/quote'),
      },
      {
        id: 'action:audit',
        label: 'Free website review',
        group: 'Actions',
        icon: <Search size={15} />,
        run: () => window.location.assign('/audit'),
      },
      {
        id: 'action:blog',
        label: 'All notes',
        group: 'Actions',
        icon: <FileText size={15} />,
        run: () => window.location.assign('/blog'),
      },
      {
        id: 'action:resume',
        label: 'Download resume',
        group: 'Actions',
        hint: 'PDF',
        icon: <Download size={15} />,
        run: () => window.location.assign(profile.resumeUrl),
      },
      {
        id: 'action:email',
        label: 'Email me',
        group: 'Actions',
        hint: profile.email,
        icon: <Mail size={15} />,
        run: () => window.location.assign(`mailto:${profile.email}`),
      },
    ]

    if (waNumber) {
      actions.push({
        id: 'action:whatsapp',
        label: 'WhatsApp me',
        group: 'Actions',
        hint: profile.phone,
        icon: <MessageCircle size={15} />,
        run: () => window.open(`https://wa.me/${waNumber}`, '_blank', 'noopener'),
      })
    }

    actions.push({
      id: 'action:theme',
      label: currentTheme() === 'dark' ? 'Switch to light theme' : 'Switch to dark theme',
      group: 'Actions',
      keywords: 'theme dark light mode',
      icon: currentTheme() === 'dark' ? <Sun size={15} /> : <Moon size={15} />,
      run: () => setTheme(currentTheme() === 'dark' ? 'light' : 'dark'),
    })

    return [...list, ...actions]
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blog, links, profile, open])

  const results = useMemo(() => {
    const q = query.trim()
    if (!q) {
      // no query: sections first, then a taste of everything else
      return items.map((item) => ({ item, s: 1 }))
    }
    return items
      .map((item) => ({ item, s: score(item, q) }))
      .filter((r) => r.s > 0)
      .sort((a, b) => b.s - a.s)
  }, [items, query])

  // group the flat result list for rendering, keeping the ranking order
  const groups = useMemo(() => {
    const order: Item['group'][] = ['Sections', 'Projects', 'Notes', 'Actions']
    return order
      .map((name) => ({ name, rows: results.filter((r) => r.item.group === name) }))
      .filter((g) => g.rows.length > 0)
  }, [results])

  // --- open/close wiring -----------------------------------------------------
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setOpen((v) => !v)
        return
      }
      if (event.key === 'Escape') setOpen((v) => (v ? false : v))
    }
    const onOpenRequest = () => setOpen(true)
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener(PALETTE_EVENT, onOpenRequest)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener(PALETTE_EVENT, onOpenRequest)
    }
  }, [])

  useEffect(() => {
    if (!open) {
      setQuery('')
      setActive(0)
      restoreFocus.current?.focus?.()
      restoreFocus.current = null
      return
    }
    restoreFocus.current = document.activeElement as HTMLElement | null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const id = window.setTimeout(() => inputRef.current?.focus(), 20)
    return () => {
      document.body.style.overflow = previousOverflow
      window.clearTimeout(id)
    }
  }, [open])

  useEffect(() => setActive(0), [query])

  // keep the highlighted row in view while arrowing through the list
  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>('[data-active="true"]')
    el?.scrollIntoView({ block: 'nearest' })
  }, [active, groups])

  const runAt = useCallback(
    (index: number) => {
      const target = results[index]
      if (!target) return
      close()
      target.item.run()
    },
    [close, results]
  )

  const onInputKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActive((i) => (results.length ? (i + 1) % results.length : 0))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActive((i) => (results.length ? (i - 1 + results.length) % results.length : 0))
    } else if (event.key === 'Enter') {
      event.preventDefault()
      runAt(active)
    }
  }

  if (!open) return null

  let flatIndex = -1

  return (
    <div className="palette" role="dialog" aria-modal="true" aria-label="Search the site">
      <div className="palette-scrim" onClick={close} />
      <div className="palette-panel">
        <div className="palette-search">
          <Search size={18} className="palette-search-icon" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={onInputKeyDown}
            placeholder="Search projects, notes, sections…"
            aria-label="Search the site"
            autoComplete="off"
            spellCheck={false}
          />
          <kbd>Esc</kbd>
        </div>

        <div className="palette-list" ref={listRef} role="listbox" aria-label="Results">
          {results.length === 0 && (
            <p className="palette-empty">
              No matches for “{query.trim()}”. Try a project name, a note or “quote”.
            </p>
          )}

          {groups.map((group) => (
            <div className="palette-group" key={group.name}>
              <span className="palette-group-title">{group.name}</span>
              {group.rows.map(({ item }) => {
                flatIndex += 1
                const index = flatIndex
                const isActive = index === active
                return (
                  <button
                    type="button"
                    key={item.id}
                    role="option"
                    aria-selected={isActive}
                    data-active={isActive ? 'true' : undefined}
                    className={`palette-row ${isActive ? 'is-active' : ''}`}
                    onMouseMove={() => setActive(index)}
                    onClick={() => runAt(index)}
                  >
                    <span className="palette-row-icon">{item.icon}</span>
                    <span className="palette-row-label">{item.label}</span>
                    {item.hint && <span className="palette-row-hint">{item.hint}</span>}
                    <ArrowUpRight size={14} className="palette-row-go" />
                  </button>
                )
              })}
            </div>
          ))}
        </div>

        <div className="palette-foot">
          <span>
            <kbd>↑</kbd>
            <kbd>↓</kbd> to navigate
          </span>
          <span>
            <CornerDownLeft size={13} /> to open
          </span>
          <span>
            <kbd>Esc</kbd> to close
          </span>
        </div>
      </div>
    </div>
  )
}

/** Small inline sparkle so the Actions group has a distinct mark. */
function Spark({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8" />
    </svg>
  )
}
