import { buildAgentDocument } from '../lib/agent/document'

export async function GET() {
  const body = await buildAgentDocument()
  return new Response(body, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
    },
  })
}
