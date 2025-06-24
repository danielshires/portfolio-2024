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
                'mono': ['"IBM Plex Mono"', 'monospace'],
                'fragment': ['"IBM Plex Mono"', 'monospace']
            },
            typography: (theme) => ({
                DEFAULT: {
                    css: {
                        maxWidth: '100vw',
                        article: {
                            maxWidth: '60ch',
                        },
                        li: {
                            fontSize: '1.125rem',
                            lineHeight: theme('lineHeight.relaxed'),
                        },
                        'li::marker': {
                            color: 'rgb(var(--zinc-950))',
                        },
                        h1: {
                            fontFamily: theme('fontFamily.sans').join(','),
                            fontWeight: '400',
                            fontSize: theme('fontSize.4xl')[0],
                            color: theme('colors.zinc.900'),
                        },
                        h2: {
                            fontFamily: theme('fontFamily.sans').join(','),
                            fontWeight: '400',
                            fontSize: theme('fontSize.3xl')[0],
                            color: theme('colors.zinc.900'),
                        },
                        h3: {
                            fontFamily: theme('fontFamily.sans').join(','),
                            fontWeight: '400',
                            fontSize: theme('fontSize.2xl')[0],
                            color: theme('colors.zinc.900'),
                        },
                        h4: {
                            fontFamily: theme('fontFamily.sans').join(','),
                            fontWeight: '400',
                            fontSize: theme('fontSize.xl')[0],
                            color: theme('colors.zinc.900'),
                        },
                        h5: {
                            fontFamily: theme('fontFamily.sans').join(','),
                            fontWeight: '400',
                            fontSize: theme('fontSize.lg')[0],
                            color: theme('colors.zinc.900'),
                        },
                        p: {
                            fontFamily: theme('fontFamily.sans').join(','),
                            fontWeight: '400',
                            fontSize: theme('fontSize.lg')[0],
                            color: theme('colors.zinc.900'),
                            lineHeight: theme('lineHeight.relaxed'),

                        },
                        '.prose-caption': {
                            fontFamily: theme('fontFamily.sans').join(','),
                            fontWeight: '400',
                            fontSize: theme('fontSize.sm')[0],
                            color: theme('colors.zinc.600'),
                        },
                        '.prose-overline': {
                            fontFamily: theme('fontFamily.sans').join(','),
                            fontWeight: '400',
                            fontSize: theme('fontSize.xs')[0],
                            textTransform: 'uppercase',
                            letterSpacing: theme('letterSpacing.wide'),
                            color: theme('colors.zinc.600'),
                        },
                        'strong': {
                            color: theme('colors.zinc.900'),
                        },
                        'a': {
                            color: theme('colors.zinc.900'),
                        },
                        'code': {
                            color: theme('colors.zinc.900'),
                            backgroundColor: theme('colors.zinc.100'),
                        },
                        'pre': {
                            backgroundColor: theme('colors.zinc.100'),
                        },
                        'blockquote': {
                            borderLeftColor: theme('colors.zinc.300'),
                        },
                        'hr': {
                            borderColor: theme('colors.zinc.300'),
                        },
                        'thead': {
                            borderBottomColor: theme('colors.zinc.300'),
                        },
                        'tbody tr': {
                            borderBottomColor: theme('colors.zinc.200'),
                        },
                    }
                },
                dark: {
                    css: {
                        'li::marker': {
                            color: 'rgb(var(--zinc-50))',
                        },
                        h1: {
                            color: theme('colors.zinc.100'),
                        },
                        h2: {
                            color: theme('colors.zinc.100'),
                        },
                        h3: {
                            color: theme('colors.zinc.100'),
                        },
                        h4: {
                            color: theme('colors.zinc.100'),
                        },
                        h5: {
                            color: theme('colors.zinc.100'),
                        },
                        p: {
                            color: theme('colors.zinc.100'),
                        },
                        '.prose-caption': {
                            color: theme('colors.zinc.400'),
                        },
                        '.prose-overline': {
                            color: theme('colors.zinc.400'),
                        },
                        'strong': {
                            color: theme('colors.zinc.50'),
                        },
                        'a': {
                            color: theme('colors.zinc.50'),
                        },
                        'code': {
                            color: theme('colors.zinc.50'),
                            backgroundColor: theme('colors.zinc.800'),
                        },
                        'pre': {
                            backgroundColor: theme('colors.zinc.800'),
                        },
                        'blockquote': {
                            borderLeftColor: theme('colors.zinc.700'),
                        },
                        'hr': {
                            borderColor: theme('colors.zinc.700'),
                        },
                        'thead': {
                            borderBottomColor: theme('colors.zinc.700'),
                        },
                        'tbody tr': {
                            borderBottomColor: theme('colors.zinc.800'),
                        },
                    }
                }
            }),
        },
    },
    plugins: [require('@tailwindcss/typography')],
    darkMode: 'class',
}