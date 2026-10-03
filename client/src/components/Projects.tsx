import { useMemo, useState } from 'react'
import { ExternalLink, Github, Star } from 'lucide-react'
import Section from './Section'
import Collapse from './Collapse'
import type { Project } from '../types'

export default function Projects({ projects }: { projects: Project[] }) {
  const categories = useMemo(() => ['All', ...new Set(projects.map((p) => p.category))], [projects])
  const [filter, setFilter] = useState('All')

  const visible = useMemo(
    () => (filter === 'All' ? projects : projects.filter((p) => p.category === filter)),
    [filter, projects]
  )

  return (
    <Section
      id="projects"
      eyebrow="Portfolio"
      title={
        <>
          Featured <span className="gradient-text">projects</span>
        </>
      }
      sub="A selection of products I've designed, built and shipped."
      alt
      center
    >
      <div className="filter-bar reveal" role="tablist" aria-label="Filter projects by category">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            role="tab"
            aria-selected={filter === cat}
            className={`filter-btn ${filter === cat ? 'active' : ''}`}
            onClick={() => setFilter(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <Collapse className="projects-grid" count={visible.length} limit={3}>
        {visible.map((project, i) => (
          <article className="project-card" key={project.id} style={{ animationDelay: `${i * 70}ms` }}>
            <div className="project-media">
              <img src={project.image} alt={`${project.title} preview`} loading="lazy" />
              <span className="project-cat">{project.category}</span>
              <span className="project-year">{project.year}</span>
            </div>

            <div className="project-body">
              <h3 className="project-title">
                {project.title}
                {project.featured && <Star size={15} className="featured-star" fill="currentColor" />}
              </h3>

              <p className="project-desc">{project.description}</p>

              {project.highlights?.length > 0 && (
                <ul className="project-highlights">
                  {project.highlights.slice(0, 3).map((h) => (
                    <li key={h}>{h}</li>
                  ))}
                </ul>
              )}

              <div className="tag-row">
                {project.tech.slice(0, 5).map((t) => (
                  <span className="tag" key={t}>
                    {t}
                  </span>
                ))}
              </div>

              <div className="project-footer">
                <div className="project-links">
                  {project.links?.live && (
                    <a className="primary" href={project.links.live} target="_blank" rel="noreferrer noopener">
                      <ExternalLink size={15} /> Live
                    </a>
                  )}
                  {project.links?.source && (
                    <a href={project.links.source} target="_blank" rel="noreferrer noopener">
                      <Github size={15} /> Code
                    </a>
                  )}
                </div>
              </div>
            </div>
          </article>
        ))}
      </Collapse>

      {visible.length === 0 && (
        <p style={{ textAlign: 'center', color: 'var(--muted)', marginTop: 24 }}>
          No projects in this category yet — check back soon.
        </p>
      )}
    </Section>
  )
}
