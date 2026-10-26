/**
 * Shared Woonona forecast for the homepage status line and the footer.
 * Open-Meteo, no API key, with a short session cache so both surfaces match.
 */

/** Woonona, NSW — beach suburb north of Wollongong. */
export const LATITUDE = -34.349
export const LONGITUDE = 150.915
export const TIME_ZONE = 'Australia/Sydney'
export const LOCATION_LABEL = 'Woonona, AU'

const WEATHER_TTL_MS = 30 * 60 * 1000
const WEATHER_CACHE_KEY = 'woonona-weather'

export type WeatherKind = 'clear' | 'partly' | 'cloud' | 'fog' | 'rain' | 'snow' | 'storm'

export type Weather = {
  code: number
  temperature: number
}

export function describeWeather(code: number): { kind: WeatherKind; label: string } {
  if (code === 0) return { kind: 'clear', label: 'Clear' }
  if (code === 1 || code === 2) return { kind: 'partly', label: 'Partly cloudy' }
  if (code === 3) return { kind: 'cloud', label: 'Overcast' }
  if (code === 45 || code === 48) return { kind: 'fog', label: 'Fog' }
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return { kind: 'rain', label: 'Rain' }
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return { kind: 'snow', label: 'Snow' }
  if (code >= 95) return { kind: 'storm', label: 'Thunderstorm' }
  return { kind: 'cloud', label: 'Cloudy' }
}

export function readWeatherCache(): Weather | null {
  try {
    const raw = sessionStorage.getItem(WEATHER_CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as { weather?: Weather; fetchedAt?: number }
    if (!parsed.weather || typeof parsed.fetchedAt !== 'number') return null
    if (Date.now() - parsed.fetchedAt > WEATHER_TTL_MS) return null
    return parsed.weather
  } catch {
    return null
  }
}

export function writeWeatherCache(weather: Weather) {
  try {
    sessionStorage.setItem(WEATHER_CACHE_KEY, JSON.stringify({ weather, fetchedAt: Date.now() }))
  } catch {
    // Private mode and blocked storage can reject the write; the live reading still shows.
  }
}

export async function fetchWeather(signal: AbortSignal): Promise<Weather | null> {
  const url = new URL('https://api.open-meteo.com/v1/forecast')
  url.searchParams.set('latitude', String(LATITUDE))
  url.searchParams.set('longitude', String(LONGITUDE))
  url.searchParams.set('current', 'temperature_2m,weather_code')
  url.searchParams.set('timezone', TIME_ZONE)

  const response = await fetch(url, { signal })
  if (!response.ok) return null

  const data = (await response.json()) as {
    current?: { temperature_2m?: number; weather_code?: number }
  }
  const temperature = data.current?.temperature_2m
  const code = data.current?.weather_code
  if (typeof temperature !== 'number' || typeof code !== 'number') return null
  return { temperature, code }
}

export { WEATHER_TTL_MS }
