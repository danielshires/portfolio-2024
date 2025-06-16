import { images } from './images'

export const projectsData = {
  featuredProject: {
    projectImage: {
      src: images.background,
      alt: 'CommBank Yello project showcase - A modern banking interface design',
      width: 2600,
      height: 900,
      format: 'webp',
      quality: 80,
    },
    title: 'CommBank Yello',
    heading: "Reimagine customer loyalty for Australia's largest bank",
    description:
      'CommBank Yello is CommBanks customer engagement and loyalty program. As the Senior UX Designer, I led the design and delivery of Yello 2.0, the next iteration of CommBank Yello',
    outcomes: [
      { value: '6.5m', label: 'Engaged customers' },
      { value: '+32', label: 'Net promoter score' },
      { value: '2m', label: 'Visits per month' },
    ],
    projectUrl: '/design/commbankyello',
  },
  projects: [
    {
      projectImage: {
        src: images.background,
        alt: 'NetBank project showcase',
        width: 2600,
        height: 900,
      },
      title: 'NetBank',
      heading: 'Visual uplift of the NetBank homepage',
      description: 'A brief description of the first project that showcases some interesting work.',
      projectUrl: '/design/project-one',
    },
    {
      projectImage: {
        src: images.background,
        alt: 'Formbay project showcase',
        width: 2600,
        height: 900,
      },
      title: 'Formbay',
      heading: 'Project Two',
      description: 'Another fascinating project that demonstrates creative problem-solving.',
      projectUrl: '/design/project-two',
    },
  ],
}
