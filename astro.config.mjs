/**
 * Astro Configuration
 * 
 * Photography portfolio built with Astro 4, featuring:
 * - Static Site Generation (SSG)
 * - React components for interactivity
 * - Tailwind CSS for styling
 * - Sanity CMS integration
 * - Swup for smooth page transitions
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
            theme: 'fade',
            containers: ['main'],
            preload: true,
            accessibility: true,
            animationSelector: '.transition-fade',
            scrollToTop: true, // Re-enable Swup's built-in scroll management
            scrollBehavior: 'auto'
        })
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
    prefetch: {
        prefetchAll: false
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