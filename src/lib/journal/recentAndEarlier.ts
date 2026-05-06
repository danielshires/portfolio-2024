import type { Post } from '../sanity'

/** How many newest posts appear under “Recent” on `/journal` and on the homepage Writing block. */
export const WRITING_RECENT_POST_COUNT = 3

/** Writing index sections: newest posts under “Recent”, the rest under “Earlier”. */
export function groupRecentAndEarlier(posts: Post[]): { label: string; posts: Post[] }[] {
  if (posts.length === 0) return []

  const recent = posts.slice(0, WRITING_RECENT_POST_COUNT)
  const earlier = posts.slice(WRITING_RECENT_POST_COUNT)

  const sections: { label: string; posts: Post[] }[] = [{ label: 'Recent', posts: recent }]
  if (earlier.length > 0) {
    sections.push({ label: 'Earlier', posts: earlier })
  }
  return sections
}
