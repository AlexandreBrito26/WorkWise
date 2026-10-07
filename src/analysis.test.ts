import { describe, expect, it } from 'vitest'
import { analyze, extractSkills } from './analysis'
import type { StoredCandidate } from './types'

const base: StoredCandidate = {
  id: '1', name: 'A', email: 'a@a.com', role: 'Front-end Developer', resumeText: '', score: 0, status: 'new',
  skills: [], experience: [], summary: { pt: '', en: '' }, createdAt: 0, feedbackSentAt: null,
}

describe('extractSkills', () => {
  it('reconhece termos com pontuação (Node.js, C#) sem confundir js/ts', () => {
    const names = extractSkills('Node.js e C#, também React', '').map((s) => s.name)
    expect(names).toEqual(expect.arrayContaining(['Node.js', 'C#', 'React']))
    expect(names).not.toContain('JavaScript')
  })
  it('dá bônus quando a habilidade aparece no título da vaga', () => {
    const [react] = extractSkills('React', 'React Developer')
    expect(react.match).toBe(70)
  })
})

describe('analyze', () => {
  it('sem habilidades reconhecidas: nota 0 e pede revisão manual', () => {
    const a = analyze({ ...base, resumeText: 'cozinheiro' })
    expect(a.score).toBe(0)
    expect(a.summaryPt).toMatch(/manualmente/)
  })
  it('com habilidades cadastradas: média simples', () => {
    const a = analyze({ ...base, skills: [{ name: 'X', match: 80 }, { name: 'Y', match: 60 }] })
    expect(a.score).toBe(70)
  })
  it('com requisitos: requisito ausente conta 0 e aparece em "Faltam"', () => {
    const a = analyze({ ...base, resumeText: 'React React React' }, ['React', 'Jest'])
    expect(a.score).toBe(45)
    expect(a.summaryPt).toContain('Faltam: Jest')
  })
})
