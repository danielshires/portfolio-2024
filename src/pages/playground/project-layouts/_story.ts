// Shared by the layout prototypes and the "full story" page.
import type { PortableTextBlock } from '@portabletext/types'
import type { Project } from '../../../lib/sanity'

export type StorySection = { id: string; heading: string; body: PortableTextBlock[] }

export const storySections = (project: Project): StorySection[] =>
  [
    { id: 'challenge', heading: 'The challenge', body: project.problem },
    { id: 'contribution', heading: 'My contribution', body: project.contribution },
    { id: 'approach', heading: 'The approach', body: project.solution },
    { id: 'outcome', heading: 'The outcome', body: project.outcomeSummary },
    { id: 'learned', heading: 'What I learned', body: project.learnings },
  ].filter((s): s is StorySection => Array.isArray(s.body) && s.body.length > 0)

// Only projects with a real write-up get a story page; a line or two stays on the visual page.
export const hasFullStory = (sections: StorySection[]) => sections.length >= 3

export const blockText = (block?: PortableTextBlock) =>
  (block?.children as { text?: string }[] | undefined)?.map((c) => c.text ?? '').join('') ?? ''

export const readMinutes = (sections: StorySection[]) => {
  const words = sections
    .flatMap((s) => s.body)
    .reduce((n, b) => n + blockText(b).split(/\s+/).filter(Boolean).length, 0)
  return Math.max(1, Math.ceil(words / 220))
}

export const shortHeading = (heading: string) =>
  heading.replace(/^The /, '').replace(/^\w/, (c) => c.toUpperCase())

// Sanity lists can carry blank entries, which would otherwise leave a trailing "&".
export const formatList = (items?: string[]) => {
  const list = (items ?? []).map((item) => item.trim()).filter(Boolean)
  return list.length > 1 ? `${list.slice(0, -1).join(', ')} & ${list.at(-1)}` : list[0]
}

export const proseClass =
  'prose dark:prose-invert max-w-none prose-p:text-lg prose-p:leading-relaxed prose-li:text-lg prose-li:leading-relaxed prose-headings:font-normal prose-headings:tracking-tight prose-h3:text-xl md:prose-h3:text-2xl prose-h4:text-xl md:prose-h4:text-2xl prose-blockquote:border-zinc-300 prose-blockquote:font-normal prose-blockquote:not-italic prose-blockquote:text-xl md:prose-blockquote:text-2xl prose-blockquote:leading-snug dark:prose-blockquote:border-zinc-700 dark:prose-blockquote:text-zinc-100'
