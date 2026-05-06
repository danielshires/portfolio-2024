# Daniel Shires - Photography & Design Portfolio

A modern, responsive portfolio website showcasing photography collections and design projects. Built with Astro, React, and Sanity CMS for optimal performance and content management.

## 🎯 About

This portfolio features:
- **Photography Collections**: Curated albums and individual photographs
- **Design Projects**: UX/UI design work and case studies
- **Responsive Design**: Optimized for all devices
- **Performance Focused**: Fast loading with optimized images
- **Content Management**: Powered by Sanity CMS
- **SEO Optimized**: Comprehensive search engine optimization

## 🚀 Tech Stack

- **Framework**: [Astro](https://astro.build/) - Static site generator
- **Frontend**: React, Preact, TypeScript
- **Styling**: Tailwind CSS
- **CMS**: [Sanity](https://www.sanity.io/) - Headless content management
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
│   │   ├── shared/         # Shared components including SEO
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

# Optional: Google Analytics (`src/components/common/SEO.astro`)
# PUBLIC_GA_ID=G-XXXXXXXXXX
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

## 🔍 SEO Optimization

### Meta Tags & Social Media
- **Open Graph**: Optimized for Facebook, LinkedIn, and social sharing
- **Twitter Cards**: Enhanced Twitter sharing with large image cards
- **Meta Descriptions**: Unique, compelling descriptions for each page
- **Canonical URLs**: Proper canonical tags to prevent duplicate content

### Structured Data
- **Person Schema**: Rich snippets for personal information
- **BlogPosting Schema**: Enhanced blog post listings
- **CreativeWork Schema**: Design project structured data
- **CollectionPage Schema**: Photography collections markup
- **Organization Schema**: Professional affiliations

### Technical SEO
- **XML Sitemap**: Comprehensive sitemap with priorities and change frequencies
- **Robots.txt**: Optimized crawl directives
- **Page Speed**: Optimized images and code splitting
- **Mobile-First**: Responsive design with mobile optimization
- **Semantic HTML**: Proper heading hierarchy and semantic markup

### Content Optimization
- **Keyword Integration**: Strategic keyword placement in titles and descriptions
- **Internal Linking**: Cross-linking between related content
- **Image Alt Text**: Descriptive alt text for all images
- **URL Structure**: Clean, SEO-friendly URLs

## 🎨 Design System

- **Typography**: IBM Plex Sans / IBM Plex Mono (Google Fonts)
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
