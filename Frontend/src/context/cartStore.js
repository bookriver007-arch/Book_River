import { createContext } from 'react'

/** localStorage key — cart yahin save hoti hai (refresh par bhi rehti hai) */
export const CART_STORAGE_KEY = 'br_cart'

/** ek book max itni baar cart me */
export const MAX_QTY = 10

export const CartContext = createContext(null)
