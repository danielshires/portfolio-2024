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
                focus: {
                    DEFAULT: '#000000',
                    dark: '#ffffff',
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
                'sans': ['Inter', 'system-ui', 'sans-serif'],
                'serif': ['ui-serif', 'Georgia', 'Cambria', 'Times New Roman', 'serif'],
                'mono': ['"IBM Plex Mono"', 'monospace'],
                'fragment': ['"IBM Plex Mono"', 'monospace']
            },
            // Global body scale knob: drives `text-base`, Text `body`/similar, and prose `p`/`li`/`h5` via theme('fontSize.base').
            // Quick presets: 1rem (default Tailwind), 1.0625rem (~17px), 1.125rem (18px).
            fontSize: {
                base: ['1rem', { lineHeight: '1.5' }],
            },
            typography: (theme) => ({
                DEFAULT: {
                    css: {
                        maxWidth: '100vw',
                        article: {
                            maxWidth: '60ch',
                        },
                        li: {
                            fontSize: theme('fontSize.base')[0],
                            lineHeight: theme('lineHeight.relaxed'),
                            color: theme('colors.zinc.900'),
                        },
                        'li::marker': {
                            color: 'rgb(var(--zinc-950))',
                        },
                        h1: {
                            fontFamily: theme('fontFamily.sans').join(','),
                            fontWeight: '400',
                            fontSize: theme('fontSize.3xl')[0],
                            lineHeight: theme('lineHeight.snug'),
                            letterSpacing: theme('letterSpacing.tight'),
                            color: theme('colors.zinc.900'),
                        },
                        h2: {
                            fontFamily: theme('fontFamily.sans').join(','),
                            fontWeight: '400',
                            fontSize: theme('fontSize.2xl')[0],
                            lineHeight: theme('lineHeight.snug'),
                            color: theme('colors.zinc.900'),
                        },
                        h3: {
                            fontFamily: theme('fontFamily.sans').join(','),
                            fontWeight: '400',
                            fontSize: theme('fontSize.xl')[0],
                            lineHeight: theme('lineHeight.snug'),
                            color: theme('colors.zinc.900'),
                        },
                        h4: {
                            fontFamily: theme('fontFamily.sans').join(','),
                            fontWeight: '400',
                            fontSize: theme('fontSize.lg')[0],
                            lineHeight: theme('lineHeight.snug'),
                            color: theme('colors.zinc.900'),
                        },
                        h5: {
                            fontFamily: theme('fontFamily.sans').join(','),
                            fontWeight: '600',
                            fontSize: theme('fontSize.base')[0],
                            lineHeight: theme('lineHeight.snug'),
                            color: theme('colors.zinc.900'),
                        },
                        p: {
                            fontFamily: theme('fontFamily.sans').join(','),
                            fontWeight: '400',
                            fontSize: theme('fontSize.base')[0],
                            color: theme('colors.zinc.900'),
                            lineHeight: theme('lineHeight.relaxed'),

                        },
                        '.prose-caption': {
                            fontFamily: theme('fontFamily.sans').join(','),
                            fontWeight: '400',
                            fontSize: theme('fontSize.sm')[0],
                            color: theme('colors.zinc.900'),
                        },
                        '.prose-overline': {
                            fontFamily: theme('fontFamily.mono').join(','),
                            fontWeight: '400',
                            fontSize: theme('fontSize.xs')[0],
                            textTransform: 'uppercase',
                            letterSpacing: theme('letterSpacing.wide'),
                            color: theme('colors.zinc.900'),
                        },
                        'strong': {
                            color: theme('colors.zinc.900'),
                        },
                        'a': {
                            color: theme('colors.zinc.800'),
                            fontWeight: '500',
                            textDecoration: 'underline',
                            textUnderlineOffset: '0.2em',
                            textDecorationThickness: '1px',
                            textDecorationColor: theme('colors.zinc.400'),
                            transitionProperty: 'color, text-decoration-color',
                            transitionDuration: theme('transitionDuration.200'),
                            transitionTimingFunction: theme('transitionTimingFunction.DEFAULT'),
                        },
                        'a:hover': {
                            color: theme('colors.zinc.950'),
                            textDecorationColor: theme('colors.zinc.700'),
                        },
                        'a:visited': {
                            color: theme('colors.zinc.700'),
                            textDecorationColor: theme('colors.zinc.400'),
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
                invert: {
                    css: {
                        color: theme('colors.zinc.300'),
                        li: {
                            color: theme('colors.zinc.300'),
                        },
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
                            color: theme('colors.zinc.300'),
                        },
                        '.prose-caption': {
                            color: theme('colors.zinc.400'),
                        },
                        '.prose-overline': {
                            fontFamily: theme('fontFamily.mono').join(','),
                            color: theme('colors.zinc.400'),
                        },
                        'strong': {
                            color: theme('colors.zinc.100'),
                        },
                        'a': {
                            color: theme('colors.zinc.200'),
                            fontWeight: '500',
                            textDecoration: 'underline',
                            textUnderlineOffset: '0.2em',
                            textDecorationThickness: '1px',
                            textDecorationColor: theme('colors.zinc.500'),
                            transitionProperty: 'color, text-decoration-color',
                            transitionDuration: theme('transitionDuration.200'),
                            transitionTimingFunction: theme('transitionTimingFunction.DEFAULT'),
                        },
                        'a:hover': {
                            color: theme('colors.zinc.50'),
                            textDecorationColor: theme('colors.zinc.400'),
                        },
                        'a:visited': {
                            color: theme('colors.zinc.300'),
                            textDecorationColor: theme('colors.zinc.600'),
                        },
                        'code': {
                            color: theme('colors.zinc.100'),
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