import type { ChangelogDay } from '../../../lib/changelog'
import {
  Trace,
  TraceCollapsible,
  TraceCollapsibleContent,
  TraceCollapsibleTrigger,
  TraceDescription,
  TraceIcon,
  TraceLine,
  TraceTitle,
} from '../../ui/trace/Trace'

const COMMIT_BASE = 'https://github.com/danielshires/portfolio-2024/commit/'

type ChangelogProps = {
  days: ChangelogDay[]
}

function changeCount(count: number) {
  return count === 1 ? '1 change' : `${count} changes`
}

export default function Changelog({ days }: ChangelogProps) {
  if (days.length === 0) {
    return <p className='text-sm text-zinc-600 dark:text-zinc-400'>No changes recorded for this build.</p>
  }

  return (
    <Trace className='gap-3'>
      {days.map((day, index) => (
        <TraceCollapsible key={day.date} defaultOpen={index === 0}>
          <TraceCollapsibleTrigger>
            <TraceLine className='items-center'>
              <TraceIcon>
                <span className='size-1.5 rounded-full bg-current' />
              </TraceIcon>
              <TraceTitle className='font-mono font-medium text-zinc-900 dark:text-zinc-100'>
                {day.version}
              </TraceTitle>
              <span>{day.label}</span>
              <TraceDescription>{changeCount(day.commits.length)}</TraceDescription>
            </TraceLine>
          </TraceCollapsibleTrigger>
          <TraceCollapsibleContent>
            <Trace className='gap-2'>
              {day.commits.map((commit) => (
                <TraceLine key={commit.hash} className='w-full items-baseline'>
                  <span className='min-w-16 shrink-0 font-mono text-xs tabular-nums text-zinc-500'>
                    {commit.version}
                  </span>
                  <TraceTitle className='flex-1 text-zinc-800 dark:text-zinc-200'>
                    {commit.subject}
                  </TraceTitle>
                  <a
                    href={`${COMMIT_BASE}${commit.hash}`}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='shrink-0 font-mono text-xs tabular-nums text-zinc-500 underline-offset-4 hover:text-zinc-900 hover:underline dark:hover:text-zinc-100'>
                    {commit.shortHash}
                  </a>
                </TraceLine>
              ))}
            </Trace>
          </TraceCollapsibleContent>
        </TraceCollapsible>
      ))}
    </Trace>
  )
}
