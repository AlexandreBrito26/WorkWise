import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
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

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = candidates.filter((c) =>
      (status === 'all' || c.status === status) && (!q || `${c.name} ${c.role}`.toLowerCase().includes(q)))
    return sort === 'score' ? [...list].sort((a, b) => b.score - a.score) : list
  }, [candidates, query, status, sort])
  return (
    <section className="panel list">
      <div className="list__head">
        <h2>{t.candidates}</h2>
        <button className="btn btn--ghost" onClick={onAnalyze} disabled={analyzing}>
          {analyzing ? t.analyzing : t.analyzeNow}
        </button>
      </div>
      <div className="filters">
        <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t.search} aria-label={t.search} />
        <select value={status} onChange={(e) => setStatus(e.target.value as Status | 'all')} aria-label={t.allStatuses}>
          <option value="all">{t.allStatuses}</option>
          {(['new', 'review', 'shortlist', 'rejected'] as const).map((s) => <option key={s} value={s}>{t.status[s]}</option>)}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value as 'default' | 'score')} aria-label={t.sortDefault}>
          <option value="default">{t.sortDefault}</option>
          <option value="score">{t.sortScore}</option>
        </select>
      </div>
      {candidates.length === 0 && <p className="state">{t.noCandidates}</p>}
      {candidates.length > 0 && visible.length === 0 && <p className="state">{t.noResults}</p>}
      <ul>
        <AnimatePresence initial={false}>
        {visible.map((c) => (
          <motion.li key={c.id} layout initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}>
            <button className={c.id === selectedId ? 'is-selected' : ''} onClick={() => onSelect(c.id)}>
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
