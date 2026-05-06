// Define types for the configuration
export type TextVariant =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'subtitle'
  | 'lead'
  | 'body'
  | 'caption'
  | 'overline'
export type TextSize = 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl'
export type TextWeight = 'normal' | 'medium' | 'semibold' | 'bold'
export type TextColor = 'default' | 'muted' | 'inverted'
export type TextAlign = 'left' | 'center' | 'right'

// Define default styles for each variant (single coordinated scale sitewide)
export const variantStyles: Record<TextVariant, string> = {
  h1: 'text-3xl md:text-4xl lg:text-5xl font-normal tracking-tight leading-tight md:leading-snug',
  h2: 'text-2xl md:text-3xl font-normal tracking-tight leading-snug',
  h3: 'text-xl md:text-2xl font-normal leading-snug',
  h4: 'text-lg md:text-xl font-normal leading-snug',
  h5: 'text-base font-semibold leading-snug',
  subtitle: 'text-base font-medium leading-snug',
  lead: 'text-lg md:text-xl font-normal leading-relaxed',
  body: 'text-base font-normal leading-relaxed',
  caption: 'text-sm font-normal leading-snug',
  overline: 'text-xs font-normal uppercase tracking-wider font-mono',
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
  lead: 'p',
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

/** Vertical offset from hero-style intros to first content block (Writing / Projects lists). */
export const stackBelowHeroClass = 'mt-16 md:mt-20'

/** Inner spacing for SimpleHero title + subline (Projects / Writing intros). */
export const simpleHeroHeadingStackClass = 'flex flex-col gap-5 md:gap-8'

/** Top spacing aligned with `Hero` on the homepage. */
export const simpleHeroSectionClass = 'flex flex-col mt-44 md:mt-52 lg:mt-60'

/** Shared row link with dividers (journal index, homepage Projects text list). */
export const linkListRowAnchorClass =
  'group block py-2 border-b border-zinc-200/80 dark:border-zinc-800/80 last:border-b-0 rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black dark:focus-visible:ring-white dark:focus-visible:ring-offset-zinc-950'

/** Same interaction/focus as link rows, without borders (homepage Writing preview). */
export const linkListRowAnchorPlainClass =
  'group block py-2 rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black dark:focus-visible:ring-white dark:focus-visible:ring-offset-zinc-950'

/** One-line or title + continuation paragraph inside list links. */
export const linkListParagraphClass =
  'text-base leading-relaxed text-zinc-900 dark:text-zinc-100'

export const linkListStrongTitleClass =
  'font-semibold group-hover:underline underline-offset-4'

export const linkListMutedContinuationClass =
  'font-normal text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-200'

/** Typography shared by journal year headings and homepage Writing / Projects section titles. */
export const sectionLabelTypographyClass =
  'font-mono text-xs font-normal uppercase tracking-wider text-zinc-500 dark:text-zinc-400'

/** Year group labels on the Writing index (+ margin below). */
export const sectionYearLabelClass = `${sectionLabelTypographyClass} mb-4`

/** “Writing →” / “Projects →” on the homepage (inside section heading). */
export const contentSectionHeadingLinkClass =
  'underline-offset-4 transition-colors duration-200 hover:underline hover:text-zinc-900 dark:hover:text-zinc-100'

/** Filter chips below SimpleHero on `/journal`. */
export const filtersNavTopClass = 'mt-10 md:mt-12'

/** Name line beside avatar on the homepage hero. */
export const heroIdentityNameClass =
  'text-lg font-normal leading-snug text-zinc-900 dark:text-zinc-100 md:text-xl'

/** Homepage hero headline typography (display scale). Column width is set in `Hero.astro` from intro length. */
export const heroDisplayIntroClass = [
  'whitespace-pre-line text-left font-medium tracking-tight text-zinc-900 dark:text-zinc-100',
  'leading-snug md:leading-snug lg:leading-[1.12]',
  'text-3xl sm:text-4xl md:text-5xl lg:text-[4rem]',
  'mt-4',
].join(' ')
