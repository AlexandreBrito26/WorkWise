import { useState } from 'react'
import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip } from 'recharts'
import { useI18n } from '../i18n'
import type { Candidate } from '../types'

const matchOf = (c: Candidate, name: string) => c.skills.find((s) => s.name === name)?.match ?? 0

export default function Compare({ current, candidates }: { current: Candidate; candidates: Candidate[] }) {
  const { t } = useI18n()
  const [otherId, setOtherId] = useState('')
  const others = candidates.filter((c) => c.id !== current.id && c.skills.length > 0)
  const other = others.find((c) => c.id === otherId) ?? null
  if (others.length === 0) return null

  const names = other ? [...new Set([...current.skills, ...other.skills].map((s) => s.name))] : []
  const data = names.map((name) => ({ name, a: matchOf(current, name), b: other ? matchOf(other, name) : 0 }))

  return (
    <div className="compare">
      <h3>{t.compareTitle}</h3>
      <select value={other ? otherId : ''} onChange={(e) => setOtherId(e.target.value)} aria-label={t.compareWith}>
        <option value="">{t.compareWith}</option>
        {others.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>
      {other && (data.length < 3 ? <p className="state">{t.compareFew}</p> : (
        <>
          <ResponsiveContainer width="100%" height={260}>
            <RadarChart data={data} outerRadius="72%">
              <PolarGrid /><PolarAngleAxis dataKey="name" /><PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
              <Radar name={current.name} dataKey="a" fillOpacity={0.3} isAnimationActive={false} style={{ stroke: 'var(--primary)', fill: 'var(--primary)' }} />
              <Radar name={other.name} dataKey="b" fillOpacity={0.3} isAnimationActive={false} style={{ stroke: 'var(--accent)', fill: 'var(--accent)' }} />
              <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--muted)', borderRadius: 8, color: 'var(--text)' }} />
            </RadarChart>
          </ResponsiveContainer>
          <ul className="map__legend">
            <li><i style={{ background: 'var(--primary)' }} />{current.name}</li>
            <li><i style={{ background: 'var(--accent)' }} />{other.name}</li>
          </ul>
        </>
      ))}
    </div>
  )
}
