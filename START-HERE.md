# 🟢 START HERE — Suraj's Portfolio

**Just remember 2 links:**

| What | Link |
|---|---|
| 🌐 **Website** (everyone can see it) | `http://localhost:5000` |
| 🔒 **Dashboard** (FOR YOU ONLY) | Click the small 🔒 icon in the website footer, or go straight to `http://localhost:5000/CHANGE_ME_ADMIN_PATH` |

Dashboard password: **`CHANGE_ME_ADMIN_PASSWORD`**

---

## 1. Starting the website

1. Open the folder: **`C:\Users\Suraj\Downloads\lotus\portfolio`**
2. **Double-click** **`START.bat`**
   - The first time takes 1–2 minutes (setup + build); after that it opens in seconds
3. The browser opens by itself → **http://localhost:5000**

**How to stop it:** just **close** the black window. That's it.
> Closing the window = website stops. To see it again, double-click `START.bat`.

---

## 2. 🔒 Dashboard (private control panel)

**Easiest way (recommended):** go to the very bottom of the website (footer) → right after the copyright line `© 2026 Suraj Kumar...` there is a small 🔒 lock icon. **One click** there → the Dashboard login opens. Just enter the password.

That icon is deliberately **faded** — a normal visitor does not notice it, and nothing says "Admin" or "Login" on it. Since you know about it, you can click it directly.

**Backup way:** type the link → `http://localhost:5000/CHANGE_ME_ADMIN_PATH`
**Password:** `CHANGE_ME_ADMIN_PASSWORD`

### The public can never see it
- This link is **not as easy as `/admin`** — it is a **secret address** nobody can guess.
- The footer icon is just a **mark** — the dashboard address is never written on it; it is fetched from the server on click (so the secret link appears nowhere in the page source).
- It will **never be indexed on Google** (`noindex` is set).
- Nobody gets in without the password — after 15 wrong tries it **locks** for a while.

> The old `/admin` **no longer works** — your normal website opens there. The dashboard only opens at the secret link above.

### What's inside the Dashboard

| Tab | What you can do |
|---|---|
| **Overview** | Website summary + "Pending tasks" list (what is still missing) |
| **Profile & Hero** | Name, photo, intro, email, phone, about, social links |
| **Projects** | Add / edit / delete / reorder projects |
| **Experience** | Internships and jobs |
| **Education** | Degrees and marks |
| **Skills** | Skill groups + level (bar) for each skill |
| **Coding Profiles** | LeetCode count and **GitHub/LeetCode links** |
| **Updates** | Timeline — newest achievement at the top |
| **Achievements / Services / Certifications / FAQ** | All the remaining content |
| **Testimonials** | Feedback quotes from people you worked with (empty list = hidden) |
| **Notes / Blog** | Short articles — every note gets its own Google-visible page |
| **Packages & Quote** | Your service packages, prices and the `/quote` page heading |
| **Free Website Review** | The free-review offer shown on `/audit` |
| **SEO & Alerts** | Message-alert email + Telegram alerts + Google/Bing verification codes + social share image |
| **Gallery** | Travel / friends photos |
| **Sections & Visibility** | Which section shows on the website (ON/OFF switch) |
| **Messages** | Messages from the contact form (reply / read / delete) |
| **Analytics** | Who visited and what they looked at — pick any date range (7/30/90 days, All, or your own dates) and export it as a CSV file |
| **Advanced (JSON)** | All content as raw JSON — for power users |
| **Settings** | Change password, site title / SEO, technical info |

**How it works:** change anything → type in the form fields → press **Save changes** at the top → the website updates instantly. **No restart needed.**
Until you press Save, the yellow "Unsaved changes" tag stays visible.

**Changing the password:** Dashboard → **Settings** → *Change password*. (It saves itself in `server\.env`.)

---

## 3. What to do, where

| I want to... | Where | How |
|---|---|---|
| Add a new project | Dashboard → **Projects** | **+ Add new** → fill in details → Save |
| Post a job-search update | Dashboard → **Updates** | **+ Add new** → Save |
| Update the LeetCode count (400+ → 500+) | Dashboard → **Coding Profiles** | Open the LeetCode entry, change the stat value → Save |
| Add the GitHub link | Dashboard → **Coding Profiles** | GitHub entry → *Profile URL* → Save |
| Hide a section (e.g. Gallery) | Dashboard → **Sections & Visibility** | Turn its switch **OFF** |
| Add a new **photo** (gallery / project) | File folder + `REBUILD.bat` | Copy the photo into `client\public\gallery\` → double-click `REBUILD.bat` → refresh |
| Show the photos in the gallery | Dashboard → **Sections & Visibility** | *Gallery* switch **ON** |
| Read contact form messages | Dashboard → **Messages** | Read / Reply / Delete |
| Get an **email** when someone messages | (one-time) Gmail inbox | First message sends a FormSubmit **activation email** to `csesuraj2003@gmail.com` — click **Confirm** once, done |
| Get a **phone ping** the second someone messages | Dashboard → **SEO & Alerts** | Telegram → @BotFather se bot token, @userinfobot se chat id → dono paste karo → Save |
| Set a **price** on your packages | Dashboard → **Packages & Quote** | Open a package → *Price* (e.g. ₹4,999) → Save |
| Share a **quote link** on WhatsApp | Send this link | `https://suraj-portfolio-wjpt.onrender.com/quote` — packages + form ek hi page par |
| Offer a **free website review** (leads ke liye) | Send this link | `https://suraj-portfolio-wjpt.onrender.com/audit` — visitor abhi kharidne ready na ho to bhi message kar dega |
| Add a testimonial | Dashboard → **Testimonials** | **+ Add new** → name, role, feedback → Save |
| Publish a note / blog post | Dashboard → **Notes / Blog** | **+ Add new** → title, slug, date, article → Save |
| Get found on Google | Dashboard → **SEO & Alerts** | Paste the verification codes from Google Search Console / Bing (see section 7) |
| Change the site title or description | Dashboard → **Settings** | Edit → Save |
| Change the dashboard password | Dashboard → **Settings** | *Change password* |

---

## 4. How to add a photo (detailed)

1. Make the photo small (under 500 KB is good) — keep the name simple, e.g. `travel-1.jpg`
2. Copy it into this folder: **`client\public\gallery\`**
3. **Double-click** `REBUILD.bat` (takes 10–20 seconds)
4. Double-click `START.bat` → refresh in the browser (`Ctrl + F5`)
5. Dashboard → **Gallery** → set that entry's *Photo path* to `/gallery/travel-1.jpg` → Save
6. Dashboard → **Sections & Visibility** → *Gallery* switch **ON**

**For a project photo** use the same steps — put the file in `client\public\projects\`, then in Dashboard → **Projects** change that project's *Image path* (e.g. `/projects/map-app.jpg`).

---

## 5. Resume (PDF)

- The website's **Download Resume** button serves the file `server\data\resume.pdf`
- To change the resume content: edit `resume\resume.html` (English text), then regenerate the PDF — the command is in the README
- Resume viewing page on mobile: **http://localhost:5000/resume**

---

## 6. Common problems

| Problem | Solution |
|---|---|
| Window closes right after double-clicking `START.bat` | Node.js is not installed → install the **LTS** version from https://nodejs.org |
| Site does not open | The black window must have been closed — run `START.bat` again |
| Dashboard says "That password is not correct" | Type the password carefully: `CHANGE_ME_ADMIN_PASSWORD` (no extra spaces) |
| Cannot find the footer 🔒 icon | Look at the very **bottom** line of the footer, a little to the right of `© 2026 Suraj Kumar. All rights reserved.` — it is very faint. It brightens when you hover over it |
| "Too many attempts" error | 15 wrong tries happened — wait 10 minutes, then try again |
| Forgot the dashboard link | Open the `server\.env` file → it is written after `ADMIN_PATH=` |
| Content is not saving | Some field was left empty, or there is a comma/quote mistake in the Advanced JSON |
| Email alerts not arriving | Open the FormSubmit **activation email** in `csesuraj2003@gmail.com` and click Confirm (one time). Messages still save in the panel meanwhile |
| New photo not showing | Run `REBUILD.bat`, then `Ctrl + F5` in the browser |
| Port 5000 busy | An old window is still running — close it, then run `START.bat` |

---

## 7. Going live on the internet (when sending it to companies)

**✅ Already live!** Anyone can open it:

| | Link |
|---|---|
| 🌐 **Website** (for companies / shared) | https://suraj-portfolio-wjpt.onrender.com |
| 🔒 **Dashboard** (FOR YOU ONLY) | https://suraj-portfolio-wjpt.onrender.com/CHANGE_ME_ADMIN_PATH |

Notes:
- Free hosting **sleeps** after ~15 minutes of no visitors — the first opening then takes ~30–50 seconds. Later openings are instant.
- **One-time free SEO setup (10 minutes, brings Google visitors):**
  1. [Google Search Console](https://search.google.com/search-console) → Add property (URL prefix) → `https://suraj-portfolio-wjpt.onrender.com` → verification method **HTML tag** → copy the code.
  2. [Bing Webmaster Tools](https://www.bing.com/webmasters) → same thing → copy the code.
  3. Dashboard → **SEO & Alerts** → paste both codes → Save → go back to both sites and press **Verify**.
  4. In both sites → Sitemaps → submit `https://suraj-portfolio-wjpt.onrender.com/sitemap.xml`.
- **To publish any change:** run `git add -A && git commit -m "update" && git push` — Render rebuilds and puts it live automatically in ~2 minutes.
- Panel password is the same as local (`CHANGE_ME_ADMIN_PASSWORD`). Inbox messages / dashboard edits reset on every redeploy (free plan limitation) — the base content in the repo always stays.

---

## 8. Where everything is (file map)

```
portfolio/
├── START.bat              ← double-click: start the website
├── REBUILD.bat            ← run after a photo/design change
├── server/
│   ├── .env               ← DASHBOARD password + secret link (private file)
│   ├── admin/admin.html   ← dashboard design
│   ├── src/index.js       ← backend (API, login, sections)
│   └── data/content.json  ← 👑 ALL CONTENT LIVES HERE
├── client/public/         ← logo, avatar, project photos, gallery photos
├── client/src/components/Footer.tsx ← footer + small 🔒 dashboard icon
├── resume/resume.html     ← resume source (to build the PDF)
└── Suraj_Kumar_Resume.pdf ← the resume PDF
```

**Remember:** for Content / Sections changes the **dashboard Save button** is enough — no restart needed. Only `.env` (password/link) or design changes require running `START.bat` again.
