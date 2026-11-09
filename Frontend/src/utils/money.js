/**
 * Settings → Language & region → number format.
 *   'pk'   -> 1,20,000  (Pak / South Asian grouping)
 *   'intl' -> 120,000   (International grouping)
 * Har price `moneyOf` se render hota hai, isliye ek setting se poora store badal jata hai.
 */
const LOCALE_KEY = 'br_locale'
let cachedRaw = null
let cachedLocale = 'en-IN'

const numberLocale = () => {
  let raw = ''
  try {
    raw = localStorage.getItem(LOCALE_KEY) || ''
  } catch {
    raw = ''
  }
  if (raw !== cachedRaw) {
    cachedRaw = raw
    try {
      cachedLocale = JSON.parse(raw)?.numberFormat === 'intl' ? 'en-US' : 'en-IN'
    } catch {
      cachedLocale = 'en-IN'
    }
  }
  return cachedLocale
}

/** "Rs. 1,320.50" / "1320" / "250.50" -> 1320.5 / 1320 / 250.5 */
export const priceOf = (value) => {
  const cleaned = String(value ?? '').replace(/,/g, '')
  const match = cleaned.match(/\d+(?:\.\d+)?/)
  return match ? Number(match[0]) : 0
}

/** moneyOf(1320) -> "Rs. 1,320" · moneyOf(382.2) -> "Rs. 382.20" · moneyOf(191.1, 2) -> "Rs. 191.10" */
export const moneyOf = (value, digits = 0) => {
  const amount = Number(value || 0)
  const places = digits || (Number.isInteger(amount) ? 0 : 2)
  return `Rs. ${amount.toLocaleString(numberLocale(), {
    minimumFractionDigits: places,
    maximumFractionDigits: places,
  })}`
}

