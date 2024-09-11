/** @type {import('tailwindcss').Config} */
export default {
    content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
    theme: {
        extend: {
            fontFamily: {
                'sans': ['"Graphik", "Inter"', 'sans-serif'],
                'serif': ['"Merriweather", Serif']
            },
            typography: (theme) => ({
                DEFAULT: {
                    css: {
                        maxWidth: '100vw',
                        p: {
                            fontSize: '1.25rem', // key can be in camelCase...
                            fontFamily: 'Merriweather',
                            fontWeight: 300,
                        },
                        article: {
                            maxWidth: '60ch',
                        }

                    }
                }
            })
        },
    },
    plugins: [require('@tailwindcss/typography')],
}