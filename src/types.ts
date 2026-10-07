import type { Lang } from './i18n'

export type Status = 'new' | 'review' | 'shortlist' | 'rejected'

export interface Skill { name: string; match: number }
export interface Experience { company: string; title: string; period: string }

/** Candidato como a interface o enxerga. */
export interface Candidate {
  id: string
  name: string
  role: string
  score: number
  status: Status
  skills: Skill[]
  experience: Experience[]
  summary: Record<Lang, string>
  notes?: string
}

/** Candidato como fica salvo no navegador (inclui dados que a tela não mostra). */
export interface StoredCandidate extends Candidate {
  email: string
  resumeText: string
  createdAt: number // ms desde 1970
  feedbackSentAt: number | null
}

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
