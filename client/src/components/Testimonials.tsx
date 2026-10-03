import { Star } from 'lucide-react'
import Section from './Section'
import type { Testimonial } from '../types'

const initials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()

export default function Testimonials({ testimonials }: { testimonials: Testimonial[] }) {
  if (!testimonials?.length) return null

  return (
    <Section
      id="testimonials"
      eyebrow="Testimonials"
      title={
        <>
          What people <span className="gradient-text">say about me</span>
        </>
      }
      sub="Feedback from managers, founders and clients I've worked with."
      center
    >
      <div className="testimonials-grid">
        {testimonials.map((t, i) => (
          <article className="testimonial-card reveal" data-delay={String((i % 3) + 1)} key={t.name}>
            <span className="quote-mark" aria-hidden="true">
              &rdquo;
            </span>

            <div className="stars" aria-label={`${t.rating} out of 5 stars`}>
              {Array.from({ length: t.rating }).map((_, s) => (
                <Star key={s} size={15} fill="currentColor" />
              ))}
            </div>

            <p className="testimonial-text">“{t.text}”</p>

            <div className="t-person">
              <span className="t-avatar" aria-hidden="true">
                {initials(t.name)}
              </span>
              <div>
                <p className="t-name">{t.name}</p>
                <p className="t-role">
                  {t.role} · {t.company}
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </Section>
  )
}
