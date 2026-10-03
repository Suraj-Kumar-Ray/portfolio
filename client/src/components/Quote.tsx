import { useState } from 'react'
import { Check, CheckCircle2, Clock, IndianRupee, Rocket } from 'lucide-react'
import { Icon } from '../icons'
import SubPage from './SubPage'
import InquiryForm from './InquiryForm'
import Process from './Process'
import { WhatsAppGlyph } from './QuickConnect'
import type { ProcessStep, Profile, WorkBlock } from '../types'

/**
 * Standalone, shareable quote page (/quote). This is the link to send a client
 * on WhatsApp — packages, what they get and a qualifying form in one screen.
 */
export default function Quote({
  work,
  profile,
  process,
}: {
  work: WorkBlock
  profile: Profile
  process?: ProcessStep[]
}) {
  const packages = work?.packages || []
  const [selectedPackage, setSelectedPackage] = useState('')

  const digits = profile.phone.replace(/\D/g, '')
  const waNumber = digits.length === 10 ? `91${digits}` : digits

  return (
    <SubPage profile={profile} title={`Get a Quote — ${profile.name}`}>
      <section className="subpage-hero">
        <div className="container">
          <span className="eyebrow">{work?.eyebrow || 'Get a Quote'}</span>
          <h1 className="hero-title" style={{ fontSize: 'clamp(1.9rem, 5vw, 3rem)' }}>
            {work?.quoteTitle || 'Get a clear quote within 24 hours'}
          </h1>
          <p className="hero-tagline" style={{ maxWidth: 720 }}>
            {work?.quoteSub || work?.subtitle}
          </p>
        </div>
      </section>

      <div className="container">
        <div className="work-grid quote-grid">
          {packages.map((pkg, i) => (
            <article className="work-card reveal" key={`${pkg.title}-${i}`}>
              <span className="work-icon">
                <Icon name={pkg.icon} size={22} />
              </span>
              <h3 className="work-title">{pkg.title}</h3>
              <p className="work-desc">{pkg.description}</p>

              {pkg.features?.length > 0 && (
                <ul className="work-features">
                  {pkg.features.map((f) => (
                    <li key={f}>
                      <Check size={14} /> {f}
                    </li>
                  ))}
                </ul>
              )}

              <div className="work-meta">
                {pkg.timeline && (
                  <span className="work-chip">
                    <Clock size={13} /> {pkg.timeline}
                  </span>
                )}
                {pkg.price && (
                  <span className="work-chip price">
                    <IndianRupee size={13} /> {pkg.price}
                  </span>
                )}
              </div>

              <button
                type="button"
                className="btn btn-ghost btn-sm work-cta"
                onClick={() => {
                  setSelectedPackage(pkg.title)
                  document.querySelector('.quote-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                  document.getElementById('quote-projectType')?.focus({ preventScroll: true })
                }}
              >
                Get a quote for this <Rocket size={14} />
              </button>
            </article>
          ))}
        </div>

        <Process steps={process} />

        <div className="work-split" style={{ paddingBottom: 70 }}>
          <aside className="work-side reveal">
            <h3 className="sub-title" style={{ marginBottom: 8 }}>
              Why work with me
            </h3>
            <p style={{ color: 'var(--muted)', fontSize: '0.94rem' }}>{work?.note}</p>

            {work?.points?.length ? (
              <ul className="work-points">
                {work.points.map((point) => (
                  <li key={point}>
                    <CheckCircle2 size={15} /> {point}
                  </li>
                ))}
              </ul>
            ) : null}

            <a
              className="btn btn-primary"
              href={`https://wa.me/${waNumber}?text=${encodeURIComponent(
                `Hi ${profile.name.split(' ')[0]}, I'd like a quote for a project.`,
              )}`}
              target="_blank"
              rel="noreferrer noopener"
              style={{ justifyContent: 'center' }}
            >
              <WhatsAppGlyph /> Chat on WhatsApp
            </a>
          </aside>

          <InquiryForm
            block={work}
            profile={profile}
            defaultProjectType={selectedPackage}
            idPrefix="quote"
            className="contact-form quote-form reveal"
          />
        </div>
      </div>
    </SubPage>
  )
}
