import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import Section from './Section'
import type { GalleryBlock } from '../types'

export default function Gallery({ block }: { block: GalleryBlock }) {
  const [open, setOpen] = useState<number | null>(null)
  const items = block?.items || []

  useEffect(() => {
    if (open === null) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(null)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  if (!items.length) return null

  return (
    <Section
      id="gallery"
      eyebrow="Gallery"
      title={
        <>
          Life <span className="gradient-text">beyond code</span>
        </>
      }
      sub={block.subtitle}
      alt
      center
    >
      <div className="gallery-grid">
        {items.map((item, i) => (
          <button
            type="button"
            className="gallery-item reveal"
            data-delay={String((i % 4) + 1)}
            key={`${item.image}-${i}`}
            onClick={() => setOpen(i)}
          >
            <img src={item.image} alt={item.caption} loading="lazy" />
            <span className="gallery-overlay">
              {item.tag && <span className="gallery-tag">{item.tag}</span>}
              <span className="gallery-caption">{item.caption}</span>
            </span>
          </button>
        ))}
      </div>

      {open !== null && (
        <div className="lightbox" role="dialog" aria-modal="true" onClick={() => setOpen(null)}>
          <button type="button" className="lightbox-close" aria-label="Close">
            <X size={20} />
          </button>
          <figure onClick={(e) => e.stopPropagation()}>
            <img src={items[open].image} alt={items[open].caption} />
            <figcaption>{items[open].caption}</figcaption>
          </figure>
        </div>
      )}
    </Section>
  )
}
