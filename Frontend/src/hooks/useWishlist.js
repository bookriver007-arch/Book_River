import { useContext } from 'react'
import { WishlistContext } from '../context/wishlistStore.js'

export default function useWishlist() {
  const ctx = useContext(WishlistContext)
  if (!ctx) throw new Error('useWishlist must be used inside WishlistProvider')
  return ctx
}
