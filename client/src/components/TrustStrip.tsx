import type { TrustBlock, TrustItem } from '../types'

/** "Chandigarh University" → "CU", "Hindustan Aeronautics Limited" → "HAL". */
function monogram(item: TrustItem) {
  if (item.short) return item.short
  return item.name
    .split(/\s+/)
    .filter((w) => !/^\(|\)$/.test(w))
    .slice(0, 3)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
}

/**
 * A slim credibility band directly under the hero: the organisations behind the
 * work (company, universities, training) and a couple of concrete wins. Real
 * affiliations are the fastest way for a visitor to trust the rest of the page,
 * so this sits just below the hero rather than buried further down.
 */
export default function TrustStrip({ block }: { block?: TrustBlock }) {
  const items = block?.items || []
  const highlights = block?.highlights || []
  if (!items.length && !highlights.length) return null

  return (
    <section className="trust-strip" aria-label={block?.eyebrow || 'Experience and education'}>
      <div className="container trust-inner reveal">
        <div className="trust-head">
          {block?.eyebrow && <span className="trust-eyebrow">{block.eyebrow}</span>}
          {highlights.length > 0 && (
            <ul className="trust-badges">
              {highlights.map((text) => (
                <li key={text}>
                  <span aria-hidden="true">🏆</span> {text}
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <ul className="trust-items">
            {items.map((item) => (
              <li className="trust-item" key={item.name}>
                <span className="trust-mark" aria-hidden="true">
                  {monogram(item)}
                </span>
                <span className="trust-copy">
                  <span className="trust-name">{item.name}</span>
                  <span className="trust-role">
                    {[item.role, item.year].filter(Boolean).join(' · ')}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
