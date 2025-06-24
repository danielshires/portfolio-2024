import { createClient } from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'

export interface SanityImage {
  _type: 'image'
  asset: {
    _ref: string
    _type: 'reference'
  }
}

export interface Post {
  _id: string
  title: string
  slug: {
    current: string
  }
  publishedAt: string
  description: string
  mainImage?: SanityImage
  body: any // This will be the Portable Text content
  tags?: string[]
  author?: string
  relatedPosts?: Post[]
  excerpt?: string
  category?: string
  views?: number
  featured?: boolean
  pinned?: boolean
  readingTime?: string
}

export interface Picture {
  _id: string
  title: string
  slug: {
    current: string
  }
  description?: string
  mainImage?: SanityImage
}

export interface Album {
  _id: string
  title: string
  slug: {
    current: string
  }
  description?: string
  coverImage?: SanityImage
  pictures: Picture[]
  publishedAt: string
}

export interface Project {
  _id: string
  title: string
  subtitle?: string
  slug: {
    current: string
  }
  client?: string
  role?: string[]
  team?: string[]
  year?: number
  duration?: string
  heroImage?: SanityImage
  outcomes?: string[]
  problem?: any // Portable Text content
  solution?: any // Portable Text content
  images?: Array<{
    asset: SanityImage
    alt: string
    caption?: string
  }>
  relatedProjects?: Project[]
  featured?: boolean
  publishedAt: string
  tags?: string[]
}

// Sanity configuration with fallback values
const config = {
  projectId: import.meta.env.PUBLIC_SANITY_PROJECT_ID || '5fq3rcf6',
  dataset: import.meta.env.PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-03-19',
  useCdn: true,
}

export const client = createClient(config)

const builder = imageUrlBuilder(client)

export function urlFor(source: SanityImage) {
  return builder.image(source)
}

// Helper function to fetch all posts
export async function getAllPosts(): Promise<Post[]> {
  return await client.fetch(`
    *[_type == "post"] | order(publishedAt desc) {
      _id,
      title,
      slug,
      publishedAt,
      description,
      mainImage,
      body,
      "tags": tags,
      "author": author->name,
      excerpt,
      category,
      views,
      featured,
      pinned,
      readingTime
    }
  `)
}

// Helper function to fetch a single post by slug
export async function getPostBySlug(slug: string): Promise<Post> {
  return await client.fetch(
    `
    *[_type == "post" && slug.current == $slug][0] {
      _id,
      title,
      slug,
      publishedAt,
      description,
      mainImage,
      body,
      "tags": tags,
      "author": author->name,
      relatedPosts: relatedPosts[]-> {
        _id,
        title,
        slug,
        publishedAt,
        description,
        mainImage
      },
      excerpt,
      category,
      views,
      featured,
      pinned,
      readingTime
    }
  `,
    { slug }
  )
}

// Helper function to fetch all pictures
export async function getAllPictures(): Promise<Picture[]> {
  return await client.fetch(`
    *[_type == "picture"] | order(_createdAt desc) {
      _id,
      title,
      slug,
      description,
      mainImage
    }
  `)
}

// Helper function to fetch a single picture by slug
export async function getPictureBySlug(slug: string): Promise<Picture> {
  return await client.fetch(
    `
    *[_type == "picture" && slug.current == $slug][0] {
      _id,
      title,
      slug,
      description,
      mainImage
    }
  `,
    { slug }
  )
}

// Helper function to fetch all albums
export async function getAllAlbums(): Promise<Album[]> {
  return await client.fetch(`
    *[_type == "album"] | order(publishedAt desc) {
      _id,
      title,
      slug,
      description,
      coverImage,
      publishedAt,
      "pictures": pictures[]-> {
        _id,
        title,
        slug,
        description,
        mainImage
      }
    }
  `)
}

// Helper function to fetch a single album by slug
export async function getAlbumBySlug(slug: string): Promise<Album> {
  return await client.fetch(
    `
    *[_type == "album" && slug.current == $slug][0] {
      _id,
      title,
      slug,
      description,
      coverImage,
      publishedAt,
      "pictures": pictures[]-> {
        _id,
        title,
        slug,
        description,
        mainImage
      }
    }
  `,
    { slug }
  )
}

// Helper function to fetch site settings singleton (for categories, OG image, etc.)
export async function getSiteSettings() {
  return await client.fetch(
    `*[_type == "siteSettings"][0]{
      categories,
      defaultOgImage
    }`
  )
}

// Helper function to fetch a single author by slug
export async function getAuthorBySlug(slug: string) {
  return await client.fetch(
    `*[_type == "author" && slug.current == $slug][0]{
      _id,
      name,
      slug,
      image,
      bio
    }`,
    { slug }
  )
}

// Helper function to fetch all projects
export async function getAllProjects(): Promise<Project[]> {
  return await client.fetch(`
    *[_type == "project"] | order(publishedAt desc) {
      _id,
      title,
      subtitle,
      slug,
      client,
      role,
      team,
      year,
      duration,
      heroImage,
      outcomes,
      featured,
      publishedAt,
      tags
    }
  `)
}

// Helper function to fetch a single project by slug
export async function getProjectBySlug(slug: string): Promise<Project> {
  return await client.fetch(
    `
    *[_type == "project" && slug.current == $slug][0] {
      _id,
      title,
      subtitle,
      slug,
      client,
      role,
      team,
      year,
      duration,
      heroImage,
      outcomes,
      problem,
      solution,
      images[] {
        asset,
        alt,
        caption
      },
      relatedProjects[]-> {
        _id,
        title,
        subtitle,
        slug,
        client,
        heroImage,
        tags,
        year
      },
      featured,
      publishedAt,
      tags
    }
  `,
    { slug }
  )
}

// Helper function to fetch featured projects
export async function getFeaturedProjects(): Promise<Project[]> {
  return await client.fetch(`
    *[_type == "project" && featured == true] | order(publishedAt desc) {
      _id,
      title,
      subtitle,
      slug,
      client,
      heroImage,
      tags,
      year
    }
  `)
}
