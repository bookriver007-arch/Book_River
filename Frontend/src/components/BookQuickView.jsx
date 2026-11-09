import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Heart, Minus, Plus, ShoppingCart, Star, Truck, X } from 'lucide-react'
import { notify } from '../utils/notify.jsx'
import useCart from '../hooks/useCart.js'
import { moneyOf, priceOf } from '../utils/money.js'

const hashOf = (text) => {
  let hash = 0
  for (let i = 0; i < text.length; i += 1) hash = (hash * 31 + text.charCodeAt(i)) % 997
  return hash
}

/**
 * Product quick-view (book par click) — modern e-commerce detail:
 * title, price + old price + discount badge, shipping line, quantity
 * stepper, "In stock", Add to cart + Buy it now.
 */
export default function BookQuickView({ book, category, liked, onWishlist, onClose }) {
  const [qty, setQty] = useState(1)
  const { add } = useCart()
  const navigate = useNavigate()

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  const base = priceOf(book.price)
  const discount = 15 + (hashOf(book.title) % 16) // 15% – 30%
  const price = base || 0
  const oldPrice = price ? Math.round(price / (1 - discount / 100)) : 0
  const rating = (4.1 + (hashOf(book.title) % 9) / 10).toFixed(1)
  const reviews = 24 + (hashOf(book.title) % 180)

  const addToCart = () => {
    add(book, qty)
    notify.cart('Cart me add ho gayi 🛒', `${qty} × ${book.title} — checkout ke liye taiyar`)
    onClose()
  }

  const buyNow = () => {
    add(book, qty)
    onClose()
    navigate('/cart')
  }

  return (
    <div
      className="fixed inset-0 z-[90] grid place-items-center p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={book.title}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Band karo"
        className="absolute inset-0 cursor-default bg-slate-900/60 backdrop-blur-sm"
      />

      <div className="relative w-full max-w-3xl overflow-hidden rounded-3xl border border-white/60 bg-white shadow-2xl dark:border-white/10 dark:bg-[#0e1a2b]">
        <button
          type="button"
          onClick={onClose}
          aria-label="Band karo"
          className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-slate-600 shadow-md ring-1 ring-black/5 transition hover:rotate-90 hover:text-slate-900 dark:bg-white/10 dark:text-slate-200 dark:ring-white/10"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="grid gap-5 p-5 sm:grid-cols-[minmax(0,14rem)_1fr] sm:gap-7 sm:p-7">
          {/* ---------- cover ---------- */}
          <div className="mx-auto w-44 sm:mx-0 sm:w-full">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/5">
              <img
                src={book.image}
                alt={`${book.title} cover`}
                className="aspect-[3/4] w-full object-cover"
              />
            </div>

            <button
              type="button"
              onClick={onWishlist}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-bold text-slate-600 transition hover:border-rose-300 hover:text-rose-600 dark:border-white/10 dark:text-slate-300 dark:hover:text-rose-300"
            >
              <Heart className={liked ? 'h-4 w-4 fill-rose-500 text-rose-500' : 'h-4 w-4'} />
              {liked ? 'Saved to wishlist' : 'Save to wishlist'}
            </button>
          </div>

          <div className="min-w-0">
            <span className="text-[0.6rem] font-bold uppercase tracking-[0.18em] text-brand-600 dark:text-brand-300">
              {category}
            </span>

            <h2 className="mt-1.5 text-xl font-extrabold uppercase leading-tight tracking-tight text-slate-900 dark:text-white sm:text-2xl">
              {book.title}
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {book.author ? `by ${book.author}` : 'Book River'}
            </p>

            <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span className="font-semibold text-slate-700 dark:text-slate-200">{rating}</span>
              <span>({reviews} reviews)</span>
            </div>

            {/* price row */}
            <div className="mt-3.5 flex flex-wrap items-center gap-x-3 gap-y-1.5">
              <span className="text-2xl font-extrabold text-brand-600 dark:text-brand-300 sm:text-3xl">
                {price ? moneyOf(price, 2) : book.price || '—'}
              </span>
              {oldPrice ? (
                <span className="text-sm font-semibold text-slate-400 line-through dark:text-slate-500">
                  {moneyOf(oldPrice, 2)}
                </span>
              ) : null}
              <span className="ml-auto rounded-full bg-rose-500 px-2.5 py-1 text-[0.66rem] font-extrabold text-white shadow-sm">
                -{discount}%
              </span>
            </div>

            <p className="mt-1.5 flex items-center gap-1.5 text-[0.73rem] font-medium text-brand-600 dark:text-brand-300">
              <Truck className="h-3.5 w-3.5" /> Shipping calculated at checkout.
            </p>

            <div className="my-4 h-px bg-slate-200 dark:bg-white/10" />

            {/* quantity + stock */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Quantity
              </span>

              <div className="inline-flex items-center overflow-hidden rounded-xl border border-slate-200 dark:border-white/15">
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  aria-label="Quantity kam karo"
                  className="grid h-9 w-9 place-items-center text-slate-600 transition hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-white/10"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="grid h-9 w-11 place-items-center border-x border-slate-200 text-sm font-bold text-slate-900 dark:border-white/15 dark:text-white">
                  {qty}
                </span>
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.min(99, q + 1))}
                  aria-label="Quantity barhao"
                  className="grid h-9 w-9 place-items-center text-slate-600 transition hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-white/10"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>

              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[0.7rem] font-bold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                ✓ In stock
              </span>
            </div>

            <div className="my-4 h-px bg-slate-200 dark:bg-white/10" />

            {/* actions */}
            <div className="grid gap-2.5 sm:grid-cols-2">
              <button
                type="button"
                onClick={addToCart}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-3 text-sm font-bold text-white shadow-md shadow-brand-600/25 transition hover:bg-brand-700 active:scale-[0.98] dark:bg-brand-500 dark:hover:bg-brand-400"
              >
                <ShoppingCart className="h-4 w-4" /> Add to cart
              </button>
              <button
                type="button"
                onClick={buyNow}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white transition hover:bg-black active:scale-[0.98] dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
              >
                Buy it now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
