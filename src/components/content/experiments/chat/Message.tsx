import type { ComponentProps } from 'react'

type MessageAlign = 'start' | 'end'

function classes(...names: Array<string | undefined>) {
  return names.filter(Boolean).join(' ')
}

export function Message({
  align = 'start',
  className,
  ...props
}: ComponentProps<'div'> & { align?: MessageAlign }) {
  return (
    <div data-slot="message" data-align={align} className={classes('message', className)} {...props} />
  )
}

export function MessageContent({ className, ...props }: ComponentProps<'div'>) {
  return <div data-slot="message-content" className={classes('message-content', className)} {...props} />
}

export function MessageHeader({ className, ...props }: ComponentProps<'p'>) {
  return <p data-slot="message-header" className={classes('message-header', className)} {...props} />
}
