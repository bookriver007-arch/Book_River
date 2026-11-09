import { useCallback, useEffect, useMemo, useState } from 'react'
import { UR } from './ur.js'
import { EN } from './en.js'
import { LanguageContext, applyToTree } from './languageContextDef.js'
import { LOCALE_KEY, readStoredLanguage, writeStoredLanguage } from './languageStore.js'

/**
 * LanguageProvider â€” language choose karta hai, `<html lang dir>` set karta hai
 * aur (Urdu par) poori app ka text/placeholder Urdu me badal deta hai.
 * Naya text baad me render ho (route change, toast) to MutationObserver
 * usko bhi turant Urdu kar deta hai.
 */
export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(readStoredLanguage)

  /* html lang + RTL */
  useEffect(() => {
    const html = document.documentElement
    html.lang = lang === 'ur' ? 'ur' : 'en'
    html.dir = lang === 'ur' ? 'rtl' : 'ltr'
    html.classList.toggle('lang-ur', lang === 'ur')
  }, [lang])

  /* poore document par translate / restore + naye nodes par bhi */
  useEffect(() => {
    if (typeof document === 'undefined') return undefined
    const root = document.body
    if (!root) return undefined

    applyToTree(root, lang)

    let scheduled = false
    const run = () => {
      scheduled = false
      applyToTree(document.body, lang)
    }
    const schedule = () => {
      if (scheduled) return
      scheduled = true
      window.requestAnimationFrame(run)
    }

    const observer = new MutationObserver(schedule)
    observer.observe(root, { childList: true, subtree: true, characterData: true })
    return () => observer.disconnect()
  }, [lang])

  /* doosre tab me language badle to follow karo */
  useEffect(() => {
    const onStorage = (event) => {
      if (event.key === LOCALE_KEY) setLangState(readStoredLanguage())
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  /** account (server) par bhi language save â€” login ho to */
  const syncToServer = useCallback((value) => {
    const token = (() => {
      try {
        return localStorage.getItem('br_token') || ''
      } catch {
        return ''
      }
    })()
    if (!token) return

    fetch('/api/auth/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ prefs: { language: value } }),
    }).catch(() => {})
  }, [])

  const setLang = useCallback(
    (next) => {
      const value = next === 'ur' ? 'ur' : 'en'
      writeStoredLanguage(value)
      setLangState(value)
      syncToServer(value)
    },
    [syncToServer],
  )

  const toggleLang = useCallback(() => {
    setLang(lang === 'ur' ? 'en' : 'ur')
  }, [lang, setLang])

  const value = useMemo(
    () => ({
      lang,
      dir: lang === 'ur' ? 'rtl' : 'ltr',
      isUrdu: lang === 'ur',
      setLang,
      toggleLang,
      t: (text) => (lang === 'ur' ? (UR[text] ?? text) : (EN[text] ?? text)),
    }),
    [lang, setLang, toggleLang],
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export default LanguageProvider
