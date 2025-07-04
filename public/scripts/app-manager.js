/**
 * Optimized Application Manager
 * Consolidates all layout functionality with improved performance
 */

class AppManager {
  constructor() {
    this.isInitialized = false
    this.currentTheme = localStorage.getItem('theme') || 
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    this.lastUrl = window.location.href
    this.urlCheckInterval = null
    
    this.init()
  }

  init() {
    if (this.isInitialized) return
    this.isInitialized = true

    // Bind methods to preserve context
    this.handleSwupEvents = this.handleSwupEvents.bind(this)
    this.updateNavigation = this.updateNavigation.bind(this)
    this.toggleTheme = this.toggleTheme.bind(this)
    this.triggerAnimations = this.triggerAnimations.bind(this)

    // Initialize all systems
    this.initThemeSystem()
    this.initNavigationSystem()
    this.initSwupSystem()
    this.initAnimationSystem()
    this.initAccessibility()
  }

  // ===== THEME SYSTEM =====
  initThemeSystem() {
    // Apply initial theme
    this.applyTheme(this.currentTheme)

    // Theme toggle event delegation
    document.addEventListener('click', (event) => {
      const button = event.target.closest('[data-theme-toggle]')
      if (button) {
        event.preventDefault()
        this.toggleTheme()
      }
    })

    // Handle storage changes from other tabs
    window.addEventListener('storage', (e) => {
      if (e.key === 'theme' && e.newValue) {
        this.currentTheme = e.newValue
        this.applyTheme(e.newValue)
      }
    })
  }

  applyTheme(theme) {
    // Optimize DOM operations by batching
    const isDark = theme === 'dark'
    
    // Update document classes
    document.documentElement.classList.toggle('dark', isDark)
    
    // Update background color
    const bgColor = isDark ? '#09090b' : '#fafafa'
    document.documentElement.style.backgroundColor = bgColor
    
    // Update meta theme-color for mobile browsers
    let themeColorMeta = document.querySelector('meta[name="theme-color"]:not([media])')
    if (!themeColorMeta) {
      themeColorMeta = document.createElement('meta')
      themeColorMeta.name = 'theme-color'
      document.head.appendChild(themeColorMeta)
    }
    themeColorMeta.content = isDark ? '#09090b' : '#fafafa'

    // Update theme toggle icons
    this.updateThemeToggleIcons(isDark)
    
    // Save to localStorage
    localStorage.setItem('theme', theme)
    this.currentTheme = theme
  }

  updateThemeToggleIcons(isDark) {
    const buttons = document.querySelectorAll('[data-theme-toggle]')
    buttons.forEach(button => {
      const sunIcon = button.querySelector('[data-sun-icon]')
      const moonIcon = button.querySelector('[data-moon-icon]')

      if (sunIcon && moonIcon) {
        sunIcon.classList.toggle('hidden', !isDark)
        moonIcon.classList.toggle('hidden', isDark)
        button.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode')
      }
    })
  }

  toggleTheme() {
    const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark'
    this.applyTheme(newTheme)
  }

  // ===== NAVIGATION SYSTEM =====
  initNavigationSystem() {
    // Initial navigation update
    this.updateNavigation()

    // Listen for navigation changes
    window.addEventListener('popstate', this.updateNavigation)
    
    // Optimized URL change detection (reduced from 100ms to 500ms)
    this.urlCheckInterval = setInterval(() => {
      if (window.location.href !== this.lastUrl) {
        this.lastUrl = window.location.href
        this.updateNavigation()
      }
    }, 500)
  }

  updateNavigation() {
    const currentPath = window.location.pathname.slice(1)
    const navLinks = document.querySelectorAll('[data-nav-path]')

    navLinks.forEach(link => {
      const path = link.getAttribute('data-nav-path')
      const isActive = path === '' ? currentPath === '' : currentPath.startsWith(path) && path !== ''

      const baseClasses = 'text-zinc-900 dark:text-zinc-100 underline-offset-8'
      const activeClasses = `underline ${baseClasses}`
      const inactiveClasses = `no-underline hover:underline ${baseClasses}`

      link.className = isActive ? activeClasses : inactiveClasses
    })
  }

  // ===== SWUP SYSTEM =====
  initSwupSystem() {
    // Mark Swup as enabled when ready
    document.addEventListener('swup:enable', () => {
      document.documentElement.setAttribute('data-swup-enabled', 'true')
    })

    // Handle Swup page transitions
    document.addEventListener('swup:contentReplaced', this.handleSwupEvents)
    document.addEventListener('swup:pageView', this.handleSwupEvents)
    document.addEventListener('swup:transitionEnd', this.handleSwupEvents)

    // Mark initial load complete
    window.addEventListener('load', () => {
      setTimeout(() => {
        document.documentElement.setAttribute('data-initial-load-complete', 'true')
      }, 100)
    })
  }

  handleSwupEvents() {
    // Reapply theme (once per transition)
    this.applyTheme(this.currentTheme)
    
    // Update navigation
    this.updateNavigation()
    
    // Trigger animations
    this.triggerAnimations()
  }

  // ===== ANIMATION SYSTEM =====
  initAnimationSystem() {
    // Trigger animations on initial load
    document.addEventListener('DOMContentLoaded', this.triggerAnimations)
    window.addEventListener('load', this.triggerAnimations)
  }

  triggerAnimations() {
    // Only trigger if animations are supported
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return
    }

    // Reset and retrigger animations
    const animatedElements = document.querySelectorAll('[class*="animate-"]')
    animatedElements.forEach(element => {
      element.style.animation = 'none'
      element.offsetHeight // Force reflow
      element.style.animation = null
    })
  }

  // ===== ACCESSIBILITY =====
  initAccessibility() {
    // Add skip link for keyboard navigation
    this.addSkipLink()
    
    // Improve focus management (less aggressive than original)
    this.initFocusManagement()
  }

  addSkipLink() {
    const skipLink = document.createElement('a')
    skipLink.href = '#main-content'
    skipLink.className = 'skip-link'
    skipLink.textContent = 'Skip to main content'
    document.body.insertBefore(skipLink, document.body.firstChild)

    // Add id to main content
    const main = document.querySelector('main')
    if (main) {
      main.id = 'main-content'
    }
  }

  initFocusManagement() {
    // Only remove focus outline during Swup transitions, not permanently
    document.addEventListener('swup:animationOutStart', () => {
      document.body.style.outline = 'none'
    })

    document.addEventListener('swup:transitionEnd', () => {
      // Restore normal focus behavior after transition
      document.body.style.outline = ''
    })
  }

  // ===== CLEANUP =====
  destroy() {
    if (this.urlCheckInterval) {
      clearInterval(this.urlCheckInterval)
    }
    
    // Remove event listeners
    window.removeEventListener('popstate', this.updateNavigation)
    document.removeEventListener('swup:contentReplaced', this.handleSwupEvents)
    document.removeEventListener('swup:pageView', this.handleSwupEvents)
    document.removeEventListener('swup:transitionEnd', this.handleSwupEvents)
    
    this.isInitialized = false
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new AppManager())
} else {
  new AppManager()
}