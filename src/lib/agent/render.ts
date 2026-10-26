import { SITE_ORIGIN } from '../seo/merge-global-jsonld'

function escapeText(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function escapeAttr(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

/** Relative site paths and this origin only. `javascript:` and other schemes are left as text. */
function safeHref(href: string): string | null {
  if (href.startsWith('/') && !href.startsWith('//')) return href
  try {
    const url = new URL(href)
    if (url.protocol === 'http:' || url.protocol === 'https:' || url.protocol === 'mailto:') {
      return href
    }
  } catch {
    return null
  }
  return null
}

function isSiteLink(href: string): boolean {
  if (href.startsWith('/') && !href.startsWith('//')) return true
  try {
    return new URL(href).origin === SITE_ORIGIN
  } catch {
    return false
  }
}

/** Keep the visible URL absolute, but navigate on the host the reader is using. */
function hrefForClick(href: string): string {
  if (!isSiteLink(href) || href.startsWith('/')) return href
  const url = new URL(href)
  return `${url.pathname}${url.search}${url.hash}`
}

/**
 * Show the markdown source, with the URL inside each link made clickable.
 * Same-site links carry `data-agent-exit` so the designed page returns.
 */
export function renderAgentMarkdown(markdown: string): string {
  const pattern = /\[([^\]]+)\]\(([^)\s]+)\)/g
  let html = ''
  let last = 0

  for (const match of markdown.matchAll(pattern)) {
    const index = match.index ?? 0
    html += escapeText(markdown.slice(last, index))
    const label = escapeText(match[1] ?? '')
    const rawHref = match[2] ?? ''
    const href = safeHref(rawHref)
    if (!href) {
      html += escapeText(match[0] ?? '')
    } else {
      const site = isSiteLink(href)
      const attrs = [
        `href="${escapeAttr(hrefForClick(href))}"`,
        site ? 'data-agent-exit' : '',
        site ? 'data-no-swup' : '',
        !site && href.startsWith('http') ? 'target="_blank" rel="noopener noreferrer"' : '',
      ]
        .filter(Boolean)
        .join(' ')
      html += `[${label}](<a ${attrs}>${escapeText(rawHref)}</a>)`
    }
    last = index + (match[0]?.length ?? 0)
  }

  html += escapeText(markdown.slice(last))
  return html
}
