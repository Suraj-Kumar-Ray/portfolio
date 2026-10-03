import { Icon } from '../icons'
import Section from './Section'
import Collapse from './Collapse'
import type { Achievement } from '../types'

export default function Achievements({ achievements }: { achievements: Achievement[] }) {
  if (!achievements?.length) return null

  return (
    <Section
      id="achievements"
      eyebrow="Recognition"
      title={
        <>
          Achievements &amp; <span className="gradient-text">milestones</span>
        </>
      }
      sub="Awards, hackathons, training and research work beyond the classroom."
      center
    >
      <Collapse className="services-grid" count={achievements.length} limit={3}>
        {achievements.map((item, i) => (
          <article className="service-card reveal" data-delay={String((i % 4) + 1)} key={item.title}>
            <span className="service-icon">
              <Icon name={item.icon} size={24} />
            </span>
            <h3 className="service-title">{item.title}</h3>
            <p className="service-desc">{item.description}</p>
          </article>
        ))}
      </Collapse>
    </Section>
  )
}
