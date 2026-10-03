import { ArrowLeft, ArrowRight, Mail, MessageCircle } from 'lucide-react'
import { WhatsAppGlyph } from './QuickConnect'
import ShareBar from './ShareBar'
import SubPage from './SubPage'
import type { Profile, Project } from '../types'

/**
 * Standalone case-study page (/work/:id) — the deep-dive version of a project
 * card: problem → solution → result, with contact paths kept within reach.
 */
export default function CaseStudy({ project, profile }: { project?: Project; profile: Profile }) {
  const first = profile.name.split(' ')[0]
  const digits = profile.phone.replace(/\D/g, '')
  const waNumber = digits.length === 10 ? `91${digits}` : digits
  const waHref = `https://wa.me/${waNumber}?text=${encodeURIComponent(
    `Hi ${first}, I saw the "${project?.title || 'project'}" case study and I have something similar in mind.`,
  )}`

  if (!project) {
    return (
      <SubPage profile={profile} title={`Case study · ${profile.name}`}>
        <section className="section">
          <div className="container" style={{ textAlign: 'center', padding: '80px 0' }}>
            <h1 className="section-title">Case study not found</h1>
            <p className="section-sub">This project may have been renamed or removed.</p>
            <a className="btn btn-primary" href="/">
              <ArrowLeft size={16} /> Back to portfolio
            </a>
          </div>
        </section>
      </SubPage>
    )
  }

  const cs = project.caseStudy

  return (
    <SubPage profile={profile} title={`${project.title} — Case Study · ${profile.name}`}>
      <header className="subpage-hero">
        <div className="container">
          <span className="eyebrow">Case study</span>
          <h1 className="section-title">{project.title}</h1>
          <p className="section-sub">{project.description}</p>
          <div className="tag-row" style={{ marginTop: 14 }}>
            <span className="tag">{project.category}</span>
            {project.year && <span className="tag">{project.year}</span>}
            {project.tech.map((t) => (
              <span className="tag" key={t}>
                {t}
              </span>
            ))}
          </div>
        </div>
      </header>

      <div className="container case-layout">
        <div className="case-main">
          {cs ? (
            <>
              <section className="case-block">
                <h2 className="case-h2">The problem</h2>
                <p>{cs.problem}</p>
              </section>
              <section className="case-block">
                <h2 className="case-h2">The solution</h2>
                <p>{cs.solution}</p>
              </section>
              <section className="case-block">
                <h2 className="case-h2">The result</h2>
                <p>{cs.result}</p>
              </section>
            </>
          ) : (
            <section className="case-block">
              <h2 className="case-h2">Overview</h2>
              <p>{project.description}</p>
            </section>
          )}

          {project.highlights?.length > 0 && (
            <section className="case-block">
              <h2 className="case-h2">Highlights</h2>
              <ul className="project-highlights">
                {project.highlights.map((h) => (
                  <li key={h}>{h}</li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <aside className="case-side">
          <div className="case-card">
            <h3 className="sub-title">Want something similar?</h3>
            <p style={{ color: 'var(--muted)', fontSize: '0.93rem' }}>
              Tell me about your project — I reply within 24 hours.
            </p>
            <a className="btn btn-primary case-cta" href={waHref} target="_blank" rel="noreferrer noopener">
              <WhatsAppGlyph /> Discuss on WhatsApp
            </a>
            <a
              className="btn btn-ghost case-cta"
              href={`mailto:${profile.email}?subject=${encodeURIComponent(`Project enquiry — like "${project.title}"`)}`}
            >
              <Mail size={16} /> Send an email
            </a>
            <a className="btn btn-ghost case-cta" href="/">
              <MessageCircle size={16} /> More projects
              <ArrowRight size={15} />
            </a>
          </div>

          <ShareBar title={`${project.title} — case study`} label="Share this case study" />
        </aside>
      </div>
    </SubPage>
  )
}
