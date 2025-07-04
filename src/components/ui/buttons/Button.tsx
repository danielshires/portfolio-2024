import React from 'react'
import { combineButtonStyles } from './button-styles'
import type { ReactButtonProps } from './types'

const Button = React.forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  ReactButtonProps
>(({
  variant = 'primary',
  size = 'md',
  className,
  disabled = false,
  loading = false,
  href,
  target = '_self',
  type = 'button',
  onClick,
  children,
  'aria-label': ariaLabel,
  id,
  ...rest
}, ref) => {
  const combinedClassName = combineButtonStyles(variant, size, className)

  // Determine if it's an internal link for Swup preloading
  const isInternal = href && href.startsWith('/') && !href.startsWith('//')

  // Common props for all elements
  const commonProps = {
    className: combinedClassName,
    disabled: disabled || loading,
    'aria-label': ariaLabel,
    id,
    ...rest
  }

  // Loading spinner component
  const LoadingSpinner = () => (
    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  )

  // If href is provided, render as link
  if (href) {
    return (
      <a
        {...commonProps}
        href={href}
        target={target}
        ref={ref as React.Ref<HTMLAnchorElement>}
        data-swup-preload={isInternal}
      >
        {loading && <LoadingSpinner />}
        {children}
      </a>
    )
  }

  // Otherwise, render as button
  return (
    <button
      {...commonProps}
      type={type}
      onClick={onClick}
      ref={ref as React.Ref<HTMLButtonElement>}
    >
      {loading && <LoadingSpinner />}
      {children}
    </button>
  )
})

Button.displayName = 'Button'

export default Button