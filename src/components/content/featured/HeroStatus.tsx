import { useEffect, useState } from 'react'
import WeatherGlyph from '../../ui/icons/WeatherGlyph'
import { describeWeather, LOCATION_LABEL, TIME_ZONE } from '../../../lib/woononaWeather'
import { useWoononaWeather } from '../../../lib/useWoononaWeather'

/** Pulse while the local hour is 9:00–16:59. */
const AVAILABLE_START_HOUR = 9
const AVAILABLE_END_HOUR = 17

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

function Separator() {
  return (
    <span aria-hidden='true' className='select-none'>
      ·
    </span>
  )
}

export default function HeroStatus({ name }: { name: string }) {
  const [clock, setClock] = useState<Clock | null>(null)
  const weather = useWoononaWeather()

  useEffect(() => {
    let timeout = 0
    const tick = () => {
      setClock(readClock(new Date()))
      timeout = window.setTimeout(tick, 1000 - (Date.now() % 1000))
    }
    tick()
    return () => window.clearTimeout(timeout)
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
