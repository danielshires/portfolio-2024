export type DiaryScale = 'effort' | 'distance' | 'time'

export type DiaryWorkout = {
  id: number
  name: string
  sport: string
  start: string
  movingSeconds: number
  distanceMeters: number
  elevationMeters: number
  /** Strava Relative Effort. Null when the workout had no heart rate. */
  effort: number | null
  /** Indoor trainer or a virtual ride, such as a Peloton session. */
  trainer: boolean
  kilojoules: number | null
  averageWatts: number | null
  averageHeartrate: number | null
}

export type DiaryDay = {
  date: string
  workouts: DiaryWorkout[]
}

export type DiaryReady = {
  status: 'ready'
  from: string
  to: string
  updatedAt: string
  days: DiaryDay[]
}

export type DiaryResponse =
  | DiaryReady
  | { status: 'unconfigured' }
  | { status: 'disconnected' }
  | { status: 'error'; message: string }
