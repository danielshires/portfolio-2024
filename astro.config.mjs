import {
    defineConfig
} from 'astro/config';
import tailwind from "@astrojs/tailwind";
import react from "@astrojs/react";
import icon from "astro-icon";
import sanity from '@sanity/astro';

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
    integrations: [
        tailwind(),
        react({
            include: ['**/*.jsx', '**/*.tsx', '**/*.js', '**/*.ts']
        }),
        icon(),
        sanity(sanityConfig)
    ],
    image: {
        service: {
            entrypoint: 'astro/assets/services/sharp'
        }
    },
    prefetch: {
        prefetchAll: false
    },
    vite: {
        optimizeDeps: {
            include: ['gsap'],
        },
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