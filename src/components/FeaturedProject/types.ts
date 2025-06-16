import type { ImageMetadata } from 'astro'

export interface Outcome {
  value: string
  label: string
}

export interface ProjectImage {
  src: ImageMetadata
  alt: string
  width: number
  height: number
  format?: string
  quality?: number
}

export interface FeaturedProjectProps {
  projectImage: ProjectImage
  title: string
  heading: string
  description: string
  outcomes: Outcome[]
  projectUrl: string
}
