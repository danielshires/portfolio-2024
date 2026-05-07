export default {
    name: 'siteSettings',
    title: 'Site Settings',
    type: 'document',
    fields: [
        {
            name: 'categories',
            title: 'Categories',
            type: 'array',
            of: [{ type: 'string' }],
            description: 'Controlled list of categories for posts (e.g. Design, AI, Growth, etc.)'
        },
        {
            name: 'defaultOgImage',
            title: 'Default Open Graph Image',
            type: 'image',
            description: 'Fallback OG image for social sharing'
        }
        // Add more global fields as needed
    ]
}
