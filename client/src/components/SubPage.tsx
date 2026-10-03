import { useEffect, type ReactNode } from 'react'
import { ArrowLeft, Search } from 'lucide-react'
import { PALETTE_SHORTCUT, openPalette } from '../palette'
import Footer from './Footer'
import BackToTop from './BackToTop'
import QuickConnect from './QuickConnect'
import StickyCta from './StickyCta'
import ThemeToggle from './ThemeToggle'
import type { Profile } from '../types'

/**
 * Slim chrome for the standalone pages (case studies, notes): a way back home,
 * the real footer and the floating contact rail — nothing else competes with
 * the content.
 */
export default function SubPage({
  profile,
  title,
  children,
}: {
  profile: Profile
  title: string
  children: ReactNode
}) {
  useEffect(() => {
    document.title = title
  }, [title])

  return (
    <div className="subpage">
      <header className="subpage-bar">
        <div className="container subpage-inner">
          <a className="nav-logo" href="/">
            <span className="logo-mark" aria-hidden="true">
              {profile.name
                .split(' ')
                .map((w) => w[0])
                .slice(0, 2)
                .join('')}
            </span>
            <span className="logo-name">{profile.name}</span>
          </a>
          <div className="subpage-actions">
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
            <a className="btn btn-ghost btn-sm" href="/">
              <ArrowLeft size={15} /> Back to portfolio
            </a>
          </div>
        </div>
      </header>

      <main>{children}</main>

      <Footer profile={profile} />
      <BackToTop />
      <QuickConnect profile={profile} />
      <StickyCta profile={profile} />
    </div>
  )
}
