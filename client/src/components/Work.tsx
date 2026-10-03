import { useState, type FormEvent } from 'react'
import { AlertCircle, Check, CheckCircle2, Clock, IndianRupee, Mail, Rocket, Send, Sparkles } from 'lucide-react'
import { Icon } from '../icons'
import Section from './Section'
import { WhatsAppGlyph } from './QuickConnect'
import Collapse from './Collapse'
import { sendInquiry } from '../api'
import type { InquiryPayload, Profile, WorkBlock } from '../types'

type Status = 'idle' | 'sending' | 'success' | 'error'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

const BUDGETS = ['Not sure yet', 'Under ₹5,000', '₹5,000 – ₹15,000', '₹15,000 – ₹50,000', '₹50,000+']
const TIMELINES = ['As soon as possible', 'Within 1–2 weeks', 'Within a month', 'Flexible']
const OTHER = 'Something else'

const EMPTY = {
  name: '',
  email: '',
  phone: '',
  projectType: '',
  budget: BUDGETS[0],
  timeline: TIMELINES[3],
  message: '',
  website: '',
}

export default function Work({ block, profile }: { block: WorkBlock; profile: Profile }) {
  const packages = block.packages || []
  const [form, setForm] = useState({ ...EMPTY, projectType: packages[0]?.title || OTHER })
  const [errors, setErrors] = useState<Partial<Record<keyof typeof EMPTY, string>>>({})
  const [status, setStatus] = useState<Status>('idle')
  const [feedback, setFeedback] = useState('')

  const set = (key: keyof typeof EMPTY) => (e: { target: { value: string } }) => {
    setForm((f) => ({ ...f, [key]: e.target.value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  const validate = () => {
    const next: Partial<Record<keyof typeof EMPTY, string>> = {}
    if (form.name.trim().length < 2) next.name = 'Please enter your name.'
    if (!EMAIL_RE.test(form.email.trim())) next.email = 'Please enter a valid email address.'
    if (form.message.trim().length < 10) next.message = 'Please describe the project in a few words.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (status === 'sending' || !validate()) return

    setStatus('sending')
    setFeedback('')

    const payload: InquiryPayload = {
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      projectType: form.projectType,
      budget: form.budget,
      timeline: form.timeline,
      message: form.message.trim(),
      website: form.website,
    }

    try {
      const res = await sendInquiry(payload)
      if (res.ok) {
        setStatus('success')
        setFeedback(res.message || 'Thanks! Your enquiry has been sent.')
        setForm({ ...EMPTY, projectType: packages[0]?.title || OTHER })
      } else {
        setStatus('error')
        setFeedback(res.errors?.[0] || res.error || 'Something went wrong. Please try again.')
      }
    } catch {
      setStatus('error')
      setFeedback('Unable to reach the server. Please check your connection and try again.')
    }
  }

  const projectTypes = [...packages.map((p) => p.title), OTHER]

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
                setForm((f) => ({ ...f, projectType: pkg.title }))
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

        <form className="contact-form work-form reveal" data-delay="2" onSubmit={onSubmit} noValidate>
          <h3 className="sub-title" style={{ marginBottom: 6 }}>
            <Send size={18} /> {block.formTitle || 'Start a project'}
          </h3>
          {block.formSub && (
            <p style={{ color: 'var(--muted)', fontSize: '0.93rem', marginBottom: 18 }}>{block.formSub}</p>
          )}

          {status === 'success' && (
            <div className="form-status success" role="status">
              <CheckCircle2 size={18} /> <span>{feedback}</span>
            </div>
          )}
          {status === 'error' && feedback && (
            <div className="form-status error" role="alert">
              <AlertCircle size={18} /> <span>{feedback}</span>
            </div>
          )}

          {/* honeypot — hidden from humans, catches bots */}
          <input
            className="honeypot"
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            value={form.website}
            onChange={set('website')}
            aria-hidden="true"
          />

          <div className="form-row">
            <div className="field">
              <label htmlFor="work-name">
                Your name <span className="req">*</span>
              </label>
              <input
                id="work-name"
                className={`input ${errors.name ? 'error' : ''}`}
                placeholder="Your name or company"
                value={form.name}
                onChange={set('name')}
                aria-invalid={Boolean(errors.name)}
              />
              {errors.name && <p className="field-error">{errors.name}</p>}
            </div>

            <div className="field">
              <label htmlFor="work-email">
                Email <span className="req">*</span>
              </label>
              <input
                id="work-email"
                type="email"
                className={`input ${errors.email ? 'error' : ''}`}
                placeholder="you@company.com"
                value={form.email}
                onChange={set('email')}
                aria-invalid={Boolean(errors.email)}
              />
              {errors.email && <p className="field-error">{errors.email}</p>}
            </div>
          </div>

          <div className="form-row">
            <div className="field">
              <label htmlFor="work-projectType">What do you need?</label>
              <select id="work-projectType" className="input" value={form.projectType} onChange={set('projectType')}>
                {projectTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="work-phone">Phone / WhatsApp (optional)</label>
              <input
                id="work-phone"
                className="input"
                placeholder="+91 ..."
                value={form.phone}
                onChange={set('phone')}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="field">
              <label htmlFor="work-budget">Budget</label>
              <select id="work-budget" className="input" value={form.budget} onChange={set('budget')}>
                {BUDGETS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="work-timeline">When do you need it?</label>
              <select id="work-timeline" className="input" value={form.timeline} onChange={set('timeline')}>
                {TIMELINES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="field">
            <label htmlFor="work-message">
              Project details <span className="req">*</span>
            </label>
            <textarea
              id="work-message"
              className={`textarea ${errors.message ? 'error' : ''}`}
              placeholder="What would you like to build? Share a few pages or screens, features and any reference links..."
              value={form.message}
              onChange={set('message')}
              aria-invalid={Boolean(errors.message)}
            />
            {errors.message && <p className="field-error">{errors.message}</p>}
          </div>

          <button className="btn btn-primary" type="submit" disabled={status === 'sending'} style={{ width: '100%' }}>
            {status === 'sending' ? (
              'Sending...'
            ) : (
              <>
                Send enquiry <Send size={16} />
              </>
            )}
          </button>
          <p className="work-privacy">Your email is only used to reply. No spam, ever.</p>
        </form>
      </div>
    </Section>
  )
}
