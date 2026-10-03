import { ArrowLeft, ArrowRight, Calendar, Clock } from 'lucide-react'
import Section from './Section'
import ShareBar from './ShareBar'
import SubPage from './SubPage'
import type { BlogBlock, BlogPost, Profile } from '../types'

const MONTHS: Record<string, number> = {
  jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
  jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
}

/** "Sep 2026" / "2026" → sortable number (newest first everywhere). */
function dateValue(s: string): number {
  const str = String(s || '').trim()
  const m = str.match(/^([A-Za-z]{3,})\s+(\d{4})$/)
  const mon = m ? MONTHS[m[1].slice(0, 3).toLowerCase()] : 0
  if (m && mon) return Number(m[2]) * 12 + mon
  const y = str.match(/(\d{4})/)
  return y ? Number(y[1]) * 12 : 0
}

const byNewest = (a: BlogPost, b: BlogPost) => dateValue(b.date) - dateValue(a.date)

function PostMeta({ post }: { post: BlogPost }) {
  return (
    <div className="note-meta">
      <Calendar size={13} /> {post.date}
      {post.readTime ? (
        <>
          <Clock size={13} /> {post.readTime}
        </>
      ) : null}
    </div>
  )
}

/** Home-page preview: the three newest notes + a link to the full list. */
export function Notes({ block }: { block: BlogBlock }) {
  const posts = [...(block.posts || [])].sort(byNewest)
  if (!posts.length) return null

  return (
    <Section
      id="blog"
      eyebrow="Notes"
      title={
        <>
          Latest <span className="gradient-text">notes</span>
        </>
      }
      sub={block.subtitle}
      center
    >
      <div className="notes-grid">
        {posts.slice(0, 3).map((post, i) => (
          <a className="note-card reveal" data-delay={String((i % 3) + 1)} key={post.slug} href={`/blog/${post.slug}`}>
            <PostMeta post={post} />
            <h3 className="note-title">{post.title}</h3>
            <p className="note-excerpt">{post.excerpt}</p>
            <span className="note-more">
              Read note <ArrowRight size={14} />
            </span>
          </a>
        ))}
      </div>
      <div className="notes-all reveal">
        <a className="btn btn-ghost" href="/blog">
          View all notes <ArrowRight size={16} />
        </a>
      </div>
    </Section>
  )
}

/** Standalone /blog page — every note, newest first. */
export function BlogIndex({ block, profile }: { block: BlogBlock; profile: Profile }) {
  const posts = [...(block.posts || [])].sort(byNewest)

  return (
    <SubPage profile={profile} title={`${block.title || 'Notes'} · ${profile.name}`}>
      <section className="subpage-hero">
        <div className="container">
          <span className="eyebrow">Notes</span>
          <h1 className="section-title">{block.title || 'Notes'}</h1>
          {block.subtitle && <p className="section-sub">{block.subtitle}</p>}
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="notes-list">
            {posts.map((post) => (
              <a className="note-row reveal" key={post.slug} href={`/blog/${post.slug}`}>
                <div>
                  <PostMeta post={post} />
                  <h2 className="note-row-title">{post.title}</h2>
                  <p className="note-excerpt">{post.excerpt}</p>
                  {post.tags?.length ? (
                    <div className="tag-row">
                      {post.tags.map((t) => (
                        <span className="tag" key={t}>
                          {t}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
                <ArrowRight size={18} className="note-row-arrow" />
              </a>
            ))}
            {!posts.length && (
              <p style={{ color: 'var(--muted)' }}>No notes published yet — check back soon.</p>
            )}
          </div>
        </div>
      </section>
    </SubPage>
  )
}

/** Standalone /blog/:slug page — the note itself. */
export function BlogPostView({ post, profile }: { post?: BlogPost; profile: Profile }) {
  if (!post) {
    return (
      <SubPage profile={profile} title={`Note not found · ${profile.name}`}>
        <section className="section">
          <div className="container" style={{ textAlign: 'center', padding: '80px 0' }}>
            <h1 className="section-title">Note not found</h1>
            <p className="section-sub">This note may have been renamed or removed.</p>
            <a className="btn btn-primary" href="/blog">
              <ArrowLeft size={16} /> All notes
            </a>
          </div>
        </section>
      </SubPage>
    )
  }

  return (
    <SubPage profile={profile} title={`${post.title} · ${profile.name}`}>
      <article>
        <header className="subpage-hero">
          <div className="container">
            <span className="eyebrow">Notes</span>
            <h1 className="section-title">{post.title}</h1>
            <PostMeta post={post} />
            {post.tags?.length ? (
              <div className="tag-row" style={{ marginTop: 14 }}>
                {post.tags.map((t) => (
                  <span className="tag" key={t}>
                    {t}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </header>

        <div className="container post-container">
          <div className="post-body">
            {post.body.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>

          <ShareBar title={post.title} label="Share this note" />

          <div className="post-foot">
            <a className="btn btn-ghost" href="/blog">
              <ArrowLeft size={16} /> All notes
            </a>
            <a className="btn btn-primary" href="/#contact">
              Discuss this with me <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </article>
    </SubPage>
  )
}
