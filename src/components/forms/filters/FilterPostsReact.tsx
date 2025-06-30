import React, { useState } from 'react'
import type { Post } from '../../../lib/sanity'
import PostCard from '../../content/posts/PostCard'

interface FilterPostsReactProps {
  posts: Post[]
  categories: string[]
  tags: string[]
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
        (p.tags || []).map((t) => t.toLowerCase()).includes(filterLower)
    )
  }

  return (
    <div className="w-full">
      <nav className="flex flex-wrap gap-2 mt-12" aria-label="Post filters">
        <button
          className={`px-4 py-1 rounded-full border text-sm font-mono uppercase transition-all duration-200 ${activeFilter === 'all' ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-900 border-zinc-200'}`}
          aria-pressed={activeFilter === 'all'}
          onClick={() => setActiveFilter('all')}
          type="button"
        >
          All
        </button>
        {categories.map((category) => (
          <button
            key={category}
            className={`px-4 py-1 rounded-full border text-sm font-mono uppercase transition-all duration-200 ${activeFilter === category ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-900 border-zinc-200'}`}
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
            className={`px-4 py-1 rounded-full border text-sm font-normal transition-all duration-200 ${activeFilter === tag ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-900 border-zinc-200'}`}
            aria-pressed={activeFilter === tag}
            onClick={() => setActiveFilter(tag)}
            type="button"
          >
            {tag}
          </button>
        ))}
      </nav>
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
        {/* <h2 className="col-span-12 text-base text-zinc-800 font-medium">Posts</h2> */}
        {filtered.map((post) => (
          <div key={post._id}>
            <PostCard post={post} />
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full text-center text-zinc-500 dark:text-zinc-400">
            No posts found.
          </div>
        )}
      </section>
    </div>
  )
}
