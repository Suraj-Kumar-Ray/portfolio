export interface Meta {
  siteName: string
  title: string
  description: string
  keywords: string[]
  themeColor: string
  ogImage: string
  favicon: string
  /** Where contact-form / enquiry alerts are emailed (free FormSubmit relay). */
  notifyEmail?: string
  /** Search-engine site-verification codes (Google Search Console / Bing Webmaster). */
  verification?: { google?: string; bing?: string }
  /** Instant phone alerts (Telegram bot). The token itself is never sent to the public site. */
  telegram?: { enabled?: boolean; botToken?: string; chatId?: string }
}

export interface Social {
  label: string
  url: string
  icon: string
}

export interface Stat {
  label: string
  value: number
  suffix: string
}

export interface Profile {
  name: string
  role: string
  tagline: string
  shortIntro: string
  location: string
  email: string
  phone: string
  avatar: string
  resumeUrl: string
  /** Optional calendar link (Calendly / Cal.com). Empty → WhatsApp callback request. */
  bookingUrl?: string
  availability: string
  yearsOfExperience: number
  about: string[]
  highlights: string[]
  languages: string[]
  stats: Stat[]
  socials: Social[]
}

export interface Service {
  title: string
  icon: string
  description: string
}

export interface SkillItem {
  name: string
  level: number
}

export interface SkillGroup {
  category: string
  icon: string
  items: SkillItem[]
}

export interface Experience {
  role: string
  company: string
  period: string
  location: string
  type: string
  description: string
  highlights: string[]
  technologies: string[]
}

export interface Education {
  degree: string
  school: string
  period: string
  description: string
}

export interface Certification {
  name: string
  issuer: string
  year: string
}

export interface ProjectLinks {
  live: string
  source: string
}

export interface Project {
  id: string
  title: string
  category: string
  featured: boolean
  year: string
  description: string
  highlights: string[]
  tech: string[]
  image: string
  links: ProjectLinks
  /** Deep-dive content for the project's own case-study page (/work/:id). */
  caseStudy?: { problem: string; solution: string; result: string }
}

export interface BlogPost {
  slug: string
  title: string
  date: string
  readTime?: string
  tags?: string[]
  excerpt: string
  body: string[]
}

export interface BlogBlock {
  title?: string
  subtitle?: string
  posts: BlogPost[]
}

export interface Testimonial {
  name: string
  role: string
  company: string
  rating: number
  text: string
}

export interface Achievement {
  title: string
  icon: string
  description: string
}

/** "Work with me" — the freelance / hire-me offer. */
export interface WorkPackage {
  title: string
  icon: string
  description: string
  features: string[]
  timeline: string
  price: string
}

export interface WorkBlock {
  eyebrow?: string
  title?: string
  subtitle?: string
  /** Heading / intro used by the standalone /quote page. */
  quoteTitle?: string
  quoteSub?: string
  formTitle?: string
  formSub?: string
  note?: string
  points?: string[]
  packages: WorkPackage[]
}

/** One step of the "How I work" process shown on the Work and Quote pages. */
export interface ProcessStep {
  title: string
  description: string
}

/** A company, university or training provider in the hero trust strip. */
export interface TrustItem {
  name: string
  role?: string
  year?: string
  /** Short monogram shown in the mark (e.g. "HAL"). Falls back to initials. */
  short?: string
}

/** Credibility strip under the hero: where I've worked/studied + a few wins. */
export interface TrustBlock {
  eyebrow?: string
  items?: TrustItem[]
  highlights?: string[]
}

/** The free-website-review lead magnet (/audit). */
export interface AuditBlock {
  title?: string
  subtitle?: string
  badge?: string
  points?: string[]
  note?: string
}

/** Every section can be switched on/off from the admin panel. */
export interface SectionConfig {
  key: string
  label: string
  enabled: boolean
}

export interface ProfileStat {
  label: string
  value: string
}

export interface CodingProfile {
  platform: string
  handle: string
  icon: string
  description: string
  stats: ProfileStat[]
  url: string
}

export interface CodingProfilesBlock {
  title?: string
  subtitle?: string
  profiles: CodingProfile[]
}

export interface GalleryItem {
  image: string
  caption: string
  tag?: string
}

export interface GalleryBlock {
  title?: string
  subtitle?: string
  items: GalleryItem[]
}

export interface UpdateItem {
  date: string
  type?: string
  title: string
  description: string
}

export interface UpdatesBlock {
  title?: string
  subtitle?: string
  items: UpdateItem[]
}

export interface Faq {
  question: string
  answer: string
}

/** Editable section heading (eyebrow / title / sub) — overrides the built-in copy.
 *  The title supports `**accent**` markers for the gradient phrase. */
export interface SectionHeading {
  key: string
  eyebrow?: string
  title?: string
  sub?: string
}

export interface Content {
  meta: Meta
  sections: SectionConfig[]
  headings?: SectionHeading[]
  profile: Profile
  services: Service[]
  skills: SkillGroup[]
  tools: string[]
  experience: Experience[]
  education: Education[]
  certifications: Certification[]
  projects: Project[]
  achievements: Achievement[]
  work: WorkBlock
  codingProfiles: CodingProfilesBlock
  gallery: GalleryBlock
  updates: UpdatesBlock
  blog: BlogBlock
  testimonials: Testimonial[]
  process: ProcessStep[]
  trust?: TrustBlock
  audit: AuditBlock
  faq: Faq[]
  updatedAt: string
}

export interface ContactPayload {
  name: string
  email: string
  subject: string
  message: string
  website?: string
}

export interface InquiryPayload {
  name: string
  email: string
  phone?: string
  projectType: string
  budget: string
  timeline: string
  message: string
  website?: string
}

export interface ApiResult<T> {
  ok: boolean
  data?: T
  message?: string
  error?: string
  errors?: string[]
}
