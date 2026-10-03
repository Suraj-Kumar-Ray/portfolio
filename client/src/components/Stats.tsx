import { useEffect, useRef, useState } from 'react'
import type { Stat } from '../types'

function Counter({ value, suffix }: { value: number; suffix: string }) {
  const [display, setDisplay] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const started = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const run = () => {
      if (started.current) return
      started.current = true
      const duration = 1600
      const start = performance.now()
      const step = (now: number) => {
        const p = Math.min((now - start) / duration, 1)
        const eased = 1 - Math.pow(1 - p, 3)
        setDisplay(Math.round(value * eased))
        if (p < 1) requestAnimationFrame(step)
      }
      requestAnimationFrame(step)
    }

    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && run()),
      { threshold: 0.4 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [value])

  return (
    <span ref={ref}>
      {display.toLocaleString()}
      {suffix}
    </span>
  )
}

export default function Stats({ stats }: { stats: Stat[] }) {
  if (!stats?.length) return null
  return (
    <section className="section section-alt stats">
      <div className="container">
        <div className="stats-grid">
          {stats.map((stat, i) => (
            <div className="stat-card reveal" data-delay={String(i + 1)} key={stat.label}>
              <div className="stat-value">
                <Counter value={stat.value} suffix={stat.suffix} />
              </div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
