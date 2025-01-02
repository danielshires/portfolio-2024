/** @type {import('tailwindcss').Config} */

export default {
    content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
    theme: {
        extend: {
            fontFamily: {
                'sans': ['"Instrument Sans", "Inter"', 'sans-serif'],
                'serif': ['"Instrument Serif", Serif'],
                'mono': ["thermal"]
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
            darkMode: 'selector',
        },
    },
    plugins: [require('@tailwindcss/typography')],
    darkMode: 'selector',

}