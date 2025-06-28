export interface ImageQualityPreset {
  quality: number
  format: 'avif' | 'webp' | 'jpeg' | 'png'
  description: string
}

export const imageQualityPresets: Record<string, ImageQualityPreset> = {
  // High quality for hero images, featured content
  hero: {
    quality: 90,
    format: 'avif',
    description: 'High quality for hero images and featured content',
  },

  // Standard quality for most content
  standard: {
    quality: 85,
    format: 'avif',
    description: 'Standard quality for most content',
  },

  // Optimized for performance
  optimized: {
    quality: 75,
    format: 'avif',
    description: 'Optimized for performance, good quality',
  },

  // Thumbnail quality
  thumbnail: {
    quality: 60,
    format: 'webp',
    description: 'Thumbnail quality for galleries and previews',
  },

  // Fallback for older browsers
  fallback: {
    quality: 80,
    format: 'jpeg',
    description: 'Fallback format for older browsers',
  },
}

export function getQualityForSize(width: number): number {
  if (width >= 3200) return 85 // Very large Retina images
  if (width >= 2400) return 80 // Large Retina images
  if (width >= 1600) return 85 // Standard large images
  if (width >= 1200) return 85 // Standard desktop images
  if (width >= 800) return 80 // Medium images
  if (width >= 400) return 75 // Small images
  return 70 // Very small images
}

export function getFormatForBrowser(): 'avif' | 'webp' | 'jpeg' {
  // In a real implementation, you'd detect browser support
  // For now, return avif as it has good modern browser support
  return 'avif'
}
