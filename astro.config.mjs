/**
 * Astro Configuration
 * 
 * Dan Portfolio (Astro 4), featuring:
 * - Static Site Generation (SSG)
 * - React components for interactivity
 * - Tailwind CSS for styling
 * - Sanity CMS integration
 * - Swup (main-only swap; instant feel with theme off + no head asset wait)
 * - Sharp image optimization
 */

import {
    defineConfig
} from 'astro/config';
import http from 'node:http';
import tailwind from "@astrojs/tailwind";
import react from "@astrojs/react";
import sanity from '@sanity/astro';
import swup from '@swup/astro';

/** Dev-only: Astro on :4321 has no function runtime. Send API routes to `netlify dev`. */
function playgroundDevProxy() {
    return {
        name: 'playground-dev-proxy',
        configureServer(server) {
            server.middlewares.use((req, res, next) => {
                const path = req.url?.split('?')[0]
                const isAvatar = path === '/api/avatar'
                const isStrava = path === '/api/strava' || path?.startsWith('/api/strava/')
                if (!isAvatar && !isStrava) return next()

                const proxyReq = http.request(
                    {
                        hostname: '127.0.0.1',
                        port: 8888,
                        path: req.url,
                        method: req.method,
                        headers: { ...req.headers, host: '127.0.0.1:8888' },
                    },
                    (proxyRes) => {
                        res.writeHead(proxyRes.statusCode || 502, proxyRes.headers)
                        proxyRes.pipe(res)
                    }
                )
                proxyReq.on('error', () => {
                    if (res.headersSent) return
                    res.statusCode = 502
                    res.setHeader('content-type', 'application/json; charset=utf-8')
                    const path = req.url?.split('?')[0] ?? ''
                    const message = path.startsWith('/api/strava')
                        ? 'The diary could not load. Try again in a little while.'
                        : 'The avatar could not reply. Try again.'
                    res.end(JSON.stringify(path.startsWith('/api/strava') ? { status: 'error', message } : { error: message }))
                })
                req.pipe(proxyReq)
            })
        },
    }
}

// Sanity configuration
const sanityConfig = {
    projectId: '5fq3rcf6',
    dataset: 'production',
    apiVersion: '2024-03-19',
    useCdn: true,
    studioUrl: '/studio'
}

// https://astro.build/config
export default defineConfig({
    site: 'https://danielshires.com',
    redirects: {
        '/experiments': '/playground',
        '/experiments/avatar': '/playground/avatar',
        '/experiments/spinnerstudio': '/playground/spinnerstudio',
        '/playgrounds': '/playground',
        '/playgrounds/avatar': '/playground/avatar',
        '/playgrounds/spinnerstudio': '/playground/spinnerstudio',
    },
    integrations: [
        tailwind(),
        react({
            include: ['**/*.jsx', '**/*.tsx', '**/*.js', '**/*.ts']
        }),
        sanity(sanityConfig),
        swup({
            theme: false,
            animationClass: false,
            containers: ['main'],
            /**
             * Swup’s in-memory page cache can serve an outdated `/writing` index after deploys or when
             * the listing DOM changed (prevents stale “Navigate” et al.). Disables hover preload (bundled behavior).
             */
            cache: false,
            preload: true,
            accessibility: true,
            // Intercept clicks as soon as the bundle runs (idle init delays first navigations)
            loadOnIdle: false,
            // Do not block swap on new stylesheets in <head> (big win vs 1–2s stalls)
            updateHead: { awaitAssets: false, persistAssets: false, persistTags: false },
            smoothScrolling: {
                animateScroll: {
                    betweenPages: false,
                    samePageWithHash: true,
                    samePage: true,
                },
            },
        }),
    ],
    image: {
        service: {
            entrypoint: 'astro/assets/services/sharp'
        },
        quality: 100,
        format: 'avif',
        densities: [1, 2],
        remotePatterns: [{
            protocol: 'https',
            hostname: 'letsenhance.io',
            port: '',
            pathname: '/static/**'
        }]
    },
    // Keep off: Swup PreloadPlugin + data-swup-preload cover in-app routes; avoids duplicate prefetch work
    prefetch: {
        prefetchAll: false,
        defaultStrategy: 'hover',
    },
    vite: {
        plugins: [playgroundDevProxy()],
        build: {
            chunkSizeWarningLimit: 1000,
            rollupOptions: {
                output: {
                    manualChunks: {
                        'react-vendor': ['react', 'react-dom'],
                        'sanity-vendor': ['@sanity/client', '@sanity/image-url'],
                    }
                }
            }
        }
    }
});