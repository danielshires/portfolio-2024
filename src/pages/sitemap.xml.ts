import { defineConfig } from 'astro/config'
import { getCollection } from 'astro:content'
import { getNavigationItems } from '../config/features'
import { getAllAlbums, getAllPosts, type Post, type Album } from '../lib/sanity'

export async function GET() {
  const posts = await getAllPosts()
  const albums = await getAllAlbums()

  // Get navigation items and filter by enabled/visible features
  const navigationItems = getNavigationItems()
  const pages = ['', ...navigationItems.map((item) => item.href), '/albums']

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${pages
    .map(
      (page) => `
    <url>
      <loc>${new URL(page, 'https://danielshires.com').href}</loc>
      <changefreq>daily</changefreq>
      <priority>${page === '' ? '1.0' : '0.8'}</priority>
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
      <changefreq>weekly</changefreq>
      <priority>0.8</priority>
    </url>
  `
    )
    .join('')}
  ${albums
    .map(
      (album: Album) => `
    <url>
      <loc>${new URL(`/albums/${album.slug.current}`, 'https://danielshires.com').href}</loc>
      <lastmod>${new Date(album.publishedAt).toISOString()}</lastmod>
      <changefreq>monthly</changefreq>
      <priority>0.7</priority>
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
