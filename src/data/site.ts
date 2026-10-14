// Single source of truth for every page and machine-readable file.
// Edit content here only. See README "Editing content".

export interface Project {
  slug: string;
  name: string;
  /** One line, used on cards, #glance, llms.txt. */
  oneLine: string;
  /** Short paragraphs for the project page. */
  body: string[];
  facts: { label: string; value: string }[];
  tags: string[];
  links: { label: string; href: string }[];
}

export interface Role {
  org: string;
  role: string;
  when?: string;
  points: string[];
}

export const site = {
  name: 'Punya Taluka',
  firstName: 'Punya',
  roleLine:
    'Data Science and AI student at NTU Singapore. I build ML systems, with a focus on computer vision.',
  jobTitle: 'Data Science and AI student',
  school: 'NTU Singapore',
  schoolFull: 'Nanyang Technological University (NTU Singapore)',
  description:
    'Punya Taluka is a Data Science and AI student at NTU Singapore who builds ML systems, with a focus on computer vision.',
  email: 'talukapunya.1@gmail.com',
  links: {
    github: 'https://github.com/PunyaTaluka123',
    linkedin: 'https://www.linkedin.com/in/punyataluka/',
  },
  handles: { github: 'PunyaTaluka123', linkedin: 'punyataluka' },

  about: [
    "I'm Punya. I study Data Science and AI at NTU Singapore. I'm in year one, class of 2030.",
    'I build ML systems. My focus is computer vision: getting a model to make sense of what a camera sees.',
    "Outside of that, I'm into reinforcement learning, quant finance and competitive programming.",
  ],

  education: [
    {
      school: 'NTU Singapore',
      detail: 'BSc Data Science and Artificial Intelligence',
      when: 'Year 1 · Class of 2030',
    },
    {
      school: 'IB Diploma',
      detail: 'Score 42/45. Math AA HL: 7.',
      when: 'May 2026',
    },
  ],

  experience: [
    {
      org: 'Datathon organizing team',
      role: 'Academic Lead',
      when: 'October 2026',
      points: [
        'More than 450 participants.',
        'I designed the problem prompts.',
        'I built the live leaderboard website.',
      ],
    },
    {
      org: 'KDK Softwares',
      role: 'Intern',
      points: [
        'I worked on backend performance and security.',
        'I worked on a migration from PHP to Go.',
      ],
    },
    {
      org: 'FRC Team Kaizen',
      role: 'Lead Programmer',
      when: 'Reefscape 2025 season',
      points: [
        'I coordinated technical and outreach work.',
        'As a rookie team, we qualified for the FIRST World Championships.',
        'We won Excellence in Engineering awards, including one in the Newton Division.',
      ],
    },
    {
      org: 'StemCast',
      role: 'Co-founder',
      points: ['A podcast for STEM outreach.'],
    },
    {
      org: 'Middle school mentoring',
      role: 'Mentor',
      points: ['I taught web development to middle school students.'],
    },
  ] satisfies Role[],

  projects: [
    {
      slug: 'biogasboosters',
      name: 'BiogasBoosters',
      oneLine: 'A framework to optimize biogas production.',
      body: [
        "Under the hood it's a reinforcement learning setup. There's a simulated digester environment and a PPO agent with an LSTM feature extractor. A Kalman filter smooths the noisy readings. An XGBoost model gives a baseline to compare against.",
        'Deployment is planned for 2027. The target is a 33% increase in biogas production.',
      ],
      facts: [
        { label: 'Approach', value: 'Reinforcement learning (PPO), LSTM, Kalman filter, XGBoost' },
        { label: 'Status', value: 'Deployment planned for 2027' },
        { label: 'Target', value: 'Targeting a 33% increase in biogas production' },
      ],
      tags: ['Reinforcement learning', 'Python', 'PyTorch'],
      links: [
        { label: 'Code on GitHub', href: 'https://github.com/PunyaTaluka123/BiogasBoosters' },
      ],
    },
    {
      slug: 'basketball-shot-tracking',
      name: 'Basketball Shot Tracking System',
      oneLine: 'A computer vision system that tracks basketball shots.',
      body: ['I built it for my IB Computer Science internal assessment.'],
      facts: [
        { label: 'Area', value: 'Computer vision' },
        { label: 'My part', value: 'Built it' },
      ],
      tags: ['Computer vision'],
      links: [],
    },
    {
      slug: 'dermatrack',
      name: 'DermaTrack',
      oneLine: 'An AI tool for dermatology that I designed.',
      body: [],
      facts: [
        { label: 'Area', value: 'AI, dermatology' },
        { label: 'My part', value: 'Designed it' },
      ],
      tags: ['AI', 'Dermatology'],
      links: [],
    },
  ] satisfies Project[],

  otherProjects: ['AgriBot', 'OrthoTrack', 'Sign language detection'],

  recognition: ['Finalist, IRIS National Science Fair'],

  interests: [
    'ML and AI engineering',
    'Computer vision',
    'Reinforcement learning',
    'Quant finance',
    'Competitive programming',
  ],

  skills: {
    languages: ['Go', 'Python', 'PHP'],
    areas: ['Machine learning', 'Computer vision', 'Web development'],
  },
};

export type Site = typeof site;
