/** Admin panel ke saare API endpoints + chhote fetch helpers. */
export const ENDPOINTS = {
  slides: '/api/description-admin',
  categories: '/api/description-admin/categories',
  books: '/api/description-admin/books',
  kids: '/api/description-admin/kids-book',
  frames: '/api/description-admin/frames',
  products: '/api/description-admin/products',
  reviews: '/api/description-admin/reviews',
}

export const FRONTEND_URL = 'http://localhost:5173/description'

/** GET — list */
export async function apiList(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error('Load failed')
  return res.json()
}

/** POST / PATCH — JSON body ya FormData (image upload) */
export async function apiSend(url, { method = 'POST', body, form } = {}) {
  const init = { method }
  if (form) init.body = form
  else if (body !== undefined) {
    init.headers = { 'Content-Type': 'application/json' }
    init.body = JSON.stringify(body)
  }
  const res = await fetch(url, init)
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.message || 'Request failed')
  return data
}

/** DELETE */
export async function apiDelete(url) {
  const res = await fetch(url, { method: 'DELETE' })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.message || 'Delete failed')
  return data
}

/** Do items ke `order` values swap karo (upar/neeche move). */
export async function swapOrder(baseUrl, a, b) {
  await Promise.all([
    apiSend(`${baseUrl}/${a._id}`, { method: 'PATCH', body: { order: b.order } }),
    apiSend(`${baseUrl}/${b._id}`, { method: 'PATCH', body: { order: a.order } }),
  ])
}
