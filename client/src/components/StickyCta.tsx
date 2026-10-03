import { ArrowUpRight, Phone, Sparkles } from 'lucide-react'
import { WhatsAppGlyph } from './QuickConnect'
import type { Profile } from '../types'

/**
 * Mobile-only sticky action bar (hidden on desktop, where the floating
 * QuickConnect rail already covers WhatsApp + call). On phones this becomes the
 * single always-visible way to act: get a quote, message on WhatsApp, or call.
 */
export default function StickyCta({ profile }: { profile: Profile }) {
  const digits = profile.phone.replace(/\D/g, '')
  const waNumber = digits.length === 10 ? `91${digits}` : digits
  const waHref = `https://wa.me/${waNumber}?text=${encodeURIComponent(
    `Hi ${profile.name.split(' ')[0]}, I saw your portfolio and would like to talk.`,
  )}`

  return (
    <div className="sticky-cta" role="group" aria-label="Quick actions">
      <a className="sticky-btn sticky-quote" href="/quote">
        <Sparkles size={17} /> Get a quote <ArrowUpRight size={14} />
      </a>
      <a
        className="sticky-btn sticky-wa"
        href={waHref}
        target="_blank"
        rel="noreferrer noopener"
        aria-label="Chat on WhatsApp"
      >
        <WhatsAppGlyph />
      </a>
      <a
        className="sticky-btn sticky-call"
        href={`tel:${profile.phone.replace(/[^\d+]/g, '')}`}
        aria-label="Call"
      >
        <Phone size={19} />
      </a>
    </div>
  )
}
