import { createContext } from 'react'
import { UR, UR_PATTERNS } from './ur.js'
import { EN, EN_PATTERNS } from './en.js'

/** default value (provider ke bahar bhi crash na ho) */
export const LanguageContext = createContext({
  lang: 'en',
  dir: 'ltr',
  isUrdu: false,
  setLang: () => {},
  toggleLang: () => {},
  t: (text) => text,
})

/* in tags ke text ko translate nahi karna */
const SKIP_TEXT_TAGS = new Set(['SCRIPT', 'STYLE', 'TEXTAREA', 'INPUT', 'CODE', 'NOSCRIPT'])
/* in tags ke attributes (placeholder etc.) bhi nahi */
const SKIP_ATTR_TAGS = new Set(['SCRIPT', 'STYLE', 'CODE', 'NOSCRIPT'])
const ATTRS = ['placeholder', 'aria-label', 'title', 'alt']

/* original text yaad rakho taake English par wapas aa sake */
const ORIGINAL_TEXT = new WeakMap()
const ORIGINAL_ATTR = new WeakMap()

/** ek text ko Urdu me badlo (aage peeche ki spaces safe) */
export const toUrdu = (value) => {
  const trimmed = String(value).trim()
  if (!trimmed) return value

  const lead = String(value).match(/^\s*/)[0]
  const trail = String(value).match(/\s*$/)[0]
  /* JSX me line-break wala text bhi match ho jaye */
  const key = trimmed.replace(/\s+/g, ' ')

  const hit = UR[key]
  if (hit) return `${lead}${hit}${trail}`

  // dynamic text (numbers wali) ke liye patterns
  for (const [pattern, build] of UR_PATTERNS) {
    const match = key.match(pattern)
    if (match) return `${lead}${build(match)}${trail}`
  }

  return value
}

const isSkippedText = (element) => {
  if (!element) return true
  if (SKIP_TEXT_TAGS.has(element.tagName)) return true
  return Boolean(element.closest('[data-no-i18n]'))
}

const isSkippedAttr = (element) => {
  if (!element) return true
  if (SKIP_ATTR_TAGS.has(element.tagName)) return true
  return Boolean(element.closest('[data-no-i18n]'))
}

/** Roman-Urdu text ko proper English me badlo */
export const toEnglish = (value) => {
  const trimmed = String(value).trim()
  if (!trimmed) return value

  const lead = String(value).match(/^\s*/)[0]
  const trail = String(value).match(/\s*$/)[0]
  /* JSX me line-break wala text bhi match ho jaye */
  const key = trimmed.replace(/\s+/g, ' ')

  const hit = EN[key]
  if (hit) return `${lead}${hit}${trail}`

  for (const [pattern, build] of EN_PATTERNS) {
    const match = key.match(pattern)
    if (match) return `${lead}${build(match)}${trail}`
  }

  return value
}

/** poore tree ke text + attributes translate (ya English par restore) karo */
export const applyToTree = (root, lang) => {
  if (!root || typeof document === 'undefined') return

  const translate = (original) => (lang === 'ur' ? toUrdu(original) : toEnglish(original))

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  const textNodes = []
  while (walker.nextNode()) textNodes.push(walker.currentNode)

  textNodes.forEach((node) => {
    const parent = node.parentElement
    if (isSkippedText(parent)) return

    if (!ORIGINAL_TEXT.has(node)) ORIGINAL_TEXT.set(node, node.nodeValue)
    const original = ORIGINAL_TEXT.get(node)
    const next = translate(original)
    if (node.nodeValue !== next) node.nodeValue = next
  })

  const elements = root.querySelectorAll ? root.querySelectorAll('*') : []
  elements.forEach((element) => {
    if (isSkippedAttr(element)) return

    ATTRS.forEach((attr) => {
      if (!element.hasAttribute(attr)) return
      let store = ORIGINAL_ATTR.get(element)
      if (!store) {
        store = new Map()
        ORIGINAL_ATTR.set(element, store)
      }
      if (!store.has(attr)) store.set(attr, element.getAttribute(attr))
      const original = store.get(attr)
      const next = translate(original)
      if (element.getAttribute(attr) !== next) element.setAttribute(attr, next)
    })
  })
}
