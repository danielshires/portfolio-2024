export default {
  name: 'project',
  title: 'Project',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule: any) => Rule.required()
    },
    {
      name: 'subtitle',
      title: 'Subtitle',
      type: 'string',
      description: 'Optional subheading for the project'
    },
    {
      name: 'linkBehavior',
      title: 'Link behavior',
      type: 'string',
      initialValue: 'internal',
      options: {
        list: [
          { title: 'Case study page on this site', value: 'internal' },
          { title: 'Link out (e.g. Figma, Medium)', value: 'external' },
        ],
        layout: 'radio',
      },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'externalUrl',
      title: 'External URL',
      type: 'url',
      description:
        'When “Link out” is selected, visitors go here from project lists instead of opening a case study page.',
      hidden: ({ parent }: any) => parent?.linkBehavior !== 'external',
      validation: (Rule: any) =>
        Rule.uri({ allowRelative: false, scheme: ['http', 'https'] }).custom((url: string | undefined, context: any) => {
          if (context.parent?.linkBehavior === 'external') {
            if (!url?.trim()) return 'Required for external links'
          }
          return true
        }),
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule: any) => Rule.required()
    },
    {
      name: 'client',
      title: 'Client',
      type: 'string',
      description: 'Client or company name'
    },
    {
      name: 'role',
      title: 'Role',
      type: 'array',
      of: [{type: 'string'}],
      description: 'Your roles in this project (e.g., "UI Designer", "Product Designer")'
    },
    {
      name: 'team',
      title: 'Team',
      type: 'array',
      of: [{type: 'string'}],
      description: 'Team members and collaborators'
    },
    {
      name: 'year',
      title: 'Year',
      type: 'number',
      validation: (Rule: any) => Rule.min(2000).max(new Date().getFullYear() + 1)
    },
    {
      name: 'duration',
      title: 'Duration',
      type: 'string',
      description: 'Project duration (e.g., "4 sprints", "3 months")'
    },
    {
      name: 'heroImage',
      title: 'Hero Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      description: 'Main hero image for the project'
    },
    {
      name: 'outcomes',
      title: 'Outcomes',
      type: 'array',
      of: [{type: 'string'}],
      description:
        'Key outcomes or achievements (recommended for internal case studies; optional once you publish a write-up externally)',
      validation: (Rule: any) =>
        Rule.custom((outcomes: string[] | undefined, context: any) => {
          const behavior = context.parent?.linkBehavior || 'internal'
          if (behavior === 'external') return true
          if (!outcomes?.length) return 'Add at least one outcome for internal case studies'
          if (outcomes.length > 4) return 'At most 4 outcomes'
          return true
        }),
      hidden: ({ parent }: any) => parent?.linkBehavior === 'external',
    },
    {
      name: 'problem',
      title: 'Problem Statement',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [
            {title: 'Normal', value: 'normal'},
            {title: 'H4', value: 'h4'},
          ],
          marks: {
            decorators: [
              {title: 'Strong', value: 'strong'},
              {title: 'Emphasis', value: 'em'},
            ],
          },
        }
      ],
      description: 'Description of the problem this project solves',
      hidden: ({ parent }: any) => parent?.linkBehavior === 'external',
    },
    {
      name: 'solution',
      title: 'Solution',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [
            {title: 'Normal', value: 'normal'},
            {title: 'H4', value: 'h4'},
          ],
          marks: {
            decorators: [
              {title: 'Strong', value: 'strong'},
              {title: 'Emphasis', value: 'em'},
            ],
          },
          lists: [
            {title: 'Bullet', value: 'bullet'},
            {title: 'Number', value: 'number'}
          ]
        }
      ],
      description: 'How you solved the problem - can include lists',
      hidden: ({ parent }: any) => parent?.linkBehavior === 'external',
    },
    {
      name: 'images',
      title: 'Project Images',
      type: 'array',
      of: [
        {
          type: 'image',
          options: {
            hotspot: true,
          },
          fields: [
            {
              name: 'alt',
              type: 'string',
              title: 'Alternative text',
              description: 'Important for SEO and accessibility.',
              validation: (Rule: any) => Rule.required()
            },
            {
              name: 'caption',
              type: 'string',
              title: 'Caption',
              description: 'Optional caption for the image'
            }
          ]
        }
      ],
      description: 'Screenshots, mockups, and other project visuals',
      hidden: ({ parent }: any) => parent?.linkBehavior === 'external',
    },
    {
      name: 'relatedProjects',
      title: 'Related Projects',
      type: 'array',
      of: [{type: 'reference', to: {type: 'project'}}],
      description: 'Other projects to display at the bottom (2-3 recommended)',
      hidden: ({ parent }: any) => parent?.linkBehavior === 'external',
      validation: (Rule: any) => Rule.max(3)
    },
    {
      name: 'featured',
      title: 'Featured Project',
      type: 'boolean',
      description: 'Display this project prominently on the homepage'
    },
    {
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    },
    {
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{type: 'string'}],
      description: 'Tags for categorizing projects (e.g., "UI/UX", "Web Design", "Mobile")'
    }
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'subtitle',
      media: 'heroImage',
      client: 'client',
      behavior: 'linkBehavior',
      url: 'externalUrl',
    },
    prepare(selection: any) {
      const {title, subtitle, client, media, behavior, url} = selection
      const ext = behavior === 'external'
      const sub = client
        ? `${client}${subtitle ? ` • ${subtitle}` : ''}`
        : subtitle
      return {
        title: title,
        subtitle: ext ? (url ? `${sub || ''}${sub ? ' · ' : ''}External · ${url}`.trim() : 'External link') : sub,
        media: media,
      }
    }
  },
  orderings: [
    {
      title: 'Newest first',
      name: 'publishedAtDesc',
      by: [
        {field: 'publishedAt', direction: 'desc'}
      ]
    },
    {
      title: 'Oldest first',
      name: 'publishedAtAsc',
      by: [
        {field: 'publishedAt', direction: 'asc'}
      ]
    },
    {
      title: 'Title A-Z',
      name: 'titleAsc',
      by: [
        {field: 'title', direction: 'asc'}
      ]
    }
  ]
}