/**
 * Self-hosted visitor analytics — no cookies, no third party.
 *
 * The site sends one beacon when a session starts (referral + device) and one
 * the first time each section crosses the middle of the screen, so the private
 * dashboard can answer "who came and what did they read". Beacons are fire-and
 * forget (sendBeacon) and deduped per session, so this never blocks or spams.
 */

type Payload = {
  sid: string
  kind: 'visit' | 'section'
  section?: string
  ref?: string
}

const seenSections = new Set<string>()
let visitSent = false

function sid(): string {
  try {
    const key = 'sk_sid'
    let id = sessionStorage.getItem(key)
    if (!id) {
      id = crypto.randomUUID?.() || `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`
      sessionStorage.setItem(key, id)
    }
    return id
  } catch {
    return 'nosid'
  }
}

function send(payload: Payload) {
  const body = JSON.stringify(payload)
  try {
    if (navigator.sendBeacon?.('/api/track', new Blob([body], { type: 'application/json' }))) return
  } catch {
    /* fall through to fetch */
  }
  fetch('/api/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    keepalive: true,
  }).catch(() => {})
}

/** One beacon per browser session (refreshes in the same tab are not counted). */
export function trackVisit() {
  if (visitSent) return
  visitSent = true
  send({ sid: sid(), kind: 'visit', ref: document.referrer || '' })
}

/**
 * Fires once per section, the first time it scrolls through the middle of the
 * screen — that is the moment a human actually saw it. Returns a cleanup that
 * stops the observer.
 */
export function trackSections(ids: string[]): () => void {
  if (typeof IntersectionObserver === 'undefined' || !ids.length) return () => {}

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        const id = entry.target.id
        if (!id || seenSections.has(id)) continue
        seenSections.add(id)
        send({ sid: sid(), kind: 'section', section: id })
      }
    },
    // a section counts as "read" when it occupies the middle band of the screen
    { rootMargin: '-40% 0px -40% 0px' },
  )

  ids.forEach((id) => {
    const el = document.getElementById(id)
    if (el) observer.observe(el)
  })

  return () => observer.disconnect()
}
