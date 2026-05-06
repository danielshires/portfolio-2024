import type { Post } from '../sanity'

/** Group posts by calendar year (newest first). Undated posts go under "Other". */
export function groupPostsByYear(posts: Post[]): { label: string; posts: Post[] }[] {
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
