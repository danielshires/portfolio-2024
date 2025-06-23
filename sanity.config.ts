import { defineConfig } from 'sanity'
import { deskTool } from 'sanity/desk'
import { schemaTypes } from './src/schemas'

export default defineConfig({
  name: 'default',
  title: 'Dan Photography Portfolio',
  projectId: '5fq3rcf6',
  dataset: 'production',
  plugins: [deskTool()],
  schema: {
    types: schemaTypes,
  },
})
