/**
 * Merges page-level JSON-LD with sitewide WebSite + canonical Person nodes.
 * Avoids duplicate @id by reusing https://danielshires.com/#person when a matching Person lacks @id.
 */
import { aboutContent } from '../../config/about'

export const SITE_ORIGIN = 'https://danielshires.com'
export const PERSON_NODE_ID = `${SITE_ORIGIN}/#person`
export const WEBSITE_NODE_ID = `${SITE_ORIGIN}/#website`

export function siteOwnerSameAs(): string[] {
  return aboutContent.social.map((s) => s.href).filter((h) => /^https?:\/\//.test(h))
}

function defaultPersonNode(): Record<string, unknown> {
  return {
    '@type': 'Person',
    '@id': PERSON_NODE_ID,
    name: 'Daniel Shires',
    url: SITE_ORIGIN,
    sameAs: siteOwnerSameAs(),
  }
}

function defaultWebSiteNode(): Record<string, unknown> {
  return {
    '@type': 'WebSite',
    '@id': WEBSITE_NODE_ID,
    url: SITE_ORIGIN,
    name: 'Daniel Shires',
    publisher: { '@id': PERSON_NODE_ID },
    inLanguage: 'en-AU',
  }
}

function asNodeArray(raw: unknown): Record<string, unknown>[] {
  if (raw == null) return []
  if (Array.isArray(raw)) {
    return raw.filter((x): x is Record<string, unknown> => Boolean(x) && typeof x === 'object')
  }
  if (
    typeof raw === 'object' &&
    raw !== null &&
    '@graph' in raw &&
    Array.isArray((raw as { '@graph': unknown })['@graph'])
  ) {
    return (raw as { '@graph': unknown[] })['@graph'].filter(
      (x): x is Record<string, unknown> => Boolean(x) && typeof x === 'object'
    )
  }
  return [raw as Record<string, unknown>]
}

function graphHasId(nodes: Record<string, unknown>[], id: string): boolean {
  if (nodes.some((n) => n['@id'] === id)) return true
  return nodes.some((n) => {
    if (n['@type'] === 'ProfilePage' && n['mainEntity'] && typeof n['mainEntity'] === 'object') {
      return (n['mainEntity'] as Record<string, unknown>)['@id'] === id
    }
    return false
  })
}

function graphHasWebSite(nodes: Record<string, unknown>[]): boolean {
  return nodes.some((n) => n['@type'] === 'WebSite')
}

/**
 * Normalize inline Person entities so the sitewide @id can be reused (e.g. BlogPosting.publisher).
 */
function assignPersonIdentityWhereMissing(nodes: Record<string, unknown>[]): void {
  for (const n of nodes) {
    if (n['@type'] === 'Person' && !n['@id'] && n['name'] === 'Daniel Shires') {
      n['@id'] = PERSON_NODE_ID
      if (!Array.isArray(n['sameAs']) || (n['sameAs'] as unknown[]).length === 0) {
        n['sameAs'] = siteOwnerSameAs()
      }
    }
    if (n['@type'] === 'ProfilePage' && n['mainEntity'] && typeof n['mainEntity'] === 'object') {
      const me = n['mainEntity'] as Record<string, unknown>
      if (me['@type'] === 'Person' && !me['@id'] && me['name'] === 'Daniel Shires') {
        me['@id'] = PERSON_NODE_ID
        if (!Array.isArray(me['sameAs']) || (me['sameAs'] as unknown[]).length === 0) {
          me['sameAs'] = siteOwnerSameAs()
        }
      }
    }
  }
}

/**
 * Combine page JSON-LD (object, @graph object, or array) with global WebSite + Person defaults.
 */
export function mergeGlobalJsonLd(pageJsonLd: unknown): unknown {
  const nodes = asNodeArray(pageJsonLd)
  assignPersonIdentityWhereMissing(nodes)

  if (!graphHasId(nodes, PERSON_NODE_ID)) {
    nodes.unshift(defaultPersonNode())
  }
  if (!graphHasId(nodes, WEBSITE_NODE_ID) && !graphHasWebSite(nodes)) {
    nodes.unshift(defaultWebSiteNode())
  }

  return {
    '@context': 'https://schema.org',
    '@graph': nodes,
  }
}
