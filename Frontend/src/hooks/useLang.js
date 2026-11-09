import { useContext } from 'react'
import { LanguageContext } from '../i18n/languageContextDef.js'

/**
 * Bhasha + translation helper.
 *   const { lang, isUrdu, setLang, toggleLang, t } = useLang()
 *   <h1>{t('My Cart')}</h1>
 */
export default function useLang() {
  return useContext(LanguageContext)
}
