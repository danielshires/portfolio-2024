import type { ButtonVariant, ButtonSize, ButtonElement, ButtonProps } from './button-styles'

export type { ButtonVariant, ButtonSize, ButtonElement, ButtonProps }

// Extended props for Astro components
export interface AstroButtonProps extends Omit<ButtonProps, 'onClick'> {
  as?: 'button' | 'a' | 'div'
  rel?: string
  'data-swup-preload'?: boolean
  'aria-label'?: string
  id?: string
}

// Extended props for React components
export interface ReactButtonProps extends ButtonProps {
  children?: React.ReactNode
  'aria-label'?: string
  id?: string
  ref?: React.Ref<HTMLButtonElement | HTMLAnchorElement>
}

// Contact CTA specific props
export interface ContactCTAProps {
  variant?: 'primary' | 'secondary' | 'tertiary'
  size?: 'sm' | 'md' | 'lg'
  subject?: string
  className?: string
  children?: React.ReactNode
}