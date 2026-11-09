import { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'

/**
 * Login guard — jab tak user login nahi karta, koi bhi page nahi khulta.
 *   <RequireAuth><Home /></RequireAuth>
 * Bina token: seedha /auth (Login) par, aur login ke baad wapas usi page par.
 */
const hasSession = () => {
  try {
    return Boolean(localStorage.getItem('br_token'))
  } catch {
    return false
  }
}

/* ek hi dafa token server se verify hota hai (expired session ke liye) */
let verified = false

export default function RequireAuth({ children }) {
  const location = useLocation()
  const [authed, setAuthed] = useState(hasSession)

  /* doosre tab me logout/login ho to yahan bhi follow ho */
  useEffect(() => {
    const onStorage = (event) => {
      if (event.key === 'br_token') setAuthed(hasSession())
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  /* token purana/expired ho to logout kar do */
  useEffect(() => {
    if (verified || !authed) return
    verified = true

    const token = (() => {
      try {
        return localStorage.getItem('br_token') || ''
      } catch {
        return ''
      }
    })()
    if (!token) return

    fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        if (res.status !== 401) return
        localStorage.removeItem('br_token')
        localStorage.removeItem('br_user')
        setAuthed(false)
      })
      .catch(() => {
        /* offline — page phir bhi chalta rahe */
      })
  }, [authed])

  if (!authed) {
    const from = `${location.pathname}${location.search}`
    return <Navigate to="/auth" replace state={{ from }} />
  }

  return children
}
