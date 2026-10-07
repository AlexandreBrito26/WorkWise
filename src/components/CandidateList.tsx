import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { downloadFile, today } from '../download'
import { exportCsv } from '../store'
import { useI18n } from '../i18n'
import type { Candidate, CandidateForm, Status } from '../types'
import NewCandidateForm from './NewCandidateForm'

interface Props {
  candidates: Candidate[]
  selectedId: string | null
  onSelect: (id: string) => void
  onCreate: (d: CandidateForm) => Promise<void>
  onAnalyze: () => void
  analyzing: boolean
}

export default function CandidateList({ candidates, selectedId, onSelect, onCreate, onAnalyze, analyzing }: Props) {
  const { t } = useI18n()
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<Status | 'all'>('all')
  const [sort, setSort] = useState<'default' | 'score'>('default')

  const searchRef = useRef<HTMLInputElement>(null)

  // Atalho "/" foca a busca (fora de campos de texto).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName
      if (e.key === '/' && tag !== 'INPUT' && tag !== 'TEXTAREA' && tag !== 'SELECT') { e.preventDefault(); searchRef.current?.focus() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = candidates.filter((c) =>
      (status === 'all' || c.status === status) && (!q || `${c.name} ${c.role}`.toLowerCase().includes(q)))
    return sort === 'score' ? [...list].sort((a, b) => b.score - a.score) : list
  }, [candidates, query, status, sort])
  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return
    e.preventDefault()
    const i = visible.findIndex((c) => c.id === selectedId)
    const next = visible[Math.min(visible.length - 1, Math.max(0, i + (e.key === 'ArrowDown' ? 1 : -1)))]
    if (!next) return
    onSelect(next.id)
    setTimeout(() => document.getElementById(`cand-${next.id}`)?.focus(), 0)
  }

  return (
    <section className="panel list">
      <div className="list__head">
        <h2>{t.candidates}</h2>
        <button className="btn btn--ghost" onClick={onAnalyze} disabled={analyzing}>
          {analyzing ? t.analyzing : t.analyzeNow}
        </button>
      </div>
      <div className="filters">
        <input ref={searchRef} type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={`${t.search} ( / )`} aria-label={t.search} />
        <select value={status} onChange={(e) => setStatus(e.target.value as Status | 'all')} aria-label={t.allStatuses}>
          <option value="all">{t.allStatuses}</option>
          {(['new', 'review', 'shortlist', 'rejected'] as const).map((s) => <option key={s} value={s}>{t.status[s]}</option>)}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value as 'default' | 'score')} aria-label={t.sortDefault}>
          <option value="default">{t.sortDefault}</option>
          <option value="score">{t.sortScore}</option>
        </select>
        <button className="btn btn--ghost" disabled={visible.length === 0}
          onClick={() => downloadFile(`workwise-candidatos-${today()}.csv`, exportCsv(visible.map((c) => c.id)), 'text/csv;charset=utf-8')}>
          {t.exportCsv}
        </button>
      </div>
      {candidates.length === 0 && <p className="state">{t.noCandidates}</p>}
      {candidates.length > 0 && visible.length === 0 && <p className="state">{t.noResults}</p>}
      <ul onKeyDown={onKeyDown}>
        <AnimatePresence initial={false}>
        {visible.map((c) => (
          <motion.li key={c.id} layout initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}>
            <button id={`cand-${c.id}`} className={c.id === selectedId ? 'is-selected' : ''} onClick={() => onSelect(c.id)}>
              <span className="list__name">{c.name}</span>
              <span className="list__role">{c.role}</span>
              <span className={`badge badge--${c.status}`}>{t.status[c.status]}</span>
              <span className="list__score">{c.status === 'new' ? '–' : c.score}</span>
            </button>
          </motion.li>
        ))}
        </AnimatePresence>
      </ul>
      <NewCandidateForm onCreate={onCreate} />
    </section>
  )
}
