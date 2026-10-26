import { prefersMarkdown } from '../../src/lib/agent/accept.ts'

declare const Netlify: {
  env: {
    get: (name: string) => string | undefined
  }
}

interface EdgeContext {
  next: () => Promise<Response>
  rewrite: (url: string) => Promise<Response>
}

/**
 * `netlify dev` treats `/agent.md` as a missing static file and the `/*` rewrite
 * returns HTML. The Astro server on 4321 has the real document. Production
 * serves the built file, so the rewrite stays on-site.
 */
function isLocalDev(request: Request): boolean {
  try {
    if (Netlify.env.get('NETLIFY_DEV') === 'true') return true
  } catch {
    // Outside the edge runtime.
  }
  const host = new URL(request.url).hostname
  return host === 'localhost' || host === '127.0.0.1'
}

async function loadMarkdown(request: Request, context: EdgeContext): Promise<Response> {
  if (isLocalDev(request)) {
    return fetch('http://[::1]:4321/agent.md')
  }
  return context.rewrite('/agent.md')
}

function withVaryAccept(response: Response): Response {
  const headers = new Headers(response.headers)
  const current = headers.get('Vary')
  const parts = current
    ? current
        .split(',')
        .map((part) => part.trim())
        .filter(Boolean)
    : []
  if (!parts.some((part) => part.toLowerCase() === 'accept')) {
    parts.push('Accept')
  }
  headers.set('Vary', parts.join(', '))
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  })
}

export default async function handler(request: Request, context: EdgeContext): Promise<Response> {
  if (request.method === 'GET' && prefersMarkdown(request.headers.get('accept'))) {
    const response = await loadMarkdown(request, context)
    const headers = new Headers(response.headers)
    headers.set('Content-Type', 'text/markdown; charset=utf-8')
    return withVaryAccept(
      new Response(response.body, { status: response.status, statusText: response.statusText, headers })
    )
  }

  return withVaryAccept(await context.next())
}
