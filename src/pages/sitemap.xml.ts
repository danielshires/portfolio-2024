import { defineConfig } from 'astro/config'
import { getCollection } from 'astro:content'

export async function GET() {
  const posts = await getCollection('posts')
  const albums = await getCollection('albums')

  const pages = ['', '/pictures', '/albums', '/design', '/experiments']

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
      (post) => `
    <url>
      <loc>${new URL(`/posts/${post.slug}`, 'https://danielshires.com').href}</loc>
      <lastmod>${post.data.date.toISOString()}</lastmod>
      <changefreq>monthly</changefreq>
      <priority>0.7</priority>
    </url>
  `
    )
    .join('')}
  ${albums
    .map(
      (album) => `
    <url>
      <loc>${new URL(`/albums/${album.data.slug.current}`, 'https://danielshires.com').href}</loc>
      <lastmod>${album.data.date.toISOString()}</lastmod>
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
