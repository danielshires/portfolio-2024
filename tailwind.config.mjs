/** @type {import('tailwindcss').Config} */

// theme() gives arrays in Tailwind 3 and may give strings in 4, so the typography config reads
// font stacks and font sizes through these.
const fontStack = (value) => (Array.isArray(value) ? value.join(',') : value)
const sizeOf = (value) => (Array.isArray(value) ? value[0] : value)

export default {
    content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
    theme: {
        extend: {
            colors: {
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
            keyframes: {
                /**
                 * Exit in arrow direction + fade, jump in from opposite side, settle home.
                 * External: out up-right → in from bottom-left.
                 */
                /** % translate is relative to the SVG box; parent has overflow:hidden so motion reads as in/out of slot. */
                'link-icon-external-wrap': {
                    '0%': { transform: 'translate(0, 0)', opacity: '1' },
                    '26%': { transform: 'translate(115%, -115%)', opacity: '0' },
                    '38%': { transform: 'translate(-115%, 115%)', opacity: '0' },
                    '100%': { transform: 'translate(0, 0)', opacity: '1' },
                },
                'link-icon-right-wrap': {
                    '0%': { transform: 'translateX(0)', opacity: '1' },
                    '26%': { transform: 'translateX(130%)', opacity: '0' },
                    '38%': { transform: 'translateX(-130%)', opacity: '0' },
                    '100%': { transform: 'translateX(0)', opacity: '1' },
                },
                'link-icon-left-wrap': {
                    '0%': { transform: 'translateX(0)', opacity: '1' },
                    '26%': { transform: 'translateX(-130%)', opacity: '0' },
                    '38%': { transform: 'translateX(130%)', opacity: '0' },
                    '100%': { transform: 'translateX(0)', opacity: '1' },
                },
                'engagement-pop': {
                    '0%': { transform: 'scale(1)' },
                    '35%': { transform: 'scale(1.28)' },
                    '100%': { transform: 'scale(1)' },
                },
                'engagement-burst': {
                    '0%': { transform: 'translate(0, 0) scale(0.4)', opacity: '0.9' },
                    '100%': { transform: 'translate(var(--burst-x, 0px), -18px) scale(0.9)', opacity: '0' },
                },
                'engagement-blink': {
                    '0%, 100%': { transform: 'scaleY(1)' },
                    '40%': { transform: 'scaleY(0.15)' },
                },
                'engagement-tick': {
                    '0%': { transform: 'translateY(0.35em)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
            },
            animation: {
                'link-icon-external-wrap':
                    'link-icon-external-wrap 0.72s cubic-bezier(0.4, 0, 0.2, 1) both',
                'link-icon-right-wrap': 'link-icon-right-wrap 0.65s cubic-bezier(0.4, 0, 0.2, 1) both',
                'link-icon-left-wrap': 'link-icon-left-wrap 0.65s cubic-bezier(0.4, 0, 0.2, 1) both',
                'engagement-pop': 'engagement-pop 0.42s cubic-bezier(0.2, 0.9, 0.3, 1.2) both',
                'engagement-burst': 'engagement-burst 0.65s ease-out both',
                'engagement-blink': 'engagement-blink 0.4s ease-in-out both',
                'engagement-tick': 'engagement-tick 0.28s cubic-bezier(0.2, 0.8, 0.2, 1) both',
            },
            typography: (theme) => ({
                DEFAULT: {
                    css: {
                        // Comfortable reading measure when prose has no explicit max-w-* (journal uses max-w-[65ch] too).
                        maxWidth: '65ch',
                        article: {
                            maxWidth: '60ch',
                        },
                        li: {
                            fontSize: sizeOf(theme('fontSize.base')),
                            lineHeight: theme('lineHeight.relaxed'),
                            color: theme('colors.zinc.900'),
                        },
                        'li::marker': {
                            color: 'rgb(var(--zinc-950))',
                        },
                        h1: {
                            fontFamily: fontStack(theme('fontFamily.sans')),
                            fontWeight: '400',
                            fontSize: sizeOf(theme('fontSize.3xl')),
                            lineHeight: theme('lineHeight.snug'),
                            letterSpacing: theme('letterSpacing.tight'),
                            color: theme('colors.zinc.900'),
                        },
                        h2: {
                            fontFamily: fontStack(theme('fontFamily.sans')),
                            fontWeight: '400',
                            fontSize: sizeOf(theme('fontSize.2xl')),
                            lineHeight: theme('lineHeight.snug'),
                            color: theme('colors.zinc.900'),
                        },
                        h3: {
                            fontFamily: fontStack(theme('fontFamily.sans')),
                            fontWeight: '400',
                            fontSize: sizeOf(theme('fontSize.xl')),
                            lineHeight: theme('lineHeight.snug'),
                            color: theme('colors.zinc.900'),
                        },
                        h4: {
                            fontFamily: fontStack(theme('fontFamily.sans')),
                            fontWeight: '400',
                            fontSize: sizeOf(theme('fontSize.lg')),
                            lineHeight: theme('lineHeight.snug'),
                            color: theme('colors.zinc.900'),
                        },
                        h5: {
                            fontFamily: fontStack(theme('fontFamily.sans')),
                            fontWeight: '600',
                            fontSize: sizeOf(theme('fontSize.base')),
                            lineHeight: theme('lineHeight.snug'),
                            color: theme('colors.zinc.900'),
                        },
                        p: {
                            fontFamily: fontStack(theme('fontFamily.sans')),
                            fontWeight: '400',
                            fontSize: sizeOf(theme('fontSize.base')),
                            color: theme('colors.zinc.900'),
                            lineHeight: theme('lineHeight.relaxed'),

                        },
                        '.prose-caption': {
                            fontFamily: fontStack(theme('fontFamily.sans')),
                            fontWeight: '400',
                            fontSize: sizeOf(theme('fontSize.sm')),
                            color: theme('colors.zinc.900'),
                        },
                        '.prose-overline': {
                            fontFamily: fontStack(theme('fontFamily.mono')),
                            fontWeight: '400',
                            fontSize: sizeOf(theme('fontSize.xs')),
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
                            textDecoration: 'none',
                            transitionProperty: 'color, text-decoration-color, text-decoration-line',
                            transitionDuration: theme('transitionDuration.200'),
                            transitionTimingFunction: theme('transitionTimingFunction.DEFAULT'),
                        },
                        'a:hover': {
                            color: theme('colors.zinc.950'),
                            textDecoration: 'underline',
                            textUnderlineOffset: '0.2em',
                            textDecorationThickness: '1px',
                            textDecorationColor: theme('colors.zinc.700'),
                        },
                        'a:visited': {
                            color: theme('colors.zinc.700'),
                            textDecoration: 'none',
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
                            fontFamily: fontStack(theme('fontFamily.mono')),
                            color: theme('colors.zinc.400'),
                        },
                        'strong': {
                            color: theme('colors.zinc.100'),
                        },
                        'a': {
                            color: theme('colors.zinc.200'),
                            fontWeight: '500',
                            textDecoration: 'none',
                            transitionProperty: 'color, text-decoration-color, text-decoration-line',
                            transitionDuration: theme('transitionDuration.200'),
                            transitionTimingFunction: theme('transitionTimingFunction.DEFAULT'),
                        },
                        'a:hover': {
                            color: theme('colors.zinc.50'),
                            textDecoration: 'underline',
                            textUnderlineOffset: '0.2em',
                            textDecorationThickness: '1px',
                            textDecorationColor: theme('colors.zinc.400'),
                        },
                        'a:visited': {
                            color: theme('colors.zinc.300'),
                            textDecoration: 'none',
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