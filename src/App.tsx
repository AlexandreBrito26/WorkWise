import { useCallback, useState } from 'react'
import Header from './components/Header'
import Metrics from './components/Metrics'
import CandidateList from './components/CandidateList'
import CvViewer from './components/CvViewer'
import Assistant from './components/Assistant'
import { createCandidate, deleteCandidate, getCandidates, getMetrics, runAnalysis, updateStatus } from './store'
import type { Candidate, CandidateForm, Metrics as MetricsData, Status } from './types'

export default function App() {
  const [candidates, setCandidates] = useState<Candidate[]>(() => getCandidates())
  const [metrics, setMetrics] = useState<MetricsData>(() => getMetrics())
  const [selected, setSelected] = useState<string | null>(() => getCandidates()[0]?.id ?? null)
  const [analyzing, setAnalyzing] = useState(false)

  // Os dados vivem no navegador (localStorage): basta reler depois de cada alteração.
  const refresh = useCallback(() => {
    setCandidates(getCandidates())
    setMetrics(getMetrics())
  }, [])

  function onStatus(id: string, status: Status) {
    updateStatus(id, status)
    refresh()
  }

  async function onCreate(data: CandidateForm) {
    // O leitor de PDF (pesado) só é baixado quando alguém realmente envia um arquivo.
    const resumeText = data.file ? await (await import('./pdf')).extractPdfText(data.file) : data.resumeText
    const created = createCandidate({ name: data.name, email: data.email, role: data.role, resumeText })
    setSelected(created.id)
    refresh()
  }

  function onDelete(id: string) {
    deleteCandidate(id)
    setSelected(null)
    refresh()
  }

  function onAnalyze() {
    setAnalyzing(true)
    // Pausa curta só para o botão mostrar "Analisando…"; a análise em si é instantânea.
    setTimeout(() => {
      runAnalysis()
      refresh()
      setAnalyzing(false)
    }, 250)
  }

  const current = candidates.find((c) => c.id === selected) ?? null

  return (
    <div className="app">
      <Header />
      <main>
        <Metrics metrics={metrics} />
        <div className="workspace">
          <CandidateList
            candidates={candidates} selectedId={selected} onSelect={setSelected}
            onCreate={onCreate} onAnalyze={onAnalyze} analyzing={analyzing}
          />
          <CvViewer candidate={current} onStatus={onStatus} onDelete={onDelete} />
          <Assistant candidateId={selected} />
        </div>
      </main>
    </div>
  )
}
