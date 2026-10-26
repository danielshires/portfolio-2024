import { useEffect, useState } from 'react'
import {
  fetchWeather,
  readWeatherCache,
  writeWeatherCache,
  WEATHER_TTL_MS,
  type Weather,
} from './woononaWeather'

/** Current Woonona reading, shared by the hero status line and the footer. */
export function useWoononaWeather(): Weather | null {
  const [weather, setWeather] = useState<Weather | null>(null)

  useEffect(() => {
    const cached = readWeatherCache()
    if (cached) setWeather(cached)

    const controller = new AbortController()
    const load = async () => {
      try {
        const next = await fetchWeather(controller.signal)
        if (!next) return
        setWeather(next)
        writeWeatherCache(next)
      } catch {
        // Keep the last reading, or leave weather blank if the forecast never arrives.
      }
    }

    if (!cached) void load()
    const refresh = window.setInterval(() => void load(), WEATHER_TTL_MS)
    return () => {
      controller.abort()
      window.clearInterval(refresh)
    }
  }, [])

  return weather
}
