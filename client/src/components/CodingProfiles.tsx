import { ExternalLink } from 'lucide-react'
import { Icon } from '../icons'
import Section from './Section'
import type { CodingProfilesBlock } from '../types'

export default function CodingProfiles({ block }: { block: CodingProfilesBlock }) {
  if (!block?.profiles?.length) return null

  return (
    <Section
      id="codingProfiles"
      eyebrow="Practice & Code"
      title={
        <>
          Where I <span className="gradient-text">practice &amp; build</span>
        </>
      }
      sub={block.subtitle}
      alt
    >
      <div className="code-grid">
        {block.profiles.map((profile, i) => (
          <article className="code-card reveal" data-delay={String((i % 3) + 1)} key={profile.platform}>
            <header className="code-card-head">
              <span className="code-icon">
                <Icon name={profile.icon} size={22} />
              </span>
              <div>
                <h3 className="code-platform">{profile.platform}</h3>
                {profile.handle && <span className="code-handle">{profile.handle}</span>}
              </div>
            </header>

            {profile.description && <p className="code-desc">{profile.description}</p>}

            <div className="code-stats">
              {profile.stats?.map((stat) => (
                <div className="code-stat" key={stat.label}>
                  <span className="code-stat-value">{stat.value}</span>
                  <span className="code-stat-label">{stat.label}</span>
                </div>
              ))}
            </div>

            {profile.url ? (
              <a className="btn btn-ghost btn-sm" href={profile.url} target="_blank" rel="noreferrer noopener">
                Visit profile <ExternalLink size={14} />
              </a>
            ) : (
              <span className="code-pending">Link soon</span>
            )}
          </article>
        ))}
      </div>
    </Section>
  )
}
