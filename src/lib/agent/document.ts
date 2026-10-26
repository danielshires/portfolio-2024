import template from './profile.md?raw'
import { aboutContent } from '../../config/about'
import { features, getNavigationItems } from '../../config/features'
import {
  getAllPosts,
  getAllProjects,
  isExternalProject,
  projectListHref,
  type Post,
  type Project,
} from '../sanity'
import { SITE_ORIGIN } from '../seo/merge-global-jsonld'

const WRITING_LIMIT = 8

const PAGE_NOTES: Record<string, string> = {
  '/': 'profile, selected work, and recent writing',
  '/projects': 'case studies and independent work',
  '/pictures': 'photography',
  '/writing': 'essays and notes',
  '/about': 'summary, experience, and ways to connect',
  '/playground': 'small interactive trials',
  '/design': 'design portfolio',
  '/field-guide': 'concepts and patterns',
  '/cv/daniel-shires-cv.md': 'résumé',
}

function absolute(href: string): string {
  if (/^(https?:|mailto:)/.test(href)) return href
  return new URL(href, SITE_ORIGIN).href
}

function oneLine(value: string | undefined): string {
  if (!value) return ''
  return value.replace(/\s+/g, ' ').trim()
}

function roleDates(start: string, end: string): string {
  const endLabel = end.toLowerCase() === 'present' ? 'Now' : end
  if (start === endLabel) return start
  return `${start} → ${endLabel}`
}

function pagesSection(): string {
  const items: { href: string; label: string }[] = [{ href: '/', label: 'Home' }]
  for (const item of getNavigationItems()) {
    if (!items.some((existing) => existing.href === item.href)) {
      items.push({ href: item.href, label: item.label })
    }
  }
  if (
    features.design.enabled &&
    features.design.visible &&
    !items.some((item) => item.href === '/design')
  ) {
    items.push({ href: '/design', label: 'Design' })
  }
  if (!items.some((item) => item.href === '/field-guide')) {
    items.push({ href: '/field-guide', label: 'Field Guide' })
  }
  items.push({ href: aboutContent.cv.href, label: aboutContent.cv.label })

  return items
    .map((item) => {
      const note = PAGE_NOTES[item.href]
      const link = `[${item.label}](${absolute(item.href)})`
      return note ? `- ${link}: ${note}` : `- ${link}`
    })
    .join('\n')
}

function experienceSection(): string {
  const blocks: string[] = []
  for (const entry of aboutContent.experience) {
    for (const role of entry.roles) {
      blocks.push(`### ${entry.organization} — ${role.title}\n${roleDates(role.start, role.end)}`)
    }
  }
  return blocks.join('\n\n')
}

function workSection(projects: Project[]): string {
  const blocks = projects
    .filter((project) => {
      if (project.seo?.noIndex || !project.title?.trim()) return false
      return Boolean(project.slug?.current) || isExternalProject(project)
    })
    .map((project) => {
      const href = absolute(projectListHref(project))
      const blurb = oneLine(project.subtitle)
      const heading = `### ${project.title.trim()} — [View](${href})`
      return blurb ? `${heading}\n${blurb}` : heading
    })
  return blocks.length > 0 ? blocks.join('\n\n') : 'No published projects.'
}

function formatPostDate(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'Australia/Sydney',
  }).format(date)
}

function writingSection(posts: Post[]): string {
  const blocks = posts
    .filter((post) => !post.seo?.noIndex && post.slug?.current && post.title?.trim())
    .slice(0, WRITING_LIMIT)
    .map((post) => {
      const href = absolute(`/writing/${post.slug.current}`)
      const meta = [formatPostDate(post.publishedAt), post.readingTime ? `${post.readingTime} min read` : '']
        .filter(Boolean)
        .join(' · ')
      const blurb = oneLine(post.excerpt) || oneLine(post.description)
      const heading = `#### [${post.title.trim()}](${href})`
      return [heading, meta, blurb].filter(Boolean).join('\n')
    })
  return blocks.length > 0 ? blocks.join('\n\n') : 'No published writing.'
}

function connectSection(): string {
  return aboutContent.social
    .map((link) => `- ${link.label}: [${link.handle}](${link.href})`)
    .join('\n')
}

let pending: Promise<string> | null = null

async function assemble(): Promise<string> {
  const [projects, posts] = await Promise.all([getAllProjects(), getAllPosts()])
  const markdown =
    template
      .replaceAll('{{pages}}', pagesSection())
      .replaceAll('{{experience}}', experienceSection())
      .replaceAll('{{work}}', workSection(projects))
      .replaceAll('{{writing}}', writingSection(posts))
      .replaceAll('{{connect}}', connectSection())
      .replace(/\n{3,}/g, '\n\n')
      .trim() + '\n'

  const leftover = markdown.match(/\{\{[a-z]+\}\}/g)
  if (leftover) {
    throw new Error(`Unresolved agent profile tokens: ${leftover.join(', ')}`)
  }
  return markdown
}

/** One Sanity read per build. The same string is served at `/agent.md` and in the page. */
export function buildAgentDocument(): Promise<string> {
  if (!pending) pending = assemble()
  return pending
}
