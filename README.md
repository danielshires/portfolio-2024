# Daniel Shires - Photography & Design Portfolio

A modern, responsive portfolio website showcasing photography collections and design projects. Built with Astro, React, and Sanity CMS for optimal performance and content management.

## 🎯 About

This portfolio features:
- **Photography Collections**: Curated albums and individual photographs
- **Design Projects**: UX/UI design work and case studies
- **Responsive Design**: Optimized for all devices
- **Performance Focused**: Fast loading with optimized images
- **Content Management**: Powered by Sanity CMS

## 🚀 Tech Stack

- **Framework**: [Astro](https://astro.build/) - Static site generator
- **Frontend**: React, Preact, TypeScript
- **Styling**: Tailwind CSS
- **CMS**: [Sanity](https://www.sanity.io/) - Headless content management
- **Animations**: GSAP, ScrollReveal, AOS
- **Icons**: Iconify, Remix Icons
- **Images**: Sharp image optimization with AVIF format

## 📁 Project Structure

```
/
├── public/                 # Static assets (fonts, images, favicon)
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── content/        # Content-specific components
│   │   ├── layout/         # Layout and navigation
│   │   ├── media/          # Image and gallery components
│   │   └── ui/             # Base UI components
│   ├── content/            # Static content (albums, posts)
│   ├── layouts/            # Page layouts
│   ├── lib/                # Utilities and Sanity client
│   ├── pages/              # Astro pages and routes
│   └── styles/             # Global styles
├── portfolio-25/           # Sanity Studio configuration
└── sanity.config.ts        # Sanity project configuration
```

## 🛠️ Development

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd 034-Dan-Photography-Portfolio
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables (if needed):
```bash
# Create .env file with Sanity configuration
SANITY_PROJECT_ID=your_project_id
SANITY_DATASET=production
```

### Available Scripts

| Command           | Action                                       |
| ----------------- | -------------------------------------------- |
| `npm run dev`     | Start development server at `localhost:4321` |
| `npm run build`   | Build for production                         |
| `npm run preview` | Preview production build locally             |
| `npm run astro`   | Run Astro CLI commands                       |

## 📸 Features

### Photography
- **Album Collections**: Organized photography series
- **Image Optimization**: Automatic AVIF conversion and responsive images
- **Gallery Views**: Grid and individual photo displays
- **Categories**: Visual diary, landscapes, architecture, and more

### Design Portfolio
- **Project Showcases**: Detailed case studies and design work
- **Interactive Elements**: Smooth animations and transitions
- **Responsive Layout**: Optimized for all screen sizes

### Content Management
- **Sanity Studio**: Visual content editor at `/studio`
- **Portable Text**: Rich text content with custom components
- **Image Management**: Optimized image handling with Sanity

## 🎨 Design System

- **Typography**: Custom Graphik font family
- **Colors**: Dark/light theme support
- **Components**: Modular, reusable UI components
- **Animations**: Smooth page transitions and scroll effects

## 📱 Performance

- **Image Optimization**: Sharp service with AVIF format
- **Code Splitting**: Automatic vendor chunk optimization
- **Prefetching**: Smart link prefetching
- **Lazy Loading**: Optimized image loading

## 🌐 Deployment

The site is optimized for static hosting platforms like:
- Vercel
- Netlify
- GitHub Pages

Build the project with `npm run build` and deploy the `dist/` folder.

## 📝 Content Management

Access the Sanity Studio at `/studio` to manage:
- Photography albums and images
- Design projects and case studies
- Blog posts and journal entries
- Site settings and metadata

## 🤝 Contributing

This is a personal portfolio project. For questions or feedback, please reach out directly.

## 📄 License

This project is private and proprietary.

```sh
npm create astro@latest -- --template basics
```

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/withastro/astro/tree/latest/examples/basics)
[![Open with CodeSandbox](https://assets.codesandbox.io/github/button-edit-lime.svg)](https://codesandbox.io/p/sandbox/github/withastro/astro/tree/latest/examples/basics)
[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/withastro/astro?devcontainer_path=.devcontainer/basics/devcontainer.json)

> 🧑‍🚀 **Seasoned astronaut?** Delete this file. Have fun!

![just-the-basics](https://github.com/withastro/astro/assets/2244813/a0a5533c-a856-4198-8470-2d67b1d7c554)

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   └── Card.astro
│   ├── layouts/
│   │   └── Layout.astro
│   └── pages/
│       └── index.astro
└── package.json
```

Astro looks for `.astro` or `.md` files in the `src/pages/` directory. Each page is exposed as a route based on its file name.

There's nothing special about `src/components/`, but that's where we like to put any Astro/React/Vue/Svelte/Preact components.

Any static assets, like images, can be placed in the `public/` directory.

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## 👀 Want to learn more?

Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).
