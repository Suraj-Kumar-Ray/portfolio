import { useEffect, useState, type FormEvent } from 'react'
import { AlertCircle, CheckCircle2, Send } from 'lucide-react'
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

/**
 * The "start a project" form. Shared by the home "Work with me" section and the
 * standalone /quote page so both send the same qualified lead into the same
 * inbox (and trigger the same email + Telegram alerts).
 */
export default function InquiryForm({
  block,
  profile,
  defaultProjectType,
  idPrefix = 'work',
  className = 'contact-form work-form reveal',
}: {
  block: WorkBlock
  profile: Profile
  /** Lifted so a package card can pre-select "What do you need?". */
  defaultProjectType?: string
  /** Keeps element ids unique when the form appears on more than one page. */
  idPrefix?: string
  className?: string
}) {
  const packages = block.packages || []
  const projectTypes = [...packages.map((p) => p.title), OTHER]
  const first = packages[0]?.title || OTHER

  const [form, setForm] = useState({ ...EMPTY, projectType: defaultProjectType || first })
  const [errors, setErrors] = useState<Partial<Record<keyof typeof EMPTY, string>>>({})
  const [status, setStatus] = useState<Status>('idle')
  const [feedback, setFeedback] = useState('')

  // a package card click updates the select without remounting (no lost typing)
  useEffect(() => {
    if (defaultProjectType) setForm((f) => ({ ...f, projectType: defaultProjectType }))
  }, [defaultProjectType])

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
        setForm({ ...EMPTY, projectType: first })
      } else {
        setStatus('error')
        setFeedback(res.errors?.[0] || res.error || 'Something went wrong. Please try again.')
      }
    } catch {
      setStatus('error')
      setFeedback('Unable to reach the server. Please check your connection and try again.')
    }
  }

  return (
    <form className={className} onSubmit={onSubmit} noValidate>
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
          <label htmlFor={`${idPrefix}-name`}>
            Your name <span className="req">*</span>
          </label>
          <input
            id={`${idPrefix}-name`}
            className={`input ${errors.name ? 'error' : ''}`}
            placeholder="Your name or company"
            value={form.name}
            onChange={set('name')}
            aria-invalid={Boolean(errors.name)}
          />
          {errors.name && <p className="field-error">{errors.name}</p>}
        </div>

        <div className="field">
          <label htmlFor={`${idPrefix}-email`}>
            Email <span className="req">*</span>
          </label>
          <input
            id={`${idPrefix}-email`}
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
          <label htmlFor={`${idPrefix}-projectType`}>What do you need?</label>
          <select
            id={`${idPrefix}-projectType`}
            className="input"
            value={form.projectType}
            onChange={set('projectType')}
          >
            {projectTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor={`${idPrefix}-phone`}>Phone / WhatsApp (optional)</label>
          <input
            id={`${idPrefix}-phone`}
            className="input"
            placeholder="+91 ..."
            value={form.phone}
            onChange={set('phone')}
          />
        </div>
      </div>

      <div className="form-row">
        <div className="field">
          <label htmlFor={`${idPrefix}-budget`}>Budget</label>
          <select id={`${idPrefix}-budget`} className="input" value={form.budget} onChange={set('budget')}>
            {BUDGETS.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor={`${idPrefix}-timeline`}>When do you need it?</label>
          <select id={`${idPrefix}-timeline`} className="input" value={form.timeline} onChange={set('timeline')}>
            {TIMELINES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="field">
        <label htmlFor={`${idPrefix}-message`}>
          Project details <span className="req">*</span>
        </label>
        <textarea
          id={`${idPrefix}-message`}
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
      <p className="work-privacy">
        Your email is only used to reply. No spam, ever — or message me on{' '}
        <a href={`https://wa.me/${waNumber(profile)}`} target="_blank" rel="noreferrer noopener">
          WhatsApp
        </a>
        .
      </p>
    </form>
  )
}

/** Indian numbers are stored as +91-XXXXXXXXXX → keep the 91 wa.me prefix. */
function waNumber(profile: Profile) {
  const digits = profile.phone.replace(/\D/g, '')
  return digits.length === 10 ? `91${digits}` : digits
}
