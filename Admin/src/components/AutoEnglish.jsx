import { useEffect } from 'react'
import { adminEnglish } from '../lib/i18n'

/**
 * Turns every Roman Urdu string in the admin panel into English on the fly.
 * Text nodes + placeholder / title / aria-label / alt are covered, and new
 * nodes (toast, dialog, dropdown) are translated through a MutationObserver.
 */

const ATTRS = ['placeholder', 'title', 'aria-label', 'alt']

const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'CODE', 'PRE', 'TEXTAREA', 'INPUT', 'SELECT'])

/** translate one text node, keeping its whitespace */
const translateText = (value) => {
  const match = /^(\s*)([\s\S]*?)(\s*)$/.exec(value)
  if (!match) return value

  const [, lead, core, tail] = match
  if (!core || core.length < 3) return value

  const next = adminEnglish(core)
  if (next === core) return value

  return `${lead}${next}${tail}`
}

const translateNode = (node) => {
  if (!node) return

  if (node.nodeType === Node.TEXT_NODE) {
    const next = translateText(node.nodeValue || '')
    if (next !== node.nodeValue) node.nodeValue = next
    return
  }

  if (node.nodeType !== Node.ELEMENT_NODE) return

  const el = /** @type {HTMLElement} */ (node)

  // attributes (placeholder / title / aria-label / alt) — inputs included
  ATTRS.forEach((attr) => {
    const value = el.getAttribute(attr)
    if (!value) return
    const next = adminEnglish(value)
    if (typeof next === 'string' && next !== value) el.setAttribute(attr, next)
  })

  // skip the text inside form fields (that is user data)
  if (SKIP_TAGS.has(el.tagName)) return

  el.childNodes.forEach(translateNode)
}

export default function AutoEnglish() {
  useEffect(() => {
    translateNode(document.body)

    const observer = new MutationObserver((records) => {
      records.forEach((record) => {
        if (record.type === 'characterData') {
          translateNode(record.target)
          return
        }
        if (record.type === 'attributes' && record.target.nodeType === Node.ELEMENT_NODE) {
          translateNode(record.target)
          return
        }
        record.addedNodes.forEach(translateNode)
      })
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ATTRS,
    })

    return () => observer.disconnect()
  }, [])

  return null
}
