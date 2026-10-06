import { useState } from 'react'
import { useI18n } from '../i18n'
import type { Candidate, Status } from '../types'

interface Props {
  candidate: Candidate | null
  onStatus: (id: string, s: Status) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

export default function CvViewer({ candidate: c, onStatus, onDelete }: Props) {
  const { t, lang } = useI18n()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(false)

  if (!c) return <section className="panel cv cv--empty"><p>{t.empty}</p></section>

  async function change(status: Status) {
    if (!c) return
    setBusy(true)
    setError(false)
    try { await onStatus(c.id, status) } catch { setError(true) } finally { setBusy(false) }
  }

  async function remove() {
    if (!c || !window.confirm(t.confirmDelete)) return
    setBusy(true)
    setError(false)
    try { await onDelete(c.id) } catch { setError(true); setBusy(false) }
  }

  return (
    <section className="panel cv">
      <header className="cv__head">
        <div>
          <h2>{c.name}</h2>
          <p>{c.role}</p>
        </div>
        {c.status !== 'new' && <div className="cv__score" aria-label={`${t.match}: ${c.score}`}>{c.score}</div>}
      </header>

      <div className="actions">
        <button className="btn" disabled={busy || c.status === 'shortlist'} onClick={() => change('shortlist')}>{t.shortlistAction}</button>
        <button className="btn btn--danger" disabled={busy || c.status === 'rejected'} onClick={() => change('rejected')}>{t.rejectAction}</button>
        {(c.status === 'shortlist' || c.status === 'rejected') && (
          <button className="btn btn--ghost" disabled={busy} onClick={() => change('review')}>{t.reviewAction}</button>
        )}
        <button className="btn btn--ghost btn--push" disabled={busy} onClick={remove}>{t.deleteAction}</button>
      </div>
      {error && <p className="state state--error" role="alert">{t.genericError}</p>}

      {c.status === 'new' ? (
        <p className="state">{t.pending}</p>
      ) : (
        <>
          <h3>{t.summary}</h3>
          <p className="cv__summary">{c.summary[lang]}</p>

          <h3>{t.skills}</h3>
          <ul className="skills">
            {c.skills.map((s) => (
              <li key={s.name}>
                <span>{s.name}</span>
                <div className="bar" role="progressbar" aria-valuenow={s.match} aria-valuemin={0} aria-valuemax={100}>
                  <i style={{ width: `${s.match}%` }} />
                </div>
                <b>{s.match}%</b>
              </li>
            ))}
          </ul>
        </>
      )}

      {c.experience.length > 0 && (
        <>
          <h3>{t.experience}</h3>
          <ul className="timeline">
            {c.experience.map((e) => (
              <li key={e.company + e.period}>
                <strong>{e.title}</strong>
                <span>{e.company} · {e.period}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  )
}
