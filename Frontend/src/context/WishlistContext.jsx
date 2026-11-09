import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { WishlistContext, WISHLIST_STORAGE_KEY } from './wishlistStore.js'

/** localStorage se wishlist padho (guest cache) */
const readStored = () => {
  try {
    const raw = localStorage.getItem(WISHLIST_STORAGE_KEY)
    const list = raw ? JSON.parse(raw) : []
    return Array.isArray(list) ? list.filter((book) => book && book.id) : []
  } catch {
    return []
  }
}

const getToken = () => {
  try {
    return localStorage.getItem('br_token') || ''
  } catch {
    return ''
  }
}

/**
 * Wishlist — login hone par MongoDB (`/api/wishlist`) me save hoti hai,
 * warna guest ke liye localStorage me (taake refresh par bhi rahe).
 */
export function WishlistProvider({ children }) {
  const [items, setItems] = useState(readStored)
  const tokenRef = useRef(getToken())

  // login hai -> server se meri wishlist laao
  useEffect(() => {
    const token = getToken()
    tokenRef.current = token
    if (!token) return undefined

    let cancelled = false
    fetch('/api/wishlist', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!cancelled && Array.isArray(data)) setItems(data)
      })
      .catch(() => {})

    return () => {
      cancelled = true
    }
  }, [])

  // guest cache / offline copy
  useEffect(() => {
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(items))
    } catch {
      // storage full / private mode — ignore
    }
  }, [items])

  /** server call (sirf jab login ho) */
  const api = useCallback((path, options = {}) => {
    const token = tokenRef.current || getToken()
    if (!token) return Promise.resolve(null)
    return fetch(`/api/wishlist${path}`, {
      ...options,
      headers: { Authorization: `Bearer ${token}`, ...(options.headers || {}) },
    }).catch(() => null)
  }, [])

  const has = useCallback((id) => items.some((book) => book.id === id), [items])

  const toggle = useCallback(
    (book) => {
      const exists = items.some((item) => item.id === book.id)

      // UI turant update (optimistic)
      setItems((prev) =>
        exists ? prev.filter((item) => item.id !== book.id) : [book, ...prev],
      )

      if (exists) return api(`/${encodeURIComponent(book.id)}`, { method: 'DELETE' })

      return api('', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(book),
      })
    },
    [api, items],
  )

  const remove = useCallback(
    (id) => {
      setItems((prev) => prev.filter((book) => book.id !== id))
      return api(`/${encodeURIComponent(id)}`, { method: 'DELETE' })
    },
    [api],
  )

  const clear = useCallback(() => {
    setItems([])
    return api('', { method: 'DELETE' })
  }, [api])

  const value = useMemo(
    () => ({ items, count: items.length, has, toggle, remove, clear }),
    [items, has, toggle, remove, clear],
  )

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
}

