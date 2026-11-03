import { Switch as SwitchPrimitive } from '@base-ui/react/switch'
import React from 'react'

type SwitchProps = React.ComponentProps<typeof SwitchPrimitive.Root> & {
  size?: 'sm' | 'default'
}

function joinClassName(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ')
}

function mergeClassName(base: string, className: SwitchProps['className']): SwitchProps['className'] {
  if (typeof className === 'function') {
    return (state) => joinClassName(base, className(state))
  }
  return joinClassName(base, className)
}

export const Switch = React.forwardRef<HTMLElement, SwitchProps>(function Switch(
  { className, size = 'default', ...props },
  ref
) {
  return (
    <SwitchPrimitive.Root
      ref={ref}
      data-slot='switch'
      data-size={size}
      className={mergeClassName(
        joinClassName(
          'group/switch relative inline-flex shrink-0 cursor-pointer items-center rounded-full border border-transparent outline-hidden transition-colors',
          'after:absolute after:-inset-x-3 after:-inset-y-2',
          'focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 dark:focus-visible:ring-white',
          'data-[size=default]:h-[18.4px] data-[size=default]:w-[32px]',
          'data-[size=sm]:h-[14px] data-[size=sm]:w-[24px]',
          'data-unchecked:bg-zinc-200 dark:data-unchecked:bg-zinc-700',
          'data-checked:bg-zinc-900 dark:data-checked:bg-zinc-100',
          'data-disabled:cursor-not-allowed data-disabled:opacity-50'
        ),
        className
      )}
      {...props}>
      <SwitchPrimitive.Thumb
        data-slot='switch-thumb'
        className={joinClassName(
          'pointer-events-none block rounded-full bg-white shadow-xs ring-0 transition-transform',
          'dark:data-unchecked:bg-zinc-100 dark:data-checked:bg-zinc-900',
          'group-data-[size=default]/switch:size-4 group-data-[size=sm]/switch:size-3',
          'data-unchecked:group-data-[size=default]/switch:translate-x-0 data-unchecked:group-data-[size=sm]/switch:translate-x-0',
          'data-checked:group-data-[size=default]/switch:translate-x-[calc(100%-2px)] data-checked:group-data-[size=sm]/switch:translate-x-[calc(100%-2px)]'
        )}
      />
    </SwitchPrimitive.Root>
  )
})
