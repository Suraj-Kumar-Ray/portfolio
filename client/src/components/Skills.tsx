import type { CSSProperties } from 'react'
import { Icon } from '../icons'
import Section from './Section'
import Collapse from './Collapse'
import type { SkillGroup } from '../types'

export default function Skills({ groups, tools }: { groups: SkillGroup[]; tools: string[] }) {
  const marquee = [...tools, ...tools]

  return (
    <Section
      id="skills"
      eyebrow="My Skills"
      title={
        <>
          The <span className="gradient-text">tech stack</span> I work with
        </>
      }
      sub="Years of hands-on experience across the modern web stack."
    >
      <Collapse className="skills-grid" count={groups.length} limit={2}>
        {groups.map((group, i) => (
          <article className="skill-group reveal" data-delay={String(i + 1)} key={group.category}>
            <header className="skill-group-head">
              <span className="service-icon">
                <Icon name={group.icon} size={20} />
              </span>
              <div>
                <h3 className="skill-group-title">{group.category}</h3>
                <span className="skill-group-count">{group.items.length} skills</span>
              </div>
            </header>

            {group.items.map((item) => (
              <div className="skill-item" key={item.name}>
                <div className="skill-top">
                  <span className="skill-name">{item.name}</span>
                  <span className="skill-level">{item.level}%</span>
                </div>
                <div
                  className="skill-bar"
                  role="progressbar"
                  aria-valuenow={item.level}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={item.name}
                >
                  <div className="skill-fill" style={{ '--level': `${item.level}%` } as CSSProperties} />
                </div>
              </div>
            ))}
          </article>
        ))}
      </Collapse>

      {tools.length > 0 && (
        <div className="marquee reveal" aria-label="Tools and technologies">
          <div className="marquee-track">
            {marquee.map((tool, i) => (
              <span className="tool-chip" key={`${tool}-${i}`}>
                {tool}
              </span>
            ))}
          </div>
        </div>
      )}
    </Section>
  )
}
