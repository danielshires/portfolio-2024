/**
 * About page content. Edit this file to update summary, social links, and work history.
 * Portfolio projects are loaded from Sanity on the page.
 *
 * CV: `public/cv/daniel-shires-cv.md`.
 * The Experience section links to `/cv/daniel-shires-cv.md`.
 */

export interface SocialLink {
  label: string
  href: string
  /** Short handle shown on the right of the Connect row. */
  handle: string
}

export interface ExperienceRole {
  title: string
  /** Four-digit year, e.g. "2022" */
  start: string
  /** Four-digit year or "present" */
  end: string
}

export interface ExperienceEntry {
  organization: string
  /** Newest role first */
  roles: ExperienceRole[]
  /** Employer / client website (optional) */
  organizationHref?: string
  /** Local mark under /images/logos. Omit for a monogram. */
  logo?: string
  /** Two-letter fallback when `logo` is omitted */
  monogram?: string
}

export interface AboutSummary {
  paragraph1BeforeLink: string
  paragraph1Link: { label: string; href: string }
  paragraph1AfterLink: string
  paragraph2: string
}

export interface AboutContent {
  summary: AboutSummary
  social: SocialLink[]
  cv: { href: string; label: string }
  experience: ExperienceEntry[]
}

/** "2021" when the role sits in one year, otherwise "2020–2022". */
export function experiencePeriod(start: string, end: string): string {
  if (start === end) return start
  return `${start}\u2013${end}`
}

/** Full tenure at a company: earliest start through the latest role's end. */
export function experienceSpan(roles: readonly ExperienceRole[]): string {
  const latest = roles[0]
  const earliest = roles[roles.length - 1]
  if (!latest || !earliest) return ''
  return experiencePeriod(earliest.start, latest.end)
}

export const aboutContent: AboutContent = {
  summary: {
    paragraph1BeforeLink:
      "I'm a Senior Product Designer based in Sydney, currently working at ",
    paragraph1Link: {
      label: 'Commonwealth Bank',
      href: 'https://www.commbank.com.au',
    },
    paragraph1AfterLink: '.',
    paragraph2:
      "I work across discovery, strategy, and delivery on complex digital products in financial services, with a focus on scalable systems, accessibility, and inclusive product UI. I've contributed to products including CommBank Yello and NetBank, partnering closely with product, engineering, and research teams.",
  },
  social: [
    { label: 'LinkedIn', handle: 'in/shiresdaniel', href: 'https://www.linkedin.com/in/shiresdaniel/' },
    { label: 'GitHub', handle: '@danielshires', href: 'https://github.com/danielshires' },
    { label: 'Email', handle: 'hello@danielshires.com', href: 'mailto:hello@danielshires.com' },
  ],
  cv: {
    href: '/cv/daniel-shires-cv.md',
    label: 'CV',
  },
  experience: [
    {
      organization: 'CommBank',
      organizationHref: 'https://www.commbank.com.au',
      logo: '/images/logos/commbank.svg',
      roles: [
        { title: 'Senior Product Designer', start: '2026', end: 'present' },
        { title: 'Senior UX Designer', start: '2025', end: 'present' },
        { title: 'Senior UI Designer', start: '2023', end: '2025' },
        { title: 'Specialist UI Designer', start: '2022', end: '2023' },
      ],
    },
    {
      organization: 'Formbay',
      organizationHref: 'https://www.formbay.com.au',
      logo: '/images/logos/formbay.png',
      roles: [{ title: 'Digital Designer', start: '2020', end: '2022' }],
    },
    {
      organization: 'MyCareSpace',
      organizationHref: 'https://www.mycarespace.com.au',
      logo: '/images/logos/mycare.png',
      roles: [{ title: 'UX/UI Designer', start: '2020', end: '2021' }],
    },
    {
      organization: 'Scenic Luxury Cruises & Tours',
      organizationHref: 'https://www.scenic.com.au',
      logo: '/images/logos/scenic.png',
      roles: [{ title: 'Digital Designer', start: '2019', end: '2020' }],
    },
    {
      organization: 'Freelance',
      monogram: 'FR',
      roles: [{ title: 'Graphic Designer', start: '2018', end: '2019' }],
    },
    {
      organization: 'Made.com',
      organizationHref: 'https://www.made.com',
      logo: '/images/logos/made.png',
      roles: [{ title: 'Creative Artworker', start: '2017', end: '2018' }],
    },
    {
      organization: 'Echo House',
      logo: '/images/logos/echohouse.png',
      roles: [{ title: 'Freelance Graphic Designer', start: '2017', end: '2017' }],
    },
    {
      organization: 'TurnbullGrey',
      organizationHref: 'https://www.turnbullgrey.co.uk',
      logo: '/images/logos/turnbullgrey.png',
      roles: [{ title: 'Graphic Design Intern', start: '2017', end: '2017' }],
    },
  ],
}
