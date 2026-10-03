import { useState } from 'react'
import { Check, Link2, Linkedin, Share2 } from 'lucide-react'
import { WhatsAppGlyph } from './QuickConnect'

/**
 * Share row — WhatsApp, LinkedIn and copy-link. Visitors (and future clients)
 * forward portfolios in WhatsApp groups, so make sharing one tap.
 */
export default function ShareBar({
  url,
  title,
  label = 'Share',
}: {
  url?: string
  title?: string
  label?: string
}) {
  const pageUrl = url || (typeof window !== 'undefined' ? window.location.href : '')
  const pageTitle = title || (typeof document !== 'undefined' ? document.title : 'Suraj Kumar — Portfolio')
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(pageUrl)
    } catch {
      // older browsers / non-secure contexts
      const ta = document.createElement('textarea')
      ta.value = pageUrl
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      ta.remove()
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="share-bar">
      <span className="share-label">
        <Share2 size={14} /> {label}
      </span>
      <a
        className="share-btn wa"
        href={`https://wa.me/?text=${encodeURIComponent(`${pageTitle} — ${pageUrl}`)}`}
        target="_blank"
        rel="noreferrer noopener"
        aria-label="Share on WhatsApp"
        title="Share on WhatsApp"
      >
        <WhatsAppGlyph />
      </a>
      <a
        className="share-btn"
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(pageUrl)}`}
        target="_blank"
        rel="noreferrer noopener"
        aria-label="Share on LinkedIn"
        title="Share on LinkedIn"
      >
        <Linkedin size={15} />
      </a>
      <button type="button" className="share-btn" onClick={copy} aria-label="Copy link" title="Copy link">
        {copied ? <Check size={15} /> : <Link2 size={15} />}
      </button>
      {copied && <span className="share-copied">Link copied!</span>}
    </div>
  )
}
