import { Icon } from '../icons'
import Section from './Section'
import Collapse from './Collapse'
import type { UpdatesBlock } from '../types'

export default function Updates({ block }: { block: UpdatesBlock }) {
  if (!block?.items?.length) return null

  return (
    <Section
      id="updates"
      eyebrow="Latest"
      title={
        <>
          What&rsquo;s <span className="gradient-text">new</span>
        </>
      }
      sub={block.subtitle}
      alt
    >
      <Collapse className="updates-list" count={block.items.length} limit={3}>
        {block.items.map((item, i) => (
          <article className="update-item reveal" data-delay={String(Math.min(i + 1, 3))} key={`${item.date}-${item.title}`}>
            <span className="update-dot">
              <Icon name={item.type || 'sparkles'} size={15} />
            </span>
            <div className="update-body">
              <span className="update-date">{item.date}</span>
              <h3 className="update-title">{item.title}</h3>
              <p className="update-desc">{item.description}</p>
            </div>
          </article>
        ))}
      </Collapse>
    </Section>
  )
}
