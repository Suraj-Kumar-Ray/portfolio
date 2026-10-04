import { CheckCircle2, MapPin, Mail, Phone, Briefcase, Sparkles, Languages } from 'lucide-react'
import Section from './Section'
import type { Profile } from '../types'

export default function About({ profile }: { profile: Profile }) {
  const facts = [
    { icon: <MapPin size={18} />, label: 'Location', value: profile.location },
    { icon: <Mail size={18} />, label: 'Email', value: profile.email },
    { icon: <Phone size={18} />, label: 'Phone', value: profile.phone },
    { icon: <Briefcase size={18} />, label: 'Experience', value: 'Fresher · Internship at HAL' },
    { icon: <Languages size={18} />, label: 'Languages', value: profile.languages?.join(' · ') || 'English · Hindi' },
    { icon: <Sparkles size={18} />, label: 'Status', value: profile.availability },
  ]

  return (
    <Section
      id="about"
      eyebrow="About Me"
      title={
        <>
          Passionate developer who turns <span className="gradient-text">ideas into products</span>
        </>
      }
    >
      <div className="about-grid">
        <div className="about-copy reveal">
          {profile.about.map((para, i) => (
            <p key={i}>{para}</p>
          ))}

          <ul className="highlights">
            {profile.highlights.map((item) => (
              <li key={item}>
                <CheckCircle2 size={17} />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <aside className="facts-card reveal" data-delay="2">
          <h3 className="sub-title" style={{ marginBottom: 0 }}>
            <Sparkles size={18} /> Quick facts
          </h3>
          <div className="facts">
            {facts.map((fact) => (
              <div className="fact" key={fact.label}>
                <span className="fact-icon">{fact.icon}</span>
                <span>
                  <span className="fact-label">{fact.label}</span>
                  <br />
                  <span className="fact-value">{fact.value}</span>
                </span>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </Section>
  )
}
