import { useCallback, useEffect, useMemo, useState } from 'react'
import { getContent } from './api'
import { trackVisit, trackSections } from './analytics'
import { useReveal } from './hooks/useReveal'
import { NAV_EVENT } from './navigation'
import type { Content, SectionConfig } from './types'

import ScrollProgress from './components/ScrollProgress'
import Testimonials from './components/Testimonials'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import TrustStrip from './components/TrustStrip'
import Stats from './components/Stats'
import About from './components/About'
import Services from './components/Services'
import Skills from './components/Skills'
import CodingProfiles from './components/CodingProfiles'
import Experience from './components/Experience'
import Projects from './components/Projects'
import Achievements from './components/Achievements'
import Work from './components/Work'
import Updates from './components/Updates'
import Gallery from './components/Gallery'
import Faq from './components/Faq'
import Contact from './components/Contact'
import Footer from './components/Footer'
import BackToTop from './components/BackToTop'
import QuickConnect from './components/QuickConnect'
import StickyCta from './components/StickyCta'
import { Notes, BlogIndex, BlogPostView } from './components/Blog'
import CaseStudy from './components/CaseStudy'
import Quote from './components/Quote'
import Audit from './components/Audit'
import NotFound from './components/NotFound'

// Standalone pages (/work/:id, /blog, /blog/:slug) are real URLs with their
// own server-injected SEO tags. The app renders them instead of the home page
// when the path matches; navigation between pages is a normal full page load.
const PATH = window.location.pathname.replace(/\/+$/, '') || '/'
const WORK_ID = (PATH.match(/^\/work\/([a-zA-Z0-9-]+)$/) || [])[1] || ''
const BLOG_SLUG = (PATH.match(/^\/blog\/([a-zA-Z0-9-]+)$/) || [])[1] || ''
const IS_QUOTE = PATH === '/quote'
const IS_AUDIT = PATH === '/audit'
const IS_SUB_PAGE = PATH === '/blog' || IS_QUOTE || IS_AUDIT || Boolean(WORK_ID) || Boolean(BLOG_SLUG)
// every URL the app knows how to render — anything else is a 404
const IS_KNOWN = PATH === '/' || PATH === '/blog' || IS_QUOTE || IS_AUDIT || Boolean(WORK_ID) || Boolean(BLOG_SLUG)

type State =
  | { status: 'loading' }
  | { status: 'ready'; content: Content }
  | { status: 'error'; message: string }

/** A section shows unless the backend explicitly disabled it. */
function buildToggle(sections: SectionConfig[] = []) {
  const map = new Map(sections.map((s) => [s.key, s.enabled]))
  return (key: string) => map.get(key) !== false
}

export default function App() {
  const [state, setState] = useState<State>({ status: 'loading' })
  const [attempt, setAttempt] = useState(0)

  const load = useCallback(async () => {
    setState({ status: 'loading' })
    try {
      const res = await getContent()
      if (res.ok && res.data) setState({ status: 'ready', content: res.data })
      else setState({ status: 'error', message: res.error || 'Could not load portfolio content.' })
    } catch {
      setState({ status: 'error', message: 'The API is unreachable. Make sure the backend is running.' })
    }
  }, [])

  useEffect(() => {
    load()
  }, [load, attempt])

  const ready = state.status === 'ready'
  const sections = state.status === 'ready' ? state.content.sections || [] : []
  const isOn = useMemo(() => buildToggle(sections), [sections])

  // nav links follow the same order as the backend section list
  const navLinks = useMemo(
    () => sections.filter((s) => s.enabled).map((s) => ({ id: s.key, label: s.label })),
    [sections]
  )

  // the "Hire Me" button goes to the project enquiry section when it is live
  const hireTarget = isOn('work') ? 'work' : isOn('contact') ? 'contact' : 'home'

  // Hero buttons, navbar links and footer links all jump through one place, so
  // the scroll behaves the same everywhere (and respects reduced-motion).
  useEffect(() => {
    const onNavigate = (event: Event) => {
      const id = (event as CustomEvent<string>).detail
      if (!id) return
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      document
        .getElementById(id)
        ?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
    }

    window.addEventListener(NAV_EVENT, onNavigate)
    return () => window.removeEventListener(NAV_EVENT, onNavigate)
  }, [])

  useReveal(ready)

  // privacy-friendly self-hosted analytics: one beacon per session, then one
  // per section the first time it is actually read
  useEffect(() => {
    if (!ready) return
    trackVisit()
    return trackSections(['home', 'stats', ...navLinks.map((l) => l.id)])
  }, [ready, navLinks])

  // Keep document metadata in sync with the CMS content. Sub-pages carry their
  // own server-injected <title>/description — their components set them instead.
  useEffect(() => {
    if (state.status !== 'ready' || IS_SUB_PAGE) return
    const { meta, profile } = state.content
    document.title = meta.title || `${profile.name} — ${profile.role}`
    const setMeta = (selector: string, attr: string, value: string) => {
      const el = document.querySelector(selector)
      if (el) el.setAttribute(attr, value)
    }
    setMeta('meta[name="description"]', 'content', meta.description)
    setMeta('meta[name="keywords"]', 'content', meta.keywords.join(', '))
    setMeta('meta[name="author"]', 'content', profile.name)
    setMeta('meta[property="og:title"]', 'content', meta.title)
    setMeta('meta[property="og:description"]', 'content', meta.description)
    setMeta('meta[name="twitter:title"]', 'content', meta.title)
    setMeta('meta[name="twitter:description"]', 'content', meta.description)
    if (meta.themeColor) setMeta('meta[name="theme-color"]', 'content', meta.themeColor)
  }, [state])

  if (state.status === 'loading') {
    return (
      <div className="splash">
        <div>
          <div className="spinner" />
          <p style={{ color: 'var(--muted)', letterSpacing: '0.18em', fontSize: '0.8rem', textTransform: 'uppercase' }}>
            Loading portfolio
          </p>
        </div>
      </div>
    )
  }

  if (state.status === 'error') {
    return (
      <div className="error-screen">
        <div>
          <div className="spinner" />
          <h1>Something went wrong</h1>
          <p>{state.message}</p>
          <button type="button" className="btn btn-primary" onClick={() => setAttempt((a) => a + 1)}>
            Try again
          </button>
        </div>
      </div>
    )
  }

  const {
    profile,
    services,
    skills,
    tools,
    experience,
    education,
    certifications,
    projects,
    achievements,
    work,
    codingProfiles,
    gallery,
    updates,
    blog,
    testimonials,
    process,
    trust,
    audit,
    faq,
  } = state.content

  if (!IS_KNOWN) return <NotFound profile={profile} />

  // standalone pages — real URLs, own chrome, own SEO (see server sendIndex)
  if (WORK_ID) return <CaseStudy project={projects.find((p) => p.id === WORK_ID)} profile={profile} />
  if (BLOG_SLUG) return <BlogPostView post={(blog?.posts || []).find((p) => p.slug === BLOG_SLUG)} profile={profile} />
  if (PATH === '/blog') return <BlogIndex block={blog || { posts: [] }} profile={profile} />
  if (IS_QUOTE) return <Quote work={work} profile={profile} process={process} />
  if (IS_AUDIT) return <Audit audit={audit} profile={profile} />

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <ScrollProgress />
      <Navbar
        name={profile.name}
        initial={profile.name.charAt(0).toUpperCase()}
        links={navLinks}
        hireTarget={hireTarget}
      />

      <main id="main">
        <Hero profile={profile} />
        <TrustStrip block={trust} />
        <Stats stats={profile.stats} />
        {isOn('about') && <About profile={profile} />}
        {isOn('services') && <Services services={services} />}
        {isOn('skills') && <Skills groups={skills} tools={tools} />}
        {isOn('codingProfiles') && <CodingProfiles block={codingProfiles} />}
        {isOn('experience') && (
          <Experience experience={experience} education={education} certifications={certifications} />
        )}
        {isOn('projects') && <Projects projects={projects} />}
        {isOn('achievements') && <Achievements achievements={achievements} />}
        {isOn('updates') && <Updates block={updates} />}
        {isOn('work') && work && <Work block={work} profile={profile} process={process} />}
        {isOn('gallery') && <Gallery block={gallery} />}
        {isOn('testimonials') && testimonials?.length > 0 && <Testimonials testimonials={testimonials} />}
        {isOn('blog') && blog?.posts?.length > 0 && <Notes block={blog} />}
        {isOn('faq') && <Faq faq={faq} />}
        {isOn('contact') && <Contact profile={profile} />}
      </main>

      <Footer profile={profile} links={navLinks} />
      <BackToTop />
      <QuickConnect profile={profile} />
      <StickyCta profile={profile} />
    </>
  )
}
