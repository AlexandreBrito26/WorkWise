import { useEffect, useRef, useState, type FormEvent } from 'react'
import { AssistantError, askAssistant, getGroqKey, setGroqKey } from '../assistant'
import { useI18n } from '../i18n'

interface Msg { from: 'bot' | 'user'; text: string; error?: boolean }

export default function Assistant({ candidateId }: { candidateId: string | null }) {
  const { t } = useI18n()
  const [msgs, setMsgs] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [key, setKey] = useState(getGroqKey)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => { endRef.current?.scrollIntoView({ block: 'end' }) }, [msgs, busy])

  async function send(e: FormEvent) {
    e.preventDefault()
    const text = input.trim()
    if (!text || busy) return
    setInput('')
    setMsgs((m) => [...m, { from: 'user', text }])
    setBusy(true)
    try {
      const reply = await askAssistant(text, candidateId ?? undefined)
      setMsgs((m) => [...m, { from: 'bot', text: reply }])
    } catch (err) {
      const kind = err instanceof AssistantError ? err.kind : null
      const text = kind === 'no-key' ? t.aiOff : kind === 'failed' ? t.aiFail : t.genericError
      setMsgs((m) => [...m, { from: 'bot', text, error: true }])
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="panel assistant">
      <h2>{t.assistant}</h2>
      <details className="assistant__key">
        <summary>{key ? t.keySaved : t.keyAdd}</summary>
        <label>{t.keyLabel}
          <input type="password" autoComplete="off" spellCheck={false} value={key}
            onChange={(e) => { setKey(e.target.value); setGroqKey(e.target.value.trim()) }} />
        </label>
        <small>{t.keyHint}</small>
      </details>
      <div className="assistant__log" aria-live="polite">
        <p className="msg msg--bot">{t.greeting}</p>
        {msgs.map((m, i) => (
          <p key={i} className={`msg msg--${m.from}${m.error ? ' msg--error' : ''}`}>{m.text}</p>
        ))}
        {busy && <p className="msg msg--bot">{t.thinking}</p>}
        <div ref={endRef} />
      </div>
      <form onSubmit={send} className="assistant__form">
        <input value={input} maxLength={1000} onChange={(e) => setInput(e.target.value)} placeholder={t.placeholder} aria-label={t.placeholder} />
        <button type="submit" disabled={busy}>{t.send}</button>
      </form>
    </section>
  )
}
