import { useI18n } from '../i18n'
import type { Metrics as MetricsData } from '../types'

export default function Metrics({ metrics }: { metrics: MetricsData | null }) {
  const { t } = useI18n()
  if (!metrics) return null
  const items = [
    { label: t.mTotal, value: metrics.total },
    { label: t.mAvg, value: metrics.averageScore },
    { label: t.mShort, value: metrics.shortlisted },
    { label: t.mDays, value: metrics.avgDaysToFeedback },
  ]
  return (
    <section className="metrics" aria-label="Metrics">
      {items.map((m) => (
        <div className="metric" key={m.label}>
          <strong>{m.value}</strong>
          <span>{m.label}</span>
        </div>
      ))}
    </section>
  )
}
