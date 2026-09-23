import { createContext, useCallback, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext(null)
const STORAGE_KEY = 'premysis_tema'

function bacaPreferensi() {
  if (typeof window === 'undefined') return 'light'
  const t = window.localStorage.getItem(STORAGE_KEY)
  if (t === 'light' || t === 'dark') return t
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function ThemeProvider({ children }) {
  const [tema, setTema] = useState(bacaPreferensi)

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', tema === 'dark')
    root.style.colorScheme = tema
    window.localStorage.setItem(STORAGE_KEY, tema)
  }, [tema])

  const toggleTema = useCallback(() => setTema((t) => (t === 'dark' ? 'light' : 'dark')), [])

  return (
    <ThemeContext.Provider value={{ tema, setTema, toggleTema, gelap: tema === 'dark' }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTema = () => {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTema harus dipakai di dalam ThemeProvider')
  return ctx
}
