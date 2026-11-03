export interface Recommendation {
  name: string
  role: string
  organization: string
  quote: string
  avatar?: string
  initials: string
}

export const recommendations: Recommendation[] = [
  {
    name: 'Lok Lee',
    role: 'Lead Product Designer',
    organization: 'VicRoads',
    avatar: '/images/recommendations/lok-lee.jpg',
    initials: 'LL',
    quote: "Dan's perseverance and focus on customer-centricity inspired all of us.",
  },
  {
    name: 'Gemma Giannakopoulos',
    role: 'New Business & Marketing Coordinator',
    organization: 'Kane Constructions',
    avatar: '/images/recommendations/gemma-giannakopoulos.jpg',
    initials: 'GG',
    quote: "Daniel's creative work is always consistent, new and fresh.",
  },
  {
    name: 'Jack Newman',
    role: 'Creative Director',
    organization: 'Mojo',
    avatar: '/images/recommendations/jack-newman.jpg',
    initials: 'JN',
    quote:
      "He's a fantastic team player and was brilliant at nurturing more junior members of the team.",
  },
]
