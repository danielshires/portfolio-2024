import { defineConfig } from 'sanity'
import { deskTool } from 'sanity/desk'
import { visionTool } from '@sanity/vision'
import { schemaTypes } from './src/schemas'

export default defineConfig({
  name: 'default',
  title: 'Dan Photography Portfolio',
  projectId: process.env.SANITY_PROJECT_ID || '',
  dataset: process.env.SANITY_DATASET || 'production',
  basePath: '/studio',
  plugins: [deskTool(), visionTool()],
  schema: {
    types: schemaTypes,
  },
  studio: {
    components: {
      // You can add custom components here if needed
    },
  },
  document: {
    unstable_comments: {
      enabled: true,
    },
  },
})
