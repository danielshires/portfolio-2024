import { buildAgentDocument } from '../lib/agent/document'
import { SANITY_PAGE_CACHE_CONTROL } from '../lib/sanityPageCache'

// On-request so the writing list in this profile tracks Sanity without a rebuild.
export const prerender = false

export async function GET() {
  const body = await buildAgentDocument()
  return new Response(body, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': SANITY_PAGE_CACHE_CONTROL,
    },
  })
}
