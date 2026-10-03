import { useState } from 'react'
import { Plus } from 'lucide-react'
import Section from './Section'
import type { Faq as FaqType } from '../types'

export default function Faq({ faq }: { faq: FaqType[] }) {
  const [open, setOpen] = useState<number | null>(0)
  if (!faq?.length) return null

  return (
    <Section
      id="faq"
      eyebrow="FAQ"
      title={
        <>
          Frequently asked <span className="gradient-text">questions</span>
        </>
      }
      alt
      center
    >
      <div className="faq-list">
        {faq.map((item, i) => (
          <div className={`faq-item reveal ${open === i ? 'open' : ''}`} key={item.question}>
            <button
              type="button"
              className="faq-q"
              aria-expanded={open === i}
              aria-controls={`faq-a-${i}`}
              onClick={() => setOpen(open === i ? null : i)}
            >
              {item.question}
              <Plus size={19} />
            </button>
            <div className="faq-a-wrap" id={`faq-a-${i}`} role="region">
              <div className="faq-a">
                <p>{item.answer}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Section>
  )
}
