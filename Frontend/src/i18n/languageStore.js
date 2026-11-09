/**
 * Bhasha (language) — yahi key Settings page aur poora app dono padhte hain.
 * Value: 'en' (English) | 'ur' (اردو)
 */
export const LOCALE_KEY = 'br_locale'

export const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'ur', label: 'اردو' },
]

const readLocale = () => {
  try {
    const raw = localStorage.getItem(LOCALE_KEY)
    const data = raw ? JSON.parse(raw) : null
    return data && typeof data === 'object' ? data : {}
  } catch {
    return {}
  }
}

/** saved language ('roman' jaisi purani value bhi Urdu maani jati hai) */
export const readStoredLanguage = () => {
  const value = readLocale().language
  if (value === 'ur' || value === 'roman' || value === 'urdu') return 'ur'
  return 'en'
}

/** language ko locale me save karo (numberFormat etc. safe rahen) */
export const writeStoredLanguage = (language) => {
  const next = { ...readLocale(), language }
  try {
    localStorage.setItem(LOCALE_KEY, JSON.stringify(next))
  } catch {
    /* private mode */
  }
  return next
}
