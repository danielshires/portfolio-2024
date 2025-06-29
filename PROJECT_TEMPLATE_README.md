# Universal Project Page Template

## 🎯 Overview

This implementation provides a complete universal project page template system for your portfolio, following the NetBank design examples you provided. The system is fully integrated with your existing Astro + Sanity setup.

## 📁 Files Created

### 1. **Sanity Schema**
- `portfolio-25/schemaTypes/project.js` - Complete project schema with all fields
- `portfolio-25/schemaTypes/index.js` - Updated to include project schema

### 2. **Pages**
- `src/pages/projects/[slug].astro` - Dynamic project detail page
- `src/pages/projects/index.astro` - Projects listing page

### 3. **Components** (`src/components/Project/`)
- `ProjectHero.astro` - Hero section with title, subtitle, and image
- `ProjectMeta.astro` - Metadata sidebar (client, role, team, year, duration)
- `ProjectOutcomes.astro` - Outcome cards with numbers and descriptions
- `ProjectProblem.astro` - Problem statement with red accent styling
- `ProjectSolution.astro` - Solution with green accent and checkmark bullets
- `RelatedProjects.astro` - Related project cards

### 4. **Data Layer**
- `src/lib/sanity.ts` - Added Project interface and query functions

## 🏗 Schema Fields

Each project in Sanity includes:

```javascript
{
  title: "Project Title",              // Required
  subtitle: "Optional subheading",     // Optional
  slug: "project-slug",               // Auto-generated
  client: "Client Name",              // Optional
  role: ["UI Designer", "UX Lead"],   // Array of roles
  team: ["John Doe", "Jane Smith"],   // Array of team members
  year: 2023,                         // Number
  duration: "4 sprints",              // String
  heroImage: {...},                   // Sanity image
  outcomes: [                         // Array of achievements
    "20+ components updated",
    "4 sprints delivery",
    "+4pts NPS increase"
  ],
  problem: [{...}],                   // Rich text (Portable Text)
  solution: [{...}],                  // Rich text with lists
  images: [{...}],                    // Array of images with captions
  relatedProjects: [{...}],           // References to other projects
  featured: true,                     // Boolean for homepage
  publishedAt: "2023-01-01",         // DateTime
  tags: ["UI/UX", "Web Design"]      // Array of strings
}
```

## 📱 Responsive Design

- **XS (Mobile)**: Full-width stack, larger text, single column
- **MD (Tablet)**: Two-column layout for metadata + content
- **XL (Desktop)**: Centered layout with generous whitespace, 12-column grid

## 🎨 Design Features

### Color-Coded Sections
- **Problem**: Red accent (`border-red-500`, `bg-red-50`)
- **Solution**: Green accent (`border-green-500`, `bg-green-50`) with checkmarks
- **Outcomes**: Numbered cards with subtle animations

### Typography
- Uses your existing Tailwind configuration
- Consistent with zinc color palette
- Supports dark/light mode themes

### Animations
- Staggered entrance animations for cards
- Hover effects on interactive elements

## 🔧 Usage

### 1. **Add to Sanity Studio**
The schema is already added to your portfolio-25 configuration. Restart your Sanity Studio to see the new "Project" document type.

### 2. **Create Projects**
Add projects through Sanity Studio with:
- Hero images
- Rich text for problem/solution
- Project metadata
- Related project references

### 3. **Access Pages**
- All projects: `/projects`
- Individual project: `/projects/project-slug`

### 4. **Navigation Integration**
Add to your main navigation:
```astro
<a href="/projects">Projects</a>
```

## 🔍 Data Functions

New functions available in `src/lib/sanity.ts`:

```typescript
getAllProjects()           // Get all projects for listing
getProjectBySlug(slug)     // Get single project with full data
getFeaturedProjects()      // Get featured projects for homepage
```

## 🎭 Component Props

### ProjectHero
```typescript
{
  title: string
  subtitle?: string
  heroImage?: SanityImage
}
```

### ProjectMeta
```typescript
{
  client?: string
  role?: string[]
  team?: string[]
  year?: number
  duration?: string
}
```

### ProjectOutcomes
```typescript
{
  outcomes: string[]
}
```

### ProjectProblem & ProjectSolution
```typescript
{
  problem: any    // Portable Text content
  solution: any   // Portable Text content
}
```

### RelatedProjects
```typescript
{
  projects: Project[]
}
```

## 🚀 Next Steps

1. **Restart Sanity Studio** to see the new Project schema
2. **Create sample projects** to test the template
3. **Add projects link** to your main navigation
4. **Customize styling** to match your exact brand preferences
5. **Add more project images** and rich content

## 🔗 Integration

The template seamlessly integrates with your existing:
- ✅ Astro configuration
- ✅ Tailwind theme system
- ✅ Dark/light mode
- ✅ Typography settings
- ✅ Component patterns
- ✅ SEO setup

## 📝 Notes

- Rich text rendering uses `astro-portabletext` (already installed)
- All images are optimized through Sanity's image pipeline
- SEO metadata is automatically generated
- Components follow your existing naming and structure patterns
