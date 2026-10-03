import { useState } from 'react'
import { ArrowUpRight, Download, MapPin, Mail, Briefcase } from 'lucide-react'
import { goToSection } from '../navigation'
import type { Profile } from '../types'

const initials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()

export default function Hero({ profile }: { profile: Profile }) {
  const [photoFailed, setPhotoFailed] = useState(false)
  // routed through the app so a phone switches to the right tab first
  const scrollTo = (id: string) => goToSection(id)

  return (
    <section id="home" className="hero">
      <div className="container hero-grid">
        <div className="hero-copy">
          <span className="badge reveal">
            <span className="dot" />
            {profile.availability}
          </span>

          <p className="hero-intro reveal" data-delay="1">
            {profile.shortIntro}
          </p>

          <h1 className="hero-title reveal" data-delay="1">
            {profile.name}
          </h1>

          <div className="hero-role reveal" data-delay="2">
            <span className="divider" aria-hidden="true" />
            <span className="gradient-text">{profile.role}</span>
          </div>

          <p className="hero-tagline reveal" data-delay="2">
            {profile.tagline}
          </p>

          <div className="hero-actions reveal" data-delay="3">
            <button type="button" className="btn btn-primary" onClick={() => scrollTo('projects')}>
              View My Work <ArrowUpRight size={17} />
            </button>
            <a className="btn btn-ghost" href={profile.resumeUrl} download>
              <Download size={17} />
              {/* short label on phones so both CTAs fit on one line */}
              <span className="label-full">Download Resume</span>
              <span className="label-short">Resume</span>
            </a>
          </div>

          <div className="hero-meta reveal" data-delay="4">
            <span>
              <MapPin size={15} /> {profile.location}
            </span>
            <span>
              <Mail size={15} /> {profile.email}
            </span>
            <span>
              <Briefcase size={15} /> {profile.yearsOfExperience}+ years experience
            </span>
          </div>
        </div>

        <div className="hero-visual reveal" data-delay="2">
          <div className="avatar-ring">
            <div className="avatar-inner">
              {profile.avatar && !photoFailed ? (
                <img
                  className="avatar-photo"
                  src={profile.avatar}
                  alt={`${profile.name} — ${profile.role}`}
                  onError={() => setPhotoFailed(true)}
                />
              ) : (
                <div>
                  <span className="avatar-initials">{initials(profile.name)}</span>
                  <span className="avatar-role">{profile.role}</span>
                </div>
              )}
            </div>
          </div>

          {/* desktop: these float over the photo (`display: contents` makes the
              wrapper invisible to layout). phones: they become a tidy row below
              the photo, where they cannot cover the face. */}
          <div className="hero-chips">
            <div className="float-chip c1">
              {'</>'} Clean Code
            </div>
            <div className="float-chip c2">⚡ Fast &amp; Accessible</div>
            <div className="float-chip c3">🚀 Ship-It Mentality</div>
          </div>
        </div>
      </div>

      <div className="scroll-cue" aria-hidden="true">
        <span className="mouse" />
        Scroll
      </div>
    </section>
  )
}
