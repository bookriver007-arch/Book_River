import { useEffect, useMemo, useState } from 'react'
import { motion as Motion } from 'framer-motion'
import { Heart, Search, ShoppingCart, SlidersHorizontal, Star, X } from 'lucide-react'
import { notify } from '../utils/notify.jsx'
import { HOME_CATEGORIES } from '../data/categoryBooks.js'
import { priceOf } from '../utils/money.js'
import useWishlist from '../hooks/useWishlist.js'
import useCart from '../hooks/useCart.js'
import BookQuickView from './BookQuickView.jsx'

/**
 * Category page ka PRODUCT section — modern e-commerce book shop grid.
 * Books admin se aati hain (`/api/home-category-books?slug=…`), warna demo.
 */

const SORTS = [
  { key: 'featured', label: 'Featured' },
  { key: 'price-asc', label: 'Price: low to high' },
  { key: 'price-desc', label: 'Price: high to low' },
  { key: 'rating', label: 'Top rated' },
  { key: 'az', label: 'Title: A → Z' },
]

/** "Rs. 1,320" -> 1320 */
const priceOfBook = (book) => priceOf(book.price)

/** price ko "Rs. 1,000" style me dikhao */
const money = (book) => {
  const value = priceOfBook(book)
  return value ? `Rs. ${value.toLocaleString('en-IN')}` : book.price || '—'
}

/** title se stable rating (4.1 – 4.9) + review count — demo shop look */
const hashOf = (text) => {
  let hash = 0
  for (let i = 0; i < text.length; i += 1) hash = (hash * 31 + text.charCodeAt(i)) % 997
  return hash
}
const ratingOf = (book) => 4.1 + (hashOf(book.title) % 9) / 10
const reviewsOf = (book) => 24 + (hashOf(book.title) % 180)

const staticBooks = (slug) => HOME_CATEGORIES.find((c) => c.slug === slug)?.books ?? []

/* ---------------- ek book card ---------------- */
function BookCard({ book, category, liked, onWishlist, onCart, onOpen }) {
  const rating = ratingOf(book)
  const reviews = reviewsOf(book)

  return (
    <Motion.article
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.35 }}
      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl dark:border-white/10 dark:bg-white/[0.04] dark:hover:border-white/20"
    >
      {/* cover — click par quick view */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => onOpen(book)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onOpen(book)
          }
        }}
        aria-label={`${book.title} ki detail dekho`}
        className="relative aspect-[3/4] cursor-pointer overflow-hidden bg-slate-100 dark:bg-slate-800"
      >
        <img
          src={book.image}
          alt={`${book.title} cover`}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-500 will-change-transform group-hover:scale-105"
        />

        {/* hover hint */}
        <span className="pointer-events-none absolute inset-0 grid place-items-center bg-slate-900/30 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <span className="rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-slate-900 shadow-lg">
            Quick view
          </span>
        </span>

        {/* wishlist */}
        <button
          type="button"
          onClick={() => onWishlist(book)}
          aria-label={liked ? 'Wishlist se hatao' : 'Wishlist me daalo'}
          aria-pressed={liked}
          className="absolute right-2.5 top-2.5 grid h-9 w-9 place-items-center rounded-full bg-white/85 text-slate-600 shadow-md ring-1 ring-black/5 backdrop-blur transition-all hover:scale-110 hover:text-rose-500 active:scale-95 dark:bg-slate-900/70 dark:text-slate-200 dark:ring-white/10"
        >
          <Heart className={liked ? 'h-4 w-4 fill-rose-500 text-rose-500' : 'h-4 w-4'} />
        </button>

        {/* rating pill */}
        <span className="absolute bottom-2.5 left-2.5 inline-flex items-center gap-1 rounded-full bg-slate-900/75 px-2 py-0.5 text-[0.68rem] font-semibold text-white backdrop-blur">
          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
          {rating.toFixed(1)}
        </span>
      </div>

      {/* details */}
      <div className="flex flex-1 flex-col p-3.5">
        <span className="text-[0.6rem] font-bold uppercase tracking-[0.16em] text-brand-600 dark:text-brand-300">
          {category}
        </span>

        <h3 className="mt-1 line-clamp-2 text-lg font-semibold leading-snug text-slate-900 dark:text-white">
          <button
            type="button"
            onClick={() => onOpen(book)}
            className="cursor-pointer text-left transition hover:text-brand-700 dark:hover:text-brand-300"
          >
            {book.title}
          </button>
        </h3>

        <p className="mt-0.5 truncate text-sm text-slate-500 dark:text-slate-400">
          {book.author ? `by ${book.author}` : 'Book River'}
        </p>

        <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
          <span className="font-semibold text-slate-700 dark:text-slate-200">
            {rating.toFixed(1)}
          </span>
          <span>({reviews})</span>
        </div>

        <div className="mt-3 flex items-end justify-between gap-2">
          <p className="text-base font-bold text-slate-900 dark:text-white">{money(book)}</p>
          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[0.62rem] font-bold uppercase tracking-wide text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
            In stock
          </span>
        </div>

        <button
          type="button"
          onClick={() => onCart(book)}
          className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-700 px-3 py-2.5 text-sm font-semibold text-white shadow-sm shadow-brand-700/25 transition-all hover:bg-brand-800 hover:shadow-md active:scale-[0.98] dark:bg-brand-600 dark:hover:bg-brand-500"
        >
          <ShoppingCart className="h-4 w-4" />
          Add to Cart
        </button>
      </div>
    </Motion.article>
  )
}

/* ---------------- section ---------------- */
export default function CategoryProducts({ slug, category }) {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState('featured')
  const { has, toggle } = useWishlist()
  const { add } = useCart()
  const [quick, setQuick] = useState(null)

  const label = category || 'Books'

  // slug badla -> filters reset
  useEffect(() => {
    setQuery('')
    setSort('featured')
    setQuick(null)
  }, [slug])

  // admin se books (warna demo)
  useEffect(() => {
    let cancelled = false
    setLoading(true)

    fetch(`/api/home-category-books?slug=${encodeURIComponent(slug)}`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        if (cancelled) return
        const list = Array.isArray(data) ? data : []
        const apiBooks = list
          .filter((book) => book && book.imageUrl)
          .map((book) => ({
            id: book._id || `${slug}-${book.title}`,
            title: book.title,
            author: book.author,
            price: book.price,
            image: book.imageUrl,
          }))

        const fallback = staticBooks(slug).map((book) => ({
          ...book,
          id: book.id || `${slug}-${book.title}`,
        }))

        setBooks(apiBooks.length ? apiBooks : fallback)
      })
      .catch(() => {
        if (!cancelled) setBooks(staticBooks(slug).map((book) => ({ ...book, id: `${slug}-${book.title}` })))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [slug])

  const toggleWishlist = (book) => {
    const liked = has(book.id)
    toggle({
      id: book.id,
      title: book.title,
      author: book.author,
      price: book.price,
      image: book.image,
      category: label,
      slug,
    })
    if (liked) notify.wishlist('Wishlist se hata di 💔', book.title)
    else notify.wishlist('Wishlist me save ho gayi ❤️', book.title)
  }

  const addToCart = (book) => {
    add({ ...book, category: label, slug })
    notify.cart('Cart me add ho gayi 🛒', book.title)
  }

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase()

    const list = books.filter((book) => {
      return (
        !needle ||
        book.title.toLowerCase().includes(needle) ||
        String(book.author || '').toLowerCase().includes(needle)
      )
    })

    if (sort === 'price-asc') return [...list].sort((a, b) => priceOfBook(a) - priceOfBook(b))
    if (sort === 'price-desc') return [...list].sort((a, b) => priceOfBook(b) - priceOfBook(a))
    if (sort === 'rating') return [...list].sort((a, b) => ratingOf(b) - ratingOf(a))
    if (sort === 'az') return [...list].sort((a, b) => a.title.localeCompare(b.title))
    return list
  }, [books, query, sort])

  const dirty = query.trim() !== ''
  const reset = () => {
    setQuery('')
  }


  return (
    <section className="mx-auto mt-7 w-full max-w-7xl">
      {/* ---------- search + sort + filters ---------- */}
      <div className="cprod-toolbar rounded-3xl border border-slate-200/80 bg-white/70 p-3 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04] sm:p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          {/* glass search pill */}
          <div className="cprod-search group relative flex flex-1 items-center gap-2.5 rounded-full border border-slate-200 bg-white px-4 py-2.5 shadow-sm transition-all focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-100 dark:border-white/10 dark:bg-white/5 dark:focus-within:ring-brand-500/20">
            <Search className="h-4 w-4 shrink-0 text-slate-400 transition-colors group-focus-within:text-brand-600" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title or author…"
              aria-label="Search books"
              className="cprod-input w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400 dark:text-white dark:placeholder:text-slate-500 [&::-webkit-search-cancel-button]:hidden"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label="Search clear"
                className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-700 dark:bg-white/10 dark:text-slate-300"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            ) : null}
          </div>

          {/* sort */}
          <div className="cprod-sort flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-2.5 shadow-sm dark:border-white/10 dark:bg-white/5">
            <SlidersHorizontal className="h-4 w-4 shrink-0 text-slate-400" />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              aria-label="Sort books"
              className="cprod-select cursor-pointer appearance-none bg-transparent pr-1 text-sm font-medium text-slate-700 outline-none dark:text-slate-200"
            >
              {SORTS.map((option) => (
                <option key={option.key} value={option.key} className="text-slate-800">
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ---------- result meta ---------- */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-2">
        <p className="cprod-meta text-sm text-slate-500 dark:text-slate-400">
          {loading ? (
            'Books load ho rahi hain…'
          ) : (
            <>
              <span className="cprod-meta-count font-semibold text-slate-900 dark:text-white">
                {visible.length}
              </span>{' '}
              {visible.length === 1 ? 'book' : 'books'}
              {query ? (
                <>
                  {' '}
                  for “
                  <span className="font-medium text-slate-700 dark:text-slate-200">{query}</span>”
                </>
              ) : null}
            </>
          )}
        </p>

        {dirty ? (
          <button
            type="button"
            onClick={reset}
            className="text-sm font-semibold text-brand-700 transition hover:text-brand-900 hover:underline dark:text-brand-300 dark:hover:text-white"
          >
            Clear all
          </button>
        ) : null}
      </div>

      {/* ---------- states ---------- */}
      {loading ? (
        <div className="mt-5 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse overflow-hidden rounded-2xl border border-slate-200/70 bg-white dark:border-white/10 dark:bg-white/5"
            >
              <div className="aspect-[3/4] bg-slate-100 dark:bg-slate-800" />
              <div className="space-y-2 p-3.5">
                <div className="h-2.5 w-16 rounded bg-slate-100 dark:bg-slate-800" />
                <div className="h-3 w-full rounded bg-slate-100 dark:bg-slate-800" />
                <div className="h-3 w-2/3 rounded bg-slate-100 dark:bg-slate-800" />
                <div className="h-9 w-full rounded-xl bg-slate-100 dark:bg-slate-800" />
              </div>
            </div>
          ))}
        </div>
      ) : visible.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white/70 px-6 py-14 text-center dark:border-white/15 dark:bg-white/5">
          <p className="text-base font-semibold text-slate-800 dark:text-white">
            Koi book nahi mili
          </p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Search clear karo ya doosra naam try karo.
          </p>
          <button
            type="button"
            onClick={reset}
            className="mt-4 rounded-full bg-brand-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-800"
          >
            Clear search
          </button>
        </div>
      ) : (
        <div className="mt-5 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {visible.map((book) => (
            <BookCard
              key={`${book.title}-${book.author}`}
              book={book}
              category={label}
              liked={has(book.id)}
              onWishlist={toggleWishlist}
              onCart={addToCart}
              onOpen={setQuick}
            />
          ))}
        </div>
      )}

      {/* book par click -> modern quick view */}
      {quick ? (
        <BookQuickView
          book={{ ...quick, category: label, slug }}
          category={label}
          liked={has(quick.id)}
          onWishlist={() => toggleWishlist(quick)}
          onClose={() => setQuick(null)}
        />
      ) : null}
    </section>
  )
}

