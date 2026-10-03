// Renders client/public/og.png (1200×630) — the image WhatsApp / LinkedIn /
// Twitter show when someone shares the portfolio. Social scrapers do NOT render
// SVG og:images, so this must be a real PNG. Run:  node scripts/og-gen.mjs
import sharp from 'sharp'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(__dirname, '..', 'public', 'og.png')

const svg = `
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#060a14"/>
      <stop offset="1" stop-color="#0c1530"/>
    </linearGradient>
    <linearGradient id="accent" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#6366f1"/>
      <stop offset="1" stop-color="#22d3ee"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.85" cy="0.15" r="0.8">
      <stop offset="0" stop-color="#6366f1" stop-opacity="0.35"/>
      <stop offset="1" stop-color="#6366f1" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#glow)"/>

  <!-- accent bar -->
  <rect x="90" y="150" width="90" height="8" rx="4" fill="url(#accent)"/>

  <text x="90" y="245" font-family="Segoe UI, Arial, sans-serif" font-size="86" font-weight="700" fill="#e9eefb">Suraj Kumar</text>
  <text x="90" y="315" font-family="Segoe UI, Arial, sans-serif" font-size="42" font-weight="600" fill="#818cf8">Full-Stack Developer</text>
  <text x="90" y="380" font-family="Segoe UI, Arial, sans-serif" font-size="28" fill="#b9c4d8">React.js · JavaScript · PHP · MySQL</text>
  <text x="90" y="425" font-family="Segoe UI, Arial, sans-serif" font-size="28" fill="#b9c4d8">M.E. CSE @ Chandigarh University · ex-HAL intern</text>

  <!-- chips -->
  <g font-family="Segoe UI, Arial, sans-serif" font-size="24" fill="#e9eefb">
    <rect x="90" y="480" width="180" height="52" rx="26" fill="#ffffff" fill-opacity="0.08" stroke="#6366f1" stroke-opacity="0.5"/>
    <text x="180" y="513" text-anchor="middle">Portfolio</text>
    <rect x="290" y="480" width="180" height="52" rx="26" fill="#ffffff" fill-opacity="0.08" stroke="#6366f1" stroke-opacity="0.5"/>
    <text x="380" y="513" text-anchor="middle">Résumé</text>
    <rect x="490" y="480" width="220" height="52" rx="26" fill="#ffffff" fill-opacity="0.08" stroke="#6366f1" stroke-opacity="0.5"/>
    <text x="600" y="513" text-anchor="middle">Open to work</text>
  </g>

  <!-- avatar mark -->
  <circle cx="1010" cy="220" r="110" fill="url(#accent)" fill-opacity="0.18" stroke="#6366f1" stroke-opacity="0.6" stroke-width="3"/>
  <text x="1010" y="255" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="88" font-weight="700" fill="#e9eefb">SK</text>

  <!-- footer strip -->
  <rect x="0" y="588" width="1200" height="42" fill="#ffffff" fill-opacity="0.05"/>
  <text x="90" y="617" font-family="Segoe UI, Arial, sans-serif" font-size="22" fill="#93a1ba">suraj-portfolio-wjpt.onrender.com</text>
</svg>
`

await sharp(Buffer.from(svg)).png().toFile(OUT)
console.log('og.png written →', OUT)
