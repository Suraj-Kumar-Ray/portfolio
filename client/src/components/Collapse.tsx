import { useState, type ReactNode } from 'react'


/**
 * A long list that shows only the first few items on phones, with a "Show all"
 * button. Desktop is completely unaffected — the button is hidden there and
 * every item stays visible (see `.collapse` in global.css).
 *
 * This exists so the single page stays a single page but stops being an endless
 * scroll on a phone.
 */
export default function Collapse({
  count,
  limit = 3,
  className,
  children,
}: {
  /** Total number of items, used to decide whether the button is needed. */
  count: number
  /** How many items stay visible on phones. */
  limit?: number
  className: string
  children: ReactNode
}) {
  const [open, setOpen] = useState(false)
  const needsButton = count > limit

  return (
    <>
      <div className={`${className} collapse ${open ? 'collapse-open' : ''}`} data-limit={limit}>
        {children}
      </div>
      {needsButton && (
        <button
          type="button"
          className="collapse-toggle"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? 'Show less' : `Show all ${count}`}
        </button>
      )}
    </>
  )
}
