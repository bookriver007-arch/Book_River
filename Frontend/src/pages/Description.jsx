import { useEffect, useRef, useState } from 'react'
import { motion as Motion } from 'framer-motion'
import { Baby, BookOpen, ShieldCheck, Sparkles, Star, Truck } from 'lucide-react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import Slideshow from '../components/Slideshow.jsx'
import Footer from '../components/Footer.jsx'
import '../css/Description.css'

/* ============================================================
   DESCRIPTION PAGE — slideshow (Admin slides), category ribbon,
   open book, kids book, frames, products aur reviews.
   Slideshow component: ../components/Slideshow.jsx
   Styles: ../css/Description.css
   ============================================================ */

// Default category boxes — shown until categories are added in the Admin panel
const DEFAULT_CATEGORIES = [
  'Poetry Books',
  'Novels',
  'Kids Books',
  'Fiction Books',
  'Science Books',
]

// Highlight box that always scrolls along with the categories
const PROMO = '50% Off All Books'

// Fallback book pages — shown until books are added in the Admin panel
// (Admin → DescriptionAdmin → "Open Book — Pages").
const DEFAULT_BOOKS = [
  {
    title: 'The Salt & the Stars',
    author: 'A. M. Rivers',
    tag: 'Science',
    price: 'Rs. 1,250',
    image: '/banners/science.svg',
    description:
      'From the first sea voyage to the deepest telescope, this is the story of how curiosity mapped the world around us. A warm, readable journey through the discoveries that quietly shaped everyday life.',
  },
  {
    title: 'Letters from the Riverbank',
    author: 'Noor Verma',
    tag: 'Fiction',
    price: 'Rs. 950',
    image: '/banners/fiction.svg',
    description:
      'Every summer, two old friends exchange one letter. This quiet, sunlit novel follows forty years of those letters — and all the laughter, secrets and silences they carry between them.',
  },
  {
    title: 'A Brief History of Tomorrow',
    author: 'E. S. Karan',
    tag: 'History',
    price: 'Rs. 1,450',
    image: '/banners/history.svg',
    description:
      'What did the people of the past imagine today would look like? A fascinating tour of yesterday\'s visions of the future — the machines, the cities, and the promises that never quite arrived.',
  },
  {
    title: 'Verses for Rainy Evenings',
    author: 'Mira Tal',
    tag: 'Poetry',
    price: 'Rs. 799',
    image: '/banners/poetry.svg',
    description:
      'A slim collection of poems written for slow evenings, warm cups and open windows. Short, luminous verses about rain, rooftops, small cities and the people we keep remembering.',
  },
  {
    title: "The Clockmaker's Garden",
    author: 'Daniyal R.',
    tag: 'Business',
    price: 'Rs. 1,100',
    image: '/banners/business.svg',
    description:
      'A gentle fable about a small shop, its patient owner and the strange machines he repairs — a warm story about patience, craft and the quiet economics of caring.',
  },
  {
    title: 'The Night Train to Nowhere',
    author: 'Sara Ilyas',
    tag: 'Fiction',
    price: 'Rs. 1,050',
    image: '/banners/fiction.svg',
    description:
      'A sleepless passenger boards a train that stops at every forgotten station. A dreamy, page-turning mystery about strangers, second chances and the stories we never finish.',
  },
  {
    title: 'The Moon Gardener',
    author: 'Emaan K.',
    tag: 'Poetry',
    price: 'Rs. 720',
    image: '/banners/poetry.svg',
    description:
      'Poems that grow like night flowers — small, silver, stubborn things about growing up, growing apart, and growing anyway.',
  },
  {
    title: 'Empires of Paper',
    author: 'T. H. Malik',
    tag: 'History',
    price: 'Rs. 1,390',
    image: '/banners/history.svg',
    description:
      'From clay tablets to printing presses, this is the story of how paper carried ideas, empires and revolutions across the world.',
  },
  {
    title: 'The Paper Boat Club',
    author: 'Hira S.',
    tag: 'Fiction',
    price: 'Rs. 890',
    image: '/banners/fiction.svg',
    description:
      'Four children, one monsoon river and a paper boat that keeps coming back. A soft, nostalgic story about friendship and the things we float away.',
  },
  {
    title: 'Small Machines, Big Ideas',
    author: 'Omar J.',
    tag: 'Science',
    price: 'Rs. 1,320',
    image: '/banners/science.svg',
    description:
      'Bicycles, thermometers, radios — the everyday objects that quietly changed the world. Short, delightful chapters on how simple ideas win.',
  },
]

function BookLeftPage({ book }) {
  return (
    <div className="bk-page bk-left">
      <div className="book-col">
        <div className="book-img">
          <img
            src={book.image}
            alt={`${book.title} — cover picture`}
            loading="lazy"
            decoding="async"
            draggable="false"
          />
        </div>
      </div>
    </div>
  )
}

function BookRightPage({ book, pageNo, total }) {
  return (
    <div className="bk-page bk-right">
      <div className="book-col">
        {book.tag ? <span className="book-tag">{book.tag}</span> : null}
        <h3 className="book-title">{book.title}</h3>
        {book.author ? <p className="book-author">by {book.author}</p> : null}
        <p className="book-desc">{book.description}</p>
        <span className="book-page-no">
          {pageNo} / {total}
        </span>
      </div>
    </div>
  )
}

/**
 * Modern orange + gold category ribbon.
 * The box names come from the Admin panel (DescriptionAdmin page, saved in
 * MongoDB via /api/description-admin/categories); the default list is only a
 * fallback. They scroll right -> left automatically (pure CSS, GPU only),
 * pause on hover, and respect prefers-reduced-motion.
 */
function CategoryRibbon() {
  const [categories, setCategories] = useState([])

  // Category boxes managed from the Admin panel.
  useEffect(() => {
    let cancelled = false
    fetch('/api/description-admin/categories')
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        if (!cancelled) {
          const list = Array.isArray(data) ? data.map((c) => c.name).filter(Boolean) : []
          setCategories(list)
        }
      })
      .catch(() => {
        if (!cancelled) setCategories([])
      })
    return () => {
      cancelled = true
    }
  }, [])

  const names = categories.length ? categories : DEFAULT_CATEGORIES
  const items = [...names, PROMO]

  return (
    <section className="ribbon" aria-label="Book categories">
      <div className="ribbon-track">
        {/* Two copies -> seamless right -> left loop */}
        {[0, 1].map((copy) => (
          <div className="ribbon-group" key={copy} aria-hidden={copy === 1 || undefined}>
            {items.map((item, idx) => (
              <span
                key={`${copy}-${idx}-${item}`}
                className={item === PROMO ? 'ribbon-item ribbon-promo' : 'ribbon-item'}
              >
                {item}
              </span>
            ))}
          </div>
        ))}
      </div>
    </section>
  )
}

/**
 * Open book — left page shows the picture, right page the description.
 * Click the right page: it lifts and turns left like a real book page,
 * revealing the next entry (left page click goes back).
 */
// Standing kids-book card — cover image uploaded from the Admin panel.
// Nothing shows until a cover is uploaded.
// align="right" = pehli book ke right; align="left" = doosri book ke left.
function KidsBookCard({ align = 'right' }) {
  const [kidsBook, setKidsBook] = useState(null)

  useEffect(() => {
    let cancelled = false
    fetch('/api/description-admin/kids-book')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!cancelled && data && data.imageUrl) setKidsBook(data)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  // no cover uploaded yet -> don't show the card at all
  if (!kidsBook) return null

  return (
    <aside
      className={align === 'left' ? 'kidsbook-scene kidsbook-scene-left' : 'kidsbook-scene'}
      aria-label="Kids book"
    >
      <div className="kidsbook-hang">
        {/* the rope the book hangs from */}
        <span className="kidsbook-rope" aria-hidden="true" />
        <div className="kidsbook">
        <div className="kidsbook-cover">
          <img className="kidsbook-photo" src={kidsBook.imageUrl} alt="Kids book cover" />
        </div>
        <div className="kidsbook-pages" aria-hidden="true" />
        </div>
      </div>
    </aside>
  )
}

// Hanging-frame gallery — admin-uploaded pictures scroll right -> left
function FramesMarquee() {
  const [frames, setFrames] = useState([])

  useEffect(() => {
    let cancelled = false
    fetch('/api/description-admin/frames')
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        if (!cancelled) setFrames(Array.isArray(data) ? data : [])
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  if (!frames.length) return null

  return (
    <section className="frames-marquee" aria-label="Kids gallery">
      <div className="frames-track">
        {/* Two copies -> seamless right -> left loop */}
        {[0, 1].map((copy) => (
          <div className="frames-group" key={copy} aria-hidden={copy === 1 || undefined}>
            {frames.map((frame, i) => (
              <div className="frame-hang" key={`${copy}-${frame._id}-${i}`}>
                <span className="frame-rope" aria-hidden="true" />
                <div className="frame-card">
                  <img src={frame.imageUrl} alt="" loading="lazy" decoding="async" />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  )
}

// "What's on the website" — info cards section
const SITE_INFO = [
  {
    Icon: BookOpen,
    title: '5+ Book Categories',
    text: 'Fiction, science, history, business aur poetry — har shelf par kuch naya.',
  },
  {
    Icon: Sparkles,
    title: 'New Launches Every Week',
    text: 'Nayi kitaabein har hafte — sabse pehle aapke liye shelf par.',
  },
  {
    Icon: Baby,
    title: 'Kids Corner',
    text: 'Picture books, fairy tales aur story time — chhote readers ke liye.',
  },
  {
    Icon: Truck,
    title: 'Fast Doorstep Delivery',
    text: 'Order karo aur ghar baithe books receive karo — quick aur safe.',
  },
  {
    Icon: ShieldCheck,
    title: '100% Secure Payments',
    text: 'Encrypted checkout — aapki payment details hamesha safe rehti hain.',
  },
  {
    Icon: Star,
    title: 'Handpicked by Real Readers',
    text: 'Har book readers ne khud chuni hai — genuine reviews ke saath.',
  },
]

// PRODUCTS — grid of book covers (4 per row, 8 total); click opens the book
function ProductsGrid() {
  const [books, setBooks] = useState(DEFAULT_BOOKS)
  const [selected, setSelected] = useState(null)

  // Products grid — admin se manage hota hai (Admin → "Products — Grid")
  useEffect(() => {
    let cancelled = false
    fetch('/api/description-admin/products')
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        if (cancelled) return
        const list = Array.isArray(data) ? data : []
        if (list.length) setBooks(list.map((b) => ({ ...b, image: b.imageUrl })))
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  // Escape se opened book band
  useEffect(() => {
    if (!selected) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') setSelected(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selected])

  const items = books.slice(0, 10)

  return (
    <section className="products" aria-label="Products">
      <div className="products-inner">
        <span className="products-eyebrow">Our Collection</span>
        <h2 className="products-title">
          <span className="products-title-grad">Products</span>
        </h2>
        <p className="products-sub">Cover par click karo — book khul kar poori details dikhayegi.</p>

        <ul className="products-grid">
          {items.map((book, i) => (
            <li key={`${book._id || book.title}-${i}`}>
              <button
                type="button"
                className="product-btn"
                onClick={() => setSelected(book)}
                aria-label={`${book.title} — book kholein`}
              >
                <span className="product-book">
                  <span className="product-cover">
                    <img src={book.image} alt={book.title} loading="lazy" decoding="async" />
                  </span>
                  <span className="product-pages" aria-hidden="true" />
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {selected && (
        <div className="product-modal" role="dialog" aria-modal="true" aria-label={selected.title}>
          <button
            type="button"
            className="product-backdrop"
            aria-label="Close"
            onClick={() => setSelected(null)}
          />
          <Motion.div
            className="product-spread"
            initial={{ opacity: 0, scale: 0.94, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* left page — inside of the front cover */}
            <div className="spread-left">
              <img src={selected.image} alt={`${selected.title} inside cover`} />
            </div>

            {/* right page — details */}
            <div className="spread-right">
              {selected.tag ? <span className="spread-tag">{selected.tag}</span> : null}
              <h3 className="spread-title">{selected.title}</h3>
              {selected.author ? <p className="spread-author">by {selected.author}</p> : null}
              {selected.price ? <p className="spread-price">{selected.price}</p> : null}
              <p className="spread-desc">{selected.description}</p>
              <div className="spread-actions">
                <Link to="/auth" className="spread-login">
                  Login
                </Link>
                <button type="button" className="spread-close" onClick={() => setSelected(null)}>
                  Close book
                </button>
              </div>
            </div>

            {/* the front cover — khud khul kar left ki taraf palat jati hai */}
            <Motion.div
              className="spread-cover"
              initial={{ rotateY: 0 }}
              animate={{ rotateY: -178 }}
              transition={{ duration: 0.95, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <img src={selected.image} alt={`${selected.title} cover`} />
            </Motion.div>
          </Motion.div>
        </div>
      )}
    </section>
  )
}

// Fallback reviews — shown until reviews are added in the Admin panel
const DEFAULT_REVIEWS = [
  { name: 'Ayesha K.', rating: 5, text: 'Ordered three books on Friday, sab Sunday tak aa gayin. Packing bhi bohat achi thi — books bilkul nayi!' },
  { name: 'Hamza R.', rating: 5, text: 'The kids section is lovely. My daughter ab har hafte nayi picture book maangti hai. Great collection!' },
  { name: 'Sana M.', rating: 4, text: 'Poetry collection bohat thoughtful hai. Prices bhi reasonable — aur delivery fast.' },
  { name: 'Bilal T.', rating: 5, text: 'Book River ki handpicked list sach mein achi hai. History books ka selection mera favourite hai.' },
  { name: 'Mariam A.', rating: 5, text: 'Checkout simple tha aur order tracking clear. Books ka quality original — 100% recommended.' },
  { name: 'Usman S.', rating: 4, text: 'Nayi books har hafte update hoti hain. "New Launches" section se hi sabse pehle order karta hoon.' },
]

function ReviewsSlider() {
  const [reviews, setReviews] = useState(DEFAULT_REVIEWS)

  // Reviews admin se manage hoti hain (Admin → "Reviews — Slider")
  useEffect(() => {
    let cancelled = false
    fetch('/api/description-admin/reviews')
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        if (cancelled) return
        const list = Array.isArray(data) ? data : []
        if (list.length) setReviews(list)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <section className="reviews" aria-label="Customer reviews">
      <div className="reviews-inner">
        <span className="reviews-eyebrow">Reviews</span>
        <h2 className="reviews-title">
          <span className="reviews-title-grad">Readers Love Us</span>
        </h2>
        <p className="reviews-sub">Asli readers ke asli reviews — jo unhe sabse zyada pasand aaya.</p>
      </div>

      <div className="reviews-marquee">
        <div className="reviews-track">
          {/* Two copies -> seamless right -> left loop */}
          {[0, 1].map((copy) => (
            <div className="reviews-group" key={copy} aria-hidden={copy === 1 || undefined}>
              {reviews.map((review, i) => (
                <article className="review-card" key={`${copy}-${review._id || i}-${i}`}>
                  <div className="review-stars" aria-label={`${review.rating} out of 5 stars`}>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star key={n} className={n <= review.rating ? 'review-star is-on' : 'review-star'} />
                    ))}
                  </div>
                  <p className="review-text">“{review.text}”</p>
                  <div className="review-who">
                    <span className="review-avatar" aria-hidden="true">
                      {review.name.charAt(0).toUpperCase()}
                    </span>
                    <div>
                      <p className="review-name">{review.name}</p>
                      <p className="review-verified">Verified Reader</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function SiteInfo() {
  return (
    <section className="siteinfo" aria-label="Website highlights">
      <div className="siteinfo-inner">
        <span className="siteinfo-eyebrow">Explore</span>
        <h2 className="siteinfo-title">
          <span className="siteinfo-title-grad">Sab Kuch Ek Jagah</span>
        </h2>
        <p className="siteinfo-sub">Book River par kya kya milta hai — ek nazar mein.</p>

        <ul className="siteinfo-grid">
          {SITE_INFO.map((item) => (
            <li className="siteinfo-card" key={item.title}>
              <span className="siteinfo-icon">
                <item.Icon className="h-5 w-5" />
              </span>
              <h3 className="siteinfo-card-title">{item.title}</h3>
              <p className="siteinfo-card-text">{item.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

// Footer — shared component (`../components/Footer.jsx`) — Description aur Home dono par

// Open book — mouse lekar aane par pages khud palatne lagte hain (auto).
const FLIP_MS = 1400 // ek page palatne ka time (CSS animation ke barabar)
const AUTO_GAP = 700 // ek page palatne ke baad agli kab shuru ho (hover me)
const MAX_PAGES = 5 // sirf 5 pages tak — admin kitni bhi add kare

function OpenBook({ align = 'left' }) {
  // Book pages saved from the Admin panel (MongoDB via /api/description-admin/books)
  const [books, setBooks] = useState(() => DEFAULT_BOOKS.slice(0, MAX_PAGES))
  const [index, setIndex] = useState(0)
  const [flip, setFlip] = useState(null) // { dir: 'next' | 'prev', target }
  const [hovering, setHovering] = useState(false)
  const timerRef = useRef(null)
  const turnRef = useRef(null)

  // clear the commit timer if the page unmounts mid-flip
  useEffect(() => () => window.clearTimeout(timerRef.current), [])

  // Load admin-managed book pages; fall back to the built-in samples.
  useEffect(() => {
    let cancelled = false
    fetch('/api/description-admin/books')
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        if (cancelled) return
        const list = Array.isArray(data) ? data : []
        // sirf pehle MAX_PAGES (5) pages — admin zyada add kare to bhi 5 hi
        if (list.length) setBooks(list.map((b) => ({ ...b, image: b.imageUrl })).slice(0, MAX_PAGES))
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  const total = books.length

  const turn = (dir) => {
    if (flip) return
    const target = (index + (dir === 'next' ? 1 : -1) + total) % total
    setFlip({ dir, target })
    // commit after the CSS flip finishes (thoda buffer)
    timerRef.current = window.setTimeout(() => {
      setIndex(target)
      setFlip(null)
    }, FLIP_MS + 50)
  }

  // hover ke dauraan auto page-turn — ek page palatne ke baad agli (smooth flow)
  useEffect(() => {
    turnRef.current = turn
  })

  useEffect(() => {
    if (!hovering || total <= 1 || flip) return undefined
    const id = window.setTimeout(() => turnRef.current?.('next'), AUTO_GAP)
    return () => window.clearTimeout(id)
  }, [hovering, total, flip, index])

  const shownIndex = flip ? flip.target : index
  const under = books[shownIndex]
  const current = books[index]

  const onKey = (dir) => (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      turn(dir)
    }
  }

  return (
    <div
      className={align === 'right' ? 'open-book-wrap open-book-wrap-right' : 'open-book-wrap'}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <div className="open-book">
        {/* ---- left page (picture) ---- */}
        <div
          className="book-click"
          role="button"
          tabIndex={0}
          aria-label="Previous book"
          onClick={() => turn('prev')}
          onKeyDown={onKey('prev')}
        >
          <BookLeftPage book={under} />
        </div>

        {/* ---- right page (description) ---- */}
        <div
          className="book-click"
          role="button"
          tabIndex={0}
          aria-label="Next book"
          onClick={() => turn('next')}
          onKeyDown={onKey('next')}
        >
          <BookRightPage book={under} pageNo={shownIndex + 1} total={total} />
        </div>

        {/* ---- the turning page (3D flip) ---- */}
        {flip && (
          <div className={`book-flip book-flip-${flip.dir}`}>
            <div className="book-face">
              {flip.dir === 'next' ? (
                <BookRightPage book={current} pageNo={index + 1} total={total} />
              ) : (
                <BookLeftPage book={current} />
              )}
              {/* light/shadow sweep while the page lifts */}
              <span className="book-shade" aria-hidden="true" />
            </div>
            <div className="book-face book-face-back">
              {flip.dir === 'next' ? (
                <BookLeftPage book={books[flip.target]} />
              ) : (
                <BookRightPage
                  book={books[flip.target]}
                  pageNo={flip.target + 1}
                  total={total}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function Description() {
  return (
    <div className="book-page min-h-screen">
      {/* Description page par wishlist / cart / track icons nahi chahiye */}
      <Navbar shopIcons={false} />

      {/* ---- Full-width slideshow: one picture at a time, auto-rotating (right -> left) ---- */}
      <Motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="pt-2 sm:pt-3"
      >
        <Slideshow />
      </Motion.div>

      {/* ---- Modern category ribbon (orange + gold, right -> left) ---- */}
      <Motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <CategoryRibbon />
      </Motion.div>

      {/* ---- Big modern heading above the books ---- */}
      <Motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.25 }}
        className="launch-head"
      >
        <span className="launch-eyebrow">✨ Just Arrived</span>
        <h2 className="launch-title">
          <span className="launch-title-grad">New Launches</span>
        </h2>
        <p className="launch-sub">
          Fresh off the shelf — nayi nayi books, sabse pehle aapke liye.
        </p>
        <div className="gold-rule mx-auto mt-6 w-40" />
      </Motion.div>

      {/* ---- Open book (left) + standing kids book with price tag on the right ---- */}
      <div className="first-book-row">
        <Motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <OpenBook />
        </Motion.div>
        <KidsBookCard />
      </div>

      {/* ---- Second open book (right) + kids book hanging on its left ---- */}
      <div className="second-book-row">
        <Motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <OpenBook align="right" />
        </Motion.div>
        <KidsBookCard align="left" />
      </div>

      {/* ---- Third open book (left) + kids book hanging on its right ---- */}
      <div className="third-book-row">
        <Motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <OpenBook />
        </Motion.div>
        <KidsBookCard />
      </div>

      {/* ---- Hanging frame gallery: pictures from the admin, right -> left ---- */}
      <Motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <FramesMarquee />
      </Motion.div>

      {/* ---- Products: 8 book covers, click opens the book ---- */}
      <Motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.65 }}
      >
        <ProductsGrid />
      </Motion.div>

      {/* ---- Reviews slider (right -> left) ---- */}
      <Motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.7 }}
      >
        <ReviewsSlider />
      </Motion.div>

      {/* ---- Info: what's on the website ---- */}
      <Motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.7 }}
      >
        <SiteInfo />
      </Motion.div>

      {/* ---- Footer ---- */}
      <Footer />
    </div>
  )
}

