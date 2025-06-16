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
  categories?: string[]
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

// Sanity configuration with fallback values
const config = {
  projectId: '5fq3rcf6', // Your Sanity project ID
  dataset: 'production',
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
      "author": author->name
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
      "relatedPosts": relatedPosts[]-> {
        _id,
        title,
        slug,
        publishedAt,
        description,
        mainImage
      }
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
