export interface Recommendation {
  name: string
  role: string
  organization: string
  relationship: string
  date: string
  quote: string
  linkedinUrl?: string
}

export const recommendations: Recommendation[] = [
  {
    name: 'Lok Lee',
    role: 'Lead Product Designer',
    organization: 'VicRoads',
    relationship: 'Worked together',
    date: 'December 2024',
    quote:
      "I had the absolute pleasure of working alongside Dan on the CommBank Yello initiative. It was a challenging project with a lot of stakeholder pressure and tight deadlines. However, Dan's perseverance and focus on customer-centricity inspired all of us. I was impressed by how he consistently stayed creative and quickly generated wide-ranging concepts despite distractions. He took design seriously and was always diligent in laying out his rationale clearly so others could participate in the decision-making process. Plus, he was patient and nurturing with the junior designers he mentored. Any digital team would be lucky to have him!",
  },
  {
    name: 'Gemma Giannakopoulos',
    role: 'New Business & Marketing Coordinator',
    organization: 'Kane Constructions',
    relationship: 'Worked together',
    date: 'May 2020',
    quote:
      "Daniel is a creative and talented graphic designer and a true collaborative team member. Daniel's creative work is always consistent, new and fresh. His work is never the same as he always has his thinking cap on to come up with new ideas. Daniel worked on many projects creating digital and traditional marketing creatives for the Scenic campaigns and product launches. I strongly recommend Daniel as an experienced creative graphic designer.",
  },
  {
    name: 'Jack Newman',
    role: 'Creative Director',
    organization: 'Mojo',
    relationship: 'Managed Daniel',
    date: 'January 2018',
    quote:
      "I managed Dan for 6 months whilst he worked at MADE.COM. He has an excellent range of design and artworking skills as well as a passion for typography in all forms. He's a fantastic team player and was brilliant at nurturing more junior members of the team. I wish him well in all his future endeavors.",
  },
  {
    name: 'Huw Thomas',
    role: 'Marketing & Communications Director',
    organization: 'Norwood',
    relationship: 'Managed Daniel',
    date: 'May 2016',
    quote:
      'I worked with Daniel at the University of East London, where he did a great job of creating content for a very complex website migration project. Daniel combines a strong eye for design with excellent communication skills and a collaborative approach.',
  },
]
