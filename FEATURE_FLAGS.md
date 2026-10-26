# Feature Flags

This project uses environment variables to control feature visibility. This allows you to keep pages in development while hiding them from the public site.

## Configuration

Create a `.env` file in your project root with the following variables:

```env
# Feature Flags Configuration
# Set to 'true' to enable, 'false' to disable, or omit for default behavior

# Experiments page
PUBLIC_FEATURE_EXPERIMENTS=true
PUBLIC_FEATURE_EXPERIMENTS_VISIBLE=true

# Pictures page
PUBLIC_FEATURE_PICTURES=true
PUBLIC_FEATURE_PICTURES_VISIBLE=true

# Posts/Thoughts page
PUBLIC_FEATURE_POSTS=true
PUBLIC_FEATURE_POSTS_VISIBLE=true

# Design page
PUBLIC_FEATURE_DESIGN=true
PUBLIC_FEATURE_DESIGN_VISIBLE=true
```

## Usage Examples

### Hide Experiments from Public Site
```env
PUBLIC_FEATURE_EXPERIMENTS=true
PUBLIC_FEATURE_EXPERIMENTS_VISIBLE=false
```
This keeps the experiments page functional but removes it from navigation and sitemap.

### Completely Disable a Feature
```env
PUBLIC_FEATURE_EXPERIMENTS=false
PUBLIC_FEATURE_EXPERIMENTS_VISIBLE=false
```
This completely disables the experiments feature.

### Default Behavior
If you don't set a variable, it defaults to enabled/visible:
- `PUBLIC_FEATURE_*` defaults to `true` (enabled)
- `PUBLIC_FEATURE_*_VISIBLE` defaults to `true` (visible in navigation)

## How It Works

1. **Navigation**: All navigation components automatically filter out hidden items
2. **Sitemap**: Hidden pages are excluded from the sitemap
3. **Build Time**: Features are evaluated at build time, so changes require a rebuild

## Adding New Features

To add a new feature flag:

1. Add it to `src/config/features.ts`:
```typescript
export const features = {
  // ... existing features
  newFeature: {
    enabled: import.meta.env.PUBLIC_FEATURE_NEW_FEATURE !== 'false',
    visible: import.meta.env.PUBLIC_FEATURE_NEW_FEATURE_VISIBLE !== 'false',
  },
}
```

2. Add it to the `getNavigationItems()` function if it should appear in navigation
3. Add the corresponding environment variables to your `.env` file

## Avatar chat

The digital avatar at `/experiments/avatar` calls Gemini from a Netlify function. The key stays on the server. Do not prefix it with `PUBLIC_` and do not commit it.

Set these in the Netlify UI, and in a local `.env` when using `npm run dev:netlify`:

```env
GEMINI_API_KEY=your-key-from-google-ai-studio
# Optional. Defaults to gemini-3.5-flash.
GEMINI_MODEL=gemini-3.5-flash
```

`npm run dev` does not run the function. Use `npm run dev:netlify` (`npx netlify dev`) so `/api/avatar` is available. Create the key at [Google AI Studio](https://aistudio.google.com/apikey).

## Training diary

The training diary at `/playground/training` reads workouts from Strava. The client id and secret stay on the server. Do not prefix them with `PUBLIC_` and do not commit them.

Set these in the Netlify UI, and in a local `.env` when using `npm run dev:netlify`:

```env
STRAVA_CLIENT_ID=your-strava-client-id
STRAVA_CLIENT_SECRET=your-strava-client-secret
```

Create the app at [Strava API settings](https://www.strava.com/settings/api). The callback domain is the production domain. `localhost` is already allowed. Then open the diary and use Connect once. `npm run dev` does not run the function. Use `npm run dev:netlify` so `/api/strava` is available.
