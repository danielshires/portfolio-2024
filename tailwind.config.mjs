/** @type {import('tailwindcss').Config} */

export default {
    content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
    theme: {
        extend: {
            fontFamily: {
                'sans': ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
                'serif': ['"Instrument Serif"', 'serif'],
                'mono': ['Thermal', 'monospace'],
                'fragment': ['"Fragment Mono"', 'monospace']
            },
            typography: (theme) => ({
                DEFAULT: {
                    css: {
                        maxWidth: '100vw',
                        article: {
                            maxWidth: '60ch',
                        },
                        li: {
                            fontSize: '1.25rem',
                        },
                        'li::marker': {
                            color: 'rgb(9,9,11);'
                        }
                    }
                }
            }),
        },
    },
    plugins: [require('@tailwindcss/typography')],
    darkMode: 'class',
}
