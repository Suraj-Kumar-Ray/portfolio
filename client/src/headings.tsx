import type { ReactNode } from 'react'
import type { SectionHeading } from './types'

/**
 * Section headings are editable from the admin dashboard (the `headings` list in
 * content.json). App fills this cache as soon as content loads, and every
 * <Section> resolves its own copy by id — so a section with no saved override
 * keeps rendering the built-in text below.
 */
let cached: SectionHeading[] = []

export function setHeadings(list: SectionHeading[] | undefined) {
  cached = Array.isArray(list) ? list : []
}

export function headingFor(key: string): SectionHeading | undefined {
  return cached.find((h) => h && h.key === key)
}

/**
 * Turns `Text **accent** text` into nodes, wrapping the accent phrase in the
 * gradient span — the same look the hard-coded titles have today.
 */
export function accentTitle(text: string): ReactNode {
  const parts = String(text ?? '').split(/\*\*(.+?)\*\*/g)
  if (parts.length === 1) return text
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <span className="gradient-text" key={i}>
        {part}
      </span>
    ) : (
      <span key={i}>{part}</span>
    )
  )
}
