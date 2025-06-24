export default {
  name: 'project',
  title: 'Project',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: Rule => Rule.required()
    },
    {
      name: 'subtitle',
      title: 'Subtitle',
      type: 'string',
      description: 'Optional subheading for the project'
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: Rule => Rule.required()
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
      validation: Rule => Rule.min(2000).max(new Date().getFullYear() + 1)
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
      description: 'Key outcomes, stats, or achievements (2-4 bullet points)',
      validation: Rule => Rule.max(4).min(1)
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
      description: 'Description of the problem this project solves'
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
      description: 'How you solved the problem - can include lists'
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
              validation: Rule => Rule.required()
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
      description: 'Screenshots, mockups, and other project visuals'
    },
    {
      name: 'relatedProjects',
      title: 'Related Projects',
      type: 'array',
      of: [{type: 'reference', to: {type: 'project'}}],
      description: 'Other projects to display at the bottom (2-3 recommended)',
      validation: Rule => Rule.max(3)
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
      client: 'client'
    },
    prepare(selection) {
      const {title, subtitle, client, media} = selection
      return {
        title: title,
        subtitle: client ? `${client}${subtitle ? ` • ${subtitle}` : ''}` : subtitle,
        media: media
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