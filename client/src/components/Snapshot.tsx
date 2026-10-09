import { Download } from 'lucide-react'
import { Icon } from '../icons'
import type { Profile, SnapshotBlock } from '../types'

/**
 * The recruiter card. Hiring teams scan for a handful of facts before they read
 * anything else — the roles open to, how soon you can join, where you are, and
 * what you have studied. Those sit in one labelled block right under the hero
 * (with the resume one tap away) instead of being spread across the page.
 * Every value comes from content.json, so the wording stays editable.
 */
export default function Snapshot({ block, profile }: { block?: SnapshotBlock; profile: Profile }) {
  const rows = block?.rows || []
  if (!rows.length) return null

  return (
    <section className="snapshot" aria-label={block?.eyebrow || 'Recruiter snapshot'}>
      <div className="container">
        <div className="snapshot-card reveal">
          <header className="snapshot-head">
            <div>
              <span className="snapshot-eyebrow">{block?.eyebrow || 'Recruiter snapshot'}</span>
              <h2 className="snapshot-title">{block?.title || 'Quick facts'}</h2>
            </div>
            <a className="btn btn-primary btn-sm" href={profile.resumeUrl} download>
              <Download size={15} /> Resume PDF
            </a>
          </header>

          <dl className="snapshot-rows">
            {rows.map((row) => (
              <div className="snapshot-row" key={row.label}>
                <dt>
                  {row.icon && <Icon name={row.icon} size={14} />}
                  {row.label}
                </dt>
                <dd>{row.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  )
}
