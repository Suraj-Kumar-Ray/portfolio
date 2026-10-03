// LinkedIn branding kit — renders upload-ready PNGs into client/public/branding/
// (cover banner, profile photos with Open-to-Work ring, QR post image).
// Run:  node client/scripts/linkedin-gen.mjs   (uses the sharp + qrcode dev deps)
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'
import QRCode from 'qrcode'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PUB = path.join(__dirname, '..', 'public')
const OUT = path.join(PUB, 'branding')
fs.mkdirSync(OUT, { recursive: true })

const FONT = 'Segoe UI, Arial, sans-serif'
const SITE = 'suraj-portfolio-wjpt.onrender.com'

/** dark navy canvas with the portfolio glow — the whole kit sits on this */
function bgSvg(w, h) {
  return `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#060a14"/><stop offset="1" stop-color="#0c1530"/>
    </linearGradient>
    <linearGradient id="acc" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#6366f1"/><stop offset="1" stop-color="#22d3ee"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.8" cy="0.12" r="0.85">
      <stop offset="0" stop-color="#6366f1" stop-opacity="0.32"/>
      <stop offset="1" stop-color="#6366f1" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#bg)"/>
  <rect width="${w}" height="${h}" fill="url(#glow)"/>
</svg>`
}

/** photo cropped to a transparent-corner circle */
async function circlePhoto(file, size) {
  const img = await sharp(file).resize(size, size, { fit: 'cover' }).png().toBuffer()
  const mask = Buffer.from(
    `<svg width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="#fff"/></svg>`,
  )
  return sharp(img).composite([{ input: mask, blend: 'dest-in' }]).png().toBuffer()
}

const write = async (name, svgOrSharp, layers = []) => {
  const base = Buffer.isBuffer(svgOrSharp) ? sharp(svgOrSharp) : sharp(Buffer.from(svgOrSharp))
  const out = layers.length ? base.composite(layers) : base
  await out.png().toFile(path.join(OUT, name))
  console.log('written →', path.join('branding', name))
}

/* ---------------- 1. LinkedIn cover banner (1584×396) ---------------- */
// text block starts at x=380 so the profile photo (bottom-left overlay on
// LinkedIn) never covers it; the SK monogram on the right is decorative.
const banner = `<svg width="1584" height="396" viewBox="0 0 1584 396" xmlns="http://www.w3.org/2000/svg">
  <text x="70" y="340" font-family="Consolas, monospace" font-size="230" font-weight="700" fill="#ffffff" fill-opacity="0.045">&lt;/&gt;</text>
  <rect x="380" y="48" width="322" height="54" rx="27" fill="#16a34a" fill-opacity="0.18" stroke="#22c55e" stroke-opacity="0.7"/>
  <circle cx="412" cy="75" r="8" fill="#22c55e"/>
  <text x="432" y="84" font-family="${FONT}" font-size="25" font-weight="600" fill="#4ade80">OPEN TO WORK</text>
  <text x="380" y="182" font-family="${FONT}" font-size="78" font-weight="700" fill="#e9eefb">Suraj Kumar</text>
  <text x="380" y="236" font-family="${FONT}" font-size="31" font-weight="600" fill="#818cf8">Full-Stack Developer · React.js · JavaScript · PHP · MySQL</text>
  <text x="380" y="292" font-family="${FONT}" font-size="25" fill="#b9c4d8">Portfolio: ${SITE} · Email: csesuraj2003@gmail.com</text>
  <text x="380" y="338" font-family="${FONT}" font-size="22" fill="#93a1ba">Phone: +91 7795253485 · M.E. CSE @ Chandigarh University · replies within 24 hours</text>
  <circle cx="1425" cy="196" r="112" fill="#6366f1" fill-opacity="0.15" stroke="url(#acc)" stroke-width="5"/>
  <text x="1425" y="228" text-anchor="middle" font-family="${FONT}" font-size="86" font-weight="700" fill="#e9eefb">SK</text>
  <rect x="0" y="386" width="1584" height="10" fill="url(#acc)"/>
</svg>`
const bannerFull = bgSvg(1584, 396).replace('</svg>', banner.replace(/^<svg[^>]*>/, '').replace('</svg>', '') + '</svg>')
await write('banner-1584x396.png', bannerFull)

/* ---------------- 2. profile photos (1000×1000, LinkedIn square) ---------------- */
// LinkedIn shows the photo as a circle — ring + badge stay inside r < 500.
const photo = await circlePhoto(path.join(PUB, 'avatar.jpg'), 744)

const otwOverlay = `<svg width="1000" height="1000" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="acc" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="#6366f1"/><stop offset="1" stop-color="#22d3ee"/>
  </linearGradient></defs>
  <circle cx="500" cy="500" r="432" fill="none" stroke="#22c55e" stroke-opacity="0.22" stroke-width="18"/>
  <circle cx="500" cy="500" r="382" fill="none" stroke="#22c55e" stroke-width="26"/>
  <rect x="220" y="796" width="560" height="86" rx="43" fill="#16a34a"/>
  <text x="500" y="852" text-anchor="middle" font-family="${FONT}" font-size="43" font-weight="700" letter-spacing="5" fill="#ffffff">OPEN TO WORK</text>
</svg>`

const brandOverlay = `<svg width="1000" height="1000" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="acc" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="#6366f1"/><stop offset="1" stop-color="#22d3ee"/>
  </linearGradient></defs>
  <circle cx="500" cy="500" r="432" fill="none" stroke="url(#acc)" stroke-opacity="0.22" stroke-width="16"/>
  <circle cx="500" cy="500" r="382" fill="none" stroke="url(#acc)" stroke-width="24"/>
  <rect x="235" y="800" width="530" height="80" rx="40" fill="url(#acc)"/>
  <text x="500" y="851" text-anchor="middle" font-family="${FONT}" font-size="34" font-weight="700" letter-spacing="3" fill="#ffffff">FULL-STACK DEVELOPER</text>
</svg>`

await write('profile-open-to-work-1000.png', bgSvg(1000, 1000), [
  { input: photo, top: 128, left: 128 },
  { input: Buffer.from(otwOverlay), top: 0, left: 0 },
])
await write('profile-branded-1000.png', bgSvg(1000, 1000), [
  { input: photo, top: 128, left: 128 },
  { input: Buffer.from(brandOverlay), top: 0, left: 0 },
])

/* ---------------- 3. post square with scannable QR (1080×1080) ---------------- */
const qr = await QRCode.toBuffer(`https://${SITE}`, {
  type: 'png',
  width: 250,
  margin: 1,
  color: { dark: '#0b1220ff', light: '#ffffffff' },
})

const postSvg = (extraDefs) => `<svg width="1080" height="1080" viewBox="0 0 1080 1080" xmlns="http://www.w3.org/2000/svg">
  ${extraDefs}
  <rect x="80" y="76" width="322" height="54" rx="27" fill="#16a34a" fill-opacity="0.18" stroke="#22c55e" stroke-opacity="0.7"/>
  <circle cx="112" cy="103" r="8" fill="#22c55e"/>
  <text x="132" y="112" font-family="${FONT}" font-size="25" font-weight="600" fill="#4ade80">OPEN TO WORK</text>
  <text x="80" y="230" font-family="${FONT}" font-size="86" font-weight="700" fill="#e9eefb">Suraj Kumar</text>
  <text x="80" y="292" font-family="${FONT}" font-size="42" font-weight="600" fill="url(#acc)">Full-Stack Developer</text>
  <rect x="80" y="330" width="170" height="52" rx="26" fill="#ffffff" fill-opacity="0.07" stroke="#6366f1" stroke-opacity="0.5"/>
  <text x="165" y="363" text-anchor="middle" font-family="${FONT}" font-size="24" fill="#e9eefb">React.js</text>
  <rect x="266" y="330" width="190" height="52" rx="26" fill="#ffffff" fill-opacity="0.07" stroke="#6366f1" stroke-opacity="0.5"/>
  <text x="361" y="363" text-anchor="middle" font-family="${FONT}" font-size="24" fill="#e9eefb">JavaScript</text>
  <rect x="472" y="330" width="120" height="52" rx="26" fill="#ffffff" fill-opacity="0.07" stroke="#6366f1" stroke-opacity="0.5"/>
  <text x="532" y="363" text-anchor="middle" font-family="${FONT}" font-size="24" fill="#e9eefb">PHP</text>
  <rect x="608" y="330" width="150" height="52" rx="26" fill="#ffffff" fill-opacity="0.07" stroke="#6366f1" stroke-opacity="0.5"/>
  <text x="683" y="363" text-anchor="middle" font-family="${FONT}" font-size="24" fill="#e9eefb">MySQL</text>
  <rect x="80" y="432" width="920" height="2" fill="#ffffff" fill-opacity="0.1"/>
  <text x="80" y="500" font-family="${FONT}" font-size="33" font-weight="600" fill="#e9eefb">Open to full-time roles &amp; freelance projects</text>
  <text x="80" y="548" font-family="${FONT}" font-size="27" fill="#b9c4d8">M.E. CSE @ Chandigarh University · ex-HAL intern</text>
  <circle cx="92" cy="596" r="8" fill="#22c55e"/>
  <text x="112" y="605" font-family="${FONT}" font-size="25" fill="#4ade80">Available immediately · replies within 24 hours</text>
  <text x="80" y="700" font-family="${FONT}" font-size="30" font-weight="600" fill="#22d3ee">Portfolio: ${SITE}</text>
  <text x="80" y="750" font-family="${FONT}" font-size="26" fill="#b9c4d8">Email: csesuraj2003@gmail.com</text>
  <text x="80" y="795" font-family="${FONT}" font-size="26" fill="#b9c4d8">Phone / WhatsApp: +91 7795253485</text>
  <text x="80" y="870" font-family="${FONT}" font-size="24" fill="#93a1ba">Résumé, case studies &amp; notes — all on the portfolio.</text>
  <rect x="660" y="620" width="340" height="340" rx="26" fill="#ffffff"/>
  <rect x="0" y="1072" width="1080" height="8" fill="url(#acc)"/>
</svg>`

// the QR must be composited as a real bitmap — SVG text can't carry it
const postBase = bgSvg(1080, 1080).replace(
  '</svg>',
  postSvg('').replace(/^<svg[^>]*>/, '').replace('</svg>', '') +
    '<defs><linearGradient id="acc" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#6366f1"/><stop offset="1" stop-color="#22d3ee"/></linearGradient></defs></svg>',
)
await write('post-open-to-work-1080.png', postBase, [{ input: qr, top: 665, left: 705 }])

console.log('LinkedIn branding kit ready ✅')
