import { Icon } from '../icons'
import Section from './Section'
import Collapse from './Collapse'
import type { Service } from '../types'

export default function Services({ services }: { services: Service[] }) {
  if (!services?.length) return null
  return (
    <Section
      id="services"
      eyebrow="What I Do"
      title={
        <>
          Services I <span className="gradient-text">offer</span>
        </>
      }
      sub="End-to-end capability — from the first component to the production deploy."
      alt
      center
    >
      <Collapse className="services-grid" count={services.length} limit={2}>
        {services.map((service, i) => (
          <article className="service-card reveal" data-delay={String((i % 4) + 1)} key={service.title}>
            <span className="service-icon">
              <Icon name={service.icon} size={24} />
            </span>
            <h3 className="service-title">{service.title}</h3>
            <p className="service-desc">{service.description}</p>
          </article>
        ))}
      </Collapse>
    </Section>
  )
}
