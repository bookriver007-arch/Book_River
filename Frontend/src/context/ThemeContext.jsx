import { useEffect, useState } from 'react'
import { THEME_STORAGE_KEY } from './themeStore.js'
import { ThemeContext } from './themeContextDef.js'

/** system ka preference */
const systemDark = () => window.matchMedia('(prefers-color-scheme: dark)').matches

/** saved mode: 'light' | 'dark' | 'system' (purana saved value bhi chalega) */
const readMode = () => {
  const saved = localStorage.getItem(THEME_STORAGE_KEY)
  if (saved === 'light' || saved === 'dark' || saved === 'system') return saved
  return 'system'
}

/**
 * Theme — mode ('light' | 'dark' | 'system') + resolved `theme`.
 * Settings page se mode choose hota hai; Navbar ka 🌙 toggle light/dark karta hai.
 */
export function ThemeProvider({ children }) {
  const [mode, setMode] = useState(readMode)
  const [system, setSystem] = useState(systemDark)

  // laptop/phone ka system theme badle to follow karo
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = (event) => setSystem(event.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const theme = mode === 'system' ? (system ? 'dark' : 'light') : mode

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', theme === 'dark')
    root.style.colorScheme = theme
    localStorage.setItem(THEME_STORAGE_KEY, mode)
  }, [theme, mode])

  const setTheme = (next) => {
    if (next === 'light' || next === 'dark' || next === 'system') setMode(next)
  }

  const toggleTheme = () => setMode(theme === 'dark' ? 'light' : 'dark')

  return (
    <ThemeContext.Provider value={{ theme, mode, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
