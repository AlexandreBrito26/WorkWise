import { useState, type FormEvent } from 'react'
import { useI18n } from '../i18n'
import { getRequirements, reanalyze, setRequirements } from '../store'
import type { Candidate } from '../types'

export default function Requirements({ candidate: c, onChanged }: { candidate: Candidate; onChanged: () => void }) {
  const { t } = useI18n()
  const [text, setText] = useState(() => getRequirements(c.role).join(', '))

  function save(e: FormEvent) {
    e.preventDefault()
    setRequirements(c.role, text.split(/[,;\n]/))
    reanalyze(c.id)
    onChanged()
  }

  return (
    <details className="reqs">
      <summary>{t.reqTitle}: {c.role}</summary>
      <form onSubmit={save}>
        <label>{t.reqHint}
          <input value={text} maxLength={400} placeholder="React, TypeScript, Jest" onChange={(e) => setText(e.target.value)} />
        </label>
        <button className="btn" type="submit">{t.reqSave}</button>
      </form>
    </details>
  )
}
