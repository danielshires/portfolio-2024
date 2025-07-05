// Define types for button configuration
export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'ghost' | 'outline' | 'icon'
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'icon'
export type ButtonElement = 'button' | 'a' | 'div'

// Define base button styles
export const baseButtonStyles = 'inline-flex items-center justify-center gap-2 font-medium rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transform-gpu'

// Define variant styles with enhanced hover states
export const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-zinc-900 hover:bg-zinc-800 hover:scale-105 hover:shadow-lg text-zinc-100 dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900 focus:ring-black dark:focus:ring-white active:scale-95',
  secondary: 'bg-zinc-100 hover:bg-zinc-200 hover:scale-105 hover:shadow-md text-zinc-900 border border-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-100 dark:border-zinc-700 focus:ring-black dark:focus:ring-white active:scale-95',
  tertiary: 'bg-transparent hover:bg-zinc-100 hover:scale-105 text-zinc-900 dark:hover:bg-zinc-800 dark:text-zinc-100 hover:underline underline-offset-4 focus:ring-black dark:focus:ring-white active:scale-95',
  ghost: 'bg-transparent hover:bg-zinc-100 hover:scale-105 hover:shadow-sm text-zinc-900 dark:hover:bg-zinc-800 dark:text-zinc-100 focus:ring-black dark:focus:ring-white active:scale-95',
  outline: 'bg-transparent border border-zinc-300 hover:bg-zinc-50 hover:border-zinc-400 hover:scale-105 hover:shadow-md text-zinc-900 dark:border-zinc-600 dark:hover:bg-zinc-800 dark:hover:border-zinc-500 dark:text-zinc-100 focus:ring-black dark:focus:ring-white active:scale-95',
  icon: 'bg-zinc-50 border border-zinc-300 hover:bg-zinc-100 hover:border-zinc-400 hover:scale-105 hover:rotate-6 text-zinc-700 dark:bg-zinc-800 dark:border-zinc-600 dark:hover:bg-zinc-700 dark:hover:border-zinc-500 dark:text-zinc-300 focus:ring-black dark:focus:ring-white active:scale-95'
}

// Define size styles
export const sizeStyles: Record<ButtonSize, string> = {
  xs: 'px-2 py-1 text-xs',
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-base',
  xl: 'px-8 py-4 text-lg',
  icon: 'p-2 gap-0'
}

// Helper function to combine button styles
export function combineButtonStyles(
  variant: ButtonVariant = 'primary',
  size: ButtonSize = 'md',
  className?: string
): string {
  const styles = [
    baseButtonStyles,
    variantStyles[variant],
    sizeStyles[size],
    className
  ]

  return styles.filter(Boolean).join(' ')
}

// Define button props interface
export interface ButtonProps {
  variant?: ButtonVariant
  size?: ButtonSize
  className?: string
  disabled?: boolean
  loading?: boolean
  href?: string
  target?: string
  type?: 'button' | 'submit' | 'reset'
  onClick?: () => void
}