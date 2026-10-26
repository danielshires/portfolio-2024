import type { ComponentProps } from 'react'

type BubbleVariant = 'default' | 'secondary' | 'muted' | 'ghost' | 'destructive'
type BubbleAlign = 'start' | 'end'

function classes(...names: Array<string | undefined>) {
  return names.filter(Boolean).join(' ')
}

export function BubbleGroup({ className, ...props }: ComponentProps<'div'>) {
  return <div data-slot="bubble-group" className={classes('bubble-group', className)} {...props} />
}

export function Bubble({
  variant = 'default',
  align = 'start',
  className,
  ...props
}: ComponentProps<'div'> & {
  variant?: BubbleVariant
  align?: BubbleAlign
}) {
  return (
    <div
      data-slot="bubble"
      data-variant={variant}
      data-align={align}
      className={classes('bubble', className)}
      {...props}
    />
  )
}

export function BubbleContent({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div data-slot="bubble-content" className={classes('bubble-content', className)} {...props} />
  )
}
