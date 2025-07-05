import React from 'react'
import { HiOutlineMail } from 'react-icons/hi'
import Button from './Button.tsx'
import type { ContactCTAProps } from './types'

interface ReactContactCTAProps extends ContactCTAProps {
  showIcon?: boolean
  iconOnly?: boolean
  children?: React.ReactNode
}

const ContactCTA: React.FC<ReactContactCTAProps> = ({ 
  variant = 'primary',
  size = 'md',
  subject = 'Portfolio%20Inquiry',
  className,
  showIcon = false,
  iconOnly = false,
  children = 'Get in touch',
  ...rest
}) => {
  const emailHref = `mailto:hello@danielshires.com?subject=${subject}`

  return (
    <Button
      variant={variant}
      size={size}
      href={emailHref}
      className={`group !p-2 sm:!px-3 sm:!py-1.5 ${className}`}
      aria-label="Send email to Daniel Shires"
      {...rest}
    >
      {showIcon && (
        <HiOutlineMail className="w-4 h-4 transition-transform duration-200 group-hover:scale-110 group-hover:rotate-3" />
      )}
      {!iconOnly && (
        <span className="hidden sm:inline transition-transform duration-200 group-hover:translate-x-0.5">
          {children}
        </span>
      )}
    </Button>
  )
}

export default ContactCTA