import type { Skill, StoredCandidate } from './types'

export const SHORTLIST_MIN = 80

/** Habilidades reconhecidas no texto do currículo: nome exibido -> variações aceitas. */
const CATALOG: Record<string, string[]> = {
  JavaScript: ['javascript', 'ecmascript'],
  TypeScript: ['typescript'],
  React: ['react', 'reactjs', 'react.js'],
  'Next.js': ['next.js', 'nextjs'],
  Vue: ['vue', 'vue.js', 'vuejs'],
  Angular: ['angular'],
  'HTML/CSS': ['html', 'html5', 'css', 'css3'],
  SASS: ['sass', 'scss'],
  'Node.js': ['node', 'node.js', 'nodejs'],
  Java: ['java'],
  'Spring Boot': ['spring boot', 'spring'],
  Python: ['python'],
  'C#': ['c#', '.net', 'dotnet'],
  PHP: ['php', 'laravel'],
  SQL: ['sql', 'mysql'],
  PostgreSQL: ['postgresql', 'postgres'],
  MongoDB: ['mongodb', 'mongo'],
  Docker: ['docker'],
  Git: ['git', 'github', 'gitlab'],
  AWS: ['aws'],
  'REST APIs': ['rest', 'restful', 'api rest'],
  GraphQL: ['graphql'],
  Jest: ['jest'],
  Cypress: ['cypress'],
  'CI/CD': ['ci/cd', 'github actions', 'jenkins'],
}

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/** Conta menções com "fronteira de palavra" que funciona também para termos como C# e Node.js. */
function countMentions(text: string, term: string): number {
  const re = new RegExp(`(?<![\\p{L}\\p{N}])${escape(term)}(?![\\p{L}\\p{N}])`, 'giu')
  return text.match(re)?.length ?? 0
}

export function extractSkills(resume: string, role: string): Skill[] {
  const found: Skill[] = []
  for (const [name, aliases] of Object.entries(CATALOG)) {
    const mentions = aliases.reduce((sum, a) => sum + countMentions(resume, a), 0)
    if (mentions === 0) continue
    // 1 menção = 60, 2 = 75, 3 ou mais = 90; citada no título da vaga ganha +10.
    let match = mentions >= 3 ? 90 : mentions === 2 ? 75 : 60
    if (aliases.some((a) => countMentions(role, a) > 0)) match += 10
    found.push({ name, match: Math.min(100, match) })
  }
  return found.sort((a, b) => b.match - a.match).slice(0, 6)
}

export interface Analysis {
  score: number
  skills: Skill[]
  summaryPt: string | null // null = manter o resumo atual
  summaryEn: string | null
}

/**
 * Triagem por regras, 100% local (sem IA):
 * - com habilidades já cadastradas: nota = média da compatibilidade delas;
 * - sem habilidades (texto colado ou PDF): procura termos conhecidos no currículo.
 */
export function analyze(c: StoredCandidate): Analysis {
  if (c.skills.length > 0) {
    const avg = c.skills.reduce((sum, s) => sum + s.match, 0) / c.skills.length
    return { score: Math.round(avg), skills: c.skills, summaryPt: null, summaryEn: null }
  }

  const skills = extractSkills(c.resumeText, c.role)
  if (skills.length === 0) {
    return {
      score: 0, skills: [],
      summaryPt: 'Nenhuma habilidade técnica conhecida foi encontrada no texto. Revise o currículo manualmente.',
      summaryEn: 'No known technical skills were found in the text. Please review the resume manually.',
    }
  }

  const avg = skills.reduce((sum, s) => sum + s.match, 0) / skills.length
  const coverage = Math.min(1, skills.length / 4) // poucas habilidades detectadas puxam a nota para baixo
  const names = skills.map((s) => s.name).join(', ')
  return {
    score: Math.round(avg * coverage), skills,
    summaryPt: `Habilidades identificadas por palavras-chave: ${names}. Triagem automática simples; confirme no currículo.`,
    summaryEn: `Skills identified by keywords: ${names}. Simple automatic screening; please confirm in the resume.`,
  }
}
