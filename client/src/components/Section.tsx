import type { ReactNode } from 'react'

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
  return (
    <section id={id} className={`section ${alt ? 'section-alt' : ''} ${className}`.trim()}>
      <div className="container">
        <header className={`section-head ${center ? 'center' : ''} reveal`}>
          <span className="eyebrow">
            {/* CSS counter → 01, 02, … as you scroll; hidden from screen readers */}
            <span className="eyebrow-num" aria-hidden="true" />
            {eyebrow}
          </span>
          <h2 className="section-title">{title}</h2>
          {sub && <p className="section-sub">{sub}</p>}
        </header>
        {children}
      </div>
    </section>
  )
}
