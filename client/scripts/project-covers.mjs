// Branded project covers (1200×750) generated from server/data/content.json.
// These are honest "brand cards" — a designed abstract mock, not a fake
// screenshot — so the projects grid looks intentional until real screenshots
// exist. Real screenshots can simply replace the generated files later.
// Run:  node client/scripts/project-covers.mjs
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..', '..')
const OUT = path.join(ROOT, 'client', 'public', 'projects')
const CONTENT = path.join(ROOT, 'server', 'data', 'content.json')
fs.mkdirSync(OUT, { recursive: true })

const W = 1200
const H = 750
const FONT = 'Segoe UI, Arial, sans-serif'
// title stays left of the mock (which begins at x=800)
const TEXT_X = 90

const content = JSON.parse(fs.readFileSync(CONTENT, 'utf8'))
const projects = Array.isArray(content.projects) ? content.projects : []

const esc = (s) =>
  String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/** wrap text into at most `max` lines of `perLine` characters */
function wrap(text, perLine, max) {
  const words = String(text).split(/\s+/)
  const lines = []
  let line = ''
  for (const w of words) {
    if (line && (line + ' ' + w).length > perLine) {
      lines.push(line)
      line = w
      if (lines.length === max) return lines
    } else {
      line = line ? line + ' ' + w : w
    }
  }
  if (line) lines.push(line)
  return lines.slice(0, max)
}

function cover(project) {
  const titleLines = wrap(project.title || 'Project', 20, 3)
  const titleFont = titleLines.length >= 3 ? 50 : titleLines.length === 2 ? 56 : 62
  const lineH = Math.round(titleFont * 1.12)
  const titleY0 = 300
  const titleBottom = titleY0 + (titleLines.length - 1) * lineH

  const title = titleLines
    .map(
      (l, i) =>
        `<text x="${TEXT_X}" y="${titleY0 + i * lineH}" font-family="${FONT}" font-size="${titleFont}" font-weight="700" fill="#eef2fb">${esc(l)}</text>`,
    )
    .join('\n  ')

  const yearY = titleBottom + 58
  const chipY = yearY + 16
  const tech = (project.tech || []).slice(0, 4)

  let chipX = TEXT_X
  const chips = tech
    .map((t) => {
      const w = 30 + t.length * 15
      const svg = `<rect x="${chipX}" y="${chipY}" width="${w}" height="52" rx="26" fill="#ffffff" fill-opacity="0.06" stroke="#6366f1" stroke-opacity="0.5"/>
  <text x="${chipX + w / 2}" y="${chipY + 34}" text-anchor="middle" font-family="${FONT}" font-size="24" fill="#cdd6ea">${esc(t)}</text>`
      chipX += w + 16
      return svg
    })
    .join('\n  ')

  return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#0a1122"/><stop offset="1" stop-color="#111c3a"/>
    </linearGradient>
    <linearGradient id="acc" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#6366f1"/><stop offset="1" stop-color="#22d3ee"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.82" cy="0.2" r="0.7">
      <stop offset="0" stop-color="#6366f1" stop-opacity="0.4"/>
      <stop offset="1" stop-color="#6366f1" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="mock" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.12"/>
      <stop offset="1" stop-color="#ffffff" stop-opacity="0.04"/>
    </linearGradient>
  </defs>

  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>

  <!-- category / featured chip -->
  <text x="${TEXT_X + 2}" y="184" font-family="${FONT}" font-size="23" font-weight="600" letter-spacing="2" fill="${project.featured ? '#4ade80' : '#8fa3c8'}">${esc((project.category || 'Project').toUpperCase())}</text>

  ${title}
  <text x="${TEXT_X}" y="${yearY}" font-family="${FONT}" font-size="26" font-weight="600" fill="#818cf8">${esc(project.year || '')}</text>

  ${chips}

  <!-- abstract product mock (honest design element, not a screenshot) -->
  <g transform="translate(80,0)" opacity="0.95">
    <rect x="720" y="150" width="390" height="452" rx="26" fill="url(#mock)" stroke="#ffffff" stroke-opacity="0.14"/>
    <rect x="720" y="150" width="390" height="56" rx="26" fill="#ffffff" fill-opacity="0.06"/>
    <circle cx="752" cy="178" r="7" fill="#f87171" fill-opacity="0.75"/>
    <circle cx="776" cy="178" r="7" fill="#fbbf24" fill-opacity="0.75"/>
    <circle cx="800" cy="178" r="7" fill="#34d399" fill-opacity="0.75"/>
    <rect x="752" y="244" width="200" height="20" rx="10" fill="url(#acc)" fill-opacity="0.85"/>
    <rect x="752" y="292" width="320" height="12" rx="6" fill="#ffffff" fill-opacity="0.22"/>
    <rect x="752" y="318" width="280" height="12" rx="6" fill="#ffffff" fill-opacity="0.16"/>
    <rect x="752" y="344" width="300" height="12" rx="6" fill="#ffffff" fill-opacity="0.16"/>
    <rect x="752" y="392" width="128" height="86" rx="16" fill="#6366f1" fill-opacity="0.28"/>
    <rect x="896" y="392" width="128" height="86" rx="16" fill="#22d3ee" fill-opacity="0.22"/>
    <rect x="752" y="502" width="272" height="12" rx="6" fill="#ffffff" fill-opacity="0.14"/>
    <rect x="752" y="528" width="180" height="12" rx="6" fill="#ffffff" fill-opacity="0.1"/>
  </g>

  <rect x="0" y="${H - 10}" width="${W}" height="10" fill="url(#acc)"/>
</svg>`
}

let made = 0
for (const project of projects) {
  if (!project.id) continue
  const buf = await sharp(Buffer.from(cover(project))).webp({ quality: 82 }).toBuffer()
  const file = path.join(OUT, `${project.id}.webp`)
  fs.writeFileSync(file, buf)
  made++
  console.log('written →', path.relative(ROOT, file), `(${Math.round(buf.length / 1024)} KB)`)
}
console.log(`Project covers ready ✅ (${made} images)`)
