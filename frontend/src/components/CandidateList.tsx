import { useI18n } from '../i18n'
import type { Candidate, CandidateForm } from '../types'
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
  return (
    <section className="panel list">
      <div className="list__head">
        <h2>{t.candidates}</h2>
        <button className="btn btn--ghost" onClick={onAnalyze} disabled={analyzing}>
          {analyzing ? t.analyzing : t.analyzeNow}
        </button>
      </div>
      {candidates.length === 0 && <p className="state">{t.noCandidates}</p>}
      <ul>
        {candidates.map((c) => (
          <li key={c.id}>
            <button className={c.id === selectedId ? 'is-selected' : ''} onClick={() => onSelect(c.id)}>
              <span className="list__name">{c.name}</span>
              <span className="list__role">{c.role}</span>
              <span className={`badge badge--${c.status}`}>{t.status[c.status]}</span>
              <span className="list__score">{c.status === 'new' ? '–' : c.score}</span>
            </button>
          </li>
        ))}
      </ul>
      <NewCandidateForm onCreate={onCreate} />
    </section>
  )
}
