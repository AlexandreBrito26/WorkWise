import type { StoredCandidate } from './types'

const DAY = 24 * 60 * 60 * 1000

interface SeedInput extends Omit<StoredCandidate, 'id' | 'resumeText' | 'createdAt' | 'feedbackSentAt'> {
  createdDaysAgo: number
  feedbackDaysAgo: number // < 0 = feedback ainda não enviado
}

const raw: SeedInput[] = [
  {
    name: 'Marina Duarte', email: 'marina@example.com', role: 'Front-end Developer', score: 91, status: 'shortlist',
    skills: [{ name: 'React', match: 95 }, { name: 'TypeScript', match: 90 }, { name: 'SASS', match: 85 }],
    experience: [
      { company: 'Nuvem Digital', title: 'Front-end Sênior', period: '2022 – 2025' },
      { company: 'Studio Pixel', title: 'Desenvolvedora Web', period: '2019 – 2022' },
    ],
    summary: {
      pt: 'Perfil forte em interfaces React com foco em acessibilidade e testes.',
      en: 'Strong React UI profile with a focus on accessibility and testing.',
    },
    createdDaysAgo: 5, feedbackDaysAgo: 2,
  },
  {
    name: 'Rafael Nogueira', email: 'rafael@example.com', role: 'Java Back-end Developer', score: 84, status: 'review',
    skills: [{ name: 'Java', match: 92 }, { name: 'Spring Boot', match: 88 }, { name: 'PostgreSQL', match: 70 }],
    experience: [
      { company: 'FinCore', title: 'Back-end Pleno', period: '2021 – 2025' },
      { company: 'Logix', title: 'Estagiário de TI', period: '2020 – 2021' },
    ],
    summary: {
      pt: 'Boa base em Spring Boot e APIs REST; experiência limitada com mensageria.',
      en: 'Solid Spring Boot and REST API base; limited messaging experience.',
    },
    createdDaysAgo: 3, feedbackDaysAgo: -1,
  },
  {
    name: 'Camila Prado', email: 'camila@example.com', role: 'Full-stack Developer', score: 0, status: 'new',
    skills: [{ name: 'Node.js', match: 78 }, { name: 'React', match: 74 }, { name: 'Docker', match: 55 }],
    experience: [{ company: 'Agência Norte', title: 'Full-stack Júnior', period: '2023 – 2025' }],
    summary: {
      pt: 'Perfil versátil em início de carreira, com potencial de crescimento.',
      en: 'Versatile early-career profile with growth potential.',
    },
    createdDaysAgo: 1, feedbackDaysAgo: -1,
  },
  {
    name: 'Bruno Faria', email: 'bruno@example.com', role: 'QA Engineer', score: 58, status: 'rejected',
    skills: [{ name: 'Cypress', match: 66 }, { name: 'Jest', match: 60 }],
    experience: [{ company: 'TestLab', title: 'Analista de QA', period: '2022 – 2025' }],
    summary: {
      pt: 'Experiência em testes manuais; pouca automação para a vaga atual.',
      en: 'Manual testing experience; little automation for the current role.',
    },
    createdDaysAgo: 6, feedbackDaysAgo: 3,
  },
]

/** Dados de demonstração (os mesmos que o back-end criava com o banco vazio). */
export function buildSeed(now = Date.now()): StoredCandidate[] {
  return raw.map(({ createdDaysAgo, feedbackDaysAgo, ...c }, i) => ({
    ...c,
    id: String(i + 1),
    resumeText:
      `${c.role}. Habilidades: ${c.skills.map((s) => s.name).join(', ')}. Experiência: ` +
      `${c.experience.map((e) => `${e.title} na ${e.company} (${e.period})`).join('; ')}.`,
    createdAt: now - createdDaysAgo * DAY,
    feedbackSentAt: feedbackDaysAgo >= 0 ? now - feedbackDaysAgo * DAY : null,
  }))
}
