import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [], // [{ _id, title, price, image, quantity }]

      addItem: (book) =>
        set((state) => {
          const existing = state.items.find((i) => i._id === book._id)
          if (existing) {
            return {
              items: state.items.map((i) =>
                i._id === book._id ? { ...i, quantity: i.quantity + (book.quantity || 1) } : i,
              ),
            }
          }
          return { items: [...state.items, { ...book, quantity: book.quantity || 1 }] }
        }),

      removeItem: (id) => set((state) => ({ items: state.items.filter((i) => i._id !== id) })),

      updateQuantity: (id, quantity) =>
        set((state) => ({
          items: state.items.map((i) => (i._id === id ? { ...i, quantity: Math.max(1, quantity) } : i)),
        })),

      clearCart: () => set({ items: [] }),

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      totalPrice: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    { name: 'bookriver-cart' },
  ),
)

export default useCartStore
