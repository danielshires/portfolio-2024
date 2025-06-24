// Define types for the configuration
export type TextVariant =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'subtitle'
  | 'body'
  | 'caption'
  | 'overline'
export type TextSize = 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl'
export type TextWeight = 'normal' | 'medium' | 'semibold' | 'bold'
export type TextColor = 'default' | 'muted' | 'inverted'
export type TextAlign = 'left' | 'center' | 'right'

// Define default styles for each variant
export const variantStyles: Record<TextVariant, string> = {
  h1: 'text-4xl font-normal',
  h2: 'text-3xl font-normal',
  h3: 'text-2xl font-normal',
  h4: 'text-xl font-normal',
  h5: 'text-lg font-normal',
  subtitle: 'text-lg font-normal',
  body: 'text-base font-normal',
  caption: 'text-sm font-normal',
  overline: 'text-xs font-normal uppercase tracking-wider',
}

// Define color variations
export const colorStyles: Record<TextColor, string> = {
  default: 'text-zinc-900 dark:text-zinc-100',
  muted: 'text-zinc-600 dark:text-zinc-400',
  inverted: 'text-zinc-100 dark:text-zinc-900',
}

// Define text alignment
export const alignStyles: Record<TextAlign, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
}

// Map variants to HTML elements
export const variantElements: Record<TextVariant, keyof JSX.IntrinsicElements> = {
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  h5: 'h5',
  subtitle: 'p',
  body: 'p',
  caption: 'p',
  overline: 'p',
}

// Helper function to combine styles
export function combineStyles(
  variant: TextVariant,
  color: TextColor = 'default',
  align: TextAlign = 'left',
  size?: TextSize,
  weight?: TextWeight,
  className?: string
): string {
  const styles = [
    variantStyles[variant],
    colorStyles[color],
    alignStyles[align],
    size ? `text-${size}` : '',
    weight ? `font-${weight}` : '',
    className,
  ]

  return styles.filter(Boolean).join(' ')
}
