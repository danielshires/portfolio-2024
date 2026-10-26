import { getStore, type Store } from '@netlify/blobs'
import { addDays, diaryWindow } from '../../src/lib/training/dates'
import type { DiaryDay, DiaryResponse, DiaryWorkout } from '../../src/lib/training/types'

const JSON_HEADERS = {
  'content-type': 'application/json; charset=utf-8',
  'cache-control': 'no-store',
}

const CACHE_MS = 30 * 60 * 1000
const CACHE_VERSION = 2
const STATE_MS = 10 * 60 * 1000
const LOAD_ERROR = 'The diary could not load. Try again in a little while.'
const RATE_ERROR = 'Strava is limiting requests for the moment. Try again in a little while.'

type Credentials = { clientId: string; clientSecret: string }

type TokenBundle = {
  accessToken: string
  refreshToken: string
  expiresAt: number
}

type OauthState = {
  state: string
  expiresAt: number
}

type DiaryCache = {
  version: number
  from: string
  to: string
  updatedAt: string
  cachedAt: number
  days: DiaryDay[]
}

type StravaActivity = {
  id?: unknown
  name?: unknown
  sport_type?: unknown
  type?: unknown
  start_date_local?: unknown
  distance?: unknown
  moving_time?: unknown
  total_elevation_gain?: unknown
  suffer_score?: unknown
  trainer?: unknown
  kilojoules?: unknown
  average_watts?: unknown
  average_heartrate?: unknown
}

function json(body: DiaryResponse, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: JSON_HEADERS })
}

function redirect(location: string): Response {
  return new Response(null, {
    status: 302,
    headers: { location, 'cache-control': 'no-store' },
  })
}

function credentials(): Credentials | null {
  const clientId = process.env.STRAVA_CLIENT_ID?.trim() ?? ''
  const clientSecret = process.env.STRAVA_CLIENT_SECRET?.trim() ?? ''
  if (!/^\d+$/.test(clientId) || !clientSecret) return null
  return { clientId, clientSecret }
}

function firstHeader(req: Request, name: string): string {
  return req.headers.get(name)?.split(',')[0]?.trim() ?? ''
}

function publicOrigin(req: Request): string {
  const url = new URL(req.url)
  const host = firstHeader(req, 'x-forwarded-host') || req.headers.get('host') || url.host
  const proto = firstHeader(req, 'x-forwarded-proto') || url.protocol.replace(':', '')
  return `${proto === 'http' ? 'http' : 'https'}://${host}`
}

function routeOf(req: Request): 'connect' | 'callback' | 'diary' {
  const pathname = new URL(req.url).pathname
  if (pathname.endsWith('/connect')) return 'connect'
  if (pathname.endsWith('/callback')) return 'callback'
  return 'diary'
}

function blobs(): Store {
  return getStore({ name: 'strava', consistency: 'strong' })
}

function finiteNumber(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : 0
}

function optionalNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : null
}

function isToken(value: unknown): value is TokenBundle {
  if (!value || typeof value !== 'object') return false
  const token = value as TokenBundle
  return (
    typeof token.accessToken === 'string' &&
    token.accessToken.length > 0 &&
    typeof token.refreshToken === 'string' &&
    token.refreshToken.length > 0 &&
    typeof token.expiresAt === 'number'
  )
}

function isCache(value: unknown): value is DiaryCache {
  if (!value || typeof value !== 'object') return false
  const cache = value as DiaryCache
  return (
    cache.version === CACHE_VERSION &&
    typeof cache.from === 'string' &&
    typeof cache.to === 'string' &&
    typeof cache.updatedAt === 'string' &&
    typeof cache.cachedAt === 'number' &&
    Array.isArray(cache.days)
  )
}

function readyFrom(cache: DiaryCache): DiaryResponse {
  return {
    status: 'ready',
    from: cache.from,
    to: cache.to,
    updatedAt: cache.updatedAt,
    days: cache.days,
  }
}

async function readCache(store: Store): Promise<DiaryCache | null> {
  const value = await store.get('diary', { type: 'json' })
  return isCache(value) ? value : null
}

function pageRedirect(origin: string, flag?: string): Response {
  const target = flag ? `${origin}/playground/training?strava=${flag}` : `${origin}/playground/training`
  return redirect(target)
}

async function requestToken(body: URLSearchParams): Promise<TokenBundle | 'invalid' | null> {
  const response = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body,
  })
  if (response.status === 400 || response.status === 401) return 'invalid'
  if (!response.ok) {
    console.error('strava token failed', response.status)
    return null
  }

  const payload = (await response.json()) as {
    access_token?: unknown
    refresh_token?: unknown
    expires_at?: unknown
  }
  if (
    typeof payload.access_token !== 'string' ||
    typeof payload.refresh_token !== 'string' ||
    typeof payload.expires_at !== 'number'
  ) {
    return null
  }
  return {
    accessToken: payload.access_token,
    refreshToken: payload.refresh_token,
    expiresAt: payload.expires_at,
  }
}

async function connect(origin: string, creds: Credentials | null): Promise<Response> {
  if (!creds) return pageRedirect(origin, 'unconfigured')
  try {
    const state = crypto.randomUUID()
    await blobs().setJSON('oauth-state', { state, expiresAt: Date.now() + STATE_MS } satisfies OauthState)
    const url = new URL('https://www.strava.com/oauth/authorize')
    url.searchParams.set('client_id', creds.clientId)
    url.searchParams.set('redirect_uri', `${origin}/api/strava/callback`)
    url.searchParams.set('response_type', 'code')
    url.searchParams.set('approval_prompt', 'force')
    url.searchParams.set('scope', 'activity:read_all')
    url.searchParams.set('state', state)
    return redirect(url.toString())
  } catch (error) {
    console.error('strava connect failed', error)
    return pageRedirect(origin, 'error')
  }
}

async function callback(req: Request, origin: string, creds: Credentials | null): Promise<Response> {
  if (!creds) return pageRedirect(origin, 'unconfigured')
  const url = new URL(req.url)
  if (url.searchParams.get('error')) return pageRedirect(origin, 'denied')

  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')
  if (!code || !state) return pageRedirect(origin, 'error')

  try {
    const store = blobs()
    const pending = (await store.get('oauth-state', { type: 'json' })) as OauthState | null
    await store.delete('oauth-state')
    if (!pending || pending.state !== state || pending.expiresAt < Date.now()) {
      return pageRedirect(origin, 'error')
    }

    const scope = url.searchParams.get('scope')
    if (scope && !scope.split(/[,\s]+/).includes('activity:read_all')) {
      return pageRedirect(origin, 'scope')
    }

    const token = await requestToken(
      new URLSearchParams({
        client_id: creds.clientId,
        client_secret: creds.clientSecret,
        code,
        grant_type: 'authorization_code',
      }),
    )
    if (!token || token === 'invalid') return pageRedirect(origin, 'error')

    await store.setJSON('auth', token)
    await store.delete('diary')
    return pageRedirect(origin)
  } catch (error) {
    console.error('strava callback failed', error)
    return pageRedirect(origin, 'error')
  }
}

async function currentToken(store: Store, creds: Credentials): Promise<TokenBundle | 'disconnected' | null> {
  const stored = await store.get('auth', { type: 'json' })
  if (!isToken(stored)) return 'disconnected'

  const now = Math.floor(Date.now() / 1000)
  if (stored.expiresAt - 120 > now) return stored

  const next = await requestToken(
    new URLSearchParams({
      client_id: creds.clientId,
      client_secret: creds.clientSecret,
      refresh_token: stored.refreshToken,
      grant_type: 'refresh_token',
    }),
  )
  if (next === 'invalid') {
    await store.delete('auth')
    return 'disconnected'
  }
  if (!next) return null
  await store.setJSON('auth', next)
  return next
}

function workoutFrom(activity: StravaActivity): { date: string; workout: DiaryWorkout } | null {
  if (typeof activity.id !== 'number') return null
  if (typeof activity.start_date_local !== 'string' || activity.start_date_local.length < 10) return null
  const date = activity.start_date_local.slice(0, 10)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null

  const sportSource = typeof activity.sport_type === 'string' ? activity.sport_type : activity.type
  const sport = typeof sportSource === 'string' && sportSource.trim() ? sportSource.trim().slice(0, 40) : 'Workout'
  const name = typeof activity.name === 'string' && activity.name.trim() ? activity.name.trim().slice(0, 140) : sport

  return {
    date,
    workout: {
      id: activity.id,
      name,
      sport,
      start: activity.start_date_local,
      movingSeconds: finiteNumber(activity.moving_time),
      distanceMeters: finiteNumber(activity.distance),
      elevationMeters: finiteNumber(activity.total_elevation_gain),
      effort:
        typeof activity.suffer_score === 'number' && Number.isFinite(activity.suffer_score)
          ? activity.suffer_score
          : null,
      trainer: activity.trainer === true || /virtual/i.test(sport),
      kilojoules: optionalNumber(activity.kilojoules),
      averageWatts: optionalNumber(activity.average_watts),
      averageHeartrate: optionalNumber(activity.average_heartrate),
    },
  }
}

function groupDays(activities: StravaActivity[], from: string, to: string): DiaryDay[] {
  const byDate = new Map<string, DiaryWorkout[]>()
  for (const activity of activities) {
    const parsed = workoutFrom(activity)
    if (!parsed || parsed.date < from || parsed.date > to) continue
    const list = byDate.get(parsed.date) ?? []
    if (!list.some((workout) => workout.id === parsed.workout.id)) list.push(parsed.workout)
    byDate.set(parsed.date, list)
  }

  return [...byDate.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([date, workouts]) => ({
      date,
      workouts: workouts.sort((left, right) => left.start.localeCompare(right.start)),
    }))
}

async function fetchActivities(token: string, after: number): Promise<StravaActivity[] | number> {
  const activities: StravaActivity[] = []
  for (let page = 1; page <= 5; page += 1) {
    const url = new URL('https://www.strava.com/api/v3/athlete/activities')
    url.searchParams.set('after', String(after))
    url.searchParams.set('per_page', '200')
    url.searchParams.set('page', String(page))
    const response = await fetch(url, { headers: { authorization: `Bearer ${token}` } })
    if (response.status === 401 || response.status === 429) return response.status
    if (!response.ok) {
      console.error('strava activities failed', response.status)
      return response.status
    }
    const batch = (await response.json()) as unknown
    if (!Array.isArray(batch)) return 502
    activities.push(...(batch as StravaActivity[]))
    if (batch.length < 200) break
  }
  return activities
}

async function loadActivities(
  store: Store,
  creds: Credentials,
  after: number,
): Promise<StravaActivity[] | 'disconnected' | 'rate' | 'error'> {
  let token = await currentToken(store, creds)
  if (token === 'disconnected' || token === null) return token === null ? 'error' : 'disconnected'

  let activities = await fetchActivities(token.accessToken, after)
  if (activities === 401) {
    await store.setJSON('auth', { ...token, expiresAt: 0 })
    token = await currentToken(store, creds)
    if (token === 'disconnected' || token === null) return token === null ? 'error' : 'disconnected'
    activities = await fetchActivities(token.accessToken, after)
  }
  if (activities === 429) return 'rate'
  if (typeof activities === 'number') return 'error'
  return activities
}

async function diary(creds: Credentials | null): Promise<Response> {
  if (!creds) return json({ status: 'unconfigured' })

  let store: Store
  try {
    store = blobs()
  } catch (error) {
    console.error('strava store unavailable', error)
    return json({ status: 'error', message: LOAD_ERROR })
  }

  const window = diaryWindow()
  let cached: DiaryCache | null = null
  try {
    cached = await readCache(store)
  } catch (error) {
    console.error('strava cache read failed', error)
  }

  const fresh =
    cached &&
    cached.from === window.from &&
    cached.to === window.to &&
    Date.now() - cached.cachedAt < CACHE_MS
  if (cached && fresh) return json(readyFrom(cached))

  try {
    const after = Math.floor(Date.parse(`${addDays(window.from, -2)}T00:00:00Z`) / 1000)
    const activities = await loadActivities(store, creds, after)
    if (activities === 'disconnected') return json({ status: 'disconnected' })
    if (activities === 'rate' || activities === 'error') {
      if (cached && cached.from === window.from && cached.to === window.to) return json(readyFrom(cached))
      return json({ status: 'error', message: activities === 'rate' ? RATE_ERROR : LOAD_ERROR })
    }

    const payload: DiaryCache = {
      version: CACHE_VERSION,
      from: window.from,
      to: window.to,
      updatedAt: new Date().toISOString(),
      cachedAt: Date.now(),
      days: groupDays(activities, window.from, window.to),
    }
    await store.setJSON('diary', payload)
    return json(readyFrom(payload))
  } catch (error) {
    console.error('strava diary failed', error)
    if (cached && cached.from === window.from && cached.to === window.to) return json(readyFrom(cached))
    return json({ status: 'error', message: LOAD_ERROR })
  }
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'GET') return json({ status: 'error', message: LOAD_ERROR }, 405)

  const origin = publicOrigin(req)
  const creds = credentials()
  const route = routeOf(req)
  if (route === 'connect') return connect(origin, creds)
  if (route === 'callback') return callback(req, origin, creds)
  return diary(creds)
}
