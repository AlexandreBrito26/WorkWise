import { useRef, useState } from 'react'
import { useI18n } from '../i18n'
import { downloadFile, today } from '../download'
import { exportData, importData, resetDemo } from '../store'

export default function DataMenu({ onChanged }: { onChanged: () => void }) {
  const { t } = useI18n()
  const fileRef = useRef<HTMLInputElement>(null)
  const [msg, setMsg] = useState<{ text: string; error?: boolean } | null>(null)

  const download = () => downloadFile(`workwise-backup-${today()}.json`, exportData(), 'application/json')

  async function upload(file: File | undefined) {
    if (!file) return
    try {
      if (file.size > 5 * 1024 * 1024) throw new Error('big')
      if (!window.confirm(t.confirmImport)) return
      importData(await file.text())
      onChanged()
      setMsg({ text: t.importOk })
    } catch {
      setMsg({ text: t.importError, error: true })
    } finally {
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  function reset() {
    if (!window.confirm(t.confirmReset)) return
    resetDemo()
    onChanged()
    setMsg({ text: t.resetOk })
  }

  return (
    <section className="panel data">
      <h2>{t.dataTitle}</h2>
      <div className="actions">
        <button className="btn" onClick={download}>{t.exportData}</button>
        <button className="btn btn--ghost" onClick={() => fileRef.current?.click()}>{t.importData}</button>
        <button className="btn btn--ghost" onClick={reset}>{t.resetDemo}</button>
        <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={(e) => void upload(e.target.files?.[0])} />
      </div>
      <small className="state">{t.dataWarn}</small>
      {msg && <p className={`state${msg.error ? ' state--error' : ''}`} role="status">{msg.text}</p>}
    </section>
  )
}
