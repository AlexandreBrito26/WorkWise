import type { Lang } from './i18n'

export type Status = 'new' | 'review' | 'shortlist' | 'rejected'

/** Espelha CandidateDto do back-end. */
export interface Candidate {
  id: string
  name: string
  role: string
  score: number
  status: Status
  skills: { name: string; match: number }[]
  experience: { company: string; title: string; period: string }[]
  summary: Record<Lang, string>
}

/** Espelha MetricsDto do back-end. */
export interface Metrics {
  total: number
  averageScore: number
  shortlisted: number
  avgDaysToFeedback: number
}

export interface NewCandidate {
  name: string
  email: string
  role: string
  resumeText: string
}

/** Formulário de cadastro: texto colado OU arquivo PDF. */
export interface CandidateForm extends NewCandidate {
  file: File | null
}
