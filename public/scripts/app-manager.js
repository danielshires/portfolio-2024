/**
 * Optimized Application Manager
 * Consolidates all layout functionality with improved performance
 */

// Prevent duplicate class declarations
if (typeof AppManager === 'undefined') {
class AppManager {
  constructor() {
    console.log('[Focus Debug] AppManager constructor called')
    this.isInitialized = false
    this.currentTheme = localStorage.getItem('theme') || 
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    this.lastUrl = window.location.href
    this.urlCheckInterval = null
    this.inputMethod = 'mouse' // Default to mouse input
    
    this.init()
  }

  init() {
    console.log('[Focus Debug] AppManager init() called')
    if (this.isInitialized) return
    this.isInitialized = true

    // Bind methods to preserve context
    this.handleSwupEvents = this.handleSwupEvents.bind(this)
    this.updateNavigation = this.updateNavigation.bind(this)
    this.toggleTheme = this.toggleTheme.bind(this)
    this.triggerAnimations = this.triggerAnimations.bind(this)
    this.setInputMethod = this.setInputMethod.bind(this)

    // Initialize all systems
    console.log('[Focus Debug] Initializing all systems')
    this.initThemeSystem()
    this.initNavigationSystem()
    this.initSwupSystem()
    this.initAnimationSystem()
    this.initAccessibility()
    this.initFocusManagement()
    console.log('[Focus Debug] All systems initialized')
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
        // Remove focus after click to prevent focus ring
        button.blur()
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

  // ===== FOCUS MANAGEMENT SYSTEM =====
  initFocusManagement() {
    console.log('[Focus Debug] initFocusManagement() called')
    // Set initial input method
    this.setInputMethod(this.inputMethod)

    // Track mouse interactions
    document.addEventListener('mousedown', () => {
      console.log('[Focus Debug] Mouse detected')
      this.setInputMethod('mouse')
    })

    document.addEventListener('mousemove', () => {
      this.setInputMethod('mouse')
    })

    // Track keyboard interactions
    document.addEventListener('keydown', (e) => {
      // Change to keyboard mode on Tab, arrow keys, Enter, Space
      if (e.key === 'Tab' || e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'Enter' || e.key === ' ') {
        console.log(`[Focus Debug] Keyboard key detected: ${e.key}`)
        this.setInputMethod('keyboard')
      }
    })

    // Browser detection debugging
    console.log(`[Focus Debug] User Agent: ${navigator.userAgent}`)
    console.log(`[Focus Debug] Chrome test: ${/Chrome/.test(navigator.userAgent)}`)
    console.log(`[Focus Debug] Safari test: ${/Safari/.test(navigator.userAgent)}`)
    
    // Chrome-specific: Global click handler to blur focused elements for mouse users
    const isChrome = /Chrome/.test(navigator.userAgent) && !/Safari/.test(navigator.userAgent)
    
    if (isChrome) {
      document.addEventListener('click', (event) => {
        console.log(`[Focus Debug] Chrome click detected, current input method: ${this.inputMethod}`)
        if (this.inputMethod === 'mouse') {
          // Comprehensive element detection for Chrome
          const target = event.target.closest(`
            a, button, [tabindex], [role="button"], 
            .cursor-pointer, [onclick], input, select, textarea,
            [class*="card"], [class*="button"], [class*="link"],
            [data-swup-preload]
          `.replace(/\s+/g, ''))
          
          if (target) {
            console.log(`[Focus Debug] Chrome blurring element: ${target.tagName}, classes: ${target.className}`)
            target.blur()
          }
          
          // Always blur any focused element in Chrome for mouse clicks
          setTimeout(() => {
            if (document.activeElement && document.activeElement !== document.body && document.activeElement !== document.documentElement) {
              console.log(`[Focus Debug] Chrome blurring active element: ${document.activeElement.tagName}`)
              document.activeElement.blur()
            }
          }, 0)
        }
      })
    } else {
      console.log('[Focus Debug] Non-Chrome browser detected - using browser defaults for focus')
    }
  }

  setInputMethod(method) {
    if (this.inputMethod === method) return
    
    this.inputMethod = method
    document.documentElement.setAttribute('data-input-method', method)
    
    // Debug logging
    console.log(`[Focus Debug] Input method changed to: ${method}`)
    console.log(`[Focus Debug] HTML data-input-method: ${document.documentElement.getAttribute('data-input-method')}`)
    console.log(`[Focus Debug] Browser: ${navigator.userAgent.includes('Safari') && !navigator.userAgent.includes('Chrome') ? 'Safari' : 'Other'}`)
    
    // Debug CSS application
    if (method === 'mouse') {
      const testElement = document.querySelector('button, a')
      if (testElement) {
        const styles = window.getComputedStyle(testElement, ':focus')
        console.log(`[Focus Debug] Test element focus outline: ${styles.outline}`)
        console.log(`[Focus Debug] HTML classes: ${document.documentElement.className}`)
      }
    }
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

// Only initialize if not already done
if (!window.appManagerInitialized) {
  window.appManagerInitialized = true
  
  // Initialize when DOM is ready
  console.log('[Focus Debug] AppManager script loaded')
  if (document.readyState === 'loading') {
    console.log('[Focus Debug] DOM still loading, waiting for DOMContentLoaded')
    document.addEventListener('DOMContentLoaded', () => {
      console.log('[Focus Debug] DOMContentLoaded fired, creating AppManager')
      new AppManager()
    })
  } else {
    console.log('[Focus Debug] DOM already loaded, creating AppManager immediately')
    new AppManager()
  }
}
}