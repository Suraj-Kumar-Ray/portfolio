import { ArrowLeft, Sparkles } from 'lucide-react'
import SubPage from './SubPage'
import type { Profile } from '../types'

/** Dedicated 404 — the server answers unknown paths with a real 404 status. */
export default function NotFound({ profile }: { profile: Profile }) {
  return (
    <SubPage profile={profile} title={`Page not found — ${profile.name}`}>
      <section className="section">
        <div className="container" style={{ textAlign: 'center', padding: '70px 0 90px' }}>
          <span className="eyebrow" style={{ justifyContent: 'center' }}>
            Error 404
          </span>
          <h1 className="section-title" style={{ marginTop: 10 }}>
            This page is not here
          </h1>
          <p className="section-sub" style={{ maxWidth: 560, margin: '12px auto 26px' }}>
            The link may be broken or the page may have moved. Everything else is one click
            away — or send me a message and I will point you in the right direction.
          </p>
          <div className="notfound-actions">
            <a className="btn btn-primary" href="/">
              <ArrowLeft size={16} /> Back to portfolio
            </a>
            <a className="btn btn-ghost" href="/quote">
              <Sparkles size={16} /> Get a quote
            </a>
          </div>
        </div>
      </section>
    </SubPage>
  )
}
