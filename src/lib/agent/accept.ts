/**
 * Whether `Accept` prefers `text/markdown` over `text/html`.
 * A missing `text/html` counts as q=0. Equal q values follow listing order.
 * A wildcard accept header is ignored, so a normal browser request still receives HTML.
 */
export function prefersMarkdown(accept: string | null | undefined): boolean {
  if (!accept) return false

  let markdownQ: number | null = null
  let htmlQ: number | null = null
  let markdownIndex = Number.POSITIVE_INFINITY
  let htmlIndex = Number.POSITIVE_INFINITY

  accept.split(',').forEach((part, index) => {
    const [typeRaw, ...params] = part.split(';').map((piece) => piece.trim())
    const type = typeRaw.toLowerCase()
    let q = 1
    for (const param of params) {
      const match = /^q=([0-9]*\.?[0-9]+)$/i.exec(param)
      if (!match) continue
      const parsed = Number(match[1])
      if (!Number.isNaN(parsed)) q = parsed
    }
    if (type === 'text/markdown') {
      markdownQ = q
      markdownIndex = index
    } else if (type === 'text/html') {
      htmlQ = q
      htmlIndex = index
    }
  })

  if (markdownQ == null || markdownQ <= 0) return false
  const html = htmlQ ?? 0
  if (markdownQ > html) return true
  if (markdownQ < html) return false
  return markdownIndex < htmlIndex
}
