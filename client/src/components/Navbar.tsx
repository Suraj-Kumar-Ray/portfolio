import { useEffect, useState } from 'react'
import { Menu, X, ArrowUpRight, Search } from 'lucide-react'
import { goToSection } from '../navigation'
import { PALETTE_SHORTCUT, openPalette } from '../palette'
import ThemeToggle from './ThemeToggle'

export interface NavLink {
  id: string
  label: string
}

export default function Navbar({
  name,
  initial,
  links,
  hireTarget,
}: {
  name: string
  initial: string
  links: NavLink[]
  /** Where the "Hire Me" button scrolls to (the work/ enquiry section when enabled). */
  hireTarget?: string
}) {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState('home')

  // Home first, then the backend-enabled sections. If there are many sections we
  // keep the bar tidy but always pin Contact at the end.
  const MAX_LINKS = 8
  const items: NavLink[] = (() => {
    const all: NavLink[] = [{ id: 'home', label: 'Home' }, ...links]
    if (all.length <= MAX_LINKS) return all
    const contact = all.find((l) => l.id === 'contact')
    const rest = all.filter((l) => l.id !== 'contact').slice(0, MAX_LINKS - 1 - (contact ? 1 : 0))
    return contact ? [...rest, contact] : rest
  })()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const sections = items.map((l) => document.getElementById(l.id)).filter(Boolean) as HTMLElement[]
    if (!sections.length) return
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (visible) setActive(visible.target.id)
      },
      { rootMargin: '-35% 0px -55% 0px', threshold: [0, 0.25, 0.6] }
    )
    sections.forEach((s) => io.observe(s))
    return () => io.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [links.map((l) => l.id).join(',')])

  // Tapping anywhere outside the open menu (or pressing Escape) closes it, so
  // you do not have to hit the burger again.
  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null
      if (!target) return
      if (target.closest('.mobile-menu') || target.closest('.nav-toggle')) return
      setOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const go = (id: string) => {
    setOpen(false)
    goToSection(id)
  }

  const contactTarget = hireTarget || (links.some((l) => l.id === 'contact') ? 'contact' : 'home')

  return (
    <>
      <nav className={`nav ${scrolled || open ? 'scrolled' : ''}`} aria-label="Main navigation">
        <div className="nav-inner">
          <a
            href="#home"
            className="nav-logo"
            onClick={(e) => {
              e.preventDefault()
              go('home')
            }}
          >
            <span className="logo-mark" aria-hidden="true">
              {initial}
            </span>
            {name}
          </a>

          <div className="nav-links">
            {items.map((link) => (
              <a
                key={link.id}
                href={`#${link.id}`}
                className={`nav-link ${active === link.id ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault()
                  go(link.id)
                }}
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="nav-actions">
            <button
              type="button"
              className="nav-search"
              onClick={openPalette}
              aria-label="Search the site"
              title={`Search (${PALETTE_SHORTCUT})`}
            >
              <Search size={16} />
              <span className="nav-search-kbd">{PALETTE_SHORTCUT}</span>
            </button>
            <ThemeToggle />
            <button type="button" className="btn btn-primary btn-sm" onClick={() => go(contactTarget)}>
              Hire Me <ArrowUpRight size={15} />
            </button>
            <button
              type="button"
              className="nav-toggle"
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </nav>

      {open && (
        <>
          <div className="mobile-menu-scrim" aria-hidden="true" onClick={() => setOpen(false)} />
          <div className="mobile-menu">
            {items.map((link) => (
              <a
                key={link.id}
                href={`#${link.id}`}
                className={`nav-link ${active === link.id ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault()
                  go(link.id)
                }}
              >
                {link.label}
              </a>
            ))}
            <button
              type="button"
              className="mobile-menu-search"
              onClick={() => {
                setOpen(false)
                openPalette()
              }}
            >
              <Search size={16} /> Search projects, notes and more
            </button>
            <button type="button" className="btn btn-primary" onClick={() => go(contactTarget)}>
              Hire Me <ArrowUpRight size={16} />
            </button>
            <div className="mobile-menu-theme">
              <span>Theme</span>
              <ThemeToggle />
            </div>
          </div>
        </>
      )}
    </>
  )
}
