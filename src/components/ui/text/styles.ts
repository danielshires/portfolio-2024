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
  subtitle: 'text-base font-normal leading-snug',
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

/** Vertical offset from hero-style intros to first content block (Thinking out loud / Projects lists). */
export const stackBelowHeroClass = 'mt-16 md:mt-20'

/** Inner spacing for SimpleHero title + subline (Projects / Thinking out loud intros). */
export const simpleHeroHeadingStackClass = 'flex flex-col gap-5 md:gap-8'

/** Top spacing aligned with `Hero` on the homepage. */
export const simpleHeroSectionClass = 'flex flex-col mt-44 md:mt-52 lg:mt-60'

/** 1px underline stroke + zinc decoration colors (use with `hover:underline`, optional `no-underline`). */
export const linkUnderlineDecorationClass =
  'underline-offset-4 decoration-zinc-400 decoration-1 transition-colors hover:decoration-zinc-600 dark:decoration-zinc-500 dark:hover:decoration-zinc-300'

/** Default in-content text link: underline on hover only. */
export const textLinkClass = `no-underline hover:underline ${linkUnderlineDecorationClass}`

/** Footer + muted navigation links (caption-scale surround). */
export const footerMutedLinkClass =
  'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors no-underline hover:underline underline-offset-4 decoration-zinc-400 decoration-1 hover:decoration-zinc-600 dark:decoration-zinc-500 dark:hover:decoration-zinc-300'
export const linkFocusRingClass =
  'rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100 dark:focus-visible:ring-offset-zinc-950'

/**
 * Stroke color for external-link arrows inside a parent with Tailwind `group` (homepage project list/cards, About).
 */
export const externalLinkGlyphGroupHoverClass =
  'text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-200 transition-colors duration-200'

/**
 * Explore “back” row: two-column `inline-grid` so underline/border stays on the text cell only (flex+link browsers
 * sometimes paint decoration across adjacent items).
 */
export const siteChildNavBackAnchorClass =
  `site-child-nav-back group inline-grid w-max max-w-full auto-cols-auto grid-flow-col items-center gap-x-2 text-lg font-normal text-zinc-900 no-underline hover:!no-underline visited:!no-underline dark:text-zinc-100 md:text-xl ${linkFocusRingClass}`

/** {@link ArrowLeftGlyph}: ~⅔ cap-height vs label; no `transition-*` so wrap animation opacity is clean. */
export const siteChildNavBackGlyphClass =
  'site-child-nav-back__glyph shrink-0 w-[0.65em] h-[0.65em] text-zinc-300 dark:text-zinc-600 group-hover:text-zinc-900 dark:group-hover:text-zinc-100'

/** Faux underline via border-bottom on this cell only (`inline-grid` col 2). */
export const siteChildNavBackLabelClass =
  'site-child-nav-back__label border-b border-transparent pb-[1px] text-left leading-snug transition-[border-color] group-hover:border-zinc-900 dark:group-hover:border-zinc-100'

/**
 * Card-style row link (title + optional muted body): whole row clickable; underline only the title via
 * {@link cardLinkTitleUnderlineClass} on the heading `Text`.
 *
 * `hover:!no-underline` keeps `.prose a:hover` / `prose-invert` from re-applying underline to the `<a>` (it would propagate to
 * all text inside the block link); the heading still picks up {@link cardLinkTitleUnderlineClass}.
 */
export const cardLinkAnchorClass =
  `group block no-underline hover:!no-underline visited:!no-underline ${linkFocusRingClass}`

export const cardLinkTitleUnderlineClass =
  'no-underline underline-offset-4 decoration-zinc-400 decoration-1 transition-colors group-hover:underline group-hover:decoration-zinc-600 dark:decoration-zinc-500 dark:group-hover:decoration-zinc-300'

/** Shared row link (thinking-out-loud index, homepage Thinking out loud preview, Projects text list). */
export const linkListRowAnchorClass = `group block py-2 ${linkFocusRingClass}`

/** Alias of {@link linkListRowAnchorClass} (kept for existing imports). */
export const linkListRowAnchorPlainClass = linkListRowAnchorClass

/** One-line or title + continuation paragraph inside list links. */
export const linkListParagraphClass =
  'text-base leading-relaxed text-zinc-900 dark:text-zinc-100'

export const linkListStrongTitleClass =
  'font-semibold group-hover:underline underline-offset-4 decoration-zinc-400 decoration-1 dark:decoration-zinc-500 group-hover:decoration-zinc-600 dark:group-hover:decoration-zinc-300 transition-colors'

export const linkListMutedContinuationClass =
  'font-normal text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-200'

/** Typography shared by Thinking out loud index section titles and homepage Thinking out loud / Projects section titles. */
export const sectionLabelTypographyClass =
  'font-mono text-xs font-normal uppercase tracking-wider text-zinc-500 dark:text-zinc-400'

/** Section labels on the Thinking out loud index (Recent / Earlier) (+ margin below). */
export const sectionYearLabelClass = `${sectionLabelTypographyClass} mb-4`

/** “Thinking out loud →” / “Projects →” on the homepage (inside section heading; use with {@link ArrowRightGlyph}). */
export const contentSectionHeadingLinkClass =
  'group inline-flex items-center gap-1 underline-offset-4 decoration-1 decoration-zinc-400 dark:decoration-zinc-500 hover:decoration-zinc-600 dark:hover:decoration-zinc-300 transition-colors duration-200 hover:underline hover:text-zinc-900 dark:hover:text-zinc-100'

/** Size for {@link ArrowRightGlyph} beside mono `sectionYearLabelClass` (`text-xs`): slightly under 1em. */
export const contentSectionHeadingArrowClass = 'h-[0.85em] w-[0.85em] shrink-0'

/** Primary nav: same 1px stroke, taller offset (matches {@link NavLink}). */
export const navLinkBaseClass =
  'font-normal text-zinc-900 dark:text-zinc-100 underline-offset-8 decoration-1 decoration-zinc-400 dark:decoration-zinc-500 hover:decoration-zinc-600 dark:hover:decoration-zinc-300'

export const navLinkActiveClass = `underline hover:underline ${navLinkBaseClass}`

export const navLinkInactiveClass = `no-underline hover:underline ${navLinkBaseClass}`

/** Name line beside avatar on the homepage hero. */
export const heroIdentityNameClass =
  'text-lg font-normal leading-snug text-zinc-900 dark:text-zinc-100 md:text-xl'

/** Homepage hero headline typography (display scale). Column width is set in `Hero.astro` from intro length. */
export const heroDisplayIntroClass = [
  'whitespace-pre-line text-left font-normal tracking-tight text-zinc-900 dark:text-zinc-100',
  'leading-snug md:leading-snug lg:leading-[1.12]',
  'text-3xl sm:text-4xl md:text-5xl lg:text-[4rem]',
  'mt-4',
].join(' ')
