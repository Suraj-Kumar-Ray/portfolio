import { useState } from 'react'
import { Check, CheckCircle2, Clock, IndianRupee, Mail, Rocket, Sparkles } from 'lucide-react'
import { Icon } from '../icons'
import Section from './Section'
import { WhatsAppGlyph } from './QuickConnect'
import Collapse from './Collapse'
import InquiryForm from './InquiryForm'
import Process from './Process'
import type { ProcessStep, Profile, WorkBlock } from '../types'

export default function Work({
  block,
  profile,
  process,
}: {
  block: WorkBlock
  profile: Profile
  process?: ProcessStep[]
}) {
  const packages = block.packages || []
  const [selectedPackage, setSelectedPackage] = useState('')

  // direct WhatsApp escape hatch next to email/phone — leads arrive faster there
  const digits = profile.phone.replace(/\D/g, '')
  const waNumber = digits.length === 10 ? `91${digits}` : digits
  const waHref = `https://wa.me/${waNumber}?text=${encodeURIComponent(
    `Hi ${profile.name.split(' ')[0]}, I would like to discuss a project with you.`,
  )}`

  return (
    <Section
      id="work"
      eyebrow={block.eyebrow || 'Work With Me'}
      title={block.title || "Have an idea? Let's build it together."}
      sub={block.subtitle}
    >
      <Collapse className="work-grid" count={packages.length} limit={3}>
        {packages.map((pkg, i) => (
          <article className="work-card reveal" data-delay={String((i % 4) + 1)} key={`${pkg.title}-${i}`}>
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
                document.getElementById('work')?.querySelector('.work-form')?.scrollIntoView({
                  behavior: 'smooth',
                  block: 'center',
                })
                document.getElementById('work-projectType')?.focus({ preventScroll: true })
              }}
            >
              Enquire about this <Rocket size={14} />
            </button>
          </article>
        ))}
      </Collapse>

      <Process steps={process} />

      <div className="work-split">
        <aside className="work-side reveal">
          <h3 className="sub-title" style={{ marginBottom: 8 }}>
            <Sparkles size={18} /> Why work with me
          </h3>
          <p style={{ color: 'var(--muted)', fontSize: '0.94rem' }}>{block.note}</p>

          {block.points?.length ? (
            <ul className="work-points">
              {block.points.map((point) => (
                <li key={point}>
                  <CheckCircle2 size={15} /> {point}
                </li>
              ))}
            </ul>
          ) : null}

          <div className="work-direct">
            <a className="contact-item" href={`mailto:${profile.email}?subject=Project%20enquiry`}>
              <span className="fact-icon">
                <Mail size={18} />
              </span>
              <span>
                <span className="fact-label">Email</span>
                <br />
                <span className="fact-value">{profile.email}</span>
              </span>
            </a>
            {profile.phone && (
              <a className="contact-item" href={`tel:${profile.phone.replace(/\s/g, '')}`}>
                <span className="fact-icon">
                  <Icon name="phone" size={18} />
                </span>
                <span>
                  <span className="fact-label">Phone / WhatsApp</span>
                  <br />
                  <span className="fact-value">{profile.phone}</span>
                </span>
              </a>
            )}
            <a className="contact-item" href={waHref} target="_blank" rel="noreferrer noopener">
              <span className="fact-icon">
                <WhatsAppGlyph />
              </span>
              <span>
                <span className="fact-label">WhatsApp</span>
                <br />
                <span className="fact-value">Chat now — fastest reply</span>
              </span>
            </a>
          </div>
        </aside>

        <InquiryForm block={block} profile={profile} defaultProjectType={selectedPackage} idPrefix="work" />
      </div>
    </Section>
  )
}
