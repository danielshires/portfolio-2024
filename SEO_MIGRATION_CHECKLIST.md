# SEO Migration Checklist - Daniel Shires Portfolio

## 🚨 CRITICAL: Pre-Launch Actions

### 1. URL Structure Verification
- [ ] Confirm all current URLs will remain identical
- [ ] If any URLs change, add 301 redirects in `netlify.toml`
- [ ] Test redirects locally before deployment

### 2. Content Preservation
- [ ] All blog posts maintain same slugs (`/journal/[slug]`)
- [ ] All projects maintain same slugs (`/projects/[slug]`)
- [ ] All albums maintain same slugs (`/albums/[slug]`)
- [ ] All images have same alt text and filenames
- [ ] All meta descriptions remain identical

### 3. Technical SEO Setup
- [ ] Google Analytics tracking code updated (replace G-XXXXXXXXXX)
- [ ] Google Search Console verification code added
- [ ] XML sitemap generates correctly
- [ ] Robots.txt accessible at `/robots.txt`
- [ ] All structured data validates in Google's Rich Results Test

### 4. Performance Optimization
- [ ] Core Web Vitals scores maintained/improved
- [ ] Images optimized (AVIF format enabled)
- [ ] Page load times under 3 seconds
- [ ] Mobile responsiveness verified

## 🔍 Post-Launch Monitoring

### Week 1-2
- [ ] Monitor Google Search Console for crawl errors
- [ ] Check Google Analytics for traffic patterns
- [ ] Verify all pages are indexed
- [ ] Monitor Core Web Vitals in Search Console

### Week 3-4
- [ ] Compare rankings with previous site
- [ ] Monitor organic traffic trends
- [ ] Check for any 404 errors
- [ ] Verify internal linking works correctly

## 📊 Key Metrics to Track

### Before Launch (Baseline)
- Current Google ranking positions
- Organic traffic volume
- Page speed scores
- Core Web Vitals metrics

### After Launch (Target)
- Maintain or improve all baseline metrics
- No significant traffic drops
- All pages indexed within 1-2 weeks

## 🛠️ Tools for Monitoring

1. **Google Search Console** - Monitor indexing and rankings
2. **Google Analytics** - Track traffic and user behavior
3. **PageSpeed Insights** - Monitor performance
4. **Screaming Frog** - Crawl site for technical issues
5. **Ahrefs/SEMrush** - Track keyword rankings

## 🚨 Emergency Rollback Plan

If rankings drop significantly:
1. Immediately revert to previous version
2. Analyze what changed (URLs, content, structure)
3. Fix issues in development
4. Re-deploy with corrections

## 📞 Contact Information

- **Google Search Console**: [Add your property URL]
- **Google Analytics**: [Add your GA4 property ID]
- **Hosting**: Netlify
- **Domain**: danielshires.com

---

**Remember**: The goal is to maintain 100% of current SEO value while improving the user experience and site performance.
