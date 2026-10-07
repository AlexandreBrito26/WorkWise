import { useEffect, useMemo, useRef, useState } from 'react'
import { Circle, Layer, Line, Rect, Stage, Text } from 'react-konva'
import type Konva from 'konva'
import { useI18n } from '../i18n'
import { SHORTLIST_MIN } from '../analysis'
import type { Candidate, Status } from '../types'

const PAD = 40
const HEIGHT = 320
const NAMES = ['text', 'muted', 'surface', 'primary', 'secondary', 'accent', 'danger', 'bg'] as const
type Colors = Record<(typeof NAMES)[number], string>

// O canvas não entende var(--x): lemos as cores reais e relemos quando o tema muda.
function readColors(): Colors {
  const cs = getComputedStyle(document.documentElement)
  return Object.fromEntries(NAMES.map((n) => [n, cs.getPropertyValue(`--${n}`).trim() || '#888'])) as Colors
}

function useColors(): Colors {
  const [colors, setColors] = useState(readColors)
  useEffect(() => {
    const update = () => setColors(readColors())
    const mo = new MutationObserver(update)
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    mq.addEventListener('change', update)
    return () => { mo.disconnect(); mq.removeEventListener('change', update) }
  }, [])
  return colors
}

// Deslocamento estável (a partir do id) para bolhas na mesma posição não ficarem empilhadas.
const jitter = (id: string, k: number) => {
  let h = k
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) % 997
  return (h / 997 - 0.5) * 14
}

interface View { x: number; y: number; scale: number }
const HOME: View = { x: 0, y: 0, scale: 1 }

export default function TalentMap({ candidates, selectedId, onSelect }: {
  candidates: Candidate[]; selectedId: string | null; onSelect: (id: string) => void
}) {
  const { t } = useI18n()
  const c = useColors()
  const box = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(600)
  const [view, setView] = useState<View>(HOME)
  const [hover, setHover] = useState<string | null>(null)

  useEffect(() => {
    const el = box.current
    if (!el) return
    const ro = new ResizeObserver(() => setWidth(Math.max(280, el.clientWidth)))
    ro.observe(el)
    setWidth(Math.max(280, el.clientWidth))
    return () => ro.disconnect()
  }, [])

  const strong = (x: Candidate) => x.skills.filter((s) => s.match >= 70).length
  const maxY = Math.max(3, ...candidates.map(strong))
  const plotW = width - PAD * 2
  const plotH = HEIGHT - PAD * 2
  const px = (score: number) => PAD + (score / 100) * plotW
  const py = (n: number) => HEIGHT - PAD - (n / maxY) * plotH

  const statusColor: Record<Status, string> = { new: c.muted, review: c.secondary, shortlist: c.accent, rejected: c.danger }
  const dots = useMemo(() => candidates.map((x) => ({
    ...x, cx: px(x.status === 'new' ? 0 : x.score) + jitter(x.id, 1), cy: py(strong(x)) + jitter(x.id, 7),
    r: 10 + Math.min(x.skills.length, 6) * 1.5,
  })), [candidates, width, maxY]) // eslint-disable-line react-hooks/exhaustive-deps

  function onWheel(e: Konva.KonvaEventObject<WheelEvent>) {
    e.evt.preventDefault()
    const stage = e.target.getStage()!
    const p = stage.getPointerPosition()!
    const next = Math.min(4, Math.max(0.6, view.scale * (e.evt.deltaY > 0 ? 1 / 1.1 : 1.1)))
    const m = { x: (p.x - view.x) / view.scale, y: (p.y - view.y) / view.scale }
    setView({ scale: next, x: p.x - m.x * next, y: p.y - m.y * next })
  }

  const hovered = dots.find((d) => d.id === hover)
  const grid = [0, 20, 40, 60, 80, 100]

  return (
    <section className="panel map">
      <div className="map__head">
        <h2>{t.mapTitle}</h2>
        <button className="btn btn--ghost" onClick={() => setView(HOME)}>{t.mapReset}</button>
      </div>
      <p className="state">{t.mapHint}</p>
      <div ref={box} className="map__canvas" role="img" aria-label={t.mapTitle}>
        <Stage width={width} height={HEIGHT} draggable x={view.x} y={view.y} scaleX={view.scale} scaleY={view.scale}
          onWheel={onWheel} onDblClick={() => setView(HOME)}
          onDragEnd={(e) => { if (e.target === e.target.getStage()) setView({ ...view, x: e.target.x(), y: e.target.y() }) }}
          style={{ cursor: 'grab' }}>
          <Layer>
            <Rect x={PAD} y={PAD} width={plotW} height={plotH} fill={c.bg} cornerRadius={8} opacity={0.6} />
            {grid.map((g) => (
              <Line key={g} points={[px(g), PAD, px(g), HEIGHT - PAD]} stroke={c.muted} opacity={0.25} strokeWidth={1} />
            ))}
            <Line points={[px(SHORTLIST_MIN), PAD, px(SHORTLIST_MIN), HEIGHT - PAD]} stroke={c.accent} dash={[6, 4]} strokeWidth={2} />
            {grid.map((g) => <Text key={`l${g}`} text={String(g)} x={px(g) - 8} y={HEIGHT - PAD + 6} fontSize={11} fill={c.muted} />)}
            <Text text={t.axisScore} x={PAD} y={HEIGHT - 16} fontSize={12} fill={c.text} />
            <Text text={t.axisStrong} x={4} y={PAD - 26} fontSize={12} fill={c.text} />
            {dots.map((d) => (
              <Circle key={d.id} x={d.cx} y={d.cy} radius={d.r} fill={statusColor[d.status]}
                stroke={d.id === selectedId ? c.primary : c.surface} strokeWidth={d.id === selectedId ? 4 : 2}
                opacity={d.status === 'new' ? 0.6 : 0.95}
                onClick={() => onSelect(d.id)} onTap={() => onSelect(d.id)}
                onMouseEnter={(e) => { setHover(d.id); e.target.getStage()!.container().style.cursor = 'pointer' }}
                onMouseLeave={(e) => { setHover(null); e.target.getStage()!.container().style.cursor = 'grab' }} />
            ))}
            {hovered && (
              <Text text={`${hovered.name} · ${hovered.status === 'new' ? '–' : hovered.score}`}
                x={Math.min(hovered.cx + hovered.r + 6, width - 170)} y={hovered.cy - 7} fontSize={13} fontStyle="bold"
                fill={c.text} shadowColor={c.surface} shadowBlur={4} shadowOpacity={1} />
            )}
          </Layer>
        </Stage>
      </div>
      <ul className="map__legend">
        {(['new', 'review', 'shortlist', 'rejected'] as const).map((s) => (
          <li key={s}><i style={{ background: statusColor[s] }} />{t.status[s]}</li>
        ))}
      </ul>
    </section>
  )
}
