type Segment =
  | { type: 'text'; value: string }
  | { type: 'link'; label: string; href: string }

const TOKEN =
  /\[([^\]]+)\]\(([^)\s]+)\)|https?:\/\/[^\s<>),.;]+|[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}|\/[a-zA-Z0-9][a-zA-Z0-9/_-]*/gi

function safeHref(raw: string): string | null {
  const href = raw.trim()
  if (href.startsWith('/') && !href.startsWith('//')) {
    return /^\/[a-zA-Z0-9/_.,~%-]*$/.test(href) ? href : null
  }
  if (href.includes('@') && !href.includes('://')) {
    return /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(href) ? `mailto:${href}` : null
  }
  try {
    const url = new URL(href)
    if (url.protocol === 'https:' || url.protocol === 'http:' || url.protocol === 'mailto:') {
      return url.href
    }
  } catch {
    return null
  }
  return null
}

export function linkSegments(text: string): Segment[] {
  const segments: Segment[] = []
  let cursor = 0
  for (const match of text.matchAll(TOKEN)) {
    const index = match.index ?? 0
    if (index < cursor) continue
    const raw = match[0]
    const markdownLabel = match[1]
    const markdownHref = match[2]
    const href = safeHref(markdownHref ?? (raw.includes('@') && !raw.includes('://') ? raw : raw))
    if (!href) continue
    if (index > cursor) segments.push({ type: 'text', value: text.slice(cursor, index) })
    segments.push({ type: 'link', label: markdownLabel ?? raw, href })
    cursor = index + raw.length
  }
  if (cursor < text.length) segments.push({ type: 'text', value: text.slice(cursor) })
  return segments
}

export function ReplyText({ text }: { text: string }) {
  return (
    <>
      {linkSegments(text).map((segment, index) =>
        segment.type === 'text' ? (
          <span key={index}>{segment.value}</span>
        ) : (
          <a key={index} href={segment.href} target="_blank" rel="noopener noreferrer">
            {segment.label}
          </a>
        ),
      )}
    </>
  )
}
