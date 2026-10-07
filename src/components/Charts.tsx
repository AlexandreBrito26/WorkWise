import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useI18n } from '../i18n'
import type { Candidate, Status } from '../types'

const COLORS: Record<Status, string> = {
  new: 'var(--muted)', review: 'var(--secondary)', shortlist: 'var(--accent)', rejected: 'var(--danger)',
}
const BUCKETS = ['0–19', '20–39', '40–59', '60–79', '80–100']
const tooltipStyle = { background: 'var(--surface)', border: '1px solid var(--muted)', borderRadius: 8, color: 'var(--text)' }

export default function Charts({ candidates }: { candidates: Candidate[] }) {
  const { t } = useI18n()
  const statuses = (['new', 'review', 'shortlist', 'rejected'] as const).map((s) => ({
    key: s, name: t.status[s], value: candidates.filter((c) => c.status === s).length,
  }))
  const scores = BUCKETS.map((name, i) => ({
    name,
    value: candidates.filter((c) => c.status !== 'new' && Math.min(4, Math.floor(c.score / 20)) === i).length,
  }))

  return (
    <section className="charts" aria-label={t.chartsLabel}>
      <figure className="panel">
        <figcaption>{t.chartsStatus}</figcaption>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={statuses} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
            <XAxis dataKey="name" tickLine={false} /><YAxis allowDecimals={false} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle} cursor={{ fillOpacity: 0.1 }} />
            <Bar dataKey="value" name={t.mTotal} radius={[6, 6, 0, 0]} isAnimationActive={false}>
              {statuses.map((d) => <Cell key={d.key} style={{ fill: COLORS[d.key] }} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </figure>
      <figure className="panel">
        <figcaption>{t.chartsScores}</figcaption>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={scores} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
            <XAxis dataKey="name" tickLine={false} /><YAxis allowDecimals={false} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle} cursor={{ fillOpacity: 0.1 }} />
            <Bar dataKey="value" name={t.mTotal} radius={[6, 6, 0, 0]} isAnimationActive={false} style={{ fill: 'var(--primary)' }} />
          </BarChart>
        </ResponsiveContainer>
      </figure>
    </section>
  )
}
