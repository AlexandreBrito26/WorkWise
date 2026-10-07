import { analyze, SHORTLIST_MIN } from './analysis'
import { buildSeed } from './seed'
import type { Candidate, Metrics, NewCandidate, Status, StoredCandidate } from './types'

const KEY = 'workwise:candidates:v1'
const REQ_KEY = 'workwise:requirements:v1'
const STATUSES: Status[] = ['new', 'review', 'shortlist', 'rejected']
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

// ---- requisitos por vaga (chave = nome da vaga em minúsculas) ----
let reqMemory: Record<string, string[]> | null = null
const roleKey = (role: string) => role.trim().toLowerCase()

function readReqs(): Record<string, string[]> {
  if (reqMemory) return reqMemory
  try { reqMemory = JSON.parse(localStorage.getItem(REQ_KEY) ?? '{}') } catch { reqMemory = {} }
  return reqMemory!
}

export const getRequirements = (role: string): string[] => readReqs()[roleKey(role)] ?? []

export function setRequirements(role: string, list: string[]) {
  const clean = [...new Set(list.map((s) => s.trim().slice(0, 40)).filter(Boolean))].slice(0, 12)
  const next = { ...readReqs() }
  if (clean.length) next[roleKey(role)] = clean
  else delete next[roleKey(role)]
  reqMemory = next
  try { localStorage.setItem(REQ_KEY, JSON.stringify(next)) } catch { /* continua em memória */ }
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
    done++
    return markFeedback(applyAnalysis(c))
  }))
  return done
}

function applyAnalysis(c: StoredCandidate): StoredCandidate {
  const a = analyze(c, getRequirements(c.role))
  const decided = c.status === 'shortlist' || c.status === 'rejected' // decisão humana não é sobrescrita
  return {
    ...c,
    score: a.score,
    skills: a.skills,
    summary: { pt: a.summaryPt ?? c.summary.pt, en: a.summaryEn ?? c.summary.en },
    status: decided ? c.status : a.score >= SHORTLIST_MIN ? 'shortlist' : 'review',
  }
}

/** Reanalisa um candidato (ex.: depois de mudar os requisitos da vaga). */
export function reanalyze(id: string) {
  write(read().map((c) => (c.id === id ? markFeedback(applyAnalysis(c)) : c)))
}

// ---- backup ----
export function exportData(): string {
  return JSON.stringify({ app: 'workwise', version: 1, candidates: read(), requirements: readReqs() }, null, 2)
}

const str = (v: unknown, max: number): string => (typeof v === 'string' ? v.slice(0, max) : '')
const num = (v: unknown, min: number, max: number): number =>
  typeof v === 'number' && Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : min

/** Valida e normaliza um backup; só campos conhecidos entram. Lança Error se o arquivo não servir. */
function parseBackup(text: string): { candidates: StoredCandidate[]; requirements: Record<string, string[]> } {
  const data = JSON.parse(text)
  if (data?.app !== 'workwise' || !Array.isArray(data.candidates) || data.candidates.length > 1000) throw new Error('invalid')
  const candidates: StoredCandidate[] = data.candidates.map((c: Record<string, unknown>, i: number) => {
    const summary = (c.summary ?? {}) as Record<string, unknown>
    const list = (v: unknown) => (Array.isArray(v) ? v.slice(0, 50) : [])
    if (!str(c.name, 120) || !STATUSES.includes(c.status as Status)) throw new Error('invalid')
    return {
      id: str(c.id, 40) || String(i + 1),
      name: str(c.name, 120), email: str(c.email, 254), role: str(c.role, 120),
      resumeText: str(c.resumeText, 20000),
      score: Math.round(num(c.score, 0, 100)), status: c.status as Status,
      skills: list(c.skills).map((s: Record<string, unknown>) => ({ name: str(s?.name, 60), match: Math.round(num(s?.match, 0, 100)) })).filter((s) => s.name),
      experience: list(c.experience).map((e: Record<string, unknown>) => ({ company: str(e?.company, 120), title: str(e?.title, 120), period: str(e?.period, 40) })),
      summary: { pt: str(summary.pt, 500), en: str(summary.en, 500) },
      createdAt: num(c.createdAt, 0, Date.now()) || Date.now(),
      feedbackSentAt: typeof c.feedbackSentAt === 'number' ? num(c.feedbackSentAt, 0, Date.now() + DAY) : null,
    }
  })
  const requirements: Record<string, string[]> = {}
  for (const [k, v] of Object.entries((data.requirements ?? {}) as Record<string, unknown>).slice(0, 200)) {
    if (Array.isArray(v)) requirements[str(k, 120)] = v.slice(0, 12).map((x) => str(x, 40)).filter(Boolean)
  }
  return { candidates, requirements }
}

/** Substitui todos os dados atuais pelo conteúdo do backup. */
export function importData(text: string) {
  const { candidates, requirements } = parseBackup(text)
  write(candidates)
  reqMemory = requirements
  try { localStorage.setItem(REQ_KEY, JSON.stringify(requirements)) } catch { /* continua em memória */ }
}

export function resetDemo() {
  write(buildSeed())
  reqMemory = {}
  try { localStorage.removeItem(REQ_KEY) } catch { /* ignora */ }
}

/** Contexto enviado à IA: nome e e-mail ficam de fora de propósito. */
export function getAssistantContext(id: string): string | null {
  const c = read().find((x) => x.id === id)
  if (!c) return null
  const skills = c.skills.map((s) => `${s.name} ${s.match}%`).join(', ')
  const exp = c.experience.map((e) => `${e.title} (${e.period})`).join('; ')
  return `Vaga: ${c.role}\nNota: ${c.score}\nHabilidades: ${skills}\nExperiência: ${exp}\nResumo: ${c.summary.pt}`
}
