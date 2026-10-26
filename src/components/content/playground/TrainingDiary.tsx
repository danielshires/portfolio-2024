import { Fragment, useCallback, useEffect, useRef, useState } from 'react'
import type { CSSProperties, KeyboardEvent } from 'react'
import { scaleLinear } from 'd3-scale'
import { stack } from 'd3-shape'
import { DIARY_DAYS, eachDate, weekdayIndex } from '../../../lib/training/dates'
import type { DiaryResponse, DiaryScale, DiaryWorkout } from '../../../lib/training/types'

const LOAD_ERROR = 'The diary could not load. Try again in a little while.'
const WEEKS = DIARY_DAYS / 7
const BASELINE = 88
const WEEKDAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

const CHARTS: { id: ChartKind; label: string }[] = [
  { id: 'calendar', label: 'Calendar' },
  { id: 'bars', label: 'Bars' },
]

const SCALES: { id: DiaryScale; label: string }[] = [
  { id: 'effort', label: 'Effort' },
  { id: 'distance', label: 'Distance' },
  { id: 'time', label: 'Time' },
]

type ChartKind = 'calendar' | 'bars'
type Notice = 'denied' | 'scope' | 'error' | 'unconfigured'
type Focusable = HTMLElement | SVGElement
type StackRow = Record<string, number>

function isIsoDate(value: unknown): value is string {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
}

function positiveOrNull(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : null
}

function readWorkout(value: unknown): DiaryWorkout | null {
  if (!value || typeof value !== 'object') return null
  const workout = value as Partial<DiaryWorkout>
  if (
    typeof workout.id !== 'number' ||
    typeof workout.name !== 'string' ||
    typeof workout.sport !== 'string' ||
    typeof workout.start !== 'string' ||
    typeof workout.movingSeconds !== 'number' ||
    typeof workout.distanceMeters !== 'number' ||
    typeof workout.elevationMeters !== 'number' ||
    !(workout.effort === null || typeof workout.effort === 'number')
  ) {
    return null
  }
  return {
    id: workout.id,
    name: workout.name,
    sport: workout.sport,
    start: workout.start,
    movingSeconds: workout.movingSeconds,
    distanceMeters: workout.distanceMeters,
    elevationMeters: workout.elevationMeters,
    effort: workout.effort ?? null,
    trainer: workout.trainer === true,
    kilojoules: positiveOrNull(workout.kilojoules),
    averageWatts: positiveOrNull(workout.averageWatts),
    averageHeartrate: positiveOrNull(workout.averageHeartrate),
  }
}

function parseDiary(value: unknown): DiaryResponse | null {
  if (!value || typeof value !== 'object' || !('status' in value)) return null
  const status = (value as { status?: unknown }).status
  if (status === 'unconfigured' || status === 'disconnected') return { status }
  if (status === 'error') {
    const message = (value as { message?: unknown }).message
    return { status, message: typeof message === 'string' && message.trim() ? message : LOAD_ERROR }
  }
  if (status !== 'ready') return null
  const ready = value as DiaryResponse & { status: 'ready' }
  if (!isIsoDate(ready.from) || !isIsoDate(ready.to) || ready.from > ready.to) return null
  if (typeof ready.updatedAt !== 'string' || !Array.isArray(ready.days) || ready.days.length > 200) return null
  const days = []
  for (const day of ready.days) {
    if (!day || typeof day !== 'object' || !isIsoDate((day as { date?: unknown }).date)) return null
    const workouts = (day as { workouts?: unknown }).workouts
    if (!Array.isArray(workouts)) return null
    const parsed = workouts.map(readWorkout)
    if (parsed.some((workout) => workout === null)) return null
    days.push({ date: (day as { date: string }).date, workouts: parsed as DiaryWorkout[] })
  }
  return { status: 'ready', from: ready.from, to: ready.to, updatedAt: ready.updatedAt, days }
}

function utcDate(iso: string): Date {
  const [year, month, day] = iso.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day))
}

function formatDiaryDate(iso: string): string {
  return new Intl.DateTimeFormat('en-AU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: 'UTC',
  }).format(utcDate(iso))
}

function formatMonth(iso: string): string {
  return new Intl.DateTimeFormat('en-AU', { month: 'short', timeZone: 'UTC' }).format(utcDate(iso))
}

function sportLabel(sport: string): string {
  const spaced = sport.replace(/_/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2')
  return spaced.charAt(0).toUpperCase() + spaced.slice(1)
}

function filterLabel(sport: string): string {
  if (sport === 'HighIntensityIntervalTraining') return 'HIIT'
  if (sport === 'WeightTraining') return 'Strength'
  return sportLabel(sport)
}

function sportOptions(days: { workouts: DiaryWorkout[] }[]): string[] {
  const counts = new Map<string, number>()
  for (const day of days) {
    for (const workout of day.workouts) {
      counts.set(workout.sport, (counts.get(workout.sport) ?? 0) + 1)
    }
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || filterLabel(a[0]).localeCompare(filterLabel(b[0])))
    .map(([sport]) => sport)
}

function formatDuration(seconds: number): string {
  const total = Math.max(0, Math.round(seconds / 60))
  const hours = Math.floor(total / 60)
  const minutes = total % 60
  if (hours === 0) return `${minutes} min`
  if (minutes === 0) return `${hours} h`
  return `${hours} h ${minutes} min`
}

function formatDistance(meters: number): string {
  if (meters >= 1000) {
    const km = meters / 1000
    return `${km >= 10 ? km.toFixed(0) : km.toFixed(1)} km`
  }
  return `${Math.round(meters)} m`
}

function metric(workout: DiaryWorkout, scale: DiaryScale): { value: number; estimated: boolean } {
  if (scale === 'distance') return { value: workout.distanceMeters, estimated: false }
  if (scale === 'time') return { value: workout.movingSeconds, estimated: false }
  if (workout.effort != null) return { value: workout.effort, estimated: false }
  return { value: workout.movingSeconds / 60, estimated: true }
}

function dayReading(workouts: DiaryWorkout[], scale: DiaryScale): { value: number; tone: 'rest' | 'indoor' | 'quiet' | 'value' } {
  if (workouts.length === 0) return { value: 0, tone: 'rest' }
  const readings = workouts.map((workout) => metric(workout, scale))
  const value = readings.reduce((sum, reading) => sum + reading.value, 0)
  if (value <= 0) return { value: 0, tone: 'indoor' }
  const estimated = readings.every((reading) => reading.value <= 0 || reading.estimated)
  return { value, tone: estimated ? 'quiet' : 'value' }
}

function isIndoorRide(workout: DiaryWorkout): boolean {
  return /ride|virtual/i.test(workout.sport) && workout.distanceMeters <= 0
}

function dayNote(workouts: DiaryWorkout[], scale: DiaryScale): string | null {
  if (scale === 'effort' && workouts.some((workout) => workout.effort == null)) {
    return workouts.length > 1
      ? 'Heart rate didn’t come across for some sessions, so those use time.'
      : 'Heart rate didn’t come across, so this day uses time.'
  }
  if (scale === 'distance' && workouts.some(isIndoorRide)) {
    return 'Indoor rides don’t include a distance unless the bike sends one. Time, heart rate, and power still come through.'
  }
  return null
}

function sessionMeta(workout: DiaryWorkout): string {
  const sport = sportLabel(workout.sport)
  const parts: string[] = []
  if (workout.name.trim().toLowerCase() !== sport.toLowerCase()) parts.push(sport)
  if (isIndoorRide(workout) && !/virtual/i.test(sport)) parts.push('Indoor')
  parts.push(formatDuration(workout.movingSeconds))
  if (workout.distanceMeters > 0) parts.push(formatDistance(workout.distanceMeters))
  if (workout.averageWatts != null) parts.push(`${Math.round(workout.averageWatts)} W`)
  if (workout.kilojoules != null) parts.push(`${Math.round(workout.kilojoules)} kJ`)
  if (workout.distanceMeters > 0 && workout.elevationMeters >= 1) {
    parts.push(`${Math.round(workout.elevationMeters)} m`)
  }
  if (workout.averageHeartrate != null) parts.push(`${Math.round(workout.averageHeartrate)} bpm`)
  return parts.join(' · ')
}

function dayLabel(date: string, workouts: DiaryWorkout[], sport: string | null): string {
  if (workouts.length === 0) {
    return sport ? `${formatDiaryDate(date)}, no ${filterLabel(sport)}` : `${formatDiaryDate(date)}, rest day`
  }
  const count = workouts.length === 1 ? '1 workout' : `${workouts.length} workouts`
  return `${formatDiaryDate(date)}, ${count}`
}

function monthMarks(dates: string[]): { index: number; label: string }[] {
  const marks: { index: number; label: string }[] = []
  let previous = -20
  dates.forEach((date, index) => {
    if (index !== 0 && !date.endsWith('-01')) return
    if (index - previous < 10) return
    marks.push({ index, label: formatMonth(date) })
    previous = index
  })
  return marks
}

function calendarWeeks(dates: string[]): (string | null)[][] {
  if (dates.length === 0) return []
  const cells: (string | null)[] = [...Array(weekdayIndex(dates[0])).fill(null), ...dates]
  const trailing = (7 - (cells.length % 7)) % 7
  cells.push(...Array(trailing).fill(null))
  const weeks: (string | null)[][] = []
  for (let index = 0; index < cells.length; index += 7) weeks.push(cells.slice(index, index + 7))
  return weeks
}

function weekLabel(week: (string | null)[], weekIndex: number): string | null {
  const dates = week.filter((date): date is string => Boolean(date))
  const firstOfMonth = dates.find((date) => date.endsWith('-01'))
  if (firstOfMonth) return formatMonth(firstOfMonth)
  if (weekIndex === 0 && dates[0]) return formatMonth(dates[0])
  return null
}

function stackedBars(workouts: DiaryWorkout[], scale: DiaryScale, max: number) {
  if (workouts.length === 0) return []
  const readings = workouts.map((workout) => metric(workout, scale))
  const row: StackRow = {}
  const keys = readings.map((_, index) => {
    const key = String(index)
    row[key] = Math.max(0, readings[index].value)
    return key
  })
  const layers = stack<StackRow>().keys(keys)([row])
  const y = scaleLinear()
    .domain([0, Math.max(max, 1)])
    .range([BASELINE, BASELINE - 74])
  return layers.map((layer, index) => {
    const start = layer[0][0]
    const end = layer[0][1]
    return {
      y: y(end),
      height: Math.max(0, y(start) - y(end)),
      opacity: readings[index].estimated ? 0.32 : index % 2 === 0 ? 0.92 : 0.68,
    }
  })
}

export default function TrainingDiary() {
  const [view, setView] = useState<DiaryResponse | { status: 'loading' }>({ status: 'loading' })
  const [notice, setNotice] = useState<Notice | null>(null)
  const [chart, setChart] = useState<ChartKind>('calendar')
  const [scale, setScale] = useState<DiaryScale>('effort')
  const [sportFilter, setSportFilter] = useState<string | null>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const [keyboardFocus, setKeyboardFocus] = useState<string | null>(null)
  const scrollerRef = useRef<HTMLDivElement>(null)
  const dayRefs = useRef(new Map<string, Focusable>())

  const load = useCallback(async () => {
    setView({ status: 'loading' })
    try {
      const response = await fetch('/api/strava/diary', { signal: AbortSignal.timeout(15000) })
      const diary = parseDiary(await response.json())
      if (!diary) {
        setView({ status: 'error', message: LOAD_ERROR })
        return
      }
      setView(diary)
      if (diary.status === 'ready') {
        const latest = [...diary.days].reverse().find((day) => day.workouts.length > 0)?.date ?? diary.to
        setSelected(latest)
      }
    } catch {
      setView({ status: 'error', message: LOAD_ERROR })
    }
  }, [])

  useEffect(() => {
    const flag = new URLSearchParams(window.location.search).get('strava')
    if (flag === 'denied' || flag === 'scope' || flag === 'error' || flag === 'unconfigured') setNotice(flag)
    void load()
  }, [load])

  const ready = view.status === 'ready' ? view : null
  const axis = ready ? eachDate(ready.from, ready.to) : []
  const workoutsByDate = new Map(ready?.days.map((day) => [day.date, day.workouts]) ?? [])
  const sports = sportOptions(ready?.days ?? [])
  const activeSport = sportFilter && sports.includes(sportFilter) ? sportFilter : null
  function workoutsOn(date: string): DiaryWorkout[] {
    const workouts = workoutsByDate.get(date) ?? []
    if (!activeSport) return workouts
    return workouts.filter((workout) => workout.sport === activeSport)
  }
  const selectedWorkouts = selected ? workoutsOn(selected) : []
  const workoutCount = axis.reduce((sum, date) => sum + workoutsOn(date).length, 0)
  const note = selectedWorkouts.length > 0 ? dayNote(selectedWorkouts, scale) : null
  const axisEnd = axis[axis.length - 1] ?? null

  const totals = axis.map((date) => dayReading(workoutsOn(date), scale).value)
  const max = Math.max(...totals, 0)

  useEffect(() => {
    if (chart !== 'bars' || !selected) return
    const frame = requestAnimationFrame(() => {
      const scroller = scrollerRef.current
      const node = dayRefs.current.get(selected)
      if (!scroller || !node) return
      const box = scroller.getBoundingClientRect()
      const nodeRect = node.getBoundingClientRect()
      if (nodeRect.left >= box.left - 1 && nodeRect.right <= box.right + 1) return
      const delta =
        nodeRect.right > box.right ? nodeRect.right - box.right + 12 : nodeRect.left - box.left - 12
      scroller.scrollLeft += delta
    })
    return () => cancelAnimationFrame(frame)
  }, [chart, selected, axisEnd])

  function chooseSport(next: string | null) {
    setSportFilter(next)
    const has = (date: string) => {
      const workouts = workoutsByDate.get(date) ?? []
      return next ? workouts.some((workout) => workout.sport === next) : workouts.length > 0
    }
    if (selected && has(selected)) return
    const latest = [...axis].reverse().find(has)
    if (latest) setSelected(latest)
  }

  function bindDay(date: string) {
    return (node: Focusable | null) => {
      if (node) dayRefs.current.set(date, node)
      else dayRefs.current.delete(date)
    }
  }

  function moveSelection(index: number) {
    const date = axis[index]
    if (!date) return
    setSelected(date)
    dayRefs.current.get(date)?.focus()
  }

  function onDayKey(event: KeyboardEvent, index: number) {
    const step = (delta: number) => {
      event.preventDefault()
      moveSelection(Math.min(axis.length - 1, Math.max(0, index + delta)))
    }
    if (event.key === 'ArrowRight') step(1)
    else if (event.key === 'ArrowLeft') step(-1)
    else if (event.key === 'ArrowDown' && chart === 'calendar') step(7)
    else if (event.key === 'ArrowUp' && chart === 'calendar') step(-7)
    else if (event.key === 'Home') step(-index)
    else if (event.key === 'End') step(axis.length - 1 - index)
  }

  const plotStyle = { '--day-count': axis.length } as CSSProperties
  const weeks = calendarWeeks(axis)
  const ink = scaleLinear()
    .domain([0, Math.max(max, 1)])
    .range([0.16, 0.92])
    .clamp(true)

  return (
    <div className='diary'>
      <header className='diary-header'>
        <div>
          <h1>Training diary</h1>
          <p>{ready ? `Last ${WEEKS} weeks` : 'Workouts from the watch, read back from Strava.'}</p>
        </div>
        {ready ? (
          <div className='diary-controls'>
            <div className='diary-scales' role='group' aria-label='Chart'>
              {CHARTS.map((item) => (
                <button
                  key={item.id}
                  type='button'
                  aria-pressed={chart === item.id}
                  onClick={() => setChart(item.id)}>
                  {item.label}
                </button>
              ))}
            </div>
            <div
              className='diary-scales'
              role='group'
              aria-label={chart === 'calendar' ? 'What the days show' : 'What the bars show'}>
              {SCALES.map((item) => (
                <button
                  key={item.id}
                  type='button'
                  aria-pressed={scale === item.id}
                  onClick={() => setScale(item.id)}>
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        ) : null}
        {sports.length > 1 ? (
          <div className='diary-activities' role='group' aria-label='Activity'>
            <button type='button' aria-pressed={activeSport === null} onClick={() => chooseSport(null)}>
              All
            </button>
            {sports.map((sport) => (
              <button
                key={sport}
                type='button'
                aria-pressed={activeSport === sport}
                onClick={() => chooseSport(sport)}>
                {filterLabel(sport)}
              </button>
            ))}
          </div>
        ) : null}
      </header>

      {ready && selected ? (
        <>
          <section className='diary-detail' aria-live='polite'>
            <h2>{formatDiaryDate(selected)}</h2>
            {workoutCount === 0 ? (
              <p className='diary-note'>Nothing has come across from Strava in the last {WEEKS} weeks.</p>
            ) : selectedWorkouts.length === 0 ? (
              <p className='diary-session-name'>{activeSport ? `No ${filterLabel(activeSport)}` : 'Rest day'}</p>
            ) : (
              <ul className='diary-sessions'>
                {selectedWorkouts.map((workout) => (
                  <li key={workout.id}>
                    <p className='diary-session-name'>{workout.name}</p>
                    <p className='diary-quiet'>{sessionMeta(workout)}</p>
                  </li>
                ))}
              </ul>
            )}
            {note ? <p className='diary-note'>{note}</p> : null}
          </section>
          <div className='diary-stage'>
            <div className='diary-scroll' ref={scrollerRef}>
              {chart === 'calendar' ? (
                <div
                  className='diary-calendar'
                  style={{ '--week-count': weeks.length } as CSSProperties}
                  role='listbox'
                  aria-label={`Last ${WEEKS} weeks, days show ${scale}${activeSport ? `, ${filterLabel(activeSport)} only` : ''}`}>
                  {WEEKDAY_LABELS.map((label, row) => (
                    <span
                      key={`${label}-${row}`}
                      className='diary-weekday'
                      style={{ gridColumn: 1, gridRow: row + 2 }}
                      aria-hidden='true'>
                      {label}
                    </span>
                  ))}
                  {weeks.map((week, weekIndex) => {
                    const label = weekLabel(week, weekIndex)
                    return (
                      <Fragment key={weekIndex}>
                        {label ? (
                          <span
                            className='diary-month'
                            style={{ gridColumn: weekIndex + 2, gridRow: 1 }}
                            aria-hidden='true'>
                            {label}
                          </span>
                        ) : null}
                        {week.map((date, row) => {
                          if (!date) return null
                          const workouts = workoutsOn(date)
                          const reading = dayReading(workouts, scale)
                          const isSelected = date === selected
                          return (
                            <button
                              key={date}
                              type='button'
                              ref={bindDay(date)}
                              role='option'
                              aria-selected={isSelected}
                              aria-label={dayLabel(date, workouts, activeSport)}
                              tabIndex={isSelected ? 0 : -1}
                              data-mark={reading.tone}
                              style={{
                                gridColumn: weekIndex + 2,
                                gridRow: row + 2,
                                ...(reading.tone === 'value' || reading.tone === 'quiet'
                                  ? { opacity: ink(reading.value) * (reading.tone === 'quiet' ? 0.5 : 1) }
                                  : null),
                              }}
                              onClick={() => setSelected(date)}
                              onKeyDown={(event) => onDayKey(event, axis.indexOf(date))}
                            />
                          )
                        })}
                      </Fragment>
                    )
                  })}
                </div>
              ) : (
                <div className='diary-plot' style={plotStyle}>
                  <svg
                    viewBox={`0 0 ${axis.length} 100`}
                    preserveAspectRatio='none'
                    role='listbox'
                    aria-label={`Last ${WEEKS} weeks, bars show ${scale}${activeSport ? `, ${filterLabel(activeSport)} only` : ''}`}
                    aria-orientation='horizontal'>
                    <line
                      x1='0'
                      x2={axis.length}
                      y1={BASELINE}
                      y2={BASELINE}
                      stroke='white'
                      strokeOpacity='0.22'
                      strokeWidth='1'
                      vectorEffect='non-scaling-stroke'
                    />
                    {axis.map((date, index) => {
                      const workouts = workoutsOn(date)
                      const bars = stackedBars(workouts, scale, max).filter((bar) => bar.height > 0.4)
                      const isSelected = date === selected
                      const unmarked = workouts.length > 0 && bars.length === 0
                      return (
                        <g
                          key={date}
                          ref={bindDay(date)}
                          role='option'
                          aria-selected={isSelected}
                          aria-label={dayLabel(date, workouts, activeSport)}
                          tabIndex={isSelected ? 0 : -1}
                          onClick={() => setSelected(date)}
                          onFocus={(event) => {
                            if (event.currentTarget.matches(':focus-visible')) setKeyboardFocus(date)
                          }}
                          onBlur={() => setKeyboardFocus((current) => (current === date ? null : current))}
                          onKeyDown={(event) => onDayKey(event, index)}>
                          {isSelected ? (
                            <rect x={index} y='0' width='1' height={BASELINE} fill='rgba(255,255,255,0.1)' />
                          ) : null}
                          {workouts.length === 0 || unmarked ? (
                            <line
                              x1={index + 0.5}
                              x2={index + 0.5}
                              y1={BASELINE}
                              y2={BASELINE - (unmarked ? 5 : 2.4)}
                              stroke='white'
                              strokeOpacity={unmarked ? 0.7 : 0.4}
                              strokeWidth='1'
                              vectorEffect='non-scaling-stroke'
                            />
                          ) : (
                            bars.map((bar, barIndex) => (
                              <rect
                                key={barIndex}
                                x={index + 0.21}
                                y={bar.y}
                                width='0.58'
                                height={bar.height}
                                fill='white'
                                fillOpacity={bar.opacity}
                              />
                            ))
                          )}
                          <rect x={index} y='0' width='1' height='100' fill='transparent' />
                          {keyboardFocus === date ? (
                            <rect
                              x={index + 0.08}
                              y='1'
                              width='0.84'
                              height={BASELINE - 2}
                              fill='none'
                              stroke='white'
                              strokeOpacity='0.55'
                              strokeWidth='1'
                              vectorEffect='non-scaling-stroke'
                            />
                          ) : null}
                        </g>
                      )
                    })}
                  </svg>
                  <div className='diary-axis' aria-hidden='true'>
                    {monthMarks(axis).map((mark) => (
                      <span key={mark.label + mark.index} style={{ left: `${(mark.index / axis.length) * 100}%` }}>
                        {mark.label}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className='diary-stage'>
          <div className='diary-empty'>
            <StatusCopy status={view.status} notice={notice} message={'message' in view ? view.message : undefined} />
            {showConnect(view.status, notice) ? (
              <a className='diary-connect' href='/api/strava/connect'>
                Connect Strava
              </a>
            ) : null}
            {view.status === 'error' ? (
              <button type='button' className='diary-connect' onClick={() => void load()}>
                Try again
              </button>
            ) : null}
          </div>
        </div>
      )}
    </div>
  )
}

function showConnect(status: DiaryResponse['status'] | 'loading', notice: Notice | null): boolean {
  if (status === 'loading' || status === 'ready' || status === 'unconfigured' || notice === 'unconfigured') {
    return false
  }
  return status === 'disconnected' || notice === 'denied' || notice === 'scope' || notice === 'error'
}

function StatusCopy({
  status,
  notice,
  message,
}: {
  status: DiaryResponse['status'] | 'loading'
  notice: Notice | null
  message?: string
}) {
  if (status === 'loading') return <p>Loading the diary…</p>
  if (notice === 'denied') return <p>Strava access was cancelled.</p>
  if (notice === 'scope') {
    return <p>Strava needs permission to read workouts, including private ones. Connect again and leave that permission on.</p>
  }
  if (notice === 'error') return <p>Strava didn’t finish connecting. Try again.</p>
  if (status === 'unconfigured' || notice === 'unconfigured') {
    return <p>This diary reads workouts from Strava. Add the Strava app keys on the server, then connect the account.</p>
  }
  if (status === 'disconnected') {
    return (
      <p>Connect Strava to load the diary. Workouts recorded in Apple Fitness show up here once Strava has them.</p>
    )
  }
  return <p>{message || LOAD_ERROR}</p>
}
