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
import tailwind from "@astrojs/tailwind";
import react from "@astrojs/react";
import sanity from '@sanity/astro';
import swup from '@swup/astro';

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