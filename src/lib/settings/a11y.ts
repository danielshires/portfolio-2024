export const SETTINGS_STORAGE_KEY = 'settings'

export type ContrastSetting = 'system' | 'high' | 'default'
export type MotionSetting = 'system' | 'reduce'
export type TextSetting = 'default' | 'large'

export type A11ySettings = {
  contrast: ContrastSetting
  motion: MotionSetting
  text: TextSetting
}

export type SiteSettings = {
  a11y: A11ySettings
  /** Unfinished pieces marked with `data-experiment` stay hidden until this is on. */
  experiments: boolean
}

export const defaultA11ySettings: A11ySettings = {
  contrast: 'system',
  motion: 'system',
  text: 'default',
}

const defaultSettings = (): SiteSettings => ({
  a11y: { ...defaultA11ySettings },
  experiments: false,
})

function isContrastSetting(value: unknown): value is ContrastSetting {
  return value === 'system' || value === 'high' || value === 'default'
}

function isMotionSetting(value: unknown): value is MotionSetting {
  return value === 'system' || value === 'reduce'
}

function isTextSetting(value: unknown): value is TextSetting {
  return value === 'default' || value === 'large'
}

export function parseSettings(raw: string | null): SiteSettings {
  const settings = defaultSettings()
  if (!raw) return settings

  try {
    const parsed = JSON.parse(raw) as { a11y?: Partial<A11ySettings>; experiments?: unknown }
    const a11y = parsed?.a11y
    if (a11y && typeof a11y === 'object') {
      if (isContrastSetting(a11y.contrast)) settings.a11y.contrast = a11y.contrast
      if (isMotionSetting(a11y.motion)) settings.a11y.motion = a11y.motion
      if (isTextSetting(a11y.text)) settings.a11y.text = a11y.text
    }
    if (parsed?.experiments === true) settings.experiments = true
    return settings
  } catch {
    return settings
  }
}

export function readSettings(): SiteSettings {
  try {
    return parseSettings(localStorage.getItem(SETTINGS_STORAGE_KEY))
  } catch {
    return defaultSettings()
  }
}

export function writeSettings(settings: SiteSettings) {
  localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings))
}

export function resolveHighContrast(contrast: ContrastSetting): boolean {
  if (contrast === 'high') return true
  if (contrast === 'default') return false
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-contrast: more)').matches
}

type ThemeWindow = Window & { refreshTheme?: () => void }

export function applyA11ySettings(settings: SiteSettings) {
  const root = document.documentElement
  root.toggleAttribute('data-high-contrast', resolveHighContrast(settings.a11y.contrast))
  root.toggleAttribute('data-reduced-motion', settings.a11y.motion === 'reduce')
  root.toggleAttribute('data-large-text', settings.a11y.text === 'large')
  root.toggleAttribute('data-experiments', settings.experiments)
  if (!settings.experiments) {
    root.removeAttribute('data-agent-view')
    try {
      localStorage.setItem('agent-view', 'off')
    } catch {
      // Storage can be blocked. The attribute is enough for this page.
    }
    document.getElementById('agent-toggle')?.setAttribute('aria-pressed', 'false')
  }
  ;(window as ThemeWindow).refreshTheme?.()
}

export const settingsBootScript = `(function () {
  try {
    var raw = localStorage.getItem(${JSON.stringify(SETTINGS_STORAGE_KEY)})
    var contrast = 'system'
    var motion = 'system'
    var text = 'default'
    var experiments = false
    if (raw) {
      var parsed = JSON.parse(raw)
      var a11y = parsed && parsed.a11y
      if (a11y) {
        if (a11y.contrast === 'high' || a11y.contrast === 'default' || a11y.contrast === 'system') contrast = a11y.contrast
        if (a11y.motion === 'reduce' || a11y.motion === 'system') motion = a11y.motion
        if (a11y.text === 'large' || a11y.text === 'default') text = a11y.text
      }
      if (parsed && parsed.experiments === true) experiments = true
    }
    var root = document.documentElement
    var high = contrast === 'high' || (contrast !== 'default' && window.matchMedia('(prefers-contrast: more)').matches)
    if (high) root.setAttribute('data-high-contrast', '')
    else root.removeAttribute('data-high-contrast')
    if (motion === 'reduce') root.setAttribute('data-reduced-motion', '')
    else root.removeAttribute('data-reduced-motion')
    if (text === 'large') root.setAttribute('data-large-text', '')
    else root.removeAttribute('data-large-text')
    if (experiments) root.setAttribute('data-experiments', '')
    else root.removeAttribute('data-experiments')
  } catch (e) {}
})()`
