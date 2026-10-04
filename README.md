# Suraj Kumar — Portfolio & Private CMS

A production-ready, recruiter-friendly portfolio with a **React 18 + TypeScript (Vite)** front end
and a **Node.js / Express** back end that also serves a **password-protected admin panel** — so every
section of the site is editable without touching code.

[![Live site](https://img.shields.io/badge/live-suraj--portfolio--wjpt.onrender.com-6366f1?logo=render&logoColor=white)](https://suraj-portfolio-wjpt.onrender.com)
![React](https://img.shields.io/badge/React-18-61dafb?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646cff?logo=vite&logoColor=white)
![Express](https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)
![Node](https://img.shields.io/badge/Node-24-339933?logo=nodedotjs&logoColor=white)

> **Live:** https://suraj-portfolio-wjpt.onrender.com  
> **Panel:** the site origin + your `ADMIN_PATH` (kept out of git — see [server/.env](server/.env))

### Highlights
- **One content file, one API** — all copy, projects, skills and notes come from `content.json` via `GET /api/content`.
- **Private dashboard** on a secret, non-indexable URL with token auth, login throttling and form editors.
- **Lead capture everywhere** — contact form, `/quote` and `/audit` pages, WhatsApp/Call rail, with instant email + Telegram alerts.
- **Self-hosted analytics** with a date-range filter and CSV export — no third-party trackers.
- **SEO-ready** — dynamic sitemap, robots, JSON-LD (`Person`, `ProfessionalService`, `Service`), per-note OG cards.
- **Durable data** — a small storage layer uses MongoDB Atlas in production and JSON files locally.

---

## ✨ Features

**Frontend**
- Hero with animated avatar ring, availability badge and CTAs (contact + resume download)
- **Trust strip** right under the hero: the organisations behind the work (HAL, universities, training) with monogram marks, plus a couple of concrete wins
- Animated stat counters, about + quick-facts card, services grid
- Skill groups with animated proficiency bars + infinite tools marquee
- Experience timeline, education and certifications
- Project portfolio with category filter, thumbnails, tech tags and live/code links
- **Case-study pages** per project (`/work/:id`) — problem → solution → result deep dives with WhatsApp/email CTAs
- **Notes / Blog** (`/blog`, `/blog/:slug`) — articles with their own SEO pages, tags and share buttons
- Testimonials, FAQ accordion, validated contact form with success/error states
- **Quick WhatsApp intents** (job / freelance / just saying hi — pre-filled messages), **Request a callback / Book a call** button and a scannable **QR contact card** (MECARD — phones open it as "add contact")
- **Share bar** (WhatsApp / LinkedIn / copy-link) on the contact card, notes and case studies
- One-click **vCard download** ("Save my contact" button) — name, photo, phone, email, address and socials in a `.vcf` every phone understands
- **Command palette (⌘K / Ctrl+K)** — one search box for every section, project, note and action (quote, review, resume, email, WhatsApp, theme), with keyboard navigation. Available from the navbar search button, the sub-page bar and the mobile menu.
- Scroll-progress bar, scroll-spy navbar, mobile menu, back-to-top, scroll-reveal animations
- Discreet 🔒 dashboard shortcut in the footer — near-invisible, label-free, resolves the panel URL only on click
- SEO meta + Open Graph/Twitter cards, semantic HTML, keyboard focus styles, `prefers-reduced-motion` support

**Backend (REST API)**
- Serves all portfolio content from a single editable JSON file
- `POST /api/contact` with server-side validation, per-IP rate limiting and a bot honeypot
- **Instant email alerts** for every contact message / project enquiry (free FormSubmit relay, no account — plus an auto-reply to the sender). One-time: FormSubmit sends an activation email to `meta.notifyEmail` — click it once. Disable with `NOTIFY_DISABLE=true`.
- **Instant Telegram alerts** — the same lead pings the owner's phone within seconds via a free Telegram bot (token + chat id in the panel's **SEO & Alerts**; env `TELEGRAM_BOT_TOKEN`/`TELEGRAM_CHAT_ID` override it and survive redeploys). The bot token is a secret and is stripped from the public `/api/content`.
- **Lead-magnet pages:** a shareable **`/quote`** page (packages + qualifying form) and a **`/audit`** free website-review offer — both post into the same inbox with the same alerts.
- **Mobile sticky CTA bar** — on phones a fixed bottom bar (Get a quote / WhatsApp / Call) replaces the floating rail so a lead never has to hunt for how to reach out.
- **Durable data** — a storage layer ([server/src/store.js](server/src/store.js)) keeps content, messages and analytics on a free MongoDB Atlas cluster when `MONGODB_URI` is set, so a redeploy on ephemeral hosting loses nothing. Local dev keeps using the JSON files; an unreachable database falls back to files instead of taking the site down.
- **Private dashboard** on a secret, non-indexable URL with token auth, login throttling and form-based editors
- Resume download, health check, security headers, SPA fallback, serves the built frontend in production

---

## 🎛️ Backend control — where everything lives

**1. Start the server** (open a terminal in the project folder):

```bash
npm run build && npm start     # site + API + dashboard  →  http://localhost:5000
# (in development: npm run dev — API on :5000, frontend on :5173)
```

**2. Open the dashboard:** the secret link comes from `ADMIN_PATH` in [server/.env](server/.env)
(never committed). Whatever you put there is appended to your origin:

```
http://localhost:5000<ADMIN_PATH>
```

> The real value is intentionally **not written anywhere in this repo** — read it from `server/.env`
or change it there / in the Render Environment tab.

> `/admin` **deliberately does not work** — it serves the normal website. That way the public never learns about the panel.

**3. The login password** is in [server/.env](server/.env) (`ADMIN_TOKEN`) — currently set to:

```
ADMIN_TOKEN=<your-password>        # current value lives in server/.env
```

You can also change the password from the dashboard's **Settings** tab (it saves itself back to `.env`).

**4. What you can do in the panel:**

- **Overview** — summary + "pending tasks" checklist
- **Profile / Projects / Experience / Education / Skills / Coding Profiles / Updates / Achievements / Services / Certifications / Gallery / Testimonials / Notes (Blog) / Packages & Quote / Free Website Review / FAQ** — all form-based editors (add, edit, reorder, delete)
- **SEO & Alerts** — message-alert email, Telegram bot token + chat id, Google/Bing verification codes, social share image
- **Sections & Visibility** — an on/off switch for every section
- **Messages** — read / reply / mark / delete messages from the contact form
- **Advanced (JSON)** — the full content as raw JSON
- **Settings** — change the password, site title/SEO, technical info

> The same thing can be done by editing the file directly: [server/data/content.json](server/data/content.json) — the dashboard simply edits that same file.

---

## 🏁 Quick start

```bash
npm run install:all     # installs root + server + client deps
npm run dev             # API on :5000  ·  Vite on :5173
```

Open **http://localhost:5173** (Vite proxies `/api` to the server).

### Production

```bash
npm run build           # type-checks + builds client/dist
npm start               # Express serves API + built frontend
```

Open **http://localhost:5000**. Set `NODE_ENV=production` (and optionally `PORT`, `ADMIN_TOKEN`) via environment variables — see [server/.env.example](server/.env.example).

---

## ✏️ Where to edit your details

**Everything lives in one file:** [`server/data/content.json`](server/data/content.json)
Edit it and reload — no rebuild needed.

| Key | What it controls |
|---|---|
| `meta` | Site title, description, keywords, theme color (used for SEO tags) |
| `profile` | Name, role, tagline, email, phone, location, avatar initials, resume URL, about paragraphs, highlights, stats, social links |
| `services` | "What I do" cards (`icon`: `layout`, `server`, `palette`, `gauge`, …) |
| `skills` | Skill groups with `{ name, level }` bars (`icon`: `monitor`, `server`, `cloud`) |
| `tools` | Chips in the scrolling tech marquee |
| `experience` | Timeline jobs: role, company, period, location, highlights, technologies |
| `education` | Degrees |
| `certifications` | Certificates: name, issuer, year |
| `projects` | Cards: `id`, `title`, `category`, `featured`, `year`, description, highlights, `tech`, `image`, `links`, `caseStudy` (problem / solution / result → the `/work/:id` page) |
| `codingProfiles` | LeetCode / GitHub style cards with stats (problems solved…) |
| `gallery` | Photo grid (travel, friends, campus) with captions + lightbox |
| `updates` | "What's New" feed — add a milestone whenever something happens |
| `sections` | **On/off switch for every section** (see control panel below) |
| `testimonials` | Quotes with name, role, company, rating (section auto-hides when the list is empty) |
| `blog` | Notes/Blog — `posts[]` with `slug`, `title`, `date`, `readTime`, `tags`, `excerpt`, `body` (paragraphs) |
| `faq` | Accordion questions/answers |

**Project thumbnails** live in [client/public/projects/](client/public/projects/) — branded 1200×750 WebP covers generated by [client/scripts/project-covers.mjs](client/scripts/project-covers.mjs) (`npm run covers`). Drop in your own `.webp`/`.png` and point `image` at `/projects/something.webp`.

**Resume:** the site's "Download Resume" button serves `server/data/resume.pdf` via `/api/resume`.
A print-ready source lives at [resume/resume.html](resume/resume.html) — edit it, then regenerate the PDF (single page, A4):

```bash
"C:\Program Files\Google\Chrome\Application\chrome.exe" --headless=new --no-pdf-header-footer \
  --print-to-pdf="Suraj_Kumar_Resume.pdf" "file:///C:/Users/Suraj/Downloads/lotus/portfolio/resume/resume.html"
cp Suraj_Kumar_Resume.pdf server/data/resume.pdf
```

---

## 🎛️ Private dashboard — everything from the backend

Open **`{your origin}${ADMIN_PATH}`** — the exact `ADMIN_PATH` and `ADMIN_TOKEN` live in
`server/.env` (git-ignored) and in the Render Environment tab, and are deliberately never
written into this repo. In production it is `https://<your-domain><ADMIN_PATH>`.
Login with your `ADMIN_TOKEN` (**change it** in `server/.env` or via Settings before going live).

**Easiest way:** the website footer has a tiny, faded 🔒 icon right after the
copyright line. One click there opens the login screen. It has no label and no tooltip, so visitors
do not notice it, and the icon itself fetches the real URL from `GET /api/admin/entry` on click — so
the secret path never appears in the page markup or the JS bundle.

**Why it stays private**
- The real URL comes from `ADMIN_PATH` and is only handed out by `GET /api/admin/entry` when someone deliberately clicks the footer icon.
- `/admin` intentionally 404s into the normal site.
- The response sends `X-Robots-Tag: noindex, nofollow, noarchive` — search engines never list it.
- `/robots.txt` deliberately does not mention the path (mentioning it would leak it).
- **SEO (per page, server-injected — crawlers need no JavaScript):** every URL gets its own `<title>`, meta description, canonical, `og:*`/`twitter:*` (with absolute `og:image` → `og.png`, 1200×630, so WhatsApp/LinkedIn show a real preview card) and Schema.org JSON-LD from `content.json`: home = `Person` + **`ProfessionalService`** (local-business card: area served, price range, contact) + project `ItemList` + **`FAQPage`**; `/work/:id` = **`CreativeWork`** + breadcrumb; `/blog` = **`Blog`** with `BlogPosting` entries; `/blog/:slug` = **`BlogPosting`** (dates, word count, author); `/quote` = **`Service`** with an `Offer` per package; `/audit` = the free-review **`Offer`**. `sitemap.xml` lists every case study and note with `lastmod` + `<image:*>` tags; `robots.txt` allows every real search engine while blocking SEO scraper bots (and never lists the panel). `/resume.html` 301-redirects to `/resume`. Set `SITE_URL` in `server/.env` after deploying so absolute URLs point at the real domain. Google/Bing verification codes go in **SEO & Alerts** in the panel (`meta.verification`).
- Login is throttled to 15 attempts per IP per 10 minutes, and tokens are compared in constant time.

| Panel tab | What it does |
|---|---|
| **Overview** | Counts, unread messages, content size + a "pending work" checklist |
| **Content editors** | Form-based editors for profile, projects, experience, education, skills, coding profiles, updates, achievements, services, certifications, gallery, testimonials, notes (blog), packages & quote, free website review and FAQ — add / edit / reorder / delete |
| **Packages & Quote** | Service packages (name, price, timeline, features) and the `/quote` page heading |
| **Free Website Review** | The `/audit` lead-magnet copy — heading, bullet points and fine print |
| **SEO & Alerts** | Message-alert email, Telegram bot token + chat id, Google/Bing site-verification codes, social share image |
| **Sections & Visibility** | Toggle switch for every section — About, Services, Skills, Coding Profiles, Experience, Projects, Achievements, Updates, Gallery, FAQ, Contact. Turning it Off removes it from the website and the nav. |
| **Messages** | Read / reply / mark / delete messages from the website form |
| **Analytics** | Private visitor stats — date-range filter (7/30/90 days, All, or custom dates), visits per day, popular sections, referrers, devices, and one-click **CSV export** (self-hosted, no cookies) |
| **Advanced (JSON)** | Full raw content editor — invalid JSON is never saved (it shows an error) |
| **Settings** | Change the password, edit site title/SEO, inspect the tech details |

**Turn a hidden section on later:** just switch it ON in the panel. Example — when you want to publish travel photos:

1. Panel → **Gallery** ON, or in `sections` set `"gallery": { "enabled": true }`
2. Put your photos in `client/public/gallery/` (`photo-1.jpg`, …)
3. In the panel's JSON editor, update the image paths + captions under `gallery.items`

**Colors:** change the palette in one place — the CSS variables at the top of [client/src/styles/global.css](client/src/styles/global.css) (`--accent`, `--accent-2`, `--bg`, …).

---

## 🔌 API reference

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Liveness + uptime |
| GET | `/robots.txt` | Crawler rules — allows the site, blocks `/api/` and never mentions the panel path |
| GET | `/sitemap.xml` | Auto-generated sitemap (homepage + resume + every `/work/:id` case study + `/blog` + every note + `/quote` + `/audit`) with `lastmod` from content edits |
| GET | `/api/content` | Full portfolio content |
| GET | `/api/profile` `/api/skills` `/api/experience` `/api/education` `/api/services` `/api/testimonials` `/api/faq` `/api/tools` `/api/certifications` `/api/meta` `/api/blog` `/api/audit` | Individual slices |
| POST | `/api/inquiry` | `{ name, email, phone, projectType, budget, timeline, message }` → project enquiry (also used by `/quote` and `/audit`), rate-limited, stores + alerts |
| GET | `/api/sections` | Section list with their on/off state |
| GET | `/api/projects?category=Frontend&featured=true` | Projects (+ category list) |
| GET | `/api/projects/:id` | Single project |
| POST | `/api/contact` | `{ name, email, subject, message }` → validates, rate-limits, stores |
| POST | `/api/track` | Public — visitor beacon `{ sid, kind: visit\|section, section, ref }` (rate-limited, bots ignored, no cookies) |
| GET | `/api/admin/entry` | Public — returns the panel URL at click time (used by the discreet footer icon; keeps the secret path out of the page/JS). Throttled, 10 req / min / IP |
| POST | `/api/admin/login` | **Admin** — verify the panel password (throttled, 15 tries / 10 min / IP) |
| GET | `/api/admin/overview` | **Admin** — counts, unread messages, content size, panel path |
| GET | `/api/admin/analytics?from=YYYY-MM-DD&to=YYYY-MM-DD` | **Admin** — visits, unique visitors, daily chart, top sections, referrers, devices, recent visits for the date range (defaults to last 30 days, capped at 92) |
| GET | `/api/admin/analytics/export?from=&to=` | **Admin** — the same range as a CSV file (time, type, section, source, device, IP), downloads via the dashboard's "Export CSV" button |
| POST | `/api/admin/password` | **Admin** — change the password (persists to `server/.env`) |
| GET | `/api/admin/content` | **Admin** — full content JSON |
| PUT | `/api/admin/content` | **Admin** — save content (shallow-merges top-level keys) |
| PATCH | `/api/admin/sections/:key` | **Admin** — `{ "enabled": true \| false }` |
| GET | `/api/messages` | **Admin** — all messages (`x-admin-token` header) |
| PATCH | `/api/messages/:id` | **Admin** — `{ "read": true \| false }` |
| DELETE | `/api/messages/:id` | **Admin** — remove a message |
| GET | `/api/resume` | Resume PDF download |

```bash
# read submitted messages
curl -H "x-admin-token: $ADMIN_TOKEN" http://localhost:5000/api/messages

# hide a section
curl -X PATCH -H "x-admin-token: $ADMIN_TOKEN" -H "Content-Type: application/json" \
  -d '{"enabled":false}' http://localhost:5000/api/admin/sections/gallery
```

Messages (and every other mutable document) are saved through the storage layer in [server/src/store.js](server/src/store.js) — plain files in development, **MongoDB Atlas** in production so nothing is lost on a redeploy. See **Durable data** below.

---

## 📁 Structure

```
portfolio/
├── package.json             # root scripts (dev / build / start)
├── server/
│   ├── admin/admin.html     # dashboard UI (served on the secret ADMIN_PATH)
│   ├── src/
│   │   ├── index.js         # Express app: API, rate limit, static hosting
│   │   └── store.js         # durable storage: local files, or MongoDB Atlas
│   └── data/
│       ├── content.json     # ← edit your details here (seed for the DB)
│       ├── messages.json    # contact form submissions (local dev only)
│       ├── settings.json    # panel password override (git-ignored, local dev)
│       └── resume.pdf       # ← drop your resume here
└── client/
    ├── index.html           # SEO meta, fonts
    ├── public/              # favicon, avatar, og image, project + gallery art
    └── src/
        ├── App.tsx          # data fetching + section composition
        ├── api.ts, types.ts
        ├── components/      # Navbar, Hero, Skills, Projects, Contact, …
        ├── hooks/useReveal.ts
        └── styles/global.css  # design system (CSS variables)
```

---

## 🚢 Deploying

**Single server (recommended):** Express serves both the API and the built frontend — one service does everything.

### Render (already deployed ✅)

**Live site:** `https://suraj-portfolio-wjpt.onrender.com`  
**Panel:** `https://suraj-portfolio-wjpt.onrender.com` + your `ADMIN_PATH` (set in the Render
Environment tab, not stored in git)

Setup used (all declared in [`render.yaml`](render.yaml) — a Render **Blueprint**):

1. Repo: `github.com/Suraj-Kumar-Ray/portfolio` (private, `main` branch) → Render **New → Blueprint**.
2. `render.yaml` declares the Node web service: free plan, build command (`npm install --prefix server --include=dev && npm install --prefix client --include=dev && npm run build`), start (`npm start`), `NODE_ENV=production`, `ADMIN_PATH`, and `healthCheckPath: /api/health`.
3. `ADMIN_TOKEN` + `SITE_URL` live in the Render **Environment** tab (never in git).
4. **Auto-deploy:** every `git push` to `main` redeploys automatically.

**Important hosting notes:**
- Render's free-tier disk is **temporary**. That is fine now: set `MONGODB_URI` (see **[Durable data](#-durable-data)**) and messages, analytics and panel edits live in a free MongoDB Atlas cluster instead of the ephemeral disk.
- Without `MONGODB_URI` the app still runs — it just keeps using local files, so a redeploy resets the inbox and any panel edits. The server logs `Data store: local files` in that case.
- Free instances **spin down** after ~15 min idle — first request then takes ~50 s (subsequent ones are fast).
- `SITE_URL` env var pins the absolute URLs used by sitemap / canonical / JSON-LD (falls back to the request host if unset).
- The server **does not boot** in production without `ADMIN_TOKEN` (deliberate — opening the panel with a default password would be too easy).
- **Email alerts (one-time setup):** the first contact message triggers a FormSubmit activation email to `meta.notifyEmail` — click the confirm link once and alerts start arriving. Until then messages still save to the panel.
- **Telegram alerts (free, ~2 min setup):** in Telegram, message **@BotFather** → `/newbot` → copy the token; then message **@userinfobot** to get your numeric chat id. Paste both in the panel's **SEO & Alerts** (or set `TELEGRAM_BOT_TOKEN` / `TELEGRAM_CHAT_ID` in the host's Environment tab so they survive a redeploy).
- **Free SEO setup (one-time):** add the site to [Google Search Console](https://search.google.com/search-console) + [Bing Webmaster Tools](https://www.bing.com/webmasters), choose the HTML-tag verification method and paste the codes into **SEO & Alerts** in the panel; then submit `https://suraj-portfolio-wjpt.onrender.com/sitemap.xml` in both.

**Split hosting:** deploy `client/dist` to Vercel/Netlify and the `server/` to Render; set `CLIENT_ORIGIN` to your frontend URL and point the client's API base at it.

---

## 💾 Durable data

By default the app reads and writes the JSON files in `server/data/`. On a host with an ephemeral disk (Render's free tier) a redeploy throws those edits away. Point it at a free database instead and nothing is lost:

The storage layer lives in [server/src/store.js](server/src/store.js). It reads everything from an in-memory copy loaded once at boot (so all the existing synchronous reads keep working) and writes back to the active backend. If the database is ever unreachable it logs a warning and falls back to local files — the site never goes down.

**Setup (free, ~5 min, no credit card):**

1. Create a free **M0** cluster at [MongoDB Atlas](https://www.mongodb.com/atlas).
2. **Database Access** → add a user (username + password).
3. **Network Access** → allow `0.0.0.0/0` (Render's IPs are dynamic).
4. **Connect → Drivers** → copy the connection string and swap in your password.
5. Put it in `server/.env` for local runs, and in the host's **Environment** tab for production:

   ```
   MONGODB_URI=mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

Optional: `MONGODB_DB` (default `portfolio`) and `MONGODB_COLLECTION` (default `documents`).

On the first boot against an empty cluster, each document is seeded from the local file (so `content.json` starts from whatever is committed). After that, panel edits, messages and analytics all persist across redeploys — and a panel password change is stored too, so it survives even though the host's `ADMIN_TOKEN` env var stays as it was. The `/api/health` and panel **Overview** show which backend is active.

---

## 🧪 Notes

- Rate limit: 8 contact submissions per IP / 15 min (returns `429`).
- Dashboard login limit: 15 attempts per IP / 10 min (returns `429`).
- Honeypot field silently accepts bot submissions without storing them.
- Set a strong `ADMIN_TOKEN` and a unique `ADMIN_PATH` before going live.
