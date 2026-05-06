/**
 * Shared data for `/sitemap.xml` and the footer site map (single source of URLs).
 */
import { getNavigationItems } from '../config/features'
import {
  getAllAlbums,
  getAllPosts,
  getAllProjects,
  getAllPictures,
  isExternalProject,
  type Post,
  type Project,
  type Album,
  type Picture,
} from './sanity'

export type PlainSitemapPage = { url: string; priority: string; changefreq: string }

const STATIC_PRESET: PlainSitemapPage[] = [
  { url: '', priority: '1.0', changefreq: 'weekly' },
  { url: '/pictures', priority: '0.9', changefreq: 'weekly' },
  { url: '/design', priority: '0.9', changefreq: 'weekly' },
  { url: '/journal', priority: '0.8', changefreq: 'weekly' },
]

export async function collectSitemapSources() {
  const [posts, albums, projects, pictures] = await Promise.all([
    getAllPosts(),
    getAllAlbums(),
    getAllProjects(),
    getAllPictures(),
  ])
  const navigationItems = getNavigationItems()
  const pageByUrl = new Map<string, PlainSitemapPage>()

  function addPage(page: PlainSitemapPage) {
    const prev = pageByUrl.get(page.url)
    if (!prev || parseFloat(page.priority) > parseFloat(prev.priority)) {
      pageByUrl.set(page.url, page)
    }
  }

  STATIC_PRESET.forEach(addPage)
  navigationItems.forEach((item) =>
    addPage({ url: item.href, priority: '0.7', changefreq: 'monthly' })
  )

  const aboutPage = pageByUrl.get('/about')
  if (aboutPage) {
    pageByUrl.set('/about', { ...aboutPage, priority: '0.85' })
  }

  const staticPages = [...pageByUrl.values()].sort((a, b) => {
    if (a.url === '') return -1
    if (b.url === '') return 1
    const pd = parseFloat(b.priority) - parseFloat(a.priority)
    if (pd !== 0) return pd
    return a.url.localeCompare(b.url)
  })

  const internalProjects = projects.filter((p) => !isExternalProject(p))

  return {
    staticPages,
    navigationItems,
    posts,
    albums,
    internalProjects,
    pictures,
  }
}

export function labelForStaticPath(
  path: string,
  navigationItems: ReturnType<typeof getNavigationItems>
): string {
  if (path === '') return 'Home'
  const fromNav = navigationItems.find((item) => item.href === path)
  if (fromNav) return fromNav.label
  const tail = path.replace(/^\//, '').split('/').pop() ?? path
  return tail
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

export function sortPostsByDate(posts: Post[]): Post[] {
  return [...posts].sort((a, b) => {
    const ta = a.publishedAt ? new Date(a.publishedAt).getTime() : 0
    const tb = b.publishedAt ? new Date(b.publishedAt).getTime() : 0
    return tb - ta
  })
}

export function sortProjectsByDate(projects: Project[]): Project[] {
  return [...projects].sort((a, b) => {
    const ta = a.publishedAt ? new Date(a.publishedAt).getTime() : 0
    const tb = b.publishedAt ? new Date(b.publishedAt).getTime() : 0
    return tb - ta
  })
}

export function sortAlbumsByDate(albums: Album[]): Album[] {
  return [...albums].sort((a, b) => {
    const ta = a.publishedAt ? new Date(a.publishedAt).getTime() : 0
    const tb = b.publishedAt ? new Date(b.publishedAt).getTime() : 0
    return tb - ta
  })
}

export function sortPicturesByTitle(pictures: Picture[]): Picture[] {
  return [...pictures].sort((a, b) => a.title.localeCompare(b.title))
}
