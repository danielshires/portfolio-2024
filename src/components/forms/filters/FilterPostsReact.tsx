import { useState } from 'react'
import type { Post } from '../../../lib/sanity'
import PostCard from '../../content/posts/PostCard.jsx'
import { filtersNavTopClass, sectionYearLabelClass } from '../../ui/text/styles'

interface FilterPostsReactProps {
  posts: Post[]
  categories: string[]
  tags: string[]
}

/** Group posts by calendar year (newest years first). Posts without a valid date land in "Other". */
function groupPostsByYear(posts: Post[]): { label: string; posts: Post[] }[] {
  const byYear = new Map<number, Post[]>()
  const undated: Post[] = []

  for (const post of posts) {
    const raw = post.publishedAt
    const d = raw ? new Date(raw) : undefined
    const y = d && !Number.isNaN(d.getTime()) ? d.getFullYear() : undefined
    if (y === undefined) {
      undated.push(post)
      continue
    }
    const list = byYear.get(y) ?? []
    list.push(post)
    byYear.set(y, list)
  }

  const sections = [...byYear.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([year, sectionPosts]) => ({ label: String(year), posts: sectionPosts }))

  if (undated.length > 0) {
    sections.push({ label: 'Other', posts: undated })
  }

  return sections
}

export default function FilterPostsReact({
  posts = [],
  categories = [],
  tags = [],
}: FilterPostsReactProps) {
  const [activeFilter, setActiveFilter] = useState('all')

  const filterLower = activeFilter.toLowerCase()
  let filtered = posts
  if (activeFilter !== 'all') {
    filtered = posts.filter(
      (p) =>
        (p.category || '').toLowerCase() === filterLower ||
        (p.tags || []).map((t) => t.toLowerCase()).includes(filterLower),
    )
  }

  const grouped = groupPostsByYear(filtered)

  return (
    <div className="w-full">
      <nav className={`flex flex-wrap gap-2 ${filtersNavTopClass}`} aria-label="Post filters">
        <button
          className={`px-4 py-1 rounded-full border text-sm font-mono uppercase transition-all duration-200 ${activeFilter === 'all' ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900' : 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border-zinc-200 dark:border-zinc-700'}`}
          aria-pressed={activeFilter === 'all'}
          onClick={() => setActiveFilter('all')}
          type="button"
        >
          All
        </button>
        {categories.map((category) => (
          <button
            key={category}
            className={`px-4 py-1 rounded-full border text-sm font-mono uppercase transition-all duration-200 ${activeFilter === category ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900' : 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border-zinc-200 dark:border-zinc-700'}`}
            aria-pressed={activeFilter === category}
            onClick={() => setActiveFilter(category)}
            type="button"
          >
            {category}
          </button>
        ))}
        {tags.map((tag) => (
          <button
            key={tag}
            className={`px-4 py-1 rounded-full border text-sm font-normal transition-all duration-200 ${activeFilter === tag ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900' : 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border-zinc-200 dark:border-zinc-700'}`}
            aria-pressed={activeFilter === tag}
            onClick={() => setActiveFilter(tag)}
            type="button"
          >
            {tag}
          </button>
        ))}
      </nav>
      <div className="mt-12 max-w-3xl">
        {filtered.length === 0 ? (
          <div className="col-span-full text-center text-zinc-500 dark:text-zinc-400">
            No posts found.
          </div>
        ) : (
          grouped.map(({ label, posts: yearPosts }, index) => (
            <section
              key={label}
              className={index > 0 ? 'mt-14' : ''}
              aria-labelledby={`journal-year-${label}`}
            >
              <h2 id={`journal-year-${label}`} className={sectionYearLabelClass}>
                {label}
              </h2>
              <div className="flex flex-col">
                {yearPosts.map((post) => (
                  <div key={post._id}>
                    <PostCard post={post} showDescription={false} />
                  </div>
                ))}
              </div>
            </section>
          ))
        )}
      </div>
    </div>
  )
}
