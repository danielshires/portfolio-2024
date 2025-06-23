# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

All commands are run from the project root:

- `npm run dev` - Start development server at localhost:4321
- `npm run build` - Build production site (runs `astro check && astro build`)
- `npm run preview` - Preview built site locally
- `astro check` - Run TypeScript and Astro checks
- `astro add` - Add integrations and dependencies

## Project Architecture

This is a photography portfolio built with **Astro 4**, **Sanity CMS**, **React**, and **Tailwind CSS**.

### Tech Stack
- **Framework**: Astro 4 with SSG (Static Site Generation)
- **CMS**: Sanity (Project ID: 5fq3rcf6, Production dataset)
- **UI**: React components + Astro components
- **Styling**: Tailwind CSS with custom dark/light theme system
- **Build**: Vite with manual chunking for vendors
- **Image Processing**: Sharp service for optimized images

### Key Directories

- `src/pages/` - File-based routing (index, pictures, posts, design, experiments)
- `src/components/` - Reusable components organized by feature
- `src/lib/sanity.ts` - Sanity client config and data fetching functions
- `src/layouts/` - Page layouts with global styles and theme management
- `src/schemas/` - TypeScript interfaces for Sanity content types

### Content Management

The site fetches content from Sanity CMS with these main content types:
- **Posts**: Blog posts with tags, categories, featured status
- **Pictures**: Individual photos with metadata
- **Albums**: Collections of pictures with cover images
- **Authors**: Content creators with bio and avatar
- **Site Settings**: Global configuration (categories, OG images)

### Component Architecture

Components are organized by feature in subdirectories:
- `Hero/` - Landing page hero components
- `Navigation/` - Site navigation with responsive design
- `Cards/` - Post and picture card components
- `Filters/` - Content filtering UI (React-based)
- `FeaturedProject/` - Project showcase components
- `Shared/` - Common utilities (SEO, Loading, Error boundaries)

### Theming System

Uses CSS custom properties with Tailwind classes:
- Light/dark mode toggle with localStorage persistence
- Zinc color palette with semantic color tokens
- Custom typography configuration for content
- Smooth theme transitions with CSS animations

### Data Fetching

Sanity queries are centralized in `src/lib/sanity.ts`:
- `getAllPosts()` - Fetch all blog posts with metadata
- `getPostBySlug(slug)` - Single post with related posts
- `getAllPictures()` - All photos for gallery
- `getAllAlbums()` - Photo collections
- `getSiteSettings()` - Global site configuration

### Routing Structure

- `/` - Homepage with hero and featured content
- `/posts/` - Blog index and individual post pages
- `/pictures/` - Photo gallery and album views  
- `/design/` - Design portfolio section
- `/experiments/` - Experimental content

### Build Configuration

Astro config includes:
- React integration with JSX support
- Tailwind CSS integration
- Sanity integration with studio at `/studio`
- Sharp image service for optimization
- Manual Vite chunks for vendor libraries (React, Sanity)
- Prefetch disabled by default for performance