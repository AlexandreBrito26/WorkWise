import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

export type ThemeMode = 'light' | 'system' | 'dark'
const KEY = 'ww_theme'

function load(): ThemeMode {
  try {
    const v = localStorage.getItem(KEY)
    return v === 'light' || v === 'dark' ? v : 'system'
  } catch { return 'system' }
}

const Ctx = createContext<{ mode: ThemeMode; setMode: (m: ThemeMode) => void } | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>(load)

  useEffect(() => {
    const root = document.documentElement
    if (mode === 'system') root.removeAttribute('data-theme') // segue prefers-color-scheme
    else root.setAttribute('data-theme', mode)
    try { mode === 'system' ? localStorage.removeItem(KEY) : localStorage.setItem(KEY, mode) } catch { /* ignora */ }
  }, [mode])

  return <Ctx.Provider value={{ mode, setMode }}>{children}</Ctx.Provider>
}

export function useTheme() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider')
  return ctx
}
