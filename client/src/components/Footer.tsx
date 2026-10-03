import { useState } from 'react'
import { ArrowUpRight, Lock } from 'lucide-react'
import { Icon } from '../icons'
import { getPanelPath } from '../api'
import { goToSection } from '../navigation'
import Collapse from './Collapse'
import type { Profile } from '../types'

export default function Footer({ profile, links = [] }: { profile: Profile; links?: { id: string; label: string }[] }) {
  const year = new Date().getFullYear()
  // goes through the app so mobile switches to the owning tab first
  const go = (id: string) => goToSection(id)

  // Discreet way in to the owner's dashboard. It is a plain key-shaped mark in the
  // footer: no "admin" wording, no tooltip, nothing that tells a visitor what it is.
  // The real panel URL is fetched at click time, so it is never printed in the page.
  const [opening, setOpening] = useState(false)
  const openPanel = async () => {
    if (opening) return
    setOpening(true)
    try {
      const res = await getPanelPath()
      if (res.ok && res.data?.path) {
        window.location.assign(res.data.path)
        return
      }
    } catch {
      /* fall through to the re-enable below */
    }
    setOpening(false)
  }

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <a href="#home" className="nav-logo" onClick={(e) => { e.preventDefault(); go('home') }}>
              <span className="logo-mark" aria-hidden="true">
                {profile.name.split(' ').map((w) => w[0]).slice(0, 2).join('')}
              </span>
              {profile.name}
            </a>
            <p>{profile.tagline}</p>
            <div className="socials">
              {profile.socials.map((social) => (
                <a
                  className="social-btn"
                  key={social.label}
                  href={social.url}
                  target={social.url.startsWith('mailto:') ? undefined : '_blank'}
                  rel="noreferrer noopener"
                  aria-label={social.label}
                  title={social.label}
                >
                  <Icon name={social.icon} size={18} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="footer-title">Quick links</h4>
            <nav aria-label="Quick links" className="footer-quick-nav">
              {/* phones show the first four links inline, the rest behind "Show all" */}
              <Collapse className="footer-links footer-links-quick" count={links.length} limit={4}>
                {links.map((link) => (
                  <a
                    key={link.id}
                    href={`#${link.id}`}
                    onClick={(e) => {
                      e.preventDefault()
                      go(link.id)
                    }}
                  >
                    <ArrowUpRight size={14} /> {link.label}
                  </a>
                ))}
              </Collapse>
            </nav>
          </div>

          <div>
            <h4 className="footer-title">Get in touch</h4>
            <div className="footer-links footer-links-contact">
              <a href={`mailto:${profile.email}`}>{profile.email}</a>
              <a href={`tel:${profile.phone.replace(/\s/g, '')}`}>{profile.phone}</a>
              <span style={{ color: 'var(--muted)', fontSize: '0.92rem' }}>{profile.location}</span>
              <a href={profile.resumeUrl} download>
                Download resume (PDF)
              </a>
              <a href="/resume" target="_blank" rel="noreferrer noopener">
                View resume online
              </a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <span className="footer-legal">
            © {year} {profile.name}. All rights reserved.
            <button
              type="button"
              className="admin-key"
              onClick={openPanel}
              disabled={opening}
              tabIndex={-1}
              aria-label="Dashboard"
            >
              <Lock size={13} />
            </button>
          </span>
        </div>
      </div>
    </footer>
  )
}
