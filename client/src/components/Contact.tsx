import { useEffect, useState, type FormEvent } from 'react'
import { AlertCircle, Calendar, CheckCircle2, Clock, Mail, MapPin, Phone, Send, UserPlus } from 'lucide-react'
import QRCode from 'qrcode'
import { Icon } from '../icons'
import Section from './Section'
import ShareBar from './ShareBar'
import { sendContact } from '../api'
import type { ContactPayload, Profile } from '../types'

type Status = 'idle' | 'sending' | 'success' | 'error'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

// vCard 3.0 — the one format every phone and contact app understands.
const vEsc = (s: string) =>
  s.replace(/\\/g, '\\\\').replace(/;/g, '\;').replace(/,/g, '\,').replace(/\r?\n/g, '\\n')

function buildVCard(p: Profile) {
  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  const words = p.name.split(' ').filter(Boolean)
  const family = words.length > 1 ? words.pop() || '' : ''
  const given = words.join(' ')
  const photo = p.avatar
    ? p.avatar.startsWith('http')
      ? p.avatar
      : origin + (p.avatar.startsWith('/') ? '' : '/') + p.avatar
    : ''
  const locParts = p.location.split(',').map((s) => s.trim())
  const locality = vEsc(locParts[0] || '')
  const region = vEsc(locParts[1] || '')
  const country = vEsc(locParts[2] || '')
  const tel = p.phone.replace(/[^\d+]/g, '')
  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${vEsc(p.name)}`,
    `N:${vEsc(family)};${vEsc(given)};;;`,
    `TITLE:${vEsc(p.role)}`,
    `EMAIL;TYPE=INTERNET:${p.email}`,
    tel ? `TEL;TYPE=CELL:${tel}` : '',
    locality || region || country
      ? `ADR;TYPE=WORK:;;${locality};${region};;${country}`
      : '',
    `URL:${origin}/`,
    photo ? `PHOTO;TYPE=URL:${photo}` : '',
    p.tagline ? `NOTE:${vEsc(p.tagline)}` : '',
    ...p.socials
      .filter((s) => /^https?:/i.test(s.url))
      .map((s) => `X-SOCIALPROFILE;TYPE=${vEsc(s.label.toLowerCase())}:${s.url}`),
    'END:VCARD',
  ]
  return lines.filter(Boolean).join('\r\n') + '\r\n'
}

export default function Contact({ profile }: { profile: Profile }) {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '', website: '' })
  const [errors, setErrors] = useState<Partial<Record<keyof typeof form, string>>>({})
  const [status, setStatus] = useState<Status>('idle')
  const [feedback, setFeedback] = useState('')

  const validate = () => {
    const next: Partial<Record<keyof typeof form, string>> = {}
    if (form.name.trim().length < 2) next.name = 'Please enter your name.'
    if (!EMAIL_RE.test(form.email.trim())) next.email = 'Please enter a valid email address.'
    if (form.message.trim().length < 10) next.message = 'Message should be at least 10 characters.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const set = (key: keyof typeof form) => (e: { target: { value: string } }) => {
    setForm((f) => ({ ...f, [key]: e.target.value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (status === 'sending' || !validate()) return

    setStatus('sending')
    setFeedback('')

    const payload: ContactPayload = {
      name: form.name.trim(),
      email: form.email.trim(),
      subject: form.subject.trim(),
      message: form.message.trim(),
      website: form.website,
    }

    try {
      const res = await sendContact(payload)
      if (res.ok) {
        setStatus('success')
        setFeedback(res.message || 'Thanks! Your message has been sent.')
        setForm({ name: '', email: '', subject: '', message: '', website: '' })
      } else {
        setStatus('error')
        setFeedback(res.errors?.[0] || res.error || 'Something went wrong. Please try again.')
      }
    } catch {
      setStatus('error')
      setFeedback('Unable to reach the server. Please check your connection and try again.')
    }
  }

  const saveContact = () => {
    const blob = new Blob([buildVCard(profile)], { type: 'text/vcard;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${profile.name.trim().replace(/\s+/g, '-')}.vcf`
    document.body.appendChild(a)
    a.click()
    a.remove()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  // one-tap WhatsApp with a ready-made reason — the visitor never has to think
  // about what to write
  const digits = profile.phone.replace(/\D/g, '')
  const waNumber = digits.length === 10 ? `91${digits}` : digits
  const first = profile.name.split(' ')[0]
  const waLink = (text: string) => `https://wa.me/${waNumber}?text=${encodeURIComponent(text)}`
  const intents = [
    { emoji: '💼', label: 'Job opportunity', text: `Hi ${first}, I have a job opportunity I would like to discuss.` },
    { emoji: '🤝', label: 'Freelance project', text: `Hi ${first}, I have a project I would like to build with you.` },
    { emoji: '👋', label: 'Just saying hi', text: `Hi ${first}, I saw your portfolio and would like to connect.` },
  ]
  // calendar link if the owner added one (panel → Profile), else a callback ask
  const bookingHref = profile.bookingUrl || waLink(`Hi ${first}, I would like to schedule a quick call with you.`)
  const bookingLabel = profile.bookingUrl ? 'Book a call' : 'Request a callback'

  // QR carrying a MECARD — phone cameras open it straight as "add contact"
  const [qr, setQr] = useState('')
  useEffect(() => {
    const card = `MECARD:N:${profile.name};TEL:${profile.phone.replace(/[^\d+]/g, '')};EMAIL:${profile.email};URL:${window.location.origin};;`
    QRCode.toDataURL(card, { margin: 1, width: 220, color: { dark: '#0b1220ff', light: '#ffffffff' } })
      .then(setQr)
      .catch(() => setQr(''))
  }, [profile])

  const details = [
    { icon: <Mail size={18} />, label: 'Email', value: profile.email, href: `mailto:${profile.email}` },
    { icon: <Phone size={18} />, label: 'Phone', value: profile.phone, href: `tel:${profile.phone.replace(/\s/g, '')}` },
    { icon: <MapPin size={18} />, label: 'Location', value: profile.location },
    { icon: <Clock size={18} />, label: 'Availability', value: profile.availability },
  ]

  return (
    <Section
      id="contact"
      eyebrow="Get In Touch"
      title={
        <>
          Let's <span className="gradient-text">work together</span>
        </>
      }
      sub="Have a role, a project or just a question? Drop a message and I'll get back to you within 24 hours."
    >
      <div className="contact-grid">
        <aside className="contact-card reveal">
          <h3 className="sub-title" style={{ marginBottom: 6 }}>
            <Send size={18} /> Contact info
          </h3>
          <p style={{ color: 'var(--muted)', fontSize: '0.93rem' }}>
            Prefer email? Reach me directly — I read every message.
          </p>

          <div className="contact-list">
            {details.map((d) => (
              <div className="contact-item" key={d.label}>
                <span className="fact-icon">{d.icon}</span>
                <span>
                  <span className="fact-label">{d.label}</span>
                  <br />
                  {d.href ? (
                    <a className="fact-value" href={d.href}>
                      {d.value}
                    </a>
                  ) : (
                    <span className="fact-value">{d.value}</span>
                  )}
                </span>
              </div>
            ))}
          </div>

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
                <Icon name={social.icon} size={19} />
              </a>
            ))}
          </div>

          <button className="btn btn-ghost save-vcard" type="button" onClick={saveContact}>
            <UserPlus size={17} /> Save my contact
          </button>

          {/* quick WhatsApp with a pre-filled reason — fastest path to a reply */}
          <div className="wa-intents">
            <p className="fact-label">Quick WhatsApp</p>
            <div className="wa-intent-row">
              {intents.map((it) => (
                <a
                  className="wa-chip"
                  key={it.label}
                  href={waLink(it.text)}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  <span aria-hidden="true">{it.emoji}</span> {it.label}
                </a>
              ))}
            </div>
          </div>

          <a className="btn btn-primary book-call" href={bookingHref} target="_blank" rel="noreferrer noopener">
            <Calendar size={17} /> {bookingLabel}
          </a>

          {qr && (
            <div className="qr-block">
              <img className="qr-img" src={qr} alt="QR code with my contact details" />
              <p className="qr-caption">Scan to save my contact</p>
            </div>
          )}

          <ShareBar label="Share my portfolio" />
        </aside>

        <form className="contact-form reveal" data-delay="2" onSubmit={onSubmit} noValidate>
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
              <label htmlFor="name">
                Your name <span className="req">*</span>
              </label>
              <input
                id="name"
                className={`input ${errors.name ? 'error' : ''}`}
                placeholder="Jane Doe"
                value={form.name}
                onChange={set('name')}
                aria-invalid={Boolean(errors.name)}
              />
              {errors.name && <p className="field-error">{errors.name}</p>}
            </div>

            <div className="field">
              <label htmlFor="email">
                Email <span className="req">*</span>
              </label>
              <input
                id="email"
                type="email"
                className={`input ${errors.email ? 'error' : ''}`}
                placeholder="jane@company.com"
                value={form.email}
                onChange={set('email')}
                aria-invalid={Boolean(errors.email)}
              />
              {errors.email && <p className="field-error">{errors.email}</p>}
            </div>
          </div>

          <div className="field">
            <label htmlFor="subject">Subject</label>
            <input
              id="subject"
              className="input"
              placeholder="Full-time role · Frontend developer"
              value={form.subject}
              onChange={set('subject')}
            />
          </div>

          <div className="field">
            <label htmlFor="message">
              Message <span className="req">*</span>
            </label>
            <textarea
              id="message"
              className={`textarea ${errors.message ? 'error' : ''}`}
              placeholder="Tell me about the role or project, timeline and how I can help..."
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
                Send Message <Send size={16} />
              </>
            )}
          </button>
        </form>
      </div>
    </Section>
  )
}
