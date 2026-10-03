import type { ProcessStep } from '../types'

/**
 * "How I work" — the four steps from first message to handover. Clients are far
 * more likely to send that first message when they can see exactly what happens
 * after they do. Shown on the home Work section and on the /quote page.
 */
export default function Process({
  steps,
  title = 'How I work',
}: {
  steps?: ProcessStep[]
  title?: string
}) {
  if (!steps?.length) return null

  return (
    <div className="process-block">
      <h3 className="sub-title" style={{ marginBottom: 16 }}>
        {title}
      </h3>
      <div className="process-grid">
        {steps.map((step, i) => (
          <article
            className="process-step reveal"
            data-delay={String((i % 4) + 1)}
            key={`${step.title}-${i}`}
          >
            <span className="process-num">STEP {String(i + 1).padStart(2, '0')}</span>
            <h4 className="process-title">{step.title}</h4>
            <p className="process-desc">{step.description}</p>
          </article>
        ))}
      </div>
    </div>
  )
}
