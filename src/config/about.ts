/**
 * About page content. Edit this file to update summary, social links, and work history.
 * Portfolio projects are loaded from Sanity on the page.
 */

export interface SocialLink {
  label: string
  href: string
}

export interface WorkEntry {
  organization: string
  role: string
  /** e.g. "2022–24", "2025–present" */
  period: string
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
  work: WorkEntry[]
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
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/shiresdaniel/' },
    { label: 'Email', href: 'mailto:hello@danielshires.com' },
  ],
  work: [
    {
      organization: 'CommBank',
      role: 'Senior Product Designer, CommBank Yello',
      period: '2025–present',
    },
    {
      organization: 'CommBank',
      role: 'Senior UI Designer, CommBank Yello',
      period: '2024–2025',
    },
    {
      organization: 'CommBank',
      role: 'Specialist UI Designer, NetBank & CommBank Yello',
      period: '2022–2024',
    },
    {
      organization: 'Formbay',
      role: 'Digital Designer',
      period: '2020–2022',
    },
    {
      organization: 'Scenic Luxury Cruises & Tours',
      role: 'Digital Designer',
      period: '2019–2020',
    },
    {
      organization: 'Freelance',
      role: 'Digital Designer',
      period: '2018–2019',
    },
    {
      organization: 'Made.com',
      role: 'Creative Artworker',
      period: '2017–2018',
    },
  ],
}
