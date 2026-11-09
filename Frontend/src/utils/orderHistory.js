/**
 * Purane orders ki local list — Track order page ke "Old orders" section ke liye.
 * Har order jo bhi track kiya jaye (ya place ho) yahan save ho jata hai,
 * is liye baad me order number bhool jane par bhi purana order dekh sakte ho.
 */
const KEY = 'br_order_history'
const MAX = 25

export const readOrderHistory = () => {
  try {
    const raw = localStorage.getItem(KEY)
    const list = raw ? JSON.parse(raw) : []
    if (!Array.isArray(list)) return []
    return list.filter((entry) => entry && entry.code)
  } catch {
    return []
  }
}

const write = (list) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX)))
  } catch {
    /* private mode / storage full */
  }
  return list.slice(0, MAX)
}

/** order ki poori detail — history me save karne ke liye */
const DETAIL_FIELDS = [
  'customerName',
  'customerPhone',
  'customerEmail',
  'address',
  'note',
  'payment',
  'items',
  'itemCount',
  'subtotal',
  'shipping',
  'tax',
  'taxLabel',
  'total',
  'status',
  'statusNote',
  'createdAt',
  'decidedAt',
]

/** order yaad rakho (same code dobara aaye to update) */
export const rememberOrder = (entry) => {
  if (!entry?.code) return readOrderHistory()
  const code = String(entry.code).toUpperCase()

  const next = {
    code,
    status: entry.status || 'pending',
    total: Number(entry.total) || 0,
    itemCount: Number(entry.itemCount) || 0,
    at: entry.at || new Date().toISOString(),
  }

  if (entry.detail && typeof entry.detail === 'object') next.detail = entry.detail

  const list = readOrderHistory().filter((item) => item.code !== code)
  /* newest pehle — `at` (ISO) se sort */
  return write(
    [next, ...list].sort((a, b) => String(b.at || '').localeCompare(String(a.at || ''))),
  )
}

/** track API ka poora order (customer, items, totals…) detail ke saath save karo */
export const rememberFullOrder = (order) => {
  if (!order?.code) return readOrderHistory()

  const detail = {}
  DETAIL_FIELDS.forEach((key) => {
    if (order[key] !== undefined) detail[key] = order[key]
  })

  return rememberOrder({
    code: order.code,
    status: order.status,
    total: order.total,
    itemCount: order.itemCount,
    at: order.createdAt || new Date().toISOString(),
    detail,
  })
}

export const removeOrder = (code) => {
  const target = String(code || '').toUpperCase()
  return write(readOrderHistory().filter((item) => item.code !== target))
}

export const clearOrderHistory = () => write([])
