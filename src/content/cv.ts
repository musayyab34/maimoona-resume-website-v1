/*
 * Single source of truth for every fact on the site. All entries come from
 * Maimoona's CV — nothing invented. Formula strings use `_n` for subscripts
 * and are rendered through <Formula/>.
 *
 * Privacy (§9 of the brief): no phone numbers, no referee contact details.
 * Supervisors are named as public academic record only.
 */

export type HalideVariant = 'Cl' | 'Br' | 'F'

export const identity = {
  name: 'Maimoona Mushtaq',
  tagline: 'Exploring matter at the smallest scale to solve energy problems at the largest.',
  role: 'Materials scientist',
  position: 'MS Materials Science candidate · Northwestern Polytechnical University · Xi’an',
  location: 'Xi’an, Shaanxi, China',
  email: 'maimoonamushtaq232@gmail.com',
  linkedin: 'https://www.linkedin.com/in/maimoona-mushtaq/',
}

export interface EducationEntry {
  id: string
  degree: string
  institution: string
  place: string
  period: string
  courses: string[]
  stackLabel: string
  stackNote: string
}

export const education: EducationEntry[] = [
  {
    id: 'bs',
    degree: 'BS Physics',
    institution: 'Fatima Jinnah Women University',
    place: 'Rawalpindi, Pakistan',
    period: '2020–2024',
    courses: [
      'Condensed Matter Physics',
      'Solid State Physics',
      'Quantum Computation',
      'Material Science',
    ],
    stackLabel: 'substrate',
    stackNote: 'the layer everything after it is built on',
  },
  {
    id: 'ms',
    degree: 'MS Materials Science',
    institution: 'Northwestern Polytechnical University',
    place: 'Xi’an, China',
    period: '2025–2028',
    courses: [
      'New Carbon Energy Materials',
      'Advanced Energy Materials',
      'Electron Microscopy and Analysis for Materials',
    ],
    stackLabel: 'absorber',
    stackNote: 'the layer where light becomes work',
  },
]

export const research = {
  role: 'Research Internee',
  org: 'Allama Iqbal Open University',
  place: 'Islamabad, Pakistan',
  period: 'Nov 2023 — present',
  points: [
    'Anode materials for lithium-ion batteries.',
    'Collaborated with PhD researchers on lithium-ion simulation results — cycle life and capacity.',
    'Guided students on DFT, battery, and perovskite solar cell research.',
    'Onboarded new internees to laboratory protocols and research methodology.',
  ],
  tools: ['VASP', 'VESTA', 'Materials Studio', 'XShell', 'Linux', 'Python'],
}

export const thesis = {
  title:
    'Non-leaded KSnX_3 [X = Cl, Br, F] based perovskite solar cell: A DFT study along with SCAPS simulation',
  degree: 'BS thesis',
  institution: 'Fatima Jinnah Women University',
  supervisor: 'Dr. Nawishta Jabeen',
  coSupervisor: 'Dr. Abdul Jalil',
  integrityNote:
    'Structural visualization — cubic ABX_3 prototype geometry. No computed values are shown.',
}

export interface VariantInfo {
  symbol: HalideVariant
  name: string
  formula: string
  caption: string
}

export const variants: Record<HalideVariant, VariantInfo> = {
  Cl: {
    symbol: 'Cl',
    name: 'chlorine',
    formula: 'KSnCl_3',
    caption: 'Chlorine on the halide site — the mid-series halide of the three studied.',
  },
  Br: {
    symbol: 'Br',
    name: 'bromine',
    formula: 'KSnBr_3',
    caption: 'Bromine on the halide site — the largest halide studied; the most open lattice.',
  },
  F: {
    symbol: 'F',
    name: 'fluorine',
    formula: 'KSnF_3',
    caption: 'Fluorine on the halide site — the smallest halide; the tightest lattice.',
  },
}

export const variantOrder: HalideVariant[] = ['Cl', 'Br', 'F']

export interface SkillGroup {
  id: string
  label: string
  items: string[]
}

export const skillGroups: SkillGroup[] = [
  {
    id: 'computational',
    label: 'Computational',
    items: ['VASP', 'CASTEP', 'SCAPS', 'Materials Studio', 'Quantum & DFT workflows'],
  },
  {
    id: 'visualization',
    label: 'Visualization & analysis',
    items: ['VESTA', 'Crystal Maker', 'OriginLab', 'GSAS', "X'Pert HighScore"],
  },
  {
    id: 'programming',
    label: 'Programming & environment',
    items: ['Python (NumPy, SciPy)', 'MATLAB', 'Mathematica', 'Linux', 'LaTeX'],
  },
  {
    id: 'practice',
    label: 'Research practice',
    items: [
      'Experimental design',
      'Materials characterization',
      'Literature review',
      'Scientific writing',
      'Publication process',
    ],
  },
]

export const certifications = [
  {
    name: 'Lithium Based Batteries',
    issuer: 'Arizona State University',
    date: '2024',
    note: 'Primary lithium chemistries — Li-SO_2, Li-SOCl_2, Li-MnO_2 — electrode materials, solid electrolytes, all-solid-state designs.',
  },
  {
    name: 'MATLAB Onramp',
    issuer: 'MathWorks',
    date: '2024',
    note: 'Arrays, matrix operations, plotting, and programming fundamentals.',
  },
  {
    name: 'EV Engineering Job Simulation',
    issuer: 'Ford · Forage',
    date: '2024',
    note: 'Battery chemistry vs. capacity analysis; PID controller tuning in Python.',
  },
  {
    name: 'Introduction to Data Science Job Simulation',
    issuer: 'Commonwealth Bank · Forage',
    date: '2024',
    note: 'Data engineering pipelines and anonymization of personal data.',
  },
]

export const otherExperience = [
  {
    role: 'Freelance Content Writer',
    org: 'Fiverr',
    period: '2023 — present',
    note: '120+ clients. Scoping, drafting, and delivering to brief — evidence the writing in a publication pipeline will be done well.',
  },
  {
    role: 'Teaching Internee',
    org: 'Modern College of Commerce and Sciences, Rawalpindi',
    period: 'Aug — Sep 2023',
    note: 'Lesson planning, classroom teaching, and lab projects with 9th- and 10th-grade students.',
  },
]

export const leadership = {
  role: 'Head of Advertisement and Media Team',
  org: 'Department of Physics, FJWU',
  period: 'Nov 2020 — Sep 2022',
  note: 'Two years leading design and event logistics — event cards, brochures, flyers; conference coordination.',
}

export const languages = [
  { lang: 'Urdu', level: 'native', detail: 'mother tongue' },
  { lang: 'Punjabi', level: 'native', detail: 'mother tongue' },
  { lang: 'English', level: 'IELTS 8', detail: 'band 8.0' },
  { lang: 'Chinese', level: 'HSK 3', detail: 'studying in Xi’an' },
  { lang: 'Japanese', level: 'JLPT N3', detail: '' },
  { lang: 'German', level: 'A1', detail: '' },
]

export const closingLine = 'Understanding matter. Designing better energy materials.'
