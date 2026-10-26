import { useEffect, useState } from 'react'

/** Woonona, NSW — beach suburb north of Wollongong. */
const LATITUDE = -34.349
const LONGITUDE = 150.915
const TIME_ZONE = 'Australia/Sydney'
const LOCATION_LABEL = 'Woonona, AU'
const WEATHER_TTL_MS = 30 * 60 * 1000
const WEATHER_CACHE_KEY = 'hero-status-woonona-weather'
/** Pulse while the local hour is 9:00–16:59. */
const AVAILABLE_START_HOUR = 9
const AVAILABLE_END_HOUR = 17

type WeatherKind = 'clear' | 'partly' | 'cloud' | 'fog' | 'rain' | 'snow' | 'storm'

type Weather = {
  code: number
  temperature: number
}

type Clock = {
  hour: string
  minute: string
  second: string
  hourNumber: number
}

function readClock(date: Date): Clock {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: TIME_ZONE,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date)

  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? '00'

  const hour = value('hour')
  return {
    hour,
    minute: value('minute'),
    second: value('second'),
    hourNumber: Number(hour),
  }
}

function describeWeather(code: number): { kind: WeatherKind; label: string } {
  if (code === 0) return { kind: 'clear', label: 'Clear' }
  if (code === 1 || code === 2) return { kind: 'partly', label: 'Partly cloudy' }
  if (code === 3) return { kind: 'cloud', label: 'Overcast' }
  if (code === 45 || code === 48) return { kind: 'fog', label: 'Fog' }
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return { kind: 'rain', label: 'Rain' }
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return { kind: 'snow', label: 'Snow' }
  if (code >= 95) return { kind: 'storm', label: 'Thunderstorm' }
  return { kind: 'cloud', label: 'Cloudy' }
}

function readWeatherCache(): Weather | null {
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

function writeWeatherCache(weather: Weather) {
  try {
    sessionStorage.setItem(WEATHER_CACHE_KEY, JSON.stringify({ weather, fetchedAt: Date.now() }))
  } catch {
    // Private mode and blocked storage can reject the write; the live reading still shows.
  }
}

async function fetchWeather(signal: AbortSignal): Promise<Weather | null> {
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

function WeatherGlyph({ kind }: { kind: WeatherKind }) {
  const shared = {
    viewBox: '0 0 16 16',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.25,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className: 'h-3.5 w-3.5 shrink-0',
    'aria-hidden': true as const,
  }

  if (kind === 'clear') {
    return (
      <svg {...shared}>
        <circle cx='8' cy='8' r='2.25' />
        <path d='M8 1.75v1.5M8 12.75v1.5M1.75 8h1.5M12.75 8h1.5M3.4 3.4l1.05 1.05M11.55 11.55l1.05 1.05M3.4 12.6l1.05-1.05M11.55 4.45l1.05-1.05' />
      </svg>
    )
  }

  if (kind === 'partly') {
    return (
      <svg {...shared}>
        <path d='M10.2 3.1v1.1M12.55 4.35l-.8.8M13.1 7h-1.1' />
        <path d='M6.2 13.25h5.15a2.35 2.35 0 0 0 .35-4.67 2.7 2.7 0 0 0-5.2-.55 2.15 2.15 0 0 0-1.9 2.15 2.15 2.15 0 0 0 1.6 3.07Z' />
      </svg>
    )
  }

  if (kind === 'fog') {
    return (
      <svg {...shared}>
        <path d='M3 5.5h10M2.5 8h11M3.5 10.5h9' />
      </svg>
    )
  }

  if (kind === 'rain') {
    return (
      <svg {...shared}>
        <path d='M5.1 10.6h5.4a2.15 2.15 0 0 0 .3-4.27 2.45 2.45 0 0 0-4.75-.5 1.95 1.95 0 0 0-1.75 1.95 1.95 1.95 0 0 0 1.8 2.82Z' />
        <path d='M6.2 12.1v1.35M8.4 12.1v1.35M10.6 12.1v1.35' />
      </svg>
    )
  }

  if (kind === 'snow') {
    return (
      <svg {...shared}>
        <path d='M5.1 9.7h5.4a2.15 2.15 0 0 0 .3-4.27 2.45 2.45 0 0 0-4.75-.5 1.95 1.95 0 0 0-1.75 1.95 1.95 1.95 0 0 0 1.8 2.82Z' />
        <path d='M6.3 11.4v1.6M6.3 12.2h.9M7.2 11.4l-.9 1.6M9.7 11.4v1.6M9.7 12.2h.9M10.6 11.4l-.9 1.6' />
      </svg>
    )
  }

  if (kind === 'storm') {
    return (
      <svg {...shared}>
        <path d='M4.9 9.4h5.5a2.2 2.2 0 0 0 .35-4.36 2.5 2.5 0 0 0-4.85-.5 2 2 0 0 0-1.8 2 2 2 0 0 0 1.8 2.86Z' />
        <path d='M8.6 9.2 6.9 12h1.7l-1 2.5' />
      </svg>
    )
  }

  return (
    <svg {...shared}>
      <path d='M4.4 12.5h7.15a2.7 2.7 0 0 0 .4-5.37 3.15 3.15 0 0 0-6.1-.7 2.45 2.45 0 0 0-2.2 2.5 2.45 2.45 0 0 0 2.75 3.57Z' />
    </svg>
  )
}

function Separator() {
  return (
    <span aria-hidden='true' className='select-none'>
      ·
    </span>
  )
}

export default function HeroStatus({ name }: { name: string }) {
  const [clock, setClock] = useState<Clock | null>(null)
  const [weather, setWeather] = useState<Weather | null>(null)

  useEffect(() => {
    let timeout = 0
    const tick = () => {
      setClock(readClock(new Date()))
      timeout = window.setTimeout(tick, 1000 - (Date.now() % 1000))
    }
    tick()
    return () => window.clearTimeout(timeout)
  }, [])

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

  const available =
    clock !== null &&
    clock.hourNumber >= AVAILABLE_START_HOUR &&
    clock.hourNumber < AVAILABLE_END_HOUR

  const conditions = weather ? describeWeather(weather.code) : null
  const temperature = weather ? `${Math.round(weather.temperature)}°` : null

  const summary = [
    available ? 'Available, 9 to 5.' : clock ? 'Outside 9 to 5.' : null,
    `${name}.`,
    'Woonona, Australia.',
    conditions && temperature ? `${temperature} and ${conditions.label.toLowerCase()}.` : null,
    clock ? `Local time ${clock.hour}:${clock.minute}.` : 'Local time loading.',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <span
      role='group'
      aria-label={summary}
      className='inline-flex max-w-full flex-wrap items-center gap-x-2 gap-y-1'>
      <span className='relative inline-flex size-2 shrink-0' aria-hidden='true'>
        {available && (
          <span className='absolute inline-flex size-full animate-ping rounded-full bg-green-400 opacity-75 motion-reduce:hidden' />
        )}
        <span
          className={`relative inline-flex size-2 rounded-full ${
            available ? 'bg-green-500' : 'bg-green-500/45'
          }`}
        />
      </span>
      <span aria-hidden='true'>{name}</span>
      <Separator />
      <span className='inline-flex items-center gap-1.5' aria-hidden='true'>
        <span>{LOCATION_LABEL}</span>
        {conditions && temperature && (
          <span className='inline-flex items-center gap-1' title={`${temperature} ${conditions.label}`}>
            <WeatherGlyph kind={conditions.kind} />
            <span>{temperature}</span>
          </span>
        )}
      </span>
      <Separator />
      <span className='inline-flex items-center tabular-nums tracking-normal' aria-hidden='true'>
        {clock ? (
          <span>
            {clock.hour}:{clock.minute}:{clock.second}
          </span>
        ) : (
          <span className='opacity-40'>––:––:––</span>
        )}
      </span>
    </span>
  )
}
