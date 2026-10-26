/**
 * Plain-text snapshot of public site copy for the digital avatar.
 * Used by the Netlify function only. Does not use `import.meta.env`.
 */
import { createClient } from '@sanity/client'
import { aboutContent, experiencePeriod } from '../../config/about'

const MAX_SITE_CHARS = 80_000
const CACHE_MS = 10 * 60 * 1000

const sanity = createClient({
  projectId: '5fq3rcf6',
  dataset: 'production',
  apiVersion: '2024-03-19',
  useCdn: true,
  perspective: 'published',
})

interface WritingDoc {
  title?: string
  slug?: string
  description?: string | null
  excerpt?: string | null
  body?: unknown
}

interface ProjectDoc {
  title?: string
  subtitle?: unknown
  slug?: string | null
  client?: unknown
  role?: unknown
  outcomes?: unknown
  problem?: unknown
  solution?: unknown
  linkBehavior?: string | null
  externalUrl?: string | null
}

interface ConceptDoc {
  title?: string
  slug?: string | null
  summary?: string | null
}

let cached: { text: string; expires: number } | null = null

export function portableTextToPlain(value: unknown): string {
  if (typeof value === 'string') return value.trim()
  if (!Array.isArray(value)) return ''

  const lines: string[] = []
  for (const block of value) {
    if (!block || typeof block !== 'object') continue
    const record = block as { _type?: string; children?: Array<{ text?: string }> }
    if (record._type !== 'block' || !Array.isArray(record.children)) continue
    const line = record.children.map((child) => child?.text ?? '').join('').trim()
    if (line) lines.push(line)
  }
  return lines.join('\n')
}

function projectHref(project: ProjectDoc): string {
  if (project.linkBehavior === 'external' && project.externalUrl?.trim()) {
    return project.externalUrl.trim()
  }
  return project.slug ? `/projects/${project.slug}` : '/projects'
}

function aboutSection(): string {
  const { summary, experience, social, cv } = aboutContent
  const intro = [
    `${summary.paragraph1BeforeLink}${summary.paragraph1Link.label} (${summary.paragraph1Link.href})${summary.paragraph1AfterLink}`,
    summary.paragraph2,
  ].join('\n\n')
  const history = experience
    .map((entry) => {
      const place = entry.organizationHref
        ? `${entry.organization} (${entry.organizationHref})`
        : entry.organization
      const roles = entry.roles
        .map((role) => `${experiencePeriod(role.start, role.end)}: ${role.title}`)
        .join('; ')
      return `- ${place} — ${roles}`
    })
    .join('\n')
  const links = [
    ...social.map((link) => `- ${link.label}: ${link.href}`),
    `- ${cv.label}: ${cv.href}`,
  ].join('\n')

  return ['## About', 'Path: /about', intro, 'Work history:', history, 'Contact:', links].join('\n\n')
}

function pageIndex(projects: ProjectDoc[], posts: WritingDoc[], concepts: ConceptDoc[]): string {
  const projectLines = projects
    .filter((project) => project.title?.trim())
    .map((project) => `- ${project.title} — ${projectHref(project)}`)
  const postLines = posts
    .filter((post) => post.title?.trim() && post.slug)
    .map((post) => `- ${post.title} — /writing/${post.slug}`)
  const conceptLines = concepts
    .filter((concept) => concept.title?.trim() && concept.slug)
    .map((concept) => `- ${concept.title} — /field-guide/${concept.slug}`)

  return [
    '## Page index',
    'Projects:',
    projectLines.length ? projectLines.join('\n') : '- None published.',
    'Writing:',
    postLines.length ? postLines.join('\n') : '- None published.',
    'Field guide:',
    conceptLines.length ? conceptLines.join('\n') : '- None published.',
  ].join('\n')
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function asLines(value: unknown): string[] {
  if (typeof value === 'string') return value.trim() ? [value.trim()] : []
  if (!Array.isArray(value)) return []

  const lines: string[] = []
  for (const item of value) {
    if (typeof item === 'string') {
      if (item.trim()) lines.push(item.trim())
      continue
    }
    if (!item || typeof item !== 'object') continue
    const record = item as { statistic?: unknown; description?: unknown }
    const statistic = asString(record.statistic)
    const description = asString(record.description)
    const line = [statistic, description].filter(Boolean).join(' ')
    if (line) lines.push(line)
  }
  return lines
}

function bulletList(value: unknown): string {
  return asLines(value).map((item) => `- ${item}`).join('\n')
}

function projectDetails(projects: ProjectDoc[]): string {
  return projects
    .filter((project) => project.title?.trim())
    .map((project) => {
      const parts = [`### ${project.title}`, `Path: ${projectHref(project)}`]
      const subtitle = asString(project.subtitle)
      if (subtitle) parts.push(subtitle)
      const client = asString(project.client)
      if (client) parts.push(`Client: ${client}`)
      const roles = asLines(project.role)
      if (roles.length) parts.push(`Role: ${roles.join(', ')}`)
      const outcomes = bulletList(project.outcomes)
      if (outcomes) parts.push(`Outcomes:\n${outcomes}`)
      const problem = portableTextToPlain(project.problem)
      if (problem) parts.push(`Problem:\n${problem}`)
      const solution = portableTextToPlain(project.solution)
      if (solution) parts.push(`Solution:\n${solution}`)
      return parts.join('\n\n')
    })
    .join('\n\n')
}

function writingDetails(posts: WritingDoc[]): string {
  return posts
    .filter((post) => post.title?.trim() && post.slug)
    .map((post) => {
      const parts = [`### ${post.title}`, `Path: /writing/${post.slug}`]
      const blurb = asString(post.description) || asString(post.excerpt)
      if (blurb) parts.push(blurb)
      const body = portableTextToPlain(post.body)
      if (body) parts.push(body)
      return parts.join('\n\n')
    })
    .join('\n\n')
}

function conceptDetails(concepts: ConceptDoc[]): string {
  return concepts
    .filter((concept) => concept.title?.trim() && concept.slug)
    .map((concept) => {
      const parts = [`### ${concept.title}`, `Path: /field-guide/${concept.slug}`]
      if (concept.summary && asString(concept.summary)) parts.push(asString(concept.summary))
      return parts.join('\n\n')
    })
    .join('\n\n')
}

export function capSiteText(header: string, details: string): string {
  const joiner = '\n\n'
  const combined = `${header}${joiner}${details}`.trim()
  if (combined.length <= MAX_SITE_CHARS) return combined

  const notice = '\n\n[Further project and writing text was omitted for length.]'
  const room = Math.max(0, MAX_SITE_CHARS - header.length - joiner.length - notice.length)
  const cut = details.slice(0, room).trimEnd()
  return `${header}${joiner}${cut}${notice}`.trim()
}

async function buildSiteContext(): Promise<string> {
  const [posts, projects, concepts] = await Promise.all([
    sanity.fetch<WritingDoc[]>(`
      *[_type == "post" && defined(publishedAt) && publishedAt <= now()] | order(publishedAt desc) {
        title,
        "slug": slug.current,
        description,
        excerpt,
        body
      }
    `),
    sanity.fetch<ProjectDoc[]>(`
      *[_type == "project"] | order(publishedAt desc) {
        title,
        subtitle,
        "slug": slug.current,
        client,
        role,
        outcomes,
        problem,
        solution,
        linkBehavior,
        externalUrl
      }
    `),
    sanity.fetch<ConceptDoc[]>(`
      *[_type == "concept" && defined(publishedAt) && publishedAt <= now()] | order(title asc) {
        title,
        "slug": slug.current,
        summary
      }
    `),
  ])

  const header = [aboutSection(), pageIndex(projects, posts, concepts)].join('\n\n')
  const details = [
    '## Field guide',
    conceptDetails(concepts) || 'None published.',
    '## Projects',
    projectDetails(projects) || 'None published.',
    '## Writing',
    writingDetails(posts) || 'None published.',
  ].join('\n\n')

  return capSiteText(header, details)
}

export async function getSiteContext(): Promise<string> {
  if (cached && cached.expires > Date.now()) return cached.text
  const text = await buildSiteContext()
  cached = { text, expires: Date.now() + CACHE_MS }
  return text
}
