/**
 * Woonona footer “weather mood” — Open-Meteo (no API key), client-side + session cache.
 * One line of copy; only the emoji reflects conditions.
 */

export type WeatherMood = {
  emoji: string
  text: string
}

/** Fixed footer line; emoji is chosen from current weather. */
export const FOOTER_TAGLINE = 'Built in Woonona, NSW'

export const FALLBACK_MOOD: WeatherMood = {
  emoji: '🌊',
  text: FOOTER_TAGLINE,
}

const CACHE_KEY = 'woonona-footer-mood-v3'
const CACHE_MS = 45 * 60 * 1000

const OPEN_METEO_URL =
  'https://api.open-meteo.com/v1/forecast?latitude=-34.336&longitude=150.905&current=temperature_2m,weather_code,wind_speed_10m&timezone=Australia%2FSydney'

type OpenMeteoCurrent = {
  temperature_2m?: number
  weather_code?: number
  wind_speed_10m?: number
}

function emojiFromSignals(current: OpenMeteoCurrent): string {
  const temp = current.temperature_2m ?? 0
  const code = current.weather_code ?? 0
  const windKmh = current.wind_speed_10m ?? 0

  if (code === 95 || code === 96 || code === 99) {
    return '⛈️'
  }

  if (temp >= 30) {
    return '🔥'
  }

  if (windKmh >= 40) {
    return '🌬️'
  }

  if (code === 45 || code === 48) {
    return '🌫️'
  }

  if (
    (code >= 51 && code <= 67) ||
    (code >= 80 && code <= 82) ||
    (code >= 85 && code <= 86)
  ) {
    return '🌧️'
  }

  if (code === 0) {
    return '☀️'
  }

  if (code === 1 || code === 2 || code === 3) {
    return '⛅'
  }

  if (code >= 71 && code <= 77) {
    return '⛅'
  }

  return '🌊'
}

function moodFromSignals(current: OpenMeteoCurrent): WeatherMood {
  return {
    emoji: emojiFromSignals(current),
    text: FOOTER_TAGLINE,
  }
}

function readCache(): WeatherMood | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as { emoji?: string; t?: number }
    if (!parsed.t || Date.now() - parsed.t > CACHE_MS) return null
    if (!parsed.emoji || typeof parsed.emoji !== 'string') return null
    return { emoji: parsed.emoji, text: FOOTER_TAGLINE }
  } catch {
    return null
  }
}

function writeCache(mood: WeatherMood) {
  try {
    sessionStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ emoji: mood.emoji, t: Date.now() })
    )
  } catch {
    /* ignore quota / private mode */
  }
}

async function fetchCurrent(): Promise<OpenMeteoCurrent | null> {
  const res = await fetch(OPEN_METEO_URL)
  if (!res.ok) return null
  const data = (await res.json()) as { current?: OpenMeteoCurrent }
  return data.current ?? null
}

function applyMood(el: HTMLElement, mood: WeatherMood) {
  el.textContent = `${mood.emoji} ${mood.text}`
}

/**
 * Hydrate `[data-footer-mood]` from cache or Open-Meteo; falls back to static HTML if fetch fails.
 */
export async function initFooterMood(selector = '[data-footer-mood]'): Promise<void> {
  if (typeof document === 'undefined') return

  const el = document.querySelector(selector)
  if (!(el instanceof HTMLElement)) return

  const cached = readCache()
  if (cached) {
    applyMood(el, cached)
    return
  }

  try {
    const current = await fetchCurrent()
    if (!current || current.weather_code === undefined) {
      return
    }
    const mood = moodFromSignals(current)
    writeCache(mood)
    applyMood(el, mood)
  } catch {
    /* keep server-rendered fallback */
  }
}
