# 🚀 Personal Portfolio — React + Express

A production-ready, recruiter-friendly portfolio site with a **React + TypeScript (Vite)** frontend and a **Node.js/Express** backend. Dark navy theme with an indigo→cyan accent, fully responsive, animated, and SEO-ready.

![stack](https://img.shields.io/badge/React-18-61dafb) ![ts](https://img.shields.io/badge/TypeScript-5-blue) ![vite](https://img.shields.io/badge/Vite-5-646cff) ![express](https://img.shields.io/badge/Express-4-000000)

---

## ✨ Features

**Frontend**
- Hero with animated avatar ring, availability badge and CTAs (contact + resume download)
- Animated stat counters, about + quick-facts card, services grid
- Skill groups with animated proficiency bars + infinite tools marquee
- Experience timeline, education and certifications
- Project portfolio with category filter, thumbnails, tech tags and live/code links
- Testimonials, FAQ accordion, validated contact form with success/error states
- One-click **vCard download** ("Save my contact" button) — name, photo, phone, email, address and socials in a `.vcf` every phone understands
- Scroll-progress bar, scroll-spy navbar, mobile menu, back-to-top, scroll-reveal animations
- Discreet 🔒 dashboard shortcut in the footer — near-invisible, label-free, resolves the panel URL only on click
- SEO meta + Open Graph/Twitter cards, semantic HTML, keyboard focus styles, `prefers-reduced-motion` support

**Backend (REST API)**
- Serves all portfolio content from a single editable JSON file
- `POST /api/contact` with server-side validation, per-IP rate limiting and a bot honeypot
- **Private dashboard** on a secret, non-indexable URL with token auth, login throttling and form-based editors
- Resume download, health check, security headers, SPA fallback, serves the built frontend in production

---

## 🎛️ Backend control — where everything lives

**1. Start the server** (open a terminal in the project folder):

```bash
npm run build && npm start     # site + API + dashboard  →  http://localhost:5000
# (in development: npm run dev — API on :5000, frontend on :5173)
```

**2. Open the dashboard:** the secret link comes from `ADMIN_PATH` in [server/.env](server/.env).
It is currently set to `ADMIN_PATH=/CHANGE_ME_ADMIN_PATH`, which means:

```
http://localhost:5000/CHANGE_ME_ADMIN_PATH
```

> `/admin` **deliberately does not work** — it serves the normal website. That way the public never learns about the panel.

**3. The login password** is in [server/.env](server/.env) (`ADMIN_TOKEN`) — currently set to:

```
ADMIN_TOKEN=<your-password>        # current value lives in server/.env
```

You can also change the password from the dashboard's **Settings** tab (it saves itself back to `.env`).

**4. What you can do in the panel:**

- **Overview** — summary + "pending tasks" checklist
- **Profile / Projects / Experience / Education / Skills / Coding Profiles / Updates / Achievements / Services / Certifications / Gallery / FAQ** — all form-based editors (add, edit, reorder, delete)
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
| `projects` | Cards: `id`, `title`, `category`, `featured`, `year`, description, highlights, `tech`, `image`, `links` |
| `codingProfiles` | LeetCode / GitHub style cards with stats (problems solved…) |
| `gallery` | Photo grid (travel, friends, campus) with captions + lightbox |
| `updates` | "What's New" feed — add a milestone whenever something happens |
| `sections` | **On/off switch for every section** (see control panel below) |
| `testimonials` | Quotes with name, role, company, rating |
| `faq` | Accordion questions/answers |

**Project thumbnails** live in [client/public/projects/](client/public/projects/) — drop in your own `something.svg`/`.png` and point `image` at `/projects/something.png`.

**Resume:** the site's "Download Resume" button serves `server/data/resume.pdf` via `/api/resume`.
A print-ready source lives at [resume/resume.html](resume/resume.html) — edit it, then regenerate the PDF (single page, A4):

```bash
"C:\Program Files\Google\Chrome\Application\chrome.exe" --headless=new --no-pdf-header-footer \
  --print-to-pdf="Suraj_Kumar_Resume.pdf" "file:///C:/Users/Suraj/Downloads/lotus/portfolio/resume/resume.html"
cp Suraj_Kumar_Resume.pdf server/data/resume.pdf
```

---

## 🎛️ Private dashboard — everything from the backend

Open **`{your origin}${ADMIN_PATH}`**, e.g. **http://localhost:5000/CHANGE_ME_ADMIN_PATH**
(in production: `https://your-domain/CHANGE_ME_ADMIN_PATH`).
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
- **SEO**: every page is served with a canonical URL, `og:url` and a Schema.org `Person` JSON-LD built from `content.json` (name, role, contact, education, skills, socials) — search engines get it without running JavaScript. Set `SITE_URL` in `server/.env` after deploying so absolute URLs point at the real domain.
- Login is throttled to 15 attempts per IP per 10 minutes, and tokens are compared in constant time.

| Panel tab | What it does |
|---|---|
| **Overview** | Counts, unread messages, content size + a "pending work" checklist |
| **Content editors** | Form-based editors for profile, projects, experience, education, skills, coding profiles, updates, achievements, services, certifications, gallery and FAQ — add / edit / reorder / delete |
| **Sections & Visibility** | Toggle switch for every section — About, Services, Skills, Coding Profiles, Experience, Projects, Achievements, Updates, Gallery, FAQ, Contact. Turning it Off removes it from the website and the nav. |
| **Messages** | Read / reply / mark / delete messages from the website form |
| **Analytics** | Private visitor stats — visits per day, popular sections, referrers, devices (self-hosted, no cookies) |
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
| GET | `/sitemap.xml` | Auto-generated sitemap (homepage + resume) with `lastmod` from content edits |
| GET | `/api/content` | Full portfolio content |
| GET | `/api/profile` `/api/skills` `/api/experience` `/api/education` `/api/services` `/api/testimonials` `/api/faq` `/api/tools` `/api/certifications` `/api/meta` | Individual slices |
| GET | `/api/sections` | Section list with their on/off state |
| GET | `/api/projects?category=Frontend&featured=true` | Projects (+ category list) |
| GET | `/api/projects/:id` | Single project |
| POST | `/api/contact` | `{ name, email, subject, message }` → validates, rate-limits, stores |
| POST | `/api/track` | Public — visitor beacon `{ sid, kind: visit\|section, section, ref }` (rate-limited, bots ignored, no cookies) |
| GET | `/api/admin/entry` | Public — returns the panel URL at click time (used by the discreet footer icon; keeps the secret path out of the page/JS). Throttled, 10 req / min / IP |
| POST | `/api/admin/login` | **Admin** — verify the panel password (throttled, 15 tries / 10 min / IP) |
| GET | `/api/admin/overview` | **Admin** — counts, unread messages, content size, panel path |
| GET | `/api/admin/analytics` | **Admin** — visits (today / 7d / 30d / all), daily chart, top sections, referrers, devices, recent visits |
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

Messages are stored in `server/data/messages.json` (git-ignored).

---

## 📁 Structure

```
portfolio/
├── package.json             # root scripts (dev / build / start)
├── server/
│   ├── admin/admin.html     # dashboard UI (served on the secret ADMIN_PATH)
│   ├── src/index.js         # Express app: API, rate limit, static hosting
│   └── data/
│       ├── content.json     # ← edit your details here
│       ├── messages.json    # contact form submissions
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

**Single server (recommended):** build, then run Express with `NODE_ENV=production` on Render / Railway / Fly / a VPS — it serves both the API and the built frontend.

### Render (free, easiest — step by step)

1. **Push to GitHub** — only the `portfolio/` folder (never let the repo root be your home folder, or the whole user folder goes in).
2. **render.com → New → Web Service** → connect the repo.
3. Fill in the settings:
   - **Build Command:** `npm run install:all && npm run build`
   - **Start Command:** `NODE_ENV=production npm run start`
4. **Environment → Add Environment Variable:**
   - `ADMIN_TOKEN` = your strong password (on hosting this is **required** — without it the server refuses to start)
   - `ADMIN_PATH` = `/CHANGE_ME_ADMIN_PATH` (or your own secret path)
5. Deploy → live in 2–3 minutes. Panel: `https://<app>.onrender.com/<ADMIN_PATH>`

**Important hosting notes:**
- Render's free-tier disk is **temporary** — every redeploy resets `messages.json` (the inbox). Content (`content.json`) lives there too, so edits made in the panel are lost on redeploy. For long-term use, take a paid disk or a database.
- After the domain is set, make `og:image` absolute: in `client/index.html` change `/og.svg` to `https://<domain>/og.svg`.
- The server **does not boot** in production without `ADMIN_TOKEN` (deliberate — opening the panel with a default password would be too easy).

**Split hosting:** deploy `client/dist` to Vercel/Netlify and the `server/` to Render; set `CLIENT_ORIGIN` to your frontend URL and point the client's API base at it.

---

## 🧪 Notes

- Rate limit: 8 contact submissions per IP / 15 min (returns `429`).
- Dashboard login limit: 15 attempts per IP / 10 min (returns `429`).
- Honeypot field silently accepts bot submissions without storing them.
- Set a strong `ADMIN_TOKEN` and a unique `ADMIN_PATH` before going live.
