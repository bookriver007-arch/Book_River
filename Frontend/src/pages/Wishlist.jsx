import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, ShoppingCart, Trash2 } from 'lucide-react'
import { notify } from '../utils/notify.jsx'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import useWishlist from '../hooks/useWishlist.js'
import useCart from '../hooks/useCart.js'
import { confirmAction } from '../utils/confirm.js'

/** Wishlist page — jo books heart ki hain wo yahan save rehti hain. */
export default function Wishlist() {
  const { items, remove, clear } = useWishlist()
  const { add } = useCart()
  const [user, setUser] = useState(null)

  useEffect(() => {
    try {
      setUser(JSON.parse(localStorage.getItem('br_user')))
    } catch {
      setUser(null)
    }
  }, [])

  const logout = () => {
    localStorage.removeItem('br_token')
    localStorage.removeItem('br_user')
    window.location.replace('/description')
  }

  const removeItem = async (item) => {
    const ok = await confirmAction({
      title: 'Wishlist se hatao?',
      message: `${item.title} wishlist se nikal jayegi.`,
      confirmLabel: 'Haan, hatao',
    })
    if (!ok) return
    remove(item.id)
    notify.wishlist('Wishlist se hata di 💔', item.title)
  }

  const addToCart = (item) => {
    add(item)
    notify.cart('Cart me add ho gayi 🛒', item.title)
  }

  return (
    <div className="book-page min-h-screen">
      <Navbar categories wide user={user} onLogout={logout} />

      <main className="mx-auto max-w-7xl px-4 pt-8 sm:px-6">
        {/* ---- header ---- */}
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-2.5 py-1 text-[0.62rem] font-bold uppercase tracking-[0.16em] text-brand-700 dark:bg-white/10 dark:text-brand-100">
              <Heart className="h-3 w-3" /> Saved books
            </span>
            <h1 className="mt-2 font-display text-3xl font-bold text-brand-900 dark:text-white">
              My Wishlist
            </h1>
            <p className="mt-1 text-sm text-brand-800/70 dark:text-white/60">
              {items.length
                ? `${items.length} ${items.length === 1 ? 'book' : 'books'} saved — dil chaahe to cart me daal do.`
                : 'Abhi kuch save nahi kiya — kisi bhi kitaab par ❤️ dabao.'}
            </p>
          </div>

          {items.length > 0 ? (
            <button
              type="button"
              onClick={async () => {
                const ok = await confirmAction({
                  title: 'Wishlist khali karein?',
                  message: 'Saari saved books hat jayengi.',
                  confirmLabel: 'Haan, khali karo',
                })
                if (!ok) return
                clear()
                notify.info('Wishlist khali kar di 🧺')
              }}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-rose-300 hover:text-rose-600 dark:border-white/15 dark:text-slate-300 dark:hover:text-rose-300"
            >
              <Trash2 className="h-4 w-4" /> Clear all
            </button>
          ) : null}
        </header>

        {/* ---- empty state ---- */}
        {items.length === 0 ? (
          <section className="mt-8 rounded-3xl border border-dashed border-slate-300 bg-white/70 px-6 py-12 text-center dark:border-white/15 dark:bg-white/5">
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-rose-50 text-rose-500 dark:bg-rose-500/15 dark:text-rose-300">
              <Heart className="h-5 w-5" />
            </span>
            <p className="mt-3 text-base font-semibold text-slate-700 dark:text-white">
              Wishlist abhi khali hai
            </p>
          </section>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {items.map((item) => (
              <article
                key={item.id}
                className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-white/10 dark:bg-white/[0.04]"
              >
                <div className="relative aspect-[3/4] overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <img
                    src={item.image}
                    alt={`${item.title} cover`}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <button
                    type="button"
                    onClick={() => removeItem(item)}
                    aria-label="Wishlist se hatao"
                    title="Wishlist se hatao"
                    className="absolute right-2.5 top-2.5 grid h-9 w-9 place-items-center rounded-full bg-white/85 text-rose-500 shadow-md ring-1 ring-black/5 backdrop-blur transition hover:scale-110 active:scale-95 dark:bg-slate-900/70 dark:ring-white/10"
                  >
                    <Heart className="h-4 w-4 fill-rose-500 text-rose-500" />
                  </button>
                </div>

                <div className="flex flex-1 flex-col p-3.5">
                  {item.category ? (
                    <span className="text-[0.6rem] font-bold uppercase tracking-[0.16em] text-brand-600 dark:text-brand-300">
                      {item.category}
                    </span>
                  ) : null}

                  <h2 className="mt-1 line-clamp-2 text-lg font-semibold leading-snug text-slate-900 dark:text-white">
                    {item.title}
                  </h2>
                  <p className="mt-0.5 truncate text-sm text-slate-500 dark:text-slate-400">
                    {item.author ? `by ${item.author}` : 'Book River'}
                  </p>

                  <p className="mt-3 text-base font-bold text-slate-900 dark:text-white">
                    {item.price || '—'}
                  </p>

                  <div className="mt-3 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => addToCart(item)}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand-700 px-3 py-2.5 text-sm font-semibold text-white shadow-sm shadow-brand-700/25 transition-all hover:bg-brand-800 active:scale-[0.98] dark:bg-brand-600 dark:hover:bg-brand-500"
                    >
                      <ShoppingCart className="h-4 w-4" /> Add to Cart
                    </button>
                    {item.slug ? (
                      <Link
                        to={`/category/${item.slug}`}
                        aria-label="Category page kholo"
                        title="Category page"
                        className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-slate-200 text-slate-500 transition hover:border-brand-300 hover:text-brand-700 dark:border-white/10 dark:text-slate-300"
                      >
                        <Heart className="h-4 w-4" />
                      </Link>
                    ) : null}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}

