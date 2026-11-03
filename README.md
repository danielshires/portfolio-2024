# danielshires.com

The personal site of Daniel Shires, a Senior Product Designer based in Woonona, NSW. It holds case studies, writing, photography, a field guide of design concepts, and a playground of small experiments, including a 3D avatar you can chat with.

Live at [danielshires.com](https://danielshires.com).

## What's on the site

| Route | What it is |
| --- | --- |
| `/` | Homepage, with a 3D Memoji-style avatar that reacts when you click it |
| `/projects` | Case studies, filterable in one list, with views and claps per project |
| `/writing` | Posts. Served on request from Sanity, so a publish is live in about a minute with no rebuild |
| `/pictures` | Photography, as individual pictures and albums |
| `/field-guide` | Short entries on design concepts and methods |
| `/design` | Design portfolio |
| `/playground` | Experiments: avatar chat, a Strava training diary, and Spinner Studio |
| `/changelog` | Every commit to the site, grouped by day and read from git history at build time |
| `/about` | About me |
| `/agent.md` | A Markdown profile of me and the site for AI agents. The homepage also returns it to clients that ask for Markdown |
| `/studio` | Sanity Studio for editing content |

Old URLs (`/journal`, `/experiments`, `/playgrounds`) redirect to their current homes.

## Tech stack

- **Framework**: [Astro 4](https://astro.build/) in hybrid mode on Netlify. Pages are static by default; writing, the homepage preview, the sitemap and `agent.md` render on request.
- **UI**: React 19 for interactive parts, Astro components for everything else
- **Styling**: Tailwind CSS 4, IBM Plex Sans and Mono, light and dark themes
- **CMS**: [Sanity](https://www.sanity.io/) (project `5fq3rcf6`, dataset `production`)
- **3D**: three.js and React Three Fiber for the avatar
- **AI chat**: Gemini, through a Netlify Function, with AI Elements and Streamdown for the chat UI
- **Storage**: Netlify Blobs for project engagement counts and rate limits
- **Page transitions**: Swup
- **Images**: Sharp, served as AVIF

## Getting started

Requires Node 20 (the version Netlify builds with).

```bash
npm install
npm run dev
```

The site runs at `localhost:4321`. Content comes from the production Sanity dataset, so no setup is needed to browse it.

The API routes (avatar chat, Strava diary, project engagement) are Netlify Functions, which plain `astro dev` can't run. To use them locally, start Netlify Dev alongside it:

```bash
npm run dev:netlify
```

Astro then proxies `/api/*` requests to Netlify Dev on port 8888.

### Environment variables

Put these in a `.env` file, and in Netlify's site settings for production. All are optional for browsing the site locally.

| Variable | Used for |
| --- | --- |
| `GEMINI_API_KEY` | Avatar chat |
| `GEMINI_MODEL` | Overrides the default Gemini model |
| `RATE_LIMIT_SALT` | Hashing visitor IDs for rate limits |
| `STRAVA_CLIENT_ID`, `STRAVA_CLIENT_SECRET`, `STRAVA_ATHLETE_ID` | Training diary |
| `PUBLIC_GA_ID` | Google Analytics |
| `PUBLIC_FEATURE_*` | Show or hide sections of the site. See [FEATURE_FLAGS.md](FEATURE_FLAGS.md) |

## Scripts

| Command | Action |
| --- | --- |
| `npm run dev` | Start the dev server at `localhost:4321` |
| `npm run dev:netlify` | Start Netlify Dev, for the API routes |
| `npm run build` | Type-check with `astro check`, then build to `dist/` |
| `npm run preview` | Preview the production build |
| `npm run avatar:prepare -- <file.glb>` | Turn a Meshy 3D export into the homepage avatar model |

## Project structure

```
/
├── src/
│   ├── pages/             # Routes
│   ├── components/        # content/, layout/, media/, ui/ — grouped by feature
│   ├── layouts/           # Page layouts, global styles and theme
│   └── lib/
│       ├── sanity.ts      # Sanity client and every content query
│       ├── agent/         # The agent.md profile
│       ├── avatar/        # Site context given to the avatar chat
│       ├── server/        # Rate limiting and Blob helpers for functions
│       └── seo/           # Structured data helpers
├── netlify/
│   ├── functions/         # avatar-chat, strava-diary, project-engagement
│   └── edge-functions/    # Serves agent.md on / to clients that want Markdown
├── portfolio-25/          # Sanity Studio and schemas. The only studio; deploy from here
├── scripts/avatar/        # Avatar model preparation
├── public/                # Fonts, images, 3D models
└── docs/tone/             # Writing tone guides
```

## Content

Edit content in Sanity Studio at `/studio`, or run the studio from `portfolio-25/`. Content types:

- **Projects**: case studies
- **Posts**: writing
- **Pictures** and **albums**: photography
- **Concepts**: field guide entries
- **Authors** and **site settings**

Writing goes live within about a minute of publishing. Projects, pictures and other prerendered pages update on the next Netlify deploy.

## Deploying

Netlify builds and deploys `main` to production. Work happens on branches and merges through pull requests.

## Other docs

- [FEATURE_FLAGS.md](FEATURE_FLAGS.md): turning sections on and off
- [IMAGE_QUALITY_GUIDE.md](IMAGE_QUALITY_GUIDE.md): which image component to use, and quality settings
- [PROJECT_TEMPLATE_README.md](PROJECT_TEMPLATE_README.md): the project page template
- [SEO_MIGRATION_CHECKLIST.md](SEO_MIGRATION_CHECKLIST.md): SEO checks for URL changes and launches

## License

Private and proprietary. This is a personal site; for questions, get in touch through [danielshires.com](https://danielshires.com).
