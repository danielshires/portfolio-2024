# Image Quality Control Guide

## 🎯 When to Use SanityImage Component

Use `SanityImage` for **simple, standard image cases**:

```astro
<SanityImage
  image={image}
  alt="Description"
  width={800}
  height={600}
  preset="hero"  // or "standard", "optimized", "thumbnail"
  class="your-classes"
/>
```

**Best for:**
- ✅ Hero images
- ✅ Content images in blog posts
- ✅ Gallery thumbnails
- ✅ Standard aspect ratios
- ✅ Simple quality requirements

## 🔧 When to Use urlFor() Directly

Use `urlFor()` for **complex or specialized cases**:

```astro
// SEO images (specific dimensions)
const seoImage = urlFor(image).width(1200).height(630).url()

// High-resolution images
<img src={urlFor(image).width(3840).quality(90).auto('format').fit('max').url()} />

// React components
const imageUrl = urlFor(image).width(1200).quality(75).auto('format').fit('max').url()
```

**Best for:**
- ✅ SEO meta images (need exact dimensions)
- ✅ High-resolution project images (3840px+)
- ✅ React components (can't use Astro components)
- ✅ Complex transformations (crop, focus, blur)
- ✅ Dynamic image arrays with different requirements

## 📊 Quality Presets

| Preset | Quality | Format | Use Case |
|--------|---------|--------|----------|
| `hero` | 90% | AVIF | Hero images, featured content |
| `standard` | 85% | AVIF | Most content, blog posts |
| `optimized` | 75% | AVIF | Performance-focused content |
| `thumbnail` | 60% | WebP | Gallery thumbnails, previews |

## 🎨 Custom Quality

Override presets when needed:

```astro
<SanityImage
  image={image}
  preset="standard"
  quality={95}  // Override to 95%
  format="webp" // Override format
/>
```

## 📱 Responsive Images

SanityImage automatically generates:
- Responsive srcsets (400w, 800w, 1200w, 1600w)
- Quality scaling based on image size
- Proper `sizes` attribute

## 🚀 Performance Tips

1. **Use appropriate presets** - Don't use hero quality for thumbnails
2. **Set proper sizes** - Help browser choose right image
3. **Consider loading** - SanityImage uses lazy loading by default
4. **Monitor file sizes** - Check network tab for actual image sizes

## 🔄 Migration Checklist

When converting from `urlFor()` to `SanityImage`:

- [ ] Check if image needs specific dimensions (SEO, etc.)
- [ ] Verify aspect ratio compatibility
- [ ] Test responsive behavior
- [ ] Confirm quality meets requirements
- [ ] Update any custom transformations

## ❌ Don't Convert If

- Image needs exact height/width for SEO
- Image is used in React components
- Image requires complex Sanity transformations
- Image is part of dynamic array with varying requirements
- Image needs very large sizes (3000px+)
