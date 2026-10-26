/** The watch and Apple Fitness calendar are local to Sydney. */
export const DIARY_TIME_ZONE = 'Australia/Sydney'

/** Inclusive window: 16 weeks of days, ending today. */
export const DIARY_DAYS = 16 * 7

export function localISODate(timeZone: string, date = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date)
  const year = parts.find((part) => part.type === 'year')?.value
  const month = parts.find((part) => part.type === 'month')?.value
  const day = parts.find((part) => part.type === 'day')?.value
  return `${year}-${month}-${day}`
}

export function addDays(iso: string, days: number): string {
  const [year, month, day] = iso.split('-').map(Number)
  const utc = new Date(Date.UTC(year, month - 1, day))
  utc.setUTCDate(utc.getUTCDate() + days)
  return utc.toISOString().slice(0, 10)
}

export function diaryWindow(now = new Date()): { from: string; to: string } {
  const to = localISODate(DIARY_TIME_ZONE, now)
  return { from: addDays(to, -(DIARY_DAYS - 1)), to }
}

/** 0 is Monday, 6 is Sunday. */
export function weekdayIndex(iso: string): number {
  const [year, month, day] = iso.split('-').map(Number)
  const utcDay = new Date(Date.UTC(year, month - 1, day)).getUTCDay()
  return (utcDay + 6) % 7
}

export function eachDate(from: string, to: string): string[] {
  const dates: string[] = []
  let cursor = from
  while (cursor <= to && dates.length <= DIARY_DAYS) {
    dates.push(cursor)
    cursor = addDays(cursor, 1)
  }
  return dates
}
