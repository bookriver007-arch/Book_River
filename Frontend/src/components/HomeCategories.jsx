import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { HOME_CATEGORIES } from '../data/categoryBooks.js'
import HangingBook from './HangingBook.jsx'
import '../css/Deals.css'
import '../css/Categories.css'

/**
 * Ek category ka section:
 * - heading + short description CENTER me
 * - left / right arrows (click par books ek qadam aage/peeche)
 * - ek waqt me 4 books, hover par thodi badi hoti hai
 * - book par click -> uski detail (naam, description, price) khulti hai
 * - `decorated` = aero ke barabar left/right latakti kitaabein bhi
 */
function CategoryRow({ category, decorated = false, onOpen }) {
  const railRef = useRef(null)
  const [atStart, setAtStart] = useState(true)
  const [atEnd, setAtEnd] = useState(false)

  const updateEdges = useCallback(() => {
    const el = railRef.current
    if (!el) return
    setAtStart(el.scrollLeft <= 4)
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 4)
  }, [])

  useEffect(() => {
    updateEdges()
    window.addEventListener('resize', updateEdges)
    return () => window.removeEventListener('resize', updateEdges)
  }, [updateEdges])

  // sirf arrow se move (auto move nahi) — ek book ka pura step
  const step = (dir) => {
    const el = railRef.current
    if (!el) return
    const first = el.querySelector('[data-book]')
    const amount = first ? first.getBoundingClientRect().width + 16 : el.clientWidth * 0.8
    el.scrollBy({ left: dir * amount, behavior: 'smooth' })
  }

  return (
    <section className="cat-section" aria-label={category.label}>
      <header className="cat-head">
        <h2 className="cat-title">{category.label}</h2>
        <p className="cat-sub">{category.tagline}</p>
      </header>

      <div className="cat-rail-row">
        {/* left latakti kitaab — arrow ke barabar */}
        {decorated ? <HangingBook side="left" /> : null}

        <div className="cat-rail-wrap">
          <button
            type="button"
            className="cat-arrow cat-arrow--prev"
            onClick={() => step(-1)}
            disabled={atStart}
            aria-label={`${category.label} — peeche`}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <div className="cat-rail" ref={railRef} onScroll={updateEdges}>
            {category.books.map((book) => (
              <button
                type="button"
                className="cat-book"
                data-book
                key={`${category.slug}-${book.title}`}
                onClick={() => onOpen(book, category)}
                aria-label={`${book.title} — details dekho`}
              >
                {/* wahi modern real-book shape jo deal cards me hai */}
                <span className="deal-book">
                  <span className="deal-book-inner">
                    <span className="deal-pages" aria-hidden="true" />
                    <span className="deal-cover">
                      <img
                        src={book.image}
                        alt={`${book.title} cover`}
                        loading="lazy"
                        decoding="async"
                      />
                    </span>
                  </span>
                </span>

                <span className="cat-book-title">{book.title}</span>
                {book.author ? (
                  <span className="cat-book-author">by {book.author}</span>
                ) : null}
                {book.price ? <span className="cat-book-price">{book.price}</span> : null}
              </button>
            ))}
          </div>

          <button
            type="button"
            className="cat-arrow cat-arrow--next"
            onClick={() => step(1)}
            disabled={atEnd}
            aria-label={`${category.label} — aage`}
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* right latakti kitaab — arrow ke barabar */}
        {decorated ? <HangingBook side="right" /> : null}
      </div>
    </section>
  )
}

/** Home page — har category ka apna section (6 sections), sab same style. */
export default function HomeCategories() {
  const [apiBooks, setApiBooks] = useState([])
  // click ki hui book (detail modal ke liye)
  const [active, setActive] = useState(null)

  // Admin (Home → Category Books) se books laao
  useEffect(() => {
    let cancelled = false
    fetch('/api/home-category-books')
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        if (!cancelled) setApiBooks(Array.isArray(data) ? data : [])
      })
      .catch(() => {
        if (!cancelled) setApiBooks([])
      })
    return () => {
      cancelled = true
    }
  }, [])

  // Escape se modal band
  useEffect(() => {
    if (!active) return undefined
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setActive(null)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [active])

  // slug ke hisaab se group — jo category admin me bhari hai wahi dikhegi,
  // warna uski demo books
  const categories = useMemo(() => {
    const bySlug = apiBooks.reduce((acc, book) => {
      if (!book || !book.slug || !book.imageUrl) return acc
      if (!acc[book.slug]) acc[book.slug] = []
      acc[book.slug].push({
        title: book.title,
        author: book.author,
        price: book.price,
        description: book.description,
        image: book.imageUrl,
      })
      return acc
    }, {})

    return HOME_CATEGORIES.map((category) => ({
      ...category,
      books: bySlug[category.slug]?.length ? bySlug[category.slug] : category.books,
    }))
  }, [apiBooks])

  const openBook = (book, category) => setActive({ book, category })
  const closeBook = () => setActive(null)

  return (
    <div className="cat-wrap">
      {categories.map((category) => (
        <CategoryRow key={category.slug} category={category} decorated onOpen={openBook} />
      ))}

      {/* ---- book detail modal (naam + description + price) ---- */}
      {active ? (
        <div
          className="cat-modal"
          role="dialog"
          aria-modal="true"
          aria-label={active.book.title}
        >
          <button
            type="button"
            className="cat-modal-backdrop"
            aria-label="Band karo"
            onClick={closeBook}
          />

          <div className="cat-modal-panel">
            <button
              type="button"
              className="cat-modal-close"
              aria-label="Band karo"
              onClick={closeBook}
            >
              <X className="h-4 w-4" />
            </button>

            <div className="cat-modal-cover">
              <span className="deal-book">
                <span className="deal-book-inner">
                  <span className="deal-pages" aria-hidden="true" />
                  <span className="deal-cover">
                    <img src={active.book.image} alt={`${active.book.title} cover`} />
                  </span>
                </span>
              </span>
            </div>

            <div className="cat-modal-body">
              <Link to={`/category/${active.category.slug}`} className="cat-modal-tag">
                {active.category.label}
              </Link>

              <h3 className="cat-modal-title">{active.book.title}</h3>
              {active.book.author ? (
                <p className="cat-modal-author">by {active.book.author}</p>
              ) : null}
              {active.book.price ? (
                <span className="cat-modal-price">{active.book.price}</span>
              ) : null}

              <p className="cat-modal-desc">
                {active.book.description || active.category.tagline}
              </p>

              <div className="cat-modal-actions">
                <Link to={`/category/${active.category.slug}`} className="cat-modal-btn">
                  {active.category.label} page kholo
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
