import { getNavigationItems } from '../config/features'
import {
  getAllAlbums,
  getAllPosts,
  getAllProjects,
  getAllPictures,
  type Post,
  type Album,
  type Project,
  type Picture,
} from '../lib/sanity'

// CRITICAL SEO: Preserve these URL structures to maintain Google rankings
// Current URL patterns that must be maintained:
// - /journal/[slug] - Blog posts
// - /projects/[slug] - Design projects
// - /pictures/albums/[slug] - Photo albums (Sanity)
// - /pictures - Photography collections
// - /design - Design portfolio
// - / - Homepage

export async function GET() {
  const posts = await getAllPosts()
  const albums = await getAllAlbums()
  const projects = await getAllProjects()
  const pictures = await getAllPictures()
  const buildIso = new Date().toISOString()

  // Get navigation items and filter by enabled/visible features
  const navigationItems = getNavigationItems()
  const pages = [
    { url: '', priority: '1.0', changefreq: 'weekly' },
    { url: '/pictures', priority: '0.9', changefreq: 'weekly' },
    { url: '/design', priority: '0.9', changefreq: 'weekly' },
    { url: '/journal', priority: '0.8', changefreq: 'weekly' },
    ...navigationItems.map((item) => ({ url: item.href, priority: '0.7', changefreq: 'monthly' })),
  ]

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${pages
    .map(
      (page) => `
    <url>
      <loc>${new URL(page.url, 'https://danielshires.com').href}</loc>
      <lastmod>${buildIso}</lastmod>
      <changefreq>${page.changefreq}</changefreq>
      <priority>${page.priority}</priority>
    </url>
  `
    )
    .join('')}
  ${posts
    .map(
      (post: Post) => `
    <url>
      <loc>${new URL(`/journal/${post.slug.current}`, 'https://danielshires.com').href}</loc>
      <lastmod>${new Date(post.publishedAt).toISOString()}</lastmod>
      <changefreq>monthly</changefreq>
      <priority>0.7</priority>
    </url>
  `
    )
    .join('')}
  ${projects
    .filter((project: Project) => project.linkBehavior !== 'external')
    .map(
      (project: Project) => `
    <url>
      <loc>${new URL(`/projects/${project.slug.current}`, 'https://danielshires.com').href}</loc>
      <lastmod>${new Date(project.publishedAt).toISOString()}</lastmod>
      <changefreq>monthly</changefreq>
      <priority>0.8</priority>
    </url>
  `
    )
    .join('')}
  ${albums
    .map(
      (album: Album) => `
    <url>
      <loc>${new URL(`/pictures/albums/${album.slug.current}`, 'https://danielshires.com').href}</loc>
      <lastmod>${new Date(album.publishedAt).toISOString()}</lastmod>
      <changefreq>monthly</changefreq>
      <priority>0.6</priority>
    </url>
  `
    )
    .join('')}
  ${pictures
    .map(
      (picture: Picture) => `
    <url>
      <loc>${new URL(`/pictures/${picture.slug.current}`, 'https://danielshires.com').href}</loc>
      <lastmod>${buildIso}</lastmod>
      <changefreq>monthly</changefreq>
      <priority>0.5</priority>
    </url>
  `
    )
    .join('')}
</urlset>`

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
    },
  })
}
