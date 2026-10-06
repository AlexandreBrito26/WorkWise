import { useState, type FormEvent } from 'react'
import { ApiError } from '../api'
import { useI18n } from '../i18n'
import type { CandidateForm } from '../types'

const empty: CandidateForm = { name: '', email: '', role: '', resumeText: '', file: null }
const MAX_BYTES = 5 * 1024 * 1024

export default function NewCandidateForm({ onCreate }: { onCreate: (d: CandidateForm) => Promise<void> }) {
  const { t } = useI18n()
  const [form, setForm] = useState<CandidateForm>(empty)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fileKey, setFileKey] = useState(0) // força o input de arquivo a limpar

  const set = (k: 'name' | 'email' | 'role' | 'resumeText') => (e: { target: { value: string } }) =>
    setForm({ ...form, [k]: e.target.value })

  function pickFile(file: File | null) {
    if (file && file.size > MAX_BYTES) {
      setError(t.pdfTooBig)
      setFileKey((k) => k + 1)
      return
    }
    setError(null)
    setForm({ ...form, file })
  }

  async function submit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await onCreate(form)
      setForm(empty)
      setFileKey((k) => k + 1)
    } catch (err) {
      const status = err instanceof ApiError ? err.status : 0
      setError(status === 422 || status === 415 ? t.pdfError : t.genericError)
    } finally {
      setBusy(false)
    }
  }

  return (
    <details className="newform">
      <summary>{t.newCandidate}</summary>
      <form onSubmit={submit}>
        <label>{t.fName}<input required maxLength={120} value={form.name} onChange={set('name')} /></label>
        <label>{t.fEmail}<input required type="email" value={form.email} onChange={set('email')} /></label>
        <label>{t.fRole}<input required maxLength={120} value={form.role} onChange={set('role')} /></label>
        <label>{t.fPdf}
          <input key={fileKey} type="file" accept="application/pdf" onChange={(e) => pickFile(e.target.files?.[0] ?? null)} />
        </label>
        {!form.file && (
          <label>{t.orPaste}
            <textarea required rows={5} maxLength={20000} aria-label={t.fResume} value={form.resumeText} onChange={set('resumeText')} />
          </label>
        )}
        {error && <p className="state state--error" role="alert">{error}</p>}
        <button type="submit" disabled={busy}>{busy ? t.creating : t.create}</button>
      </form>
    </details>
  )
}
