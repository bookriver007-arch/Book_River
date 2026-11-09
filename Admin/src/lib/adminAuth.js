/** Admin session — token in localStorage (separate from the frontend's br_token). */
const TOKEN_KEY = 'br_admin_token'
const ADMIN_KEY = 'br_admin'

export const getAdminToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY) || ''
  } catch {
    return ''
  }
}

export const getAdmin = () => {
  try {
    const raw = localStorage.getItem(ADMIN_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export const saveAdminSession = ({ token, admin }) => {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token)
    if (admin) localStorage.setItem(ADMIN_KEY, JSON.stringify(admin))
  } catch {
    /* private mode */
  }
}

export const clearAdminSession = () => {
  try {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(ADMIN_KEY)
  } catch {
    /* ignore */
  }
}

export const isAdminLoggedIn = () => Boolean(getAdminToken())
