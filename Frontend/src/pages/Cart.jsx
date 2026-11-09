import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  CheckCircle2,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Trash2,
  Truck,
} from 'lucide-react'
import { notify } from '../utils/notify.jsx'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import useCart from '../hooks/useCart.js'
import { MAX_QTY } from '../context/cartStore.js'
import { moneyOf, priceOf } from '../utils/money.js'

const FREE_SHIP_OVER = 999
const SHIP_FEE = 60

/** Cart page — jahan se koi bhi product buy (order place) ho sakta hai. */
export default function Cart() {
  const { items, count, subtotal, setQty, remove, clear } = useCart()
  const [user, setUser] = useState(null)
  const [address, setAddress] = useState({})
  const [placing, setPlacing] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    try {
      setUser(JSON.parse(localStorage.getItem('br_user')))
    } catch {
      setUser(null)
    }
    try {
      setAddress(JSON.parse(localStorage.getItem('br_address')) || {})
    } catch {
      setAddress({})
    }
  }, [])

  const shipping = subtotal === 0 || subtotal >= FREE_SHIP_OVER ? 0 : SHIP_FEE
  const total = subtotal + shipping

  const logout = () => {
    localStorage.removeItem('br_token')
    localStorage.removeItem('br_user')
    window.location.replace('/description')
  }

  const removeItem = (item) => {
    remove(item.id)
    notify.cart('Cart se hata di 🗑️', item.title)
  }

  /** "Buy" — order backend par jata hai (admin `/orders` par approve karega) */
  const placeOrder = async () => {
    if (!items.length || placing) return
    setPlacing(true)

    try {
      let token = ''
      try {
        token = localStorage.getItem('br_token') || ''
      } catch {
        token = ''
      }

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          customerName: address.fullName || user?.name || 'Guest',
          customerEmail: user?.email || '',
          customerPhone: address.phone || '',
          address: [address.address, address.city].filter(Boolean).join(', '),
          items: items.map((item) => ({
            bookId: item.id,
            title: item.title,
            author: item.author,
            price: item.price,
            qty: item.qty,
            image: item.image,
            category: item.category,
            slug: item.slug,
          })),
        }),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.message || 'Order save nahi hua')

      const placed = {
        id: data.code || 'BR-000000',
        total: Number(data.total) || total,
        books: Number(data.itemCount) || count,
      }
      clear()
      notify.payment('Order place ho gaya 🎉', `${placed.id} · ${moneyOf(placed.total)}`)
      // seedha tracking page par — status wahin se track hoga
      navigate(`/track?code=${encodeURIComponent(placed.id)}&new=1`)
    } catch (err) {
      notify.error('Order save nahi hua', `${err.message} — backend chalu hai? dobara try karo`)
    } finally {
      setPlacing(false)
    }
  }

  return (
    <div className="book-page min-h-screen">
      <Navbar categories wide user={user} onLogout={logout} />

      <main className="mx-auto max-w-7xl px-4 pt-8 sm:px-6">
        {/* ---------- header ---------- */}
            <header className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-2.5 py-1 text-[0.62rem] font-bold uppercase tracking-[0.16em] text-brand-700 dark:bg-white/10 dark:text-brand-100">
                  <ShoppingBag className="h-3 w-3" /> Cart
                </span>
                <h1 className="mt-2 font-display text-3xl font-bold text-brand-900 dark:text-white">
                  My Cart
                </h1>
                <p className="mt-1 text-sm text-brand-800/70 dark:text-white/60">
                  {items.length
                    ? `${count} ${count === 1 ? 'book' : 'books'} cart me — checkout karke order place karo.`
                    : 'Cart abhi khali hai — koi bhi book add karo.'}
                </p>
              </div>

              {items.length > 0 ? (
                <button
                  type="button"
                  onClick={() => {
                    clear()
                    notify.info('Cart khali kar di 🧺')
                  }}
                  className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-rose-300 hover:text-rose-600 dark:border-white/15 dark:text-slate-300 dark:hover:text-rose-300"
                >
                  <Trash2 className="h-4 w-4" /> Clear cart
                </button>
              ) : null}
            </header>

            {/* ---------- empty state ---------- */}
            {items.length === 0 ? (
              <section className="mt-8 rounded-3xl border border-dashed border-slate-300 bg-white/70 px-6 py-14 text-center dark:border-white/15 dark:bg-white/5">
                <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-brand-50 text-brand-600 dark:bg-white/10 dark:text-brand-200">
                  <ShoppingBag className="h-5 w-5" />
                </span>
                <p className="mt-3 text-base font-semibold text-slate-700 dark:text-white">
                  Cart khali hai
                </p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Koi bhi book kholo aur “Add to cart” dabao — wo seedha yahan aa jayegi.
                </p>
                <Link
                  to="/home"
                  className="mt-5 inline-flex items-center gap-2 rounded-full bg-brand-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-brand-700/25 transition hover:bg-brand-800"
                >
                  Books dekho <ArrowRight className="h-4 w-4" />
                </Link>
              </section>
            ) : (
              <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_21rem]">
                {/* ---------- items ---------- */}
                <div className="space-y-3">
                  {items.map((item) => (
                    <article
                      key={item.id}
                      className="flex gap-4 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-sm transition hover:shadow-md dark:border-white/10 dark:bg-white/[0.04]"
                    >
                      <Link
                        to={item.slug ? `/category/${item.slug}` : '/home'}
                        className="shrink-0 overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800"
                      >
                        <img
                          src={item.image}
                          alt={`${item.title} cover`}
                          loading="lazy"
                          decoding="async"
                          className="h-28 w-20 object-cover transition-transform duration-500 hover:scale-105 sm:h-32 sm:w-24"
                        />
                      </Link>

                      <div className="flex min-w-0 flex-1 flex-col">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            {item.category ? (
                              <span className="text-[0.58rem] font-bold uppercase tracking-[0.16em] text-brand-600 dark:text-brand-300">
                                {item.category}
                              </span>
                            ) : null}
                            <h2 className="mt-0.5 line-clamp-2 text-sm font-bold leading-snug text-slate-900 dark:text-white sm:text-base">
                              {item.title}
                            </h2>
                            <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
                              {item.author ? `by ${item.author}` : 'Book River'}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeItem(item)}
                            aria-label={`${item.title} cart se hatao`}
                            title="Cart se hatao"
                            className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/15 dark:hover:text-rose-300"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-3">
                          <div className="inline-flex items-center overflow-hidden rounded-xl border border-slate-200 dark:border-white/15">
                            <button
                              type="button"
                              onClick={() => setQty(item.id, item.qty - 1)}
                              aria-label="Quantity kam karo"
                              className="grid h-8 w-8 place-items-center text-slate-600 transition hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-white/10"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="grid h-8 w-9 place-items-center border-x border-slate-200 text-sm font-bold text-slate-900 dark:border-white/15 dark:text-white">
                              {item.qty}
                            </span>
                            <button
                              type="button"
                              onClick={() => setQty(item.id, Math.min(MAX_QTY, item.qty + 1))}
                              disabled={item.qty >= MAX_QTY}
                              aria-label="Quantity barhao"
                              className="grid h-8 w-8 place-items-center text-slate-600 transition hover:bg-slate-50 disabled:opacity-40 dark:text-slate-300 dark:hover:bg-white/10"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>

                          <div className="text-right">
                            <p className="text-sm font-bold text-slate-900 dark:text-white">
                              {moneyOf(priceOf(item.price) * item.qty)}
                            </p>
                            {item.qty > 1 ? (
                              <p className="text-[0.68rem] text-slate-400 dark:text-slate-500">
                                {moneyOf(priceOf(item.price))} each
                              </p>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
                {/* ---------- summary ---------- */}
                <aside className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm lg:sticky lg:top-24 dark:border-white/10 dark:bg-white/[0.04]">
                  <h2 className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                    Order summary
                  </h2>

                  <dl className="mt-4 space-y-2.5 text-sm">
                    <div className="flex items-center justify-between">
                      <dt className="text-slate-500 dark:text-slate-400">Subtotal ({count})</dt>
                      <dd className="font-semibold text-slate-900 dark:text-white">
                        {moneyOf(subtotal)}
                      </dd>
                    </div>
                    <div className="flex items-center justify-between">
                      <dt className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                        <Truck className="h-3.5 w-3.5" /> Shipping
                      </dt>
                      <dd className="font-semibold text-slate-900 dark:text-white">
                        {shipping === 0 ? (
                          <span className="text-emerald-600 dark:text-emerald-300">Free</span>
                        ) : (
                          moneyOf(shipping)
                        )}
                      </dd>
                    </div>
                  </dl>

                  {shipping > 0 ? (
                    <p className="mt-2.5 rounded-xl bg-amber-50 px-3 py-2 text-[0.72rem] font-medium text-amber-800 dark:bg-amber-500/15 dark:text-amber-200">
                      {moneyOf(FREE_SHIP_OVER - subtotal)} aur add karo → shipping free!
                    </p>
                  ) : null}

                  <div className="my-4 h-px bg-slate-200 dark:bg-white/10" />

                  <div className="flex items-end justify-between">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">Total</span>
                    <span className="text-xl font-extrabold text-brand-700 dark:text-brand-300">
                      {moneyOf(total)}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={placeOrder}
                    disabled={placing}
                    className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-700 px-4 py-3 text-sm font-bold text-white shadow-md shadow-brand-700/25 transition hover:bg-brand-800 active:scale-[0.98] disabled:cursor-wait disabled:opacity-70"
                  >
                    {placing ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                        Order lag raha hai…
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4" /> Place order · Buy now
                      </>
                    )}
                  </button>

                  <p className="mt-2.5 flex items-center justify-center gap-1.5 text-[0.68rem] font-medium text-slate-500 dark:text-slate-400">
                    <ShieldCheck className="h-3.5 w-3.5" /> Secure checkout · Cash on Delivery
                  </p>

                  <Link
                    to="/home"
                    className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 transition hover:border-brand-300 hover:text-brand-700 dark:border-white/10 dark:text-slate-300 dark:hover:text-brand-200"
                  >
                    Aur books dekho
                  </Link>
                </aside>
              </div>
            )}
      </main>

      <Footer />
    </div>
  )
}
