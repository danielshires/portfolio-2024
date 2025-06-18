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
                        },
                        'h1, h2, h3, h4, h5, h6': {
                            color: 'rgb(var(--zinc-950))',
                        },
                        'p, li, blockquote': {
                            color: 'rgb(var(--zinc-700))',
                        },
                        'strong': {
                            color: 'rgb(var(--zinc-950))',
                        },
                        'a': {
                            color: 'rgb(var(--zinc-950))',
                        },
                        'code': {
                            color: 'rgb(var(--zinc-950))',
                            backgroundColor: 'rgb(var(--zinc-100))',
                        },
                        'pre': {
                            backgroundColor: 'rgb(var(--zinc-100))',
                        },
                        'blockquote': {
                            borderLeftColor: 'rgb(var(--zinc-300))',
                        },
                        'hr': {
                            borderColor: 'rgb(var(--zinc-300))',
                        },
                        'thead': {
                            borderBottomColor: 'rgb(var(--zinc-300))',
                        },
                        'tbody tr': {
                            borderBottomColor: 'rgb(var(--zinc-200))',
                        },
                    }
                },
                dark: {
                    css: {
                        'li::marker': {
                            color: 'rgb(var(--zinc-50))',
                        },
                        'h1, h2, h3, h4, h5, h6': {
                            color: 'rgb(var(--zinc-50))',
                        },
                        'p, li, blockquote': {
                            color: 'rgb(var(--zinc-300))',
                        },
                        'strong': {
                            color: 'rgb(var(--zinc-50))',
                        },
                        'a': {
                            color: 'rgb(var(--zinc-50))',
                        },
                        'code': {
                            color: 'rgb(var(--zinc-50))',
                            backgroundColor: 'rgb(var(--zinc-800))',
                        },
                        'pre': {
                            backgroundColor: 'rgb(var(--zinc-800))',
                        },
                        'blockquote': {
                            borderLeftColor: 'rgb(var(--zinc-700))',
                        },
                        'hr': {
                            borderColor: 'rgb(var(--zinc-700))',
                        },
                        'thead': {
                            borderBottomColor: 'rgb(var(--zinc-700))',
                        },
                        'tbody tr': {
                            borderBottomColor: 'rgb(var(--zinc-800))',
                        },
                    }
                }
            }),
        },
    },
    plugins: [require('@tailwindcss/typography')],
    darkMode: 'class',
}
