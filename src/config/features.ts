// Feature flags configuration
export const features = {
  // Navigation features
  experiments: {
    enabled: import.meta.env.PUBLIC_FEATURE_EXPERIMENTS === 'true',
    visible: import.meta.env.PUBLIC_FEATURE_EXPERIMENTS_VISIBLE === 'true',
  },
  pictures: {
    enabled: import.meta.env.PUBLIC_FEATURE_PICTURES !== 'false',
    visible: import.meta.env.PUBLIC_FEATURE_PICTURES_VISIBLE !== 'false',
  },
  posts: {
    enabled: import.meta.env.PUBLIC_FEATURE_POSTS !== 'false',
    visible: import.meta.env.PUBLIC_FEATURE_POSTS_VISIBLE !== 'false',
  },
  design: {
    enabled: import.meta.env.PUBLIC_FEATURE_DESIGN !== 'false',
    visible: import.meta.env.PUBLIC_FEATURE_DESIGN_VISIBLE !== 'false',
  },
} as const

// Helper function to get navigation items
export function getNavigationItems() {
  return [
    { path: 'projects', href: '/projects', label: 'Projects', ...features.design },
    { path: 'pictures', href: '/pictures', label: 'Pictures', ...features.pictures },
    { path: 'journal', href: '/journal', label: 'Journal', ...features.posts },
    { path: 'experiments', href: '/experiments', label: 'Experiments', ...features.experiments },
  ].filter((item) => item.enabled && item.visible)
}
