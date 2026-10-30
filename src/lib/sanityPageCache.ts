/**
 * Short edge cache for pages that read Sanity at request time.
 * Keeps SSR cheap while letting publishes appear without a rebuild.
 */
export const SANITY_PAGE_CACHE_CONTROL =
  'public, s-maxage=60, stale-while-revalidate=600'

export function applySanityPageCache(headers: Headers): void {
  headers.set('Cache-Control', SANITY_PAGE_CACHE_CONTROL)
}
