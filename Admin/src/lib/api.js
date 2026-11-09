/** All admin panel API endpoints + small fetch helpers. */
export const ENDPOINTS = {
  slides: '/api/description-admin',
  homeSlides: '/api/home-slides',
  homeDeals: '/api/home-deals',
  homeCategoryBooks: '/api/home-category-books',
  homeHangingBook: '/api/home-hanging-book',
  homeAbout: '/api/home-about',
  categories: '/api/description-admin/categories',
  books: '/api/description-admin/books',
  kids: '/api/description-admin/kids-book',
  frames: '/api/description-admin/frames',
  products: '/api/description-admin/products',
  reviews: '/api/description-admin/reviews',
  orders: '/api/orders',
  checkout: '/api/checkout',
  adminLogin: '/api/admin/login',
  adminSignup: '/api/admin/signup',
  adminMe: '/api/admin/me',
  adminStats: '/api/admin/stats',
  adminInvite: '/api/admin/invite',
  adminRequests: '/api/admin/requests',
  adminList: '/api/admin/admins',
}

/** Frontend base URL + a link to any frontend page */
export const FRONTEND_BASE = 'http://localhost:5173'
export const frontendUrl = (path = '/description') => `${FRONTEND_BASE}${path}`

export const FRONTEND_URL = frontendUrl('/description')

/** Admin token (when logged in) — sent with every request */
const authHeader = () => {
  try {
    const token = localStorage.getItem('br_admin_token') || ''
    return token ? { Authorization: `Bearer ${token}` } : {}
  } catch {
    return {}
  }
}

/** GET — list */
export async function apiList(url) {
  const res = await fetch(url, { headers: authHeader() })
  if (!res.ok) throw new Error('Load failed')
  return res.json()
}

/** POST / PATCH — JSON body ya FormData (image upload) */
export async function apiSend(url, { method = 'POST', body, form } = {}) {
  const init = { method, headers: { ...authHeader() } }
  if (form) init.body = form
  else if (body !== undefined) {
    init.headers['Content-Type'] = 'application/json'
    init.body = JSON.stringify(body)
  }
  const res = await fetch(url, init)
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.message || 'Request failed')
  return data
}

/** DELETE */
export async function apiDelete(url) {
  const res = await fetch(url, { method: 'DELETE', headers: authHeader() })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.message || 'Delete failed')
  return data
}

/** Swap the `order` values of two items (move up / down). */
export async function swapOrder(baseUrl, a, b) {
  await Promise.all([
    apiSend(`${baseUrl}/${a._id}`, { method: 'PATCH', body: { order: b.order } }),
    apiSend(`${baseUrl}/${b._id}`, { method: 'PATCH', body: { order: a.order } }),
  ])
}
