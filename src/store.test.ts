import { beforeEach, describe, expect, it, vi } from 'vitest'

// O store guarda cache em módulo: recarregamos o módulo a cada teste para começar do zero.
async function fresh() {
  localStorage.clear()
  vi.resetModules()
  return await import('./store')
}
const novo = { name: 'Ana', email: 'ana@x.com', role: 'Dev', resumeText: 'React TypeScript Jest Docker React' }

describe('store', () => {
  let s: Awaited<ReturnType<typeof fresh>>
  beforeEach(async () => { s = await fresh() })

  it('começa com os 4 candidatos de demonstração', () => {
    expect(s.getCandidates()).toHaveLength(4)
  })

  it('analisa só candidatos novos e nunca recusa sozinho', () => {
    const c = s.createCandidate({ ...novo, resumeText: 'cozinheiro' })
    s.runAnalysis()
    expect(s.getCandidates().find((x) => x.id === c.id)?.status).toBe('review')
  })

  it('reanálise não sobrescreve decisão humana', () => {
    const c = s.createCandidate(novo)
    s.updateStatus(c.id, 'rejected')
    s.setRequirements('Dev', ['React'])
    s.reanalyze(c.id)
    expect(s.getCandidates().find((x) => x.id === c.id)?.status).toBe('rejected')
  })

  it('backup: exporta, importa e rejeita arquivo inválido', () => {
    const c = s.createCandidate(novo)
    s.setNotes(c.id, 'boa conversa')
    const backup = s.exportData()
    s.resetDemo()
    s.importData(backup)
    expect(s.getCandidates().find((x) => x.id === c.id)?.notes).toBe('boa conversa')
    expect(() => s.importData('{"app":"outro"}')).toThrow()
    expect(() => s.importData('não é json')).toThrow()
  })

  it('CSV neutraliza fórmulas de planilha', () => {
    const c = s.createCandidate({ ...novo, name: '=HYPERLINK("http://x")' })
    expect(s.exportCsv([c.id])).toContain(`"'=HYPERLINK(""http://x"")"`)
  })

  it('excluir remove o candidato', () => {
    const c = s.createCandidate(novo)
    s.deleteCandidate(c.id)
    expect(s.getCandidates().some((x) => x.id === c.id)).toBe(false)
  })
})
