import { useState, type FormEvent } from 'react'
import { AlertCircle, CheckCircle2, Globe, Search, Send, Smartphone, Zap } from 'lucide-react'
import SubPage from './SubPage'
import { sendInquiry } from '../api'
import type { AuditBlock, Profile } from '../types'

type Status = 'idle' | 'sending' | 'success' | 'error'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const EMPTY = { name: '', email: '', phone: '', site: '', message: '', website: '' }

/**
 * Free website review (/audit) — the low-friction lead magnet. Visitors who are
 * not ready to buy a project will gladly accept a free review, and every review
 * request arrives as a normal enquiry (same inbox + email + Telegram alert).
 */
export default function Audit({ audit, profile }: { audit?: AuditBlock; profile: Profile }) {
  const [form, setForm] = useState({ ...EMPTY })
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
    if (form.site.trim().length < 3) next.site = 'Please share your website or page URL.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (status === 'sending' || !validate()) return

    setStatus('sending')
    setFeedback('')

    const extra = form.message.trim()
    try {
      const res = await sendInquiry({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        projectType: 'Free website review',
        budget: 'Free',
        timeline: 'Flexible',
        message: `Website: ${form.site.trim()}${extra ? `\n\n${extra}` : ''}`,
        website: form.website,
      })
      if (res.ok) {
        setStatus('success')
        setFeedback(res.message || 'Thanks! I will review your site and reply within 24 hours.')
        setForm({ ...EMPTY })
      } else {
        setStatus('error')
        setFeedback(res.errors?.[0] || res.error || 'Something went wrong. Please try again.')
      }
    } catch {
      setStatus('error')
      setFeedback('Unable to reach the server. Please check your connection and try again.')
    }
  }

  const points = audit?.points || [
    'Speed — what loads slowly and the biggest cause',
    'Mobile — where the layout breaks on a phone',
    'SEO basics — title, description, headings and indexing',
    'The 3 highest-impact fixes, in priority order',
  ]
  const icons = [<Zap size={16} />, <Smartphone size={16} />, <Search size={16} />, <CheckCircle2 size={16} />]

  return (
    <SubPage profile={profile} title={`Free Website Review — ${profile.name}`}>
      <section className="subpage-hero">
        <div className="container">
          <span className="eyebrow">{audit?.badge || 'Free · no obligation'}</span>
          <h1 className="hero-title" style={{ fontSize: 'clamp(1.9rem, 5vw, 3rem)' }}>
            {audit?.title || 'Get a free website review'}
          </h1>
          <p className="hero-tagline" style={{ maxWidth: 760 }}>
            {audit?.subtitle}
          </p>
        </div>
      </section>

      <div className="container">
        <div className="work-split" style={{ paddingBottom: 70 }}>
          <aside className="work-side reveal">
            <h3 className="sub-title" style={{ marginBottom: 10 }}>
              What you get
            </h3>
            <ul className="audit-points">
              {points.map((p, i) => (
                <li key={p}>
                  <span className="audit-ic">{icons[i % icons.length]}</span> {p}
                </li>
              ))}
            </ul>
            <p style={{ color: 'var(--muted)', fontSize: '0.92rem', marginTop: 14 }}>{audit?.note}</p>
          </aside>

          <form className="contact-form reveal" onSubmit={onSubmit} noValidate>
            <h3 className="sub-title" style={{ marginBottom: 6 }}>
              <Globe size={18} /> Send your website
            </h3>
            <p style={{ color: 'var(--muted)', fontSize: '0.93rem', marginBottom: 18 }}>
              Two fields and a link — that's all I need to get started.
            </p>

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

            <div className="field">
              <label htmlFor="audit-site">
                Website URL <span className="req">*</span>
              </label>
              <input
                id="audit-site"
                className={`input ${errors.site ? 'error' : ''}`}
                placeholder="https://example.com"
                value={form.site}
                onChange={set('site')}
                aria-invalid={Boolean(errors.site)}
              />
              {errors.site && <p className="field-error">{errors.site}</p>}
            </div>

            <div className="form-row">
              <div className="field">
                <label htmlFor="audit-name">
                  Your name <span className="req">*</span>
                </label>
                <input
                  id="audit-name"
                  className={`input ${errors.name ? 'error' : ''}`}
                  placeholder="Your name"
                  value={form.name}
                  onChange={set('name')}
                  aria-invalid={Boolean(errors.name)}
                />
                {errors.name && <p className="field-error">{errors.name}</p>}
              </div>

              <div className="field">
                <label htmlFor="audit-email">
                  Email <span className="req">*</span>
                </label>
                <input
                  id="audit-email"
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

            <div className="field">
              <label htmlFor="audit-phone">Phone / WhatsApp (optional)</label>
              <input
                id="audit-phone"
                className="input"
                placeholder="+91 ..."
                value={form.phone}
                onChange={set('phone')}
              />
            </div>

            <div className="field">
              <label htmlFor="audit-message">Anything specific I should look at? (optional)</label>
              <textarea
                id="audit-message"
                className="textarea"
                placeholder="e.g. sales are coming from mobile, or the site feels slow on phones..."
                value={form.message}
                onChange={set('message')}
              />
            </div>

            <button className="btn btn-primary" type="submit" disabled={status === 'sending'} style={{ width: '100%' }}>
              {status === 'sending' ? (
                'Sending...'
              ) : (
                <>
                  Request my free review <Send size={16} />
                </>
              )}
            </button>
            <p className="work-privacy">Free, one review per website. No spam, no pushy calls.</p>
          </form>
        </div>
      </div>
    </SubPage>
  )
}
