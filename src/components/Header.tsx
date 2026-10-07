import { useI18n } from '../i18n'
import { useTheme, type ThemeMode } from '../theme'

const MODES: { mode: ThemeMode; icon: string }[] = [
  { mode: 'light', icon: '☀' },
  { mode: 'system', icon: '◐' },
  { mode: 'dark', icon: '☾' },
]

export default function Header() {
  const { lang, setLang, t } = useI18n()
  const { mode, setMode } = useTheme()
  return (
    <header className="header">
      <div className="header__brand">
        <h1>WorkWise</h1>
        <p>{t.tagline}</p>
      </div>
      <div className="header__actions">
      <div className="theme" role="group" aria-label={t.themeLabel}>
        {MODES.map(({ mode: m, icon }) => (
          <button key={m} className={mode === m ? 'is-active' : ''} aria-pressed={mode === m}
            aria-label={t.themes[m]} title={t.themes[m]} onClick={() => setMode(m)}>
            {icon}
          </button>
        ))}
      </div>
      <div className="lang" role="group" aria-label="Language">
        {(['pt', 'en'] as const).map((l) => (
          <button key={l} className={lang === l ? 'is-active' : ''} aria-pressed={lang === l} onClick={() => setLang(l)}>
            {l.toUpperCase()}
          </button>
        ))}
      </div>
      </div>
    </header>
  )
}
