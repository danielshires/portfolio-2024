# Daniel Shires

> Senior Product Designer based in Woonona, NSW.

Dan is a Senior Product Designer at [Commonwealth Bank](https://www.commbank.com.au), exploring the future of customer communication.

He brings together product discovery, customer-centred design, and systems thinking to make complex problems easier to understand and solve. Working across product, engineering, and research, he helps turn early insights into clear concepts and useful digital experiences.

He also uses AI to explore ideas, prototype quickly, and build working products, bridging design and development. Outside his day job he builds small products and experiments, from a Figma plugin to this site.

## Pages

{{pages}}

## Interests

- Product discovery
- Design systems and interface craft
- Photography
- AI-assisted prototyping
- Accessibility

## Experience

{{experience}}

## Work

{{work}}

## Writing

{{writing}}

## Stack

This site is a static [Astro](https://astro.build) 4 build, hosted on [Netlify](https://www.netlify.com). Pages are generated ahead of time.

Projects, writing, pictures, and albums come from [Sanity](https://www.sanity.io) (project `5fq3rcf6`, production dataset). The studio is at [/studio](https://danielshires.com/studio). About copy, experience, and social links are edited in `src/config/about.ts`. The CV is the markdown file linked above.

Interactive pieces, such as the theme control, are React islands. Everything else is Astro. Styling is Tailwind CSS, with a light and dark theme stored in `localStorage`. [Swup](https://swup.js.org) replaces only the `<main>` element between pages. Images are optimised with Sharp. A Netlify function serves the avatar chat experiment at `/api/avatar`.

This profile is the plain-text version of the site. It is also published at [/agent.md](https://danielshires.com/agent.md). The homepage returns the same document when a request sends `Accept: text/markdown`.

## Connect

{{connect}}
