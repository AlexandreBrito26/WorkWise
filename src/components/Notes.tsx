import { useState } from 'react'
import { useI18n } from '../i18n'
import { setNotes } from '../store'
import type { Candidate } from '../types'

export default function Notes({ candidate: c, onChanged }: { candidate: Candidate; onChanged: () => void }) {
  const { t } = useI18n()
  const [text, setText] = useState(c.notes ?? '')
  return (
    <>
      <h3>{t.notes}</h3>
      <textarea className="notes" rows={3} maxLength={2000} value={text} aria-label={t.notesHint} placeholder={t.notesHint}
        onChange={(e) => setText(e.target.value)}
        onBlur={() => { if (text !== (c.notes ?? '')) { setNotes(c.id, text); onChanged() } }} />
    </>
  )
}
