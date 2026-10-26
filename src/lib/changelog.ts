import { execFileSync } from 'node:child_process'

export type ChangelogCommit = {
  hash: string
  shortHash: string
  subject: string
  /** Step within the day's build, in the order the commit landed. The first commit is vN.1. */
  version: string
}

export type ChangelogDay = {
  date: string
  label: string
  /** Build for this day. The first day of work is v1. */
  version: string
  commits: ChangelogCommit[]
}

const FIELD = '\x1f'

function formatDayLabel(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number)
  if (!year || !month || !day) return isoDate
  return new Intl.DateTimeFormat('en-AU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(year, month - 1, day)))
}

/** Commits grouped by calendar day in Australia/Sydney, newest day first. */
export function getChangelog(): ChangelogDay[] {
  let raw: string
  try {
    raw = execFileSync(
      'git',
      [
        'log',
        '--no-merges',
        `--pretty=format:%H${FIELD}%h${FIELD}%cd${FIELD}%s`,
        '--date=format-local:%Y-%m-%d',
      ],
      {
        cwd: process.cwd(),
        encoding: 'utf8',
        env: { ...process.env, TZ: 'Australia/Sydney' },
        maxBuffer: 10 * 1024 * 1024,
      },
    )
  } catch {
    return []
  }

  const days: ChangelogDay[] = []
  const byDate = new Map<string, ChangelogDay>()

  for (const line of raw.split('\n')) {
    if (!line) continue
    const [hash, shortHash, date, subject] = line.split(FIELD)
    if (!hash || !shortHash || !date || subject === undefined || subject.length === 0) continue
    let day = byDate.get(date)
    if (!day) {
      day = { date, label: formatDayLabel(date), version: '', commits: [] }
      byDate.set(date, day)
      days.push(day)
    }
    day.commits.push({ hash, shortHash, subject, version: '' })
  }

  const buildCount = days.length
  for (let index = 0; index < days.length; index++) {
    const day = days[index]
    const build = buildCount - index
    day.version = `v${build}`
    const stepCount = day.commits.length
    for (let commitIndex = 0; commitIndex < stepCount; commitIndex++) {
      const step = stepCount - commitIndex
      day.commits[commitIndex].version = `v${build}.${step}`
    }
  }

  return days
}
