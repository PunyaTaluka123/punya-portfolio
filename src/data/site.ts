// Single source of truth for every page and machine-readable file.
// Edit content here only. See README "Edit the content".
// Sources for every claim are listed in FACT_AUDIT.md.

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

  /** Short interface text that isn't a fact about me: rails, buttons, prompts. */
  copy: {
    railTop: ['Data Science + AI', 'NTU Singapore', 'Year 1 · Class of 2030'],
    railBottom: ['Computer vision / ML systems', 'Scroll ↓'],
    ctaProjects: 'See the projects',
    ctaEmail: 'Email me',
    experienceHint: 'Pick a role to read more',
    contactLead: 'Want to talk ML, computer vision or a project? Send me an email.',
  },

  about: [
    "I'm Punya. I study Data Science and AI at NTU Singapore. I'm in year one, class of 2030.",
    'I build ML systems. My focus is computer vision: getting a model to make sense of what a camera sees.',
    "I've spent the last three years building ML for healthcare and sustainability, and teaching younger programmers to build.",
    "Outside of that, I'm into reinforcement learning, quant finance and competitive programming.",
  ],

  /** Shown under About for recruiters. */
  availability:
    "I hold an NTU Student's Pass, so I can intern in Singapore during NTU vacations without a work pass.",

  education: [
    {
      school: 'NTU Singapore',
      detail: 'BSc Data Science and Artificial Intelligence',
      when: 'Year 1 · Class of 2030',
    },
    {
      school: 'IB Diploma',
      detail:
        'Score 42/45. Physics HL, Chemistry HL, Math AA HL (7), Computer Science HL, English SL, Hindi SL.',
      when: 'May 2026',
    },
    {
      school: 'SAT',
      detail: '1560',
      when: '',
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
      org: 'FRC Team Kaizen',
      role: 'Lead Programmer',
      when: '2024 – 2025 · Reefscape season',
      points: [
        "I led the autonomous and control software and set up the team's software workflow.",
        'I built a 15-second autonomous routine that uses real-time camera tracking to line up and score.',
        'I tuned PID loops on the real robot, and picked failure recovery over peak performance.',
        'I coordinated technical and outreach work with the mechanical and strategy teams.',
        'I mentored junior programmers and taught them object-oriented programming in Java.',
        'As a rookie team, we qualified for the FIRST World Championships. We won Excellence in Engineering awards, including one in the Newton Division.',
      ],
    },
    {
      org: 'KDK Softwares',
      role: 'Backend Intern',
      when: 'Summer 2023',
      points: [
        'I migrated a codebase from PHP to Go and shipped production services on a live taxation platform.',
        'I hardened authentication and input validation, closing reported security vulnerabilities.',
        'I debugged production issues and shipped performance fixes under deadline.',
      ],
    },
    {
      org: 'StemCast',
      role: 'Co-founder',
      points: ['A podcast for STEM outreach.'],
    },
    {
      org: 'School coding club, grades 6–8',
      role: 'Mentor',
      points: [
        'I taught web development (HTML and CSS) to middle school students.',
        'I helped beginners build their first working webpages.',
      ],
    },
  ] satisfies Role[],

  projects: [
    {
      slug: 'biogasboosters',
      name: 'BiogasBoosters',
      oneLine: 'A framework to optimize biogas production.',
      body: [
        "It's ML control for anaerobic digesters. Three models work together: XGBoost predicts static yield, an LSTM tracks the reactor's state over time, and a PPO agent makes the control decisions. A Kalman filter smooths the noisy readings.",
        "It runs over a simulated Kafka sensor stream in SIMBA 6.0 (ADM1). The reward has hard safety limits (VFA above 6000 mg/L, pH below 6.8), so the controller can't trade stability for yield.",
        'I wrote the preprocessing too: IQR outlier detection, interpolation for missing readings, and normalisation across 6 reactor variables.',
        'It has a measured 33% increase in biogas production. Deployment is planned for 2027.',
      ],
      facts: [
        { label: 'Years', value: '2022 – 2024' },
        {
          label: 'Approach',
          value: 'XGBoost, LSTM and PPO (reinforcement learning), Kalman filter',
        },
        { label: 'Simulation', value: 'SIMBA 6.0 (ADM1) over a simulated Kafka sensor stream' },
        { label: 'Status', value: 'Deployment planned for 2027' },
        { label: 'Result', value: 'Measured 33% increase in biogas production' },
        { label: 'Recognition', value: 'IRIS National Science Fair 2024 finalist' },
      ],
      tags: ['Reinforcement learning', 'Python', 'PyTorch', 'Kafka'],
      links: [
        { label: 'Code on GitHub', href: 'https://github.com/PunyaTaluka123/BiogasBoosters' },
      ],
    },
    {
      slug: 'basketball-shot-tracking',
      name: 'Basketball Shot Tracking System',
      oneLine: 'A computer vision system that tracks basketball shots.',
      body: [
        'I built it for my IB Computer Science internal assessment. The IA is a solo software project made for a real client and marked on planning, design, development and evaluation, so I took it from idea to working system on my own.',
        'Shot tracking is a hard computer vision problem. The ball is small and fast, it blurs, and it has to be picked out from players, the hoop and a busy background.',
      ],
      facts: [
        { label: 'Area', value: 'Computer vision' },
        {
          label: 'Context',
          value: 'IB Computer Science internal assessment (solo, for a real client)',
        },
        { label: 'My part', value: 'Built it, start to finish' },
      ],
      tags: ['Computer vision'],
      links: [],
    },
    {
      slug: 'dermatrack',
      name: 'DermaTrack',
      oneLine: 'An AI tool for dermatology that I designed.',
      body: [
        'I designed DermaTrack as an assistant for dermatologists during live consultations. It pairs speech-to-text with image standardisation and suggests clinical questions, so doctors spend less time on paperwork.',
        'The vision side is a skin lesion classifier. I benchmarked ResNet50, YOLOv8, Mask R-CNN and MobileNet-V3 in PyTorch on HAM10000: 98% on binary melanoma and 77% across 7 classes, on image-level splits.',
        'I hand-annotated 927 lesion images with dermatologist input and trained a Detectron2 model to outline lesion boundaries.',
        "Image-level splits can put the same lesion in both train and test. So I'm reworking the evaluation: lesion-level splits, sensitivity at a pre-declared specificity, and results by Fitzpatrick skin type.",
      ],
      facts: [
        { label: 'Years', value: '2023 – 2025' },
        { label: 'My part', value: 'Designed it' },
        { label: 'Models', value: 'ResNet50, YOLOv8, Mask R-CNN, MobileNet-V3, Detectron2' },
        { label: 'Data', value: 'HAM10000, plus 927 images I annotated' },
      ],
      tags: ['Computer vision', 'PyTorch', 'Dermatology'],
      links: [],
    },
    {
      slug: 'dengueradar',
      name: 'DengueRadar',
      oneLine: 'Dengue risk forecasting for Singapore, on Databricks.',
      body: [
        'My entry for the DAISI Challenge Singapore. A solo pipeline on Databricks Free Edition pulls NEA and data.gov.sg feeds (dengue clusters, rainfall, temperature) and forecasts dengue risk by planning area.',
        'The output is a Databricks App that gives a plain-English reason for each area, so NEA officers and town councils can act on it without reading model scores.',
      ],
      facts: [
        { label: 'Year', value: '2026' },
        { label: 'Context', value: 'DAISI Challenge Singapore' },
        { label: 'Data', value: 'NEA and data.gov.sg: dengue clusters, rainfall, temperature' },
        { label: 'Stack', value: 'Databricks (Delta Lake, MLflow), Databricks App, Python' },
      ],
      tags: ['Forecasting', 'Databricks', 'Python'],
      links: [],
    },
  ] satisfies Project[],

  otherProjects: ['AgriBot', 'OrthoTrack', 'Sign language detection'],

  recognition: [
    'Finalist, IRIS National Science Fair 2024: BiogasBoosters made the top 50 of 100,000+ projects across India',
    'CERN Beamline for Schools: top 50 international shortlist, for a proposal to develop a perovskite-based scintillator',
  ],

  interests: [
    'ML and AI engineering',
    'Computer vision',
    'Reinforcement learning',
    'Quant finance',
    'Competitive programming',
  ],

  skills: {
    languages: ['Python', 'Go', 'TypeScript', 'Java', 'C++', 'Kotlin', 'PHP'],
    areas: ['Machine learning', 'Computer vision', 'Web development'],
    ml: ['PyTorch', 'Detectron2', 'scikit-learn', 'XGBoost', 'pandas'],
    tools: ['Git', 'Docker', 'PostgreSQL', 'Kafka', 'Databricks', 'Gemini API', 'n8n'],
  },

  spoken: ['English', 'Hindi'],
};

export type Site = typeof site;
