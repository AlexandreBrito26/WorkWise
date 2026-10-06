import { useCallback, useEffect, useState } from 'react'
import Header from './components/Header'
import Metrics from './components/Metrics'
import CandidateList from './components/CandidateList'
import CvViewer from './components/CvViewer'
import Assistant from './components/Assistant'
import Login from './components/Login'
import {
  createCandidate, deleteCandidate, getCandidates, getMetrics, hasToken, runAnalysis,
  setToken, setUnauthorizedHandler, updateStatus, uploadCandidate,
} from './api'
import { useI18n } from './i18n'
import type { Candidate, CandidateForm, Metrics as MetricsData, Status } from './types'

export default function App() {
  const { t } = useI18n()
  const [authed, setAuthed] = useState(hasToken())
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [metrics, setMetrics] = useState<MetricsData | null>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)

  const load = useCallback(async () => {
    try {
      const [list, m] = await Promise.all([getCandidates(), getMetrics()])
      setCandidates(list)
      setMetrics(m)
      setSelected((cur) => cur ?? list[0]?.id ?? null)
      setError(false)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    setToken(null)
    setAuthed(false)
    setCandidates([])
    setMetrics(null)
    setSelected(null)
    setLoading(true)
  }, [])

  useEffect(() => { setUnauthorizedHandler(logout) }, [logout])
  useEffect(() => { if (authed) void load() }, [authed, load])

  async function onStatus(id: string, status: Status) {
    await updateStatus(id, status)
    await load()
  }

  async function onCreate(data: CandidateForm) {
    let created: Candidate
    if (data.file) {
      const fd = new FormData()
      fd.append('name', data.name)
      fd.append('email', data.email)
      fd.append('role', data.role)
      fd.append('file', data.file)
      created = await uploadCandidate(fd)
    } else {
      created = await createCandidate({ name: data.name, email: data.email, role: data.role, resumeText: data.resumeText })
    }
    setSelected(created.id)
    await load()
  }

  async function onDelete(id: string) {
    await deleteCandidate(id)
    setSelected(null)
    await load()
  }

  async function onAnalyze() {
    setAnalyzing(true)
    try { await runAnalysis() } catch { /* o estado NEW permanece e o ciclo seguinte tenta de novo */ }
    await load()
    setAnalyzing(false)
  }

  if (!authed) {
    return (
      <div className="app">
        <Header />
        <main><Login onLogin={() => setAuthed(true)} /></main>
      </div>
    )
  }

  const current = candidates.find((c) => c.id === selected) ?? null

  return (
    <div className="app">
      <Header onLogout={logout} />
      <main>
        {loading && <p className="state">{t.loading}</p>}
        {error && !loading && (
          <p className="state state--error" role="alert">
            {t.loadError} <button onClick={() => { setLoading(true); void load() }}>{t.retry}</button>
          </p>
        )}
        {!loading && !error && (
          <>
            <Metrics metrics={metrics} />
            <div className="workspace">
              <CandidateList
                candidates={candidates} selectedId={selected} onSelect={setSelected}
                onCreate={onCreate} onAnalyze={onAnalyze} analyzing={analyzing}
              />
              <CvViewer candidate={current} onStatus={onStatus} onDelete={onDelete} />
              <Assistant candidateId={selected} />
            </div>
          </>
        )}
      </main>
    </div>
  )
}
