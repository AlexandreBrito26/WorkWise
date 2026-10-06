import { useState, type FormEvent } from 'react'
import { ApiError, login, setToken } from '../api'
import { useI18n } from '../i18n'

export default function Login({ onLogin }: { onLogin: () => void }) {
  const { t } = useI18n()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      const { token } = await login(email, password)
      setToken(token)
      onLogin()
    } catch (err) {
      const status = err instanceof ApiError ? err.status : 0
      setError(status === 401 ? t.invalidCreds : status === 429 ? t.tooMany : t.genericError)
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="panel login" onSubmit={submit}>
      <h2>{t.signIn}</h2>
      <label>{t.fEmail}<input type="email" required autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} /></label>
      <label>{t.fPassword}<input type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} /></label>
      {error && <p className="state state--error" role="alert">{error}</p>}
      <button className="btn" type="submit" disabled={busy}>{busy ? t.signingIn : t.signIn}</button>
    </form>
  )
}
