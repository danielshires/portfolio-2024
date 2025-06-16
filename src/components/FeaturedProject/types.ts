export interface Outcome {
  value: string
  label: string
}

export interface ProjectImage {
  src: string
  alt: string
  width: number
  height: number
}

export interface FeaturedProjectProps {
  projectImage: ProjectImage
  title: string
  heading: string
  description: string
  outcomes: Outcome[]
  projectUrl: string
}
