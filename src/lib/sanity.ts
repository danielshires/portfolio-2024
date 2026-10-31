/**
 * Sanity CMS Integration
 * 
 * This file provides centralized access to Sanity CMS content and utilities.
 * Includes type definitions, client configuration, and data fetching functions.
 * 
 * Project: Dan Portfolio
 * Sanity Project ID: 5fq3rcf6
 * Dataset: production
 */

import { createClient } from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'

// ========================================
// TYPE DEFINITIONS
// ========================================

export interface SanityImageCrop {
  top: number
  bottom: number
  left: number
  right: number
}

export interface SanityImageHotspot {
  x: number
  y: number
  height: number
  width: number
}

export interface SanityImage {
  _type: 'image'
  asset: {
    _ref: string
    _type: 'reference'
  }
  crop?: SanityImageCrop
  hotspot?: SanityImageHotspot
}

/** One image in a project gallery, including alt text and an optional caption. */
export interface ProjectGalleryImage extends SanityImage {
  _key?: string
  alt?: string
  heading?: string
  caption?: string
  surface?: 'none' | 'neutral' | 'brand'
}

/** Two gallery images shown side by side. */
export interface ProjectGalleryPair {
  _type: 'imagePair'
  _key?: string
  left?: ProjectGalleryImage
  right?: ProjectGalleryImage
}

/** Three gallery images shown in a row. */
export interface ProjectGalleryTrio {
  _type: 'imageTrio'
  _key?: string
  first?: ProjectGalleryImage
  second?: ProjectGalleryImage
  third?: ProjectGalleryImage
}

export type ProjectGalleryRow = ProjectGalleryImage | ProjectGalleryPair | ProjectGalleryTrio

/** Images in one gallery row that have an uploaded asset, in display order. */
export function galleryRowImages(row: ProjectGalleryRow): ProjectGalleryImage[] {
  const candidates =
    row._type === 'imagePair'
      ? [row.left, row.right]
      : row._type === 'imageTrio'
        ? [row.first, row.second, row.third]
        : [row]
  return candidates.filter((image): image is ProjectGalleryImage => Boolean(image?.asset))
}

/** Every image across gallery rows, in display order. */
export function flattenProjectGallery(rows?: ProjectGalleryRow[]): ProjectGalleryImage[] {
  return rows?.flatMap(galleryRowImages) ?? []
}

/** Optional SEO overrides (Sanity `seo` object on post / project). */
export interface DocumentSeo {
  title?: string
  description?: string
  ogImage?: SanityImage
  noIndex?: boolean
}

/** Field Guide concept taxonomy */
export type ConceptKind =
  | 'observation'
  | 'pattern'
  | 'principle'
  | 'mental-model'
  | 'heuristic'

/** Minimal concept projection for references and cards */
export interface ConceptSummary {
  _id: string
  title: string
  slug: {
    current: string
  }
  summary?: string
  type?: ConceptKind
  publishedAt?: string
}

/** Full concept for `/field-guide/[slug]` */
export interface Concept extends ConceptSummary {
  body?: any
  signals?: string[]
  tensions?: string[]
  relatedConcepts?: ConceptSummary[]
  aliases?: string[]
  featured?: boolean
}

export interface PostDiscussingConcept {
  _id: string
  title: string
  slug: {
    current: string
  }
  description: string
}

export interface ProjectDemonstratingConcept {
  _id: string
  title: string
  subtitle?: string
  slug: {
    current: string
  }
  linkBehavior?: 'internal' | 'external'
  externalUrl?: string
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
  body?: any // Portable Text — omitted in listing queries to keep island props small
  tags?: string[]
  author?: string
  relatedPosts?: Post[]
  /** Next-older published post; used when `relatedPosts` resolves to an empty list. */
  readNextByDate?: {
    _id: string
    title: string
    slug?: { current: string }
    publishedAt?: string
    description?: string
    mainImage?: SanityImage
  } | null
  excerpt?: string
  category?: string
  views?: number
  featured?: boolean
  pinned?: boolean
  readingTime?: string
  conceptsDiscussed?: ConceptSummary[]
  seo?: DocumentSeo
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

/** Keep in sync with the `disciplines` options in `portfolio-25/schemaTypes/project.js`. */
export const projectDisciplines = [
  { value: 'product-design', label: 'Product design' },
  { value: 'research', label: 'Research' },
  { value: 'brand', label: 'Brand' },
  { value: 'digital-design', label: 'Digital design' },
] as const

export type ProjectDiscipline = (typeof projectDisciplines)[number]['value']

export interface Project {
  _id: string
  title: string
  subtitle?: string
  slug: {
    current: string
  }
  /** Default to internal when absent (legacy documents). */
  linkBehavior?: 'internal' | 'external'
  externalUrl?: string
  client?: string
  role?: string[]
  team?: string[]
  duration?: string
  heroImage?: SanityImage
  outcomes?: Array<{ statistic: string; description: string }>
  category?: 'product' | 'independent'
  disciplines?: ProjectDiscipline[]
  problem?: any // Portable Text content
  contribution?: any // Portable Text content
  solution?: any // Portable Text content
  outcomeSummary?: any // Portable Text content
  learnings?: any // Portable Text content
  images?: ProjectGalleryRow[]
  surfaceTint?: string
  relatedProjects?: Project[]
  featured?: boolean
  publishedAt: string
  tags?: string[]
  conceptsDemonstrated?: ConceptSummary[]
  seo?: DocumentSeo
}

/** Readable label for concept `type` values (editorial, not tag pills). */
export function conceptTypeLabel(type: ConceptKind | string | undefined): string | undefined {
  if (!type) return undefined
  const map: Record<string, string> = {
    observation: 'Observation',
    pattern: 'Pattern',
    principle: 'Principle',
    'mental-model': 'Mental model',
    heuristic: 'Heuristic',
  }
  return map[type] ?? type
}

// Sanity configuration
const config = {
  projectId: '5fq3rcf6',
  dataset: 'production',
  apiVersion: '2024-03-19',
  // Always use the CDN for published reads so SSR writing pages stay fast and
  // a Sanity publish can go live without a site rebuild (CDN lag is usually ~60s).
  useCdn: true,
  // When a token is present, Sanity can return drafts alongside published documents,
  // which causes duplicate entries on listings. Omit the read token and force
  // "published" so the public site only ever sees published content.
  perspective: 'published' as const,
}

export const client = createClient(config)

const builder = imageUrlBuilder(client)

export function isExternalProject(
  project: Pick<Project, 'linkBehavior' | 'externalUrl'>
): boolean {
  return project.linkBehavior === 'external' && Boolean(project.externalUrl?.trim())
}

/** Href for project cards and lists: internal path or external URL. */
export function projectListHref(project: Pick<Project, 'slug' | 'linkBehavior' | 'externalUrl'>): string {
  if (isExternalProject(project)) {
    return project.externalUrl!.trim()
  }
  return `/projects/${project.slug.current}`
}

/** Build an image URL. Pass the whole image so crop and hotspot are applied. */
export function urlFor(source: SanityImage) {
  return builder.image(source)
}


/** Listing/metadata only — no `body` or `mainImage` (keeps React island props within limits). */
export async function getAllPosts(): Promise<Post[]> {
  return await client.fetch(`
    *[_type == "post" && defined(publishedAt) && publishedAt <= now()] | order(publishedAt desc) {
      _id,
      title,
      slug,
      publishedAt,
      description,
      "tags": tags,
      "author": author->name,
      excerpt,
      category,
      views,
      featured,
      pinned,
      readingTime,
      seo {
        noIndex
      }
    }
  `)
}

/** Curated Sanity “Related posts”, or the next-older published post when that list is empty. */
export function resolveReadNextPosts(post: Post): Array<{ _id: string; title: string; slug?: { current: string } }> {
  const curated =
    post.relatedPosts?.filter((p) => {
      if (!p || p._id === post._id || !p.title?.trim()) return false
      if (!p.slug?.current?.trim()) return false
      if (!p.publishedAt) return false
      return new Date(p.publishedAt).getTime() <= Date.now()
    }) ?? []
  if (curated.length > 0) {
    return curated.map((p) => ({ _id: p._id, title: p.title, slug: p.slug }))
  }
  const next = post.readNextByDate
  if (next && next._id !== post._id && next.slug?.current) {
    return [{ _id: next._id, title: next.title, slug: next.slug }]
  }
  return []
}

// Helper function to fetch a single post by slug
export async function getPostBySlug(slug: string): Promise<Post> {
  return await client.fetch(
    `
    *[_type == "post" && slug.current == $slug && defined(publishedAt) && publishedAt <= now()][0] {
      _id,
      title,
      slug,
      publishedAt,
      description,
      mainImage,
      body,
      "tags": tags,
      "author": author->name,
      "relatedPosts": coalesce(relatedPosts, [])[defined(_ref)]->{
        _id,
        title,
        slug,
        mainImage,
        publishedAt,
        description
      },
      "readNextByDate": *[
        _type == "post" &&
        slug.current != $slug &&
        defined(publishedAt) &&
        publishedAt < ^.publishedAt &&
        publishedAt <= now()
      ] | order(publishedAt desc) [0] {
        _id, title, slug, mainImage, publishedAt, description
      },
      excerpt,
      category,
      views,
      featured,
      pinned,
      readingTime,
      "conceptsDiscussed": *[
        _type == "concept" &&
        _id in coalesce(^.conceptsDiscussed, [])[]._ref &&
        defined(slug.current) &&
        defined(publishedAt) &&
        publishedAt <= now()
      ]{
        _id,
        title,
        slug,
        summary,
        type,
        publishedAt
      },
      seo {
        title,
        description,
        noIndex,
        ogImage
      }
    }
  `,
    { slug }
  )
}

export async function getAllPublishedConcepts(): Promise<ConceptSummary[]> {
  return await client.fetch(`
    *[_type == "concept" && defined(publishedAt) && publishedAt <= now()] | order(title asc) {
      _id,
      title,
      slug,
      summary,
      type,
      publishedAt
    }
  `)
}

export async function getConceptBySlug(slug: string): Promise<Concept | null> {
  return await client.fetch(
    `
    *[
      _type == "concept" &&
      slug.current == $slug &&
      defined(publishedAt) &&
      publishedAt <= now()
    ][0] {
      _id,
      title,
      slug,
      summary,
      type,
      body,
      signals,
      tensions,
      "relatedConcepts": *[
        _type == "concept" &&
        _id in coalesce(^.relatedConcepts, [])[]._ref &&
        defined(slug.current) &&
        defined(publishedAt) &&
        publishedAt <= now()
      ]{
        _id,
        title,
        slug,
        summary,
        type,
        publishedAt
      },
      aliases,
      featured,
      publishedAt
    }
  `,
    { slug }
  )
}

export async function getPostsDiscussingConcept(
  conceptId: string
): Promise<PostDiscussingConcept[]> {
  return await client.fetch(
    `
    *[
      _type == "post" &&
      references($conceptId) &&
      defined(publishedAt) &&
      publishedAt <= now()
    ] | order(publishedAt desc) {
      _id,
      title,
      slug,
      description
    }
  `,
    { conceptId }
  )
}

export async function getProjectsDemonstratingConcept(
  conceptId: string
): Promise<ProjectDemonstratingConcept[]> {
  return await client.fetch(
    `
    *[
      _type == "project" &&
      references($conceptId)
    ] | order(publishedAt desc) {
      _id,
      title,
      subtitle,
      slug,
      linkBehavior,
      externalUrl
    }
  `,
    { conceptId }
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
      duration,
      heroImage,
      outcomes,
      category,
      disciplines,
      featured,
      publishedAt,
      tags,
      linkBehavior,
      externalUrl,
      seo {
        noIndex
      }
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
      duration,
      heroImage,
      outcomes,
      category,
      problem,
      contribution,
      solution,
      outcomeSummary,
      learnings,
      surfaceTint,
      images[] {
        _type,
        _key,
        asset,
        alt,
        heading,
        caption,
        surface,
        crop,
        hotspot,
        left {
          _type,
          _key,
          asset,
          alt,
          heading,
          caption,
          surface,
          crop,
          hotspot
        },
        right {
          _type,
          _key,
          asset,
          alt,
          heading,
          caption,
          surface,
          crop,
          hotspot
        },
        first {
          _type,
          _key,
          asset,
          alt,
          heading,
          caption,
          surface,
          crop,
          hotspot
        },
        second {
          _type,
          _key,
          asset,
          alt,
          heading,
          caption,
          surface,
          crop,
          hotspot
        },
        third {
          _type,
          _key,
          asset,
          alt,
          heading,
          caption,
          surface,
          crop,
          hotspot
        }
      },
      relatedProjects[]-> {
        _id,
        title,
        subtitle,
        slug,
        client,
        heroImage,
        tags,
        linkBehavior,
        externalUrl
      },
      featured,
      publishedAt,
      tags,
      linkBehavior,
      externalUrl,
      "conceptsDemonstrated": *[
        _type == "concept" &&
        _id in coalesce(^.conceptsDemonstrated, [])[]._ref &&
        defined(slug.current) &&
        defined(publishedAt) &&
        publishedAt <= now()
      ]{
        _id,
        title,
        slug,
        summary,
        type,
        publishedAt
      },
      seo {
        title,
        description,
        noIndex,
        ogImage
      }
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
      linkBehavior,
      externalUrl
    }
  `)
}
