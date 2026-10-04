import type { ReactNode } from 'react'
import { accentTitle, headingFor } from '../headings'

interface SectionProps {
  id: string
  eyebrow: string
  title: ReactNode
  sub?: string
  alt?: boolean
  center?: boolean
  children: ReactNode
  className?: string
}

export default function Section({ id, eyebrow, title, sub, alt, center, children, className = '' }: SectionProps) {
  // Every heading can be overridden from the dashboard (content.json → headings).
  // With no saved override we fall back to the copy shipped in the component.
  const override = headingFor(id)
  const shownEyebrow = override?.eyebrow || eyebrow
  const shownTitle = override?.title ? accentTitle(override.title) : title
  const shownSub = override?.sub || sub

  return (
    <section id={id} className={`section ${alt ? 'section-alt' : ''} ${className}`.trim()}>
      <div className="container">
        <header className={`section-head ${center ? 'center' : ''} reveal`}>
          <span className="eyebrow">
            {/* CSS counter → 01, 02, … as you scroll; hidden from screen readers */}
            <span className="eyebrow-num" aria-hidden="true" />
            {shownEyebrow}
          </span>
          <h2 className="section-title">{shownTitle}</h2>
          {shownSub && <p className="section-sub">{shownSub}</p>}
        </header>
        {children}
      </div>
    </section>
  )
}
