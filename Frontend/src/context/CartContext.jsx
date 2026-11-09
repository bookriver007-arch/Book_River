import { useCallback, useEffect, useMemo, useState } from 'react'
import { CART_STORAGE_KEY, CartContext, MAX_QTY } from './cartStore.js'
import { priceOf } from '../utils/money.js'

/** localStorage se cart padho */
const readStored = () => {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY)
    const list = raw ? JSON.parse(raw) : []
    if (!Array.isArray(list)) return []
    return list
      .filter((item) => item && item.id)
      .map((item) => ({
        ...item,
        qty: Math.min(MAX_QTY, Math.max(1, Number(item.qty) || 1)),
      }))
  } catch {
    return []
  }
}

/**
 * Cart — localStorage me save hoti hai (guest bhi kharid sake),
 * count/subtotal sab yahin se aate hain.
 */
export function CartProvider({ children }) {
  const [items, setItems] = useState(readStored)

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
    } catch {
      // storage full / private mode — ignore
    }
  }, [items])

  /** book add (same book dobara -> qty badh jaati hai) */
  const add = useCallback((book, qty = 1) => {
    const amount = Math.min(MAX_QTY, Math.max(1, Number(qty) || 1))
    setItems((prev) => {
      const found = prev.find((item) => item.id === book.id)
      if (found) {
        return prev.map((item) =>
          item.id === book.id
            ? { ...item, qty: Math.min(MAX_QTY, item.qty + amount) }
            : item,
        )
      }
      return [
        {
          id: book.id,
          title: book.title,
          author: book.author,
          price: book.price,
          image: book.image,
          category: book.category,
          slug: book.slug,
          qty: amount,
        },
        ...prev,
      ]
    })
    return amount
  }, [])

  /** qty set (0 -> item hata do) */
  const setQty = useCallback((id, qty) => {
    const next = Math.min(MAX_QTY, Math.max(0, Number(qty) || 0))
    setItems((prev) =>
      next === 0
        ? prev.filter((item) => item.id !== id)
        : prev.map((item) => (item.id === id ? { ...item, qty: next } : item)),
    )
  }, [])

  const remove = useCallback((id) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }, [])

  const clear = useCallback(() => setItems([]), [])

  const value = useMemo(() => {
    const count = items.reduce((sum, item) => sum + item.qty, 0)
    const subtotal = items.reduce((sum, item) => sum + priceOf(item.price) * item.qty, 0)
    return {
      items,
      count,
      subtotal,
      has: (id) => items.some((item) => item.id === id),
      add,
      setQty,
      remove,
      clear,
    }
  }, [items, add, setQty, remove, clear])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
