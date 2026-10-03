import dotenv from 'dotenv'
import express from 'express'
import cors from 'cors'
import crypto from 'node:crypto'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// load server/.env regardless of the folder the server was started from
const ENV_FILE = path.join(__dirname, '..', '.env')
dotenv.config({ path: ENV_FILE, override: true })

const DATA_DIR = path.join(__dirname, '..', 'data')
const CONTENT_FILE = path.join(DATA_DIR, 'content.json')
const MESSAGES_FILE = path.join(DATA_DIR, 'messages.json')
const ANALYTICS_FILE = path.join(DATA_DIR, 'analytics.json')

const envPort = Number(process.env.PORT)
const PORT = Number.isInteger(envPort) && envPort > 0 ? envPort : 5000
let ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'admin123'
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173'
const isProduction = process.env.NODE_ENV === 'production'

// Live site with a default password would hand the control panel to anyone.
// Refuse to boot in production until the owner sets a real password.
if (isProduction && !process.env.ADMIN_TOKEN) {
  console.error('\n  FATAL: ADMIN_TOKEN is not set — refusing to start in production.')
  console.error('  Set it in server/.env (local runs) or in your host\'s Environment tab')
  console.error('  (Render / Railway → Environment → Add:  ADMIN_TOKEN = <your password>)')
  console.error('  then redeploy.\n')
  process.exit(1)
}
if (isProduction && process.env.ADMIN_TOKEN === 'admin123') {
  console.warn('\n  WARNING: ADMIN_TOKEN is the weak default "admin123" — change it!\n')
}

// The control panel lives on a secret, unguessable URL so visitors never see it.
// Change ADMIN_PATH in server/.env whenever you like. `/admin` on purpose does NOT work.
const ADMIN_PATH = (() => {
  let p = String(process.env.ADMIN_PATH || '/panel').trim()
  if (!p.startsWith('/')) p = '/' + p
  if (p.length > 1) p = p.replace(/\/+$/, '')
  return p
})()

const app = express()
app.disable('x-powered-by')
// Behind Render's (or any) reverse proxy: without this every visitor would
// share the proxy's IP — breaking rate limits, analytics dedupe and https URLs.
app.set('trust proxy', 1)
app.use(express.json({ limit: '100kb' }))
app.use(
  cors({
    origin: isProduction ? false : [CLIENT_ORIGIN, 'http://127.0.0.1:5173'],
  })
)

// --- security headers -------------------------------------------------------
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'SAMEORIGIN')
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  next()
})

// --- data helpers -----------------------------------------------------------
function readJson(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'))
  } catch (err) {
    if (err.code !== 'ENOENT') console.error(`[data] could not read ${file}:`, err.message)
    return fallback
  }
}

function writeJson(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8')
}

const getContent = () => readJson(CONTENT_FILE, {})
const getMessages = () => readJson(MESSAGES_FILE, [])

// --- analytics storage -------------------------------------------------------
// Events live in a git-ignored file, pruned to the last 90 days / 8000 events.
// Beacons arrive faster than a disk write deserves, so they are queued and
// flushed at most every few seconds (and on process exit).
const ANALYTICS_MAX = 8000
const ANALYTICS_DAYS = 90
let analyticsQueue = []
let analyticsTimer = null

function pruneEvents(list) {
  const cutoff = Date.now() - ANALYTICS_DAYS * 864e5
  const kept = Array.isArray(list) ? list.filter((e) => e && e.t && Date.parse(e.t) >= cutoff) : []
  return kept.length > ANALYTICS_MAX ? kept.slice(-ANALYTICS_MAX) : kept
}

const getAnalytics = () => pruneEvents(readJson(ANALYTICS_FILE, []))

function flushAnalytics() {
  if (!analyticsQueue.length) return
  const events = getAnalytics().concat(analyticsQueue)
  analyticsQueue = []
  writeJson(ANALYTICS_FILE, pruneEvents(events))
}

function queueEvent(event) {
  analyticsQueue.push(event)
  if (!analyticsTimer) {
    analyticsTimer = setTimeout(() => {
      analyticsTimer = null
      flushAnalytics()
    }, 4000)
    analyticsTimer.unref?.()
  }
}

// best-effort flush when the server stops
process.on('exit', flushAnalytics)

// local calendar day (YYYY-MM-DD) so "today" matches the owner's timezone
function dayKey(value = new Date()) {
  const d = new Date(value)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function publicContent() {
  const { meta = {}, profile = {}, ...rest } = getContent()
  return {
    meta,
    profile,
    ...rest,
    updatedAt: new Date().toISOString(),
  }
}

// --- rate limiting (in-memory, per IP) --------------------------------------
const buckets = new Map()

function makeLimiter(name, windowMs, max, message) {
  return function limit(req, res, next) {
    const id = `${name}:${req.ip || req.socket.remoteAddress || 'unknown'}`
    const now = Date.now()
    const list = (buckets.get(id) || []).filter((t) => now - t < windowMs)
    if (list.length >= max) {
      res.setHeader('Retry-After', Math.ceil(windowMs / 1000))
      return res.status(429).json({ ok: false, error: message })
    }
    list.push(now)
    buckets.set(id, list)
    next()
  }
}

const rateLimit = makeLimiter('contact', 15 * 60 * 1000, 8, 'Too many requests. Please try again later.')
// project enquiries from the "Work with me" section
const inquiryLimit = makeLimiter('inquiry', 15 * 60 * 1000, 6, 'Too many enquiries. Please try again later.')
// guard the panel against password guessing
const adminLimit = makeLimiter('admin', 10 * 60 * 1000, 15, 'Too many attempts. Please wait a few minutes and try again.')

// How often the public site may ask "where is the panel?" (see /api/admin/entry).
// Keeps the URL out of the page markup and out of people's faces.
const entryLimit = makeLimiter('entry', 60 * 1000, 10, 'Too many requests.')
// visitor beacons: generous, a scrolling page sends a handful per session
const trackLimit = makeLimiter('track', 60 * 1000, 60, 'Too many requests.')

setInterval(() => {
  const now = Date.now()
  for (const [id, list] of buckets) {
    const kept = list.filter((t) => now - t < 15 * 60 * 1000)
    kept.length ? buckets.set(id, kept) : buckets.delete(id)
  }
}, 5 * 60 * 1000).unref?.()

// --- validation -------------------------------------------------------------
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

function validateContact(body) {
  const errors = []
  const name = String(body.name || '').trim()
  const email = String(body.email || '').trim()
  const subject = String(body.subject || '').trim()
  const message = String(body.message || '').trim()

  if (name.length < 2) errors.push('Please enter your name (at least 2 characters).')
  if (name.length > 120) errors.push('Name is too long.')
  if (!EMAIL_RE.test(email)) errors.push('Please enter a valid email address.')
  if (email.length > 200) errors.push('Email is too long.')
  if (message.length < 10) errors.push('Message should be at least 10 characters.')
  if (message.length > 5000) errors.push('Message is too long (max 5000 characters).')
  if (subject.length > 200) errors.push('Subject is too long.')

  return {
    errors,
    value: { name, email, subject: subject || 'Portfolio enquiry', message },
  }
}

// --- API routes -------------------------------------------------------------
const api = express.Router()

api.get('/health', (req, res) => {
  res.json({ ok: true, uptime: process.uptime(), ts: Date.now() })
})

api.get('/content', (req, res) => res.json({ ok: true, data: publicContent() }))

const CONTENT_KEYS = [
  'meta',
  'sections',
  'profile',
  'services',
  'work',
  'skills',
  'tools',
  'experience',
  'education',
  'certifications',
  'achievements',
  'codingProfiles',
  'gallery',
  'updates',
  'testimonials',
  'faq',
]

for (const key of CONTENT_KEYS) {
  api.get(`/${key}`, (req, res) => {
    const content = getContent()
    const value = content[key]
    // objects (blocks) stay objects, lists fall back to an empty array
    res.json({ ok: true, data: value ?? (key === 'meta' || key === 'profile' ? {} : []) })
  })
}

api.get('/projects', (req, res) => {
  const projects = getContent().projects || []
  const { category, featured } = req.query
  let data = projects
  if (category && category !== 'All') {
    data = data.filter((p) => String(p.category).toLowerCase() === String(category).toLowerCase())
  }
  if (featured === 'true') data = data.filter((p) => p.featured)
  const categories = ['All', ...new Set(projects.map((p) => p.category))]
  res.json({ ok: true, data, categories })
})

api.get('/projects/:id', (req, res) => {
  const project = (getContent().projects || []).find((p) => p.id === req.params.id)
  if (!project) return res.status(404).json({ ok: false, error: 'Project not found.' })
  res.json({ ok: true, data: project })
})

// --- "work with me" project enquiry -----------------------------------------
// Same inbox as the contact form, but tagged `kind: "inquiry"` and carrying the
// project type / budget / timeline so freelance leads stand out.
function validateInquiry(body) {
  const errors = []
  const name = String(body.name || '').trim()
  const email = String(body.email || '').trim()
  const phone = String(body.phone || '').trim()
  const projectType = String(body.projectType || '').trim() || 'Not specified'
  const budget = String(body.budget || '').trim() || 'Not specified'
  const timeline = String(body.timeline || '').trim() || 'Not specified'
  const message = String(body.message || '').trim()

  if (name.length < 2) errors.push('Please enter your name (at least 2 characters).')
  if (name.length > 120) errors.push('Name is too long.')
  if (!EMAIL_RE.test(email)) errors.push('Please enter a valid email address.')
  if (phone.length > 40) errors.push('Phone number is too long.')
  if (message.length < 10) errors.push('Project details should be at least 10 characters.')
  if (message.length > 5000) errors.push('Project details are too long (max 5000 characters).')
  if (projectType.length > 120 || budget.length > 60 || timeline.length > 60) {
    errors.push('One of the selections is too long.')
  }

  return { errors, value: { name, email, phone, projectType, budget, timeline, message } }
}

api.post('/inquiry', inquiryLimit, (req, res) => {
  const body = req.body || {}

  // Honeypot: bots fill hidden fields. Pretend success, store nothing.
  if (body.website || body.fax) {
    return res.json({ ok: true, message: 'Thanks! Your enquiry has been sent.' })
  }

  const { errors, value } = validateInquiry(body)
  if (errors.length) return res.status(400).json({ ok: false, errors })

  const messages = getMessages()
  const record = {
    id: `msg_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`,
    kind: 'inquiry',
    ...value,
    subject: `Project enquiry — ${value.projectType}`,
    userAgent: req.get('user-agent') || '',
    ip: req.ip || '',
    read: false,
    createdAt: new Date().toISOString(),
  }
  messages.push(record)
  writeJson(MESSAGES_FILE, messages)

  console.log(`[inquiry] ${record.name} (${record.email}) → ${record.projectType} · ${record.budget}`)
  res.status(201).json({
    ok: true,
    message: 'Thanks! Your enquiry reached my inbox — I will reply within 24 hours.',
    id: record.id,
  })
})

api.post('/contact', rateLimit, (req, res) => {
  const body = req.body || {}

  // Honeypot: bots fill hidden fields. Pretend success, store nothing.
  if (body.website || body.fax) {
    return res.json({ ok: true, message: 'Thanks! Your message has been sent.' })
  }

  const { errors, value } = validateContact(body)
  if (errors.length) return res.status(400).json({ ok: false, errors })

  const messages = getMessages()
  const record = {
    id: `msg_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`,
    kind: 'contact',
    ...value,
    userAgent: req.get('user-agent') || '',
    ip: req.ip || '',
    read: false,
    createdAt: new Date().toISOString(),
  }
  messages.push(record)
  writeJson(MESSAGES_FILE, messages)

  console.log(`[contact] new message from ${record.email}: "${record.subject}"`)
  res.status(201).json({
    ok: true,
    message: 'Thanks! Your message has been sent — I usually reply within 24 hours.',
    id: record.id,
  })
})

// --- visitor analytics (public beacon) --------------------------------------
// Privacy-friendly and fully self-hosted: no cookies, no third party. The site
// sends one beacon per session and one the first time each section is read.
api.post('/track', trackLimit, (req, res) => {
  const ua = String(req.get('user-agent') || '')
  const body = req.body || {}

  // crawlers, prefetchers and preview renderers are not visitors
  if (!ua || /bot|spider|crawler|slurp|headless|lighthouse|preview/i.test(ua)) {
    return res.json({ ok: true })
  }
  if (body.website || body.fax) return res.json({ ok: true }) // honeypot safety net

  const kind = body.kind === 'section' ? 'section' : 'visit'
  const section =
    kind === 'section'
      ? String(body.section || '').replace(/[^a-zA-Z0-9]/g, '').slice(0, 40) || null
      : null
  const ip = req.ip || req.socket.remoteAddress || ''

  // Same person, same IP: a refresh (or a page rendered in several frames)
  // within 5 minutes is still one visit, and a section re-read within 10
  // minutes is not a new view — keeps the numbers honest.
  const recent = getAnalytics().concat(analyticsQueue)
  if (kind === 'visit') {
    const lastVisit = [...recent].reverse().find((e) => e.k === 'visit' && e.ip === ip)
    if (lastVisit && Date.now() - Date.parse(lastVisit.t) < 5 * 60 * 1000) {
      return res.json({ ok: true })
    }
  } else {
    const recentSection = recent.find(
      (e) => e.k === 'section' && e.s === section && e.ip === ip && Date.now() - Date.parse(e.t) < 10 * 60 * 1000,
    )
    if (recentSection) return res.json({ ok: true })
  }

  queueEvent({
    t: new Date().toISOString(),
    k: kind,
    sid: String(body.sid || '').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 40) || null,
    s: section,
    r: kind === 'visit' ? String(body.ref || '').slice(0, 200) : '',
    ip,
    dv: /android|iphone|ipad|mobile|windows phone/i.test(ua) ? 'Mobile' : 'Desktop',
  })
  res.json({ ok: true })
})

// --- admin routes -----------------------------------------------------------
function safeEqual(a = '', b = '') {
  const bufA = Buffer.from(String(a))
  const bufB = Buffer.from(String(b))
  if (bufA.length !== bufB.length) return false
  return crypto.timingSafeEqual(bufA, bufB)
}

function adminTokenFrom(req) {
  const header = req.get('x-admin-token')
  if (header) return header
  const auth = req.get('authorization') || ''
  return auth.startsWith('Bearer ') ? auth.slice(7) : ''
}

function requireAdmin(req, res, next) {
  if (!safeEqual(adminTokenFrom(req), ADMIN_TOKEN)) {
    return res.status(401).json({ ok: false, error: 'Unauthorized.' })
  }
  next()
}

// --- sections (public read) -------------------------------------------------
api.get('/sections', (req, res) => {
  res.json({ ok: true, data: getContent().sections || [] })
})

// --- panel entry point ------------------------------------------------------
// The public site only calls this when someone clicks the tiny footer icon.
// Returning the URL at click time means the secret path never sits in the HTML
// or the JS bundle, and changing ADMIN_PATH in server/.env needs no client rebuild.
api.get('/admin/entry', entryLimit, (req, res) => {
  res.json({ ok: true, data: { path: ADMIN_PATH } })
})

// --- panel login + summary (admin) ------------------------------------------
api.post('/admin/login', adminLimit, (req, res) => {
  const token = String((req.body || {}).token || '')
  if (!safeEqual(token, ADMIN_TOKEN)) {
    return res.status(401).json({ ok: false, error: 'That password is not correct.' })
  }
  res.json({ ok: true, data: { ok: true } })
})

api.get('/admin/overview', requireAdmin, (req, res) => {
  const content = getContent()
  const sections = Array.isArray(content.sections) ? content.sections : []
  const projects = Array.isArray(content.projects) ? content.projects : []
  const messages = getMessages()
  let stat = null
  try {
    stat = fs.statSync(CONTENT_FILE)
  } catch {
    stat = null
  }
  res.json({
    ok: true,
    data: {
      siteName: content.meta?.siteName || content.profile?.name || 'Portfolio',
      ownerName: content.profile?.name || '',
      sectionsVisible: sections.filter((s) => s.enabled).length,
      sectionsTotal: sections.length,
      projects: projects.length,
      projectsFeatured: projects.filter((p) => p.featured).length,
      messages: messages.length,
      unread: messages.filter((m) => !m.read).length,
      contentBytes: stat ? stat.size : 0,
      contentUpdatedAt: stat ? stat.mtime.toISOString() : null,
      resumeReady: fs.existsSync(path.join(DATA_DIR, 'resume.pdf')),
      adminPath: ADMIN_PATH,
    },
  })
})

// --- visitor analytics summary (admin) --------------------------------------
api.get('/admin/analytics', requireAdmin, (req, res) => {
  const events = getAnalytics().concat(analyticsQueue)
  const since = (days) => {
    const cutoff = Date.now() - days * 864e5
    return (e) => Date.parse(e.t) >= cutoff
  }
  const hostOf = (raw) => {
    const trimmed = String(raw || '').trim()
    if (!trimmed) return 'Direct'
    try {
      const u = new URL(trimmed)
      const host = u.hostname.replace(/^www\./, '')
      const self = String(req.get('host') || '').split(':')[0]
      if (host === self || host === 'localhost' || host === '127.0.0.1') return 'Direct'
      return host
    } catch {
      return 'Direct'
    }
  }

  const visits = events.filter((e) => e.k === 'visit')
  const today = dayKey()
  const v7 = visits.filter(since(7))
  const v30 = visits.filter(since(30))
  const recent30 = events.filter(since(30))

  const daily = Array.from({ length: 14 }, (_, i) => {
    const d = dayKey(new Date(Date.now() - (13 - i) * 864e5))
    return { d, v: visits.filter((e) => dayKey(e.t) === d).length }
  })

  const tally = (list, pick) => {
    const map = new Map()
    list.forEach((item) => {
      const key = pick(item)
      if (key) map.set(key, (map.get(key) || 0) + 1)
    })
    return [...map.entries()].sort((a, b) => b[1] - a[1])
  }

  const devices = Object.fromEntries(tally(v30, (e) => e.dv || 'Desktop'))

  res.json({
    ok: true,
    data: {
      totals: {
        all: visits.length,
        today: visits.filter((e) => dayKey(e.t) === today).length,
        d7: v7.length,
        d30: v30.length,
        unique7: new Set(v7.map((e) => e.ip).filter(Boolean)).size,
      },
      daily,
      sections: tally(recent30.filter((e) => e.s), (e) => e.s)
        .slice(0, 8)
        .map(([k, v]) => ({ k, v })),
      refs: tally(v30, (e) => hostOf(e.r))
        .slice(0, 6)
        .map(([k, v]) => ({ k, v })),
      devices,
      recent: events.slice(-15).reverse().map((e) => ({
        t: e.t,
        ip: e.ip,
        dv: e.dv,
        r: hostOf(e.r),
        s: e.s,
        k: e.k,
      })),
    },
  })
})

api.post('/admin/password', adminLimit, requireAdmin, (req, res) => {
  const body = req.body || {}
  const current = String(body.currentToken || '')
  const next = String(body.newToken || '').trim()
  if (!safeEqual(current, ADMIN_TOKEN)) {
    return res.status(401).json({ ok: false, error: 'Current password is not correct.' })
  }
  if (next.length < 8) {
    return res.status(400).json({ ok: false, error: 'New password must be at least 8 characters.' })
  }
  ADMIN_TOKEN = next
  process.env.ADMIN_TOKEN = next
  try {
    let envText = fs.existsSync(ENV_FILE) ? fs.readFileSync(ENV_FILE, 'utf8') : ''
    if (/^ADMIN_TOKEN=.*$/m.test(envText)) {
      envText = envText.replace(/^ADMIN_TOKEN=.*$/m, `ADMIN_TOKEN=${next}`)
    } else {
      envText += `${envText.endsWith('\n') || !envText ? '' : '\n'}ADMIN_TOKEN=${next}\n`
    }
    fs.writeFileSync(ENV_FILE, envText, 'utf8')
  } catch (err) {
    return res.status(500).json({
      ok: false,
      error: `Password changed for this session, but server/.env could not be updated: ${err.message}`,
    })
  }
  res.json({ ok: true, message: 'Password updated.' })
})

// --- content control (admin) ------------------------------------------------
api.get('/admin/content', requireAdmin, (req, res) => {
  res.json({ ok: true, data: getContent() })
})

api.put('/admin/content', requireAdmin, (req, res) => {
  const body = req.body
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return res.status(400).json({ ok: false, error: 'Body must be a JSON object.' })
  }
  // shallow-merge top-level keys so partial edits are safe
  const merged = { ...getContent(), ...body }
  writeJson(CONTENT_FILE, merged)
  res.json({ ok: true, data: merged })
})

api.patch('/admin/sections/:key', requireAdmin, (req, res) => {
  const { key } = req.params
  const { enabled } = req.body || {}
  if (typeof enabled !== 'boolean') {
    return res.status(400).json({ ok: false, error: '`enabled` must be true or false.' })
  }
  const content = getContent()
  const sections = Array.isArray(content.sections) ? content.sections : []
  const section = sections.find((s) => s.key === key)
  if (!section) return res.status(404).json({ ok: false, error: `Section "${key}" not found.` })

  section.enabled = enabled
  content.sections = sections
  writeJson(CONTENT_FILE, content)
  console.log(`[sections] ${key} → ${enabled ? 'visible' : 'hidden'}`)
  res.json({ ok: true, data: section })
})

api.get('/messages', requireAdmin, (req, res) => {
  const messages = getMessages().sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  res.json({ ok: true, data: messages, total: messages.length })
})

api.patch('/messages/:id', requireAdmin, (req, res) => {
  const messages = getMessages()
  const message = messages.find((m) => m.id === req.params.id)
  if (!message) return res.status(404).json({ ok: false, error: 'Not found.' })
  if (typeof (req.body || {}).read === 'boolean') message.read = req.body.read
  writeJson(MESSAGES_FILE, messages)
  res.json({ ok: true, data: message })
})

api.delete('/messages/:id', requireAdmin, (req, res) => {
  const messages = getMessages()
  const next = messages.filter((m) => m.id !== req.params.id)
  if (next.length === messages.length) return res.status(404).json({ ok: false, error: 'Not found.' })
  writeJson(MESSAGES_FILE, next)
  res.json({ ok: true })
})

app.use('/api', api)

// --- admin control panel (secret URL, never indexed) ------------------------
const ADMIN_HTML = path.join(__dirname, '..', 'admin', 'admin.html')

app.get(ADMIN_PATH, (req, res, next) => {
  if (!fs.existsSync(ADMIN_HTML)) return next()
  res.setHeader('Cache-Control', 'no-store')
  // keep the panel out of every search engine and link preview
  res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive, nosnippet')
  res.setHeader('Referrer-Policy', 'no-referrer')
  res.sendFile(ADMIN_HTML)
})

// --- SEO: absolute base URL, robots.txt, sitemap.xml ------------------------
// Sitemap / robots / JSON-LD need absolute URLs. Set SITE_URL in server/.env
// after deploying (e.g. SITE_URL=https://surajkumar.onrender.com); locally the
// request's own host is used, so everything works out of the box.
const SITE_URL = String(process.env.SITE_URL || '').replace(/\/+$/, '')
const siteBase = (req) => SITE_URL || `${req.protocol}://${req.get('host') || `localhost:${PORT}`}`
const escXml = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

// robots.txt deliberately does NOT mention the panel path (that would leak it)
app.get('/robots.txt', (req, res) => {
  const base = siteBase(req)
  res.type('text/plain').send(
    'User-agent: *\n' +
      'Allow: /\n' +
      'Disallow: /api/\n' +
      'Disallow: /resume.html\n' +
      '\n' +
      `Sitemap: ${base}/sitemap.xml\n`,
  )
})

// --- resume: web version + PDF download ------------------------------------
const RESUME_HTML = path.join(__dirname, '..', '..', 'resume', 'resume.html')

app.get(['/resume', '/resume.html'], (req, res, next) => {
  if (!fs.existsSync(RESUME_HTML)) return next()
  res.setHeader('Cache-Control', 'no-cache')
  res.sendFile(RESUME_HTML)
})

app.get('/api/resume', (req, res) => {
  const resumePath = path.join(DATA_DIR, 'resume.pdf')
  if (fs.existsSync(resumePath)) {
    return res.download(resumePath, 'Suraj-Kumar-Resume.pdf')
  }
  res.status(404).json({ ok: false, error: 'Resume not found. Add server/data/resume.pdf' })
})

// One-page portfolio + resume: that is the whole public surface.
app.get('/sitemap.xml', (req, res) => {
  const base = siteBase(req)
  let lastmod = new Date().toISOString().slice(0, 10)
  try {
    lastmod = fs.statSync(CONTENT_FILE).mtime.toISOString().slice(0, 10)
  } catch {
    /* keep today's date */
  }
  const pages = [{ loc: `${base}/`, freq: 'monthly', pri: '1.0' }]
  if (fs.existsSync(RESUME_HTML)) pages.push({ loc: `${base}/resume`, freq: 'yearly', pri: '0.5' })
  const xml =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    pages
      .map(
        (p) =>
          `  <url>\n    <loc>${escXml(p.loc)}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${p.freq}</changefreq>\n    <priority>${p.pri}</priority>\n  </url>`,
      )
      .join('\n') +
    '\n</urlset>\n'
  res.type('application/xml').send(xml)
})

// --- 404 for unknown API routes --------------------------------------------
app.use('/api', (req, res) => res.status(404).json({ ok: false, error: 'Not found.' }))

// --- static client (production) --------------------------------------------
const CLIENT_DIST = path.join(__dirname, '..', '..', 'client', 'dist')

// Schema.org Person, built from content.json so it always matches what the
// panel shows (name, role, email, socials, education, skills). Injected into
// the served HTML — search engines get it without running any JavaScript.
function personJsonLd(base) {
  const content = getContent()
  const p = content.profile || {}
  const meta = content.meta || {}
  const loc = String(p.location || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  const socialUrls = (Array.isArray(p.socials) ? p.socials : []).map((s) => s.url)
  const codingUrls = ((content.codingProfiles || {}).profiles || []).map((x) => x.url)
  const sameAs = [...socialUrls, ...codingUrls].filter((u) => /^https?:\/\//.test(String(u || '')))
  const knowsAbout = (Array.isArray(content.skills) ? content.skills : [])
    .flatMap((g) => (g.items || []).map((i) => i.name))
    .filter(Boolean)
    .slice(0, 15)
  const alumniOf = (Array.isArray(content.education) ? content.education : [])
    .filter((e) => /university|institute|college/i.test(String(e.school || '')))
    .map((e) => ({ '@type': 'CollegeOrUniversity', name: e.school }))
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: p.name || meta.siteName || 'Suraj Kumar',
    jobTitle: p.role || undefined,
    description: meta.description || p.tagline || undefined,
    url: `${base}/`,
    image: p.avatar ? (p.avatar.startsWith('http') ? p.avatar : base + (p.avatar.startsWith('/') ? '' : '/') + p.avatar) : undefined,
    email: p.email || undefined,
    telephone: p.phone || undefined,
    address: loc.length
      ? {
          '@type': 'PostalAddress',
          addressLocality: loc[0],
          addressRegion: loc[1] || undefined,
          addressCountry: loc[2] || undefined,
        }
      : undefined,
    sameAs,
    alumniOf,
    knowsAbout,
  }
}

function sendIndex(req, res) {
  fs.readFile(path.join(CLIENT_DIST, 'index.html'), 'utf8', (err, html) => {
    if (err) {
      return res.status(500).send('Client build missing — run: cd client && npm run build')
    }
    const ld = JSON.stringify(personJsonLd(siteBase(req))).replace(/</g, '\\u003c')
    const base = siteBase(req)
    res.setHeader('Cache-Control', 'no-cache')
    res.type('html').send(
      html.replace('</head>', () =>
        [
          `<link rel="canonical" href="${escXml(base + '/')}" />`,
          `<meta property="og:url" content="${escXml(base + '/')}" />`,
          `<script type="application/ld+json">${ld}</script>`,
        ]
          .map((t) => `  ${t}`)
          .join('\n') +
          '\n  </head>',
      ),
    )
  })
}

if (fs.existsSync(CLIENT_DIST)) {
  // before express.static so `/` and `/index.html` get the injected JSON-LD
  app.get(['/', '/index.html'], sendIndex)
  app.use(
    express.static(CLIENT_DIST, {
      index: 'index.html',
      maxAge: '1y',
      // HTML and loose images must be revalidated so replaced files/crops
      // never leave a stale page or avatar behind. Hashed assets keep the long cache.
      setHeaders: (res, filePath) => {
        // The service worker and the PWA manifest must never go stale, and HTML /
        // loose images are revalidated so a replaced file never sticks around.
        if (
          /\.(html|jpg|jpeg|png|svg|webp|gif|ico|webmanifest)$/i.test(filePath) ||
          filePath.endsWith('sw.js')
        ) {
          res.setHeader('Cache-Control', 'no-cache')
        }
      },
    })
  )
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next()
    sendIndex(req, res)
  })
}

// --- error handler ----------------------------------------------------------
app.use((err, req, res, next) => {
  console.error('[error]', err.message)
  res.status(err.status || 500).json({ ok: false, error: 'Something went wrong. Please try again.' })
})

/** Every non-loopback IPv4 address, so the site can be opened from a phone. */
function lanAddresses() {
  const found = []
  for (const list of Object.values(os.networkInterfaces())) {
    for (const net of list || []) {
      if (net.family === 'IPv4' && !net.internal) found.push(net.address)
    }
  }
  return found
}

app.listen(PORT, () => {
  console.log(`\n  Portfolio site + API  → http://localhost:${PORT}`)
  const lan = lanAddresses()
  if (lan.length) {
    console.log(`  Phone / tablet       → ${lan.map((ip) => `http://${ip}:${PORT}`).join('  ·  ')}  (same Wi-Fi required)`)
  }
  console.log(`  Control panel        → http://localhost:${PORT}${ADMIN_PATH}  (just for you)`)
  console.log(`  Resume (web / PDF)   → http://localhost:${PORT}/resume  ·  /api/resume`)
  console.log(`  Environment: ${isProduction ? 'production' : 'development'}`)
  console.log(`  Content file: ${CONTENT_FILE}`)
  console.log(
    `  Admin token:  ${
      process.env.ADMIN_TOKEN ? 'loaded from server/.env' : 'NOT SET — using default admin123 (change it!)'
    }\n`
  )
})
