import { Dialog } from '@base-ui/react/dialog'
import React from 'react'

export const DialogRoot = Dialog.Root
export const DialogTrigger = Dialog.Trigger
export const DialogClose = Dialog.Close

type DialogContentProps = React.ComponentProps<typeof Dialog.Popup> & {
  showCloseButton?: boolean
}

function joinClassName(base: string, className: DialogContentProps['className']) {
  if (typeof className === 'function') return base
  return [base, className].filter(Boolean).join(' ')
}

export function DialogContent({
  className,
  children,
  showCloseButton = true,
  ...props
}: DialogContentProps) {
  return (
    <Dialog.Portal>
      <Dialog.Backdrop className='settings-dialog-backdrop' />
      <Dialog.Popup className={joinClassName('settings-dialog-popup', className)} {...props}>
        {children}
        {showCloseButton ? (
          <Dialog.Close className='settings-dialog-close' aria-label='Close'>
            <svg
              width='16'
              height='16'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              aria-hidden='true'>
              <path d='M6 6l12 12M18 6L6 18' />
            </svg>
          </Dialog.Close>
        ) : null}
      </Dialog.Popup>
    </Dialog.Portal>
  )
}

export function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof Dialog.Title>) {
  return <Dialog.Title className={joinClassName('settings-dialog-title', className)} {...props} />
}

export function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof Dialog.Description>) {
  return (
    <Dialog.Description className={joinClassName('sr-only', className)} {...props} />
  )
}
