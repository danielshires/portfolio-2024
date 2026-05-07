export default {
  name: 'concept',
  title: 'Field Guide entry',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: Rule => Rule.required(),
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: Rule => Rule.required(),
    },
    {
      name: 'summary',
      title: 'Summary',
      type: 'text',
      rows: 3,
    },
    {
      name: 'type',
      title: 'Type',
      type: 'string',
      options: {
        list: [
          { title: 'Observation', value: 'observation' },
          { title: 'Pattern', value: 'pattern' },
          { title: 'Principle', value: 'principle' },
          { title: 'Mental Model', value: 'mental-model' },
          { title: 'Heuristic', value: 'heuristic' },
        ],
      },
    },
    {
      name: 'body',
      title: 'Body',
      type: 'array',
      of: [
        { type: 'block' },
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            {
              name: 'alt',
              type: 'string',
              title: 'Alternative text',
              description: 'Describe the image for screen readers and SEO.',
            },
          ],
        },
      ],
    },
    {
      name: 'signals',
      title: 'Signals',
      description: 'Examples of where this pattern shows up (short phrases).',
      type: 'array',
      of: [{ type: 'string' }],
    },
    {
      name: 'tensions',
      title: 'Tensions',
      description: 'Tradeoffs or contradictions (short phrases).',
      type: 'array',
      of: [{ type: 'string' }],
    },
    {
      name: 'relatedConcepts',
      title: 'Related concepts',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'concept' }] }],
    },
    {
      name: 'aliases',
      title: 'Aliases',
      type: 'array',
      of: [{ type: 'string' }],
    },
    {
      name: 'featured',
      title: 'Featured',
      type: 'boolean',
      initialValue: false,
    },
    {
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
      description: 'Required on the site: unpublished concepts do not appear.',
    },
  ],
  preview: {
    select: {
      title: 'title',
      conceptType: 'type',
      publishedAt: 'publishedAt',
    },
    prepare(selection) {
      const { title, conceptType, publishedAt } = selection
      const subParts = []
      if (conceptType) subParts.push(conceptType.replace('-', ' '))
      if (!publishedAt) subParts.push('Draft')
      return {
        title,
        subtitle: subParts.length ? subParts.join(' · ') : undefined,
      }
    },
  },
  orderings: [
    {
      title: 'Title A–Z',
      name: 'titleAsc',
      by: [{ field: 'title', direction: 'asc' }],
    },
    {
      title: 'Published (newest)',
      name: 'publishedAtDesc',
      by: [{ field: 'publishedAt', direction: 'desc' }],
    },
  ],
}
