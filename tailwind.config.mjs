/** @type {import('tailwindcss').Config} */

export default {
    content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: 'rgb(var(--zinc-950))',
                    light: 'rgb(var(--zinc-50))',
                },
                background: {
                    light: 'rgb(var(--zinc-50))',
                    dark: 'rgb(var(--zinc-950))',
                },
                text: {
                    light: 'rgb(var(--zinc-950))',
                    dark: 'rgb(var(--zinc-50))',
                },
                border: {
                    light: 'rgb(var(--zinc-200))',
                    dark: 'rgb(var(--zinc-800))',
                },
            },
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
                            color: 'rgb(var(--zinc-950))',
                        }
                    }
                }
            }),
        },
    },
    plugins: [require('@tailwindcss/typography')],
    darkMode: 'class',
}
