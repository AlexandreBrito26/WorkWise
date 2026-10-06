import { useI18n } from '../i18n'

export default function Header({ onLogout }: { onLogout?: () => void }) {
  const { lang, setLang, t } = useI18n()
  return (
    <header className="header">
      <div className="header__brand">
        <h1>WorkWise</h1>
        <p>{t.tagline}</p>
      </div>
      <div className="header__actions">
        <div className="lang" role="group" aria-label="Language">
          {(['pt', 'en'] as const).map((l) => (
            <button key={l} className={lang === l ? 'is-active' : ''} aria-pressed={lang === l} onClick={() => setLang(l)}>
              {l.toUpperCase()}
            </button>
          ))}
        </div>
        {onLogout && <button className="btn btn--ghost" onClick={onLogout}>{t.signOut}</button>}
      </div>
    </header>
  )
}
