import { Award, GraduationCap, MapPin, Clock } from 'lucide-react'
import Section from './Section'
import Collapse from './Collapse'
import type { Certification, Education, Experience as Exp } from '../types'

interface Props {
  experience: Exp[]
  education: Education[]
  certifications: Certification[]
}

export default function Experience({ experience, education, certifications }: Props) {
  return (
    <Section
      id="experience"
      eyebrow="My Journey"
      title={
        <>
          Experience &amp; <span className="gradient-text">education</span>
        </>
      }
      sub="Where I've worked, what I shipped and what I learned along the way."
    >
      <Collapse className="timeline" count={experience.length} limit={3}>
        {experience.map((job, i) => (
          <article className="timeline-item reveal" data-delay={String(Math.min(i + 1, 3))} key={`${job.company}-${job.role}`}>
            <div className="timeline-card">
              <div className="timeline-top">
                <div>
                  <h3 className="timeline-role">{job.role}</h3>
                  <p className="timeline-company">{job.company}</p>
                </div>
                <span className="timeline-period">
                  <Clock size={13} /> {job.period}
                </span>
              </div>

              <div className="timeline-meta">
                <span>
                  <MapPin size={14} /> {job.location}
                </span>
                <span>{job.type}</span>
              </div>

              <p className="timeline-desc">{job.description}</p>

              <ul className="timeline-highlights">
                {job.highlights.map((h) => (
                  <li key={h}>{h}</li>
                ))}
              </ul>

              <div className="tag-row">
                {job.technologies.map((t) => (
                  <span className="tag" key={t}>
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </article>
        ))}
      </Collapse>

      <div className="dual-grid">
        <div className="reveal">
          <h3 className="sub-title">
            <GraduationCap size={19} /> Education
          </h3>
          <Collapse className="edu-list" count={education.length} limit={2}>
            {education.map((edu) => (
              <article className="edu-card" key={edu.degree}>
                <h4 className="edu-degree">{edu.degree}</h4>
                <p className="edu-school">{edu.school}</p>
                <p className="edu-period">{edu.period}</p>
                <p className="edu-desc">{edu.description}</p>
              </article>
            ))}
          </Collapse>
        </div>

        <div className="reveal" data-delay="2">
          <h3 className="sub-title">
            <Award size={19} /> Certifications
          </h3>
          <Collapse className="cert-list" count={certifications.length} limit={2}>
            {certifications.map((cert) => (
              <article className="cert-card" key={cert.name}>
                <span className="cert-icon">
                  <Award size={18} />
                </span>
                <div>
                  <p className="cert-name">{cert.name}</p>
                  <p className="cert-meta">
                    {cert.issuer} · {cert.year}
                  </p>
                </div>
              </article>
            ))}
          </Collapse>
        </div>
      </div>
    </Section>
  )
}
