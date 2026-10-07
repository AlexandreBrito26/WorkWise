import { analyze, SHORTLIST_MIN } from './analysis'
import { buildSeed } from './seed'
import type { Candidate, Metrics, NewCandidate, Status, StoredCandidate } from './types'

const KEY = 'workwise:candidates:v1'
const DAY = 24 * 60 * 60 * 1000

// Se o navegador bloquear o localStorage (modo privado, por exemplo), os dados ficam só em memória.
let memory: StoredCandidate[] | null = null

function read(): StoredCandidate[] {
  if (memory) return memory
  try {
    const raw = localStorage.getItem(KEY)
    memory = raw ? (JSON.parse(raw) as StoredCandidate[]) : buildSeed()
    if (!raw) write(memory)
  } catch {
    memory = buildSeed()
  }
  return memory
}

function write(list: StoredCandidate[]) {
  memory = list
  try { localStorage.setItem(KEY, JSON.stringify(list)) } catch { /* sem armazenamento: continua em memória */ }
}

/** A tela só recebe os campos públicos; e-mail e texto do currículo ficam fora. */
function toCandidate(c: StoredCandidate): Candidate {
  const { id, name, role, score, status, skills, experience, summary } = c
  return { id, name, role, score, status, skills, experience, summary }
}

export const getCandidates = (): Candidate[] => read().map(toCandidate)

export function getMetrics(): Metrics {
  const all = read()
  const avg = all.length ? Math.round(all.reduce((s, c) => s + c.score, 0) / all.length) : 0
  const sent = all.filter((c) => c.feedbackSentAt !== null)
  const days = sent.length ? sent.reduce((s, c) => s + (c.feedbackSentAt! - c.createdAt) / DAY, 0) / sent.length : 0
  return {
    total: all.length,
    averageScore: avg,
    shortlisted: all.filter((c) => c.status === 'shortlist').length,
    avgDaysToFeedback: Math.round(days * 10) / 10,
  }
}

export function createCandidate(data: NewCandidate): Candidate {
  const c: StoredCandidate = {
    id: `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    name: data.name.trim(), email: data.email.trim(), role: data.role.trim(),
    resumeText: data.resumeText,
    score: 0, status: 'new', skills: [], experience: [], summary: { pt: '', en: '' },
    createdAt: Date.now(), feedbackSentAt: null,
  }
  write([...read(), c])
  return toCandidate(c)
}

/** O feedback ao candidato é simulado: ao decidir, só registramos o momento (nenhum e-mail é enviado). */
const markFeedback = (c: StoredCandidate): StoredCandidate =>
  (c.status === 'shortlist' || c.status === 'rejected') && c.feedbackSentAt === null
    ? { ...c, feedbackSentAt: Date.now() }
    : c

export function updateStatus(id: string, status: Status): void {
  write(read().map((c) => (c.id === id ? markFeedback({ ...c, status }) : c)))
}

/** Exclusão definitiva dos dados do candidato (direito de eliminação da LGPD). */
export function deleteCandidate(id: string): void {
  write(read().filter((c) => c.id !== id))
}

/** Analisa os candidatos novos. Recusa continua sendo decisão humana: nota baixa vai para "em análise". */
export function runAnalysis(): number {
  let done = 0
  write(read().map((c) => {
    if (c.status !== 'new') return c
    const a = analyze(c)
    done++
    return markFeedback({
      ...c,
      score: a.score,
      skills: a.skills,
      summary: { pt: a.summaryPt ?? c.summary.pt, en: a.summaryEn ?? c.summary.en },
      status: a.score >= SHORTLIST_MIN ? 'shortlist' : 'review',
    })
  }))
  return done
}

/** Contexto enviado à IA: nome e e-mail ficam de fora de propósito. */
export function getAssistantContext(id: string): string | null {
  const c = read().find((x) => x.id === id)
  if (!c) return null
  const skills = c.skills.map((s) => `${s.name} ${s.match}%`).join(', ')
  const exp = c.experience.map((e) => `${e.title} (${e.period})`).join('; ')
  return `Vaga: ${c.role}\nNota: ${c.score}\nHabilidades: ${skills}\nExperiência: ${exp}\nResumo: ${c.summary.pt}`
}
