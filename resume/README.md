# Resume — Suraj Kumar

One-page resume for **M.E. Computer Science & Engineering, 2027** (Chandigarh University),
targeting **full-stack developer** and **QA engineer** roles. Built to survive an ATS parser
and stay readable for a human.

## Files

| File | What it is |
|---|---|
| `resume.html` | **Source of truth.** The page served at `/resume`. Print CSS produces the PDF. |
| `Suraj_Kumar_Resume.pdf` | One A4 page, text-based (selectable), generated from `resume.html`. |
| `Suraj_Kumar_Resume.docx` | Editable Word copy, generated from `resume.html`. Upload this to Google Docs or a portal that asks for Word. |
| `build-docx.py` | Builds the `.docx` by parsing `resume.html`. |
| `../server/data/resume.pdf` | The file `/api/resume` serves as the Download button. |

Copies of the PDF and DOCX also sit in `~/Downloads/` and `~/Downloads/linkedin-assets/`
for attaching to mail.

## Rebuilding

Edit `resume.html` only. Then:

```bash
# PDF (needs Chrome or Edge)
"/c/Program Files/Google/Chrome/Application/chrome.exe" --headless --disable-gpu \
  --no-pdf-header-footer \
  --print-to-pdf="C:\Users\Suraj\Downloads\lotus\portfolio\server\data\resume.pdf" \
  "file:///C:/Users/Suraj/Downloads/lotus/portfolio/resume/resume.html"

cp ../server/data/resume.pdf Suraj_Kumar_Resume.pdf

# DOCX
python build-docx.py
```

Verify the PDF really is one page before sending it:

```bash
python -c "import re;d=open('Suraj_Kumar_Resume.pdf','rb').read();print(re.findall(rb'/Count\s+\d+',d)[:1])"
# -> [b'/Count 1']
```

## Page budget

A4 with 12 mm top/bottom and 14 mm side margins leaves **1032 px** of height at 96 dpi.
The file is tuned to land around **974 px (94%)** — a visible bottom margin, not a crammed page.
If you add a line, measure again; going past 1032 px silently produces a second page.

## Sections, in order

1. **Career Objective** — 3 lines. Who you are, what you want, what you build.
2. **Technical Skills** — 6 rows with a fixed label column (Languages / Frontend / Backend /
   Databases / Testing / Tools). Readable for a human, plain text for a parser.
3. **Internship Experience** — HAL, MCSRDC, Bengaluru, Aug–Sep 2023.
4. **Projects** — School Management Portal (React/Node/MySQL), Portfolio & Resume Platform
   (React/TS/Node).
5. **Education** — M.E. 2025–2027, B.E. 2020–2024 (CGPA 8.7), XII 85.6%.
6. **Certifications** — AWS Certified Developer – Associate (Nov 2026), OCI Architect Associate (Oct 2026) plus three courses.

## Why 2027 is the headline year

B.E. finished in 2024 and M.E. is running 2025–2027, so the current batch year is **2027**.
Every application form should say **Year of passing: 2027**. The one-year break between
B.E. and M.E. is stated in one line under Education rather than hidden — an empty field
gets auto-rejected, a stated reason gets read.

## ATS keywords present

**Languages** JavaScript (ES6+), TypeScript, SQL, PHP, Java, Python, C ·
**Frontend** React.js, HTML5, CSS3, Bootstrap, Responsive Web Design, REST API Integration, JSON ·
**Backend** Node.js, Express.js, PHP, RESTful APIs, MVC, Session Authentication, Role-Based Access Control ·
**Databases** MySQL, SQL, joins, subqueries, normalization, indexing, query optimization, CRUD ·
**Testing** Manual Testing, Functional Testing, Regression Testing, Test Case Design, Defect Reporting, SDLC, STLC, Playwright, Selenium, Postman ·
**Tools** Git, GitHub, GitHub Actions, VS Code, Chrome DevTools, Linux, Agile / Scrum

Deliberately **absent**: MongoDB, Redux, Docker, AWS, Kubernetes, Jira, GraphQL, Next.js.
None of them has been used on a real project, and a keyword you cannot defend in an
interview costs more than the match it wins.

## Editing rules

- One page. Always.
- No tables, columns, icons, images or text boxes in the HTML — old parsers drop them.
- Keep the section names plain (`Career Objective`, `Technical Skills`, `Education`).
- Every bullet starts with a verb and says what changed, not what was "worked on".
- Never add a skill, project or date that cannot be shown in a repo or a certificate.
