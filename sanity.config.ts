import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { schemaTypes } from './src/schemas'

export default defineConfig({
  name: 'default',
  title: 'Dan Portfolio',
  projectId: '5fq3rcf6',
  dataset: 'production',
  plugins: [structureTool()],
  schema: {
    types: schemaTypes,
  },
})
