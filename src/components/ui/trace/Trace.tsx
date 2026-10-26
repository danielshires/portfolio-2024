import { Collapsible } from '@base-ui/react/collapsible'
import React from 'react'

function joinClassName(...parts: Array<string | undefined | false>) {
  return parts.filter(Boolean).join(' ')
}

function classNameString(className: unknown) {
  return typeof className === 'string' ? className : undefined
}

export function Trace({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='trace'
      className={joinClassName('flex w-full min-w-0 flex-col gap-2', className)}
      {...props}
    />
  )
}

export function TraceLine({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot='trace-line'
      className={joinClassName(
        'flex min-w-0 max-w-full gap-2 text-left text-sm leading-relaxed text-zinc-600 dark:text-zinc-400',
        className,
      )}
      {...props}
    />
  )
}

export function TraceIcon({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot='trace-icon'
      aria-hidden='true'
      className={joinClassName(
        'flex size-4 shrink-0 items-center justify-center [&_svg]:pointer-events-none',
        className,
      )}
      {...props}
    />
  )
}

export function TraceTitle({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot='trace-title'
      className={joinClassName('min-w-0 text-pretty', className)}
      {...props}
    />
  )
}

export function TraceDescription({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot='trace-description'
      className={joinClassName(
        'shrink-0 text-zinc-500 tabular-nums dark:text-zinc-500',
        className,
      )}
      {...props}
    />
  )
}

export function TraceCollapsible({
  className,
  ...props
}: React.ComponentProps<typeof Collapsible.Root>) {
  return (
    <Collapsible.Root
      data-slot='trace-collapsible'
      className={joinClassName('flex w-full min-w-0 flex-col', classNameString(className))}
      {...props}
    />
  )
}

export function TraceCollapsibleTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof Collapsible.Trigger>) {
  return (
    <Collapsible.Trigger
      data-slot='trace-collapsible-trigger'
      className={joinClassName(
        'group flex w-fit max-w-full min-w-0 cursor-pointer items-center gap-1 rounded-sm border-0 bg-transparent p-0 text-left font-inherit text-zinc-600 outline-none transition-colors hover:text-zinc-900 focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 dark:text-zinc-400 dark:hover:text-zinc-100 dark:focus-visible:ring-zinc-100 dark:focus-visible:ring-offset-zinc-950',
        classNameString(className),
      )}
      {...props}>
      {children}
      <svg
        viewBox='0 0 24 24'
        fill='none'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
        aria-hidden='true'
        className='size-4 shrink-0 transition-transform duration-200 group-data-[panel-open]:rotate-90 motion-reduce:transition-none'>
        <path d='m9 18 6-6-6-6' />
      </svg>
    </Collapsible.Trigger>
  )
}

export function TraceCollapsibleContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof Collapsible.Panel>) {
  return (
    <Collapsible.Panel
      data-slot='trace-collapsible-content'
      className='h-[var(--collapsible-panel-height)] min-w-0 overflow-hidden transition-[height] duration-200 data-[ending-style]:h-0 data-[starting-style]:h-0 motion-reduce:transition-none'
      {...props}>
      <div
        data-slot='trace-collapsible-content-inner'
        className={joinClassName(
          'mt-2 mb-1 ml-[7px] min-w-0 border-l border-zinc-200 pr-1 pl-4 dark:border-zinc-700',
          classNameString(className),
        )}>
        {children}
      </div>
    </Collapsible.Panel>
  )
}
