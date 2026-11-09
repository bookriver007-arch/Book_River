import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import '../css/Description.css'
import '../css/AboutBook.css'

/** right page par website ki shelves (English) */
const SHELVES = [
  { label: 'Board Books', slug: 'board-books' },
  { label: 'Kids Story Books', slug: 'kids-story-books' },
  { label: 'Knowledge Books', slug: 'knowledge-books' },
  { label: 'Activity Books', slug: 'activity-books' },
  { label: 'Teen Fiction', slug: 'teen-fiction' },
  { label: 'Adult Novels', slug: 'adult-novels' },
]

const FACTS = [
  { value: '6', label: 'Shelves' },
  { value: '100%', label: 'Hand-picked' },
  { value: 'Weekly', label: 'New arrivals' },
]

// default 3 pages — jab tak admin (Home → About Book) se set na ho
const DEFAULTS = [
  {
    page: 1,
    heading: 'A shelf for every reader',
    description:
      'Book River is a small, carefully curated online bookstore. Every title on our shelves is chosen by hand — for the very first hands that hold a board book, for curious kids who ask endless questions, and for grown-up readers who still love a good story.',
    images: ['/banners/fiction.svg', '/banners/science.svg', '/banners/poetry.svg'],
  },
  {
    page: 2,
    heading: 'Chosen by hand, page after page',
    description:
      'We read before we sell. Every new arrival is picked for its writing, its pictures and the way it feels in small hands — so the next book on your shelf is never a gamble.',
    images: ['/banners/science.svg', '/banners/history.svg', '/banners/fiction.svg'],
  },
  {
    page: 3,
    heading: 'From first words to last pages',
    description:
      'Board books for tiny fingers, story books that grow with your child, knowledge and activity books for curious minds, and novels for the long evenings — everything in one place.',
    images: ['/banners/poetry.svg', '/banners/business.svg', '/banners/science.svg'],
  },
]

const FLIP_MS = 1400 // ek page palatne ka time (Description book jaisa)
const AUTO_GAP = 700 // ek page palatne ke baad agli kab shuru ho (hover me)


/* ---- LEFT page: 3 pictures (modern collage) ---- */
function AboutLeftPage({ page }) {
  const [back, mid, polaroid] = page.images
  return (
    <div className="bk-page bk-left">
      <div className="book-col">
        <div className="about-collage">
          <img className="about-shot about-shot--back" src={back} alt="" loading="lazy" />
          <img className="about-shot about-shot--mid" src={mid} alt="" loading="lazy" />
          <figure className="about-shot about-shot--polaroid">
            <img src={polaroid} alt="" loading="lazy" />
            <figcaption>Handpicked covers</figcaption>
          </figure>
        </div>
      </div>
    </div>
  )
}

/* ---- RIGHT page: heading + description (+ page 1 par shelves) ---- */
function AboutRightPage({ page, pageNo, total }) {
  return (
    <div className="bk-page bk-right">
      <div className="book-col book-col--copy">
        <span className="about-bk-eyebrow">About Book River</span>

        <h3 className="about-bk-title">{page.heading}</h3>
        <p className="about-bk-text">{page.description}</p>

        {pageNo === 1 ? (
          <>
            <ul className="about-bk-list">
              {SHELVES.map((shelf) => (
                <li key={shelf.slug}>
                  <Link to={`/category/${shelf.slug}`}>{shelf.label}</Link>
                </li>
              ))}
            </ul>

            <div className="about-bk-facts">
              {FACTS.map((fact) => (
                <span className="about-bk-fact" key={fact.label}>
                  <strong>{fact.value}</strong>
                  {fact.label}
                </span>
              ))}
            </div>
          </>
        ) : null}

        <span className="book-page-no">
          {pageNo} / {total}
        </span>
      </div>
    </div>
  )
}

/**
 * About / knowledge section — Description page wali KHULI kitaab.
 * Mouse lekar aao -> pages khud palatne lagti hain (auto page change).
 * Click: right page = agla, left page = pichla.
 */
export default function AboutBook() {
  const [apiPages, setApiPages] = useState([])
  const [index, setIndex] = useState(0)
  const [flip, setFlip] = useState(null) // { dir: 'next' | 'prev', target }
  const [hovering, setHovering] = useState(false)
  const timerRef = useRef(null)
  const turnRef = useRef(null)

  // Admin (Home → About Book) se 3 pages laao
  useEffect(() => {
    let cancelled = false
    fetch('/api/home-about')
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        if (!cancelled) setApiPages(Array.isArray(data) ? data : [])
      })
      .catch(() => {
        if (!cancelled) setApiPages([])
      })
    return () => {
      cancelled = true
      window.clearTimeout(timerRef.current)
    }
  }, [])

  // admin data + default = hamesha 3 pages (har page par 3 pictures)
  const byPage = new Map(apiPages.map((doc) => [doc.page, doc]))
  const pages = DEFAULTS.map((def) => {
    const doc = byPage.get(def.page)
    const fromApi = [doc?.imageUrl, doc?.image2Url, doc?.image3Url]
    return {
      page: def.page,
      heading: doc?.heading || def.heading,
      description: doc?.description || def.description,
      images: def.images.map((fallback, i) => fromApi[i] || fallback),
    }
  })
  const total = pages.length

  const turn = (dir) => {
    if (flip || total <= 1) return
    const target = (index + (dir === 'next' ? 1 : -1) + total) % total
    setFlip({ dir, target })
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

  // Page 1 & 3 -> picture LEFT | Page 2 -> picture RIGHT
  const sides = (i) => {
    const page = pages[i]
    const pictureLeft = i % 2 === 0
    const pic = <AboutLeftPage page={page} />
    const txt = <AboutRightPage page={page} pageNo={i + 1} total={total} />
    return pictureLeft ? { left: pic, right: txt } : { left: txt, right: pic }
  }

  const shown = sides(shownIndex)
  const current = sides(index)
  const target = flip ? sides(flip.target) : null

  const onKey = (dir) => (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      turn(dir)
    }
  }


  return (
    <section className="about-book" id="about-book" aria-label="About Book River">
      <div
        className="open-book-wrap"
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
      >
        <div className="open-book">
          {/* ---- left page (page 1 & 3: picture · page 2: text) ---- */}
          <div
            className="book-click"
            role="button"
            tabIndex={0}
            aria-label="Pichla page"
            onClick={() => turn('prev')}
            onKeyDown={onKey('prev')}
          >
            {shown.left}
          </div>

          {/* ---- right page (page 1 & 3: text · page 2: picture) ---- */}
          <div
            className="book-click"
            role="button"
            tabIndex={0}
            aria-label="Agla page"
            onClick={() => turn('next')}
            onKeyDown={onKey('next')}
          >
            {shown.right}
          </div>

          {/* ---- palat'ta hua page (3D flip) ---- */}
          {flip ? (
            <div className={`book-flip book-flip-${flip.dir}`}>
              <div className="book-face">
                {flip.dir === 'next' ? current.right : current.left}
                <span className="book-shade" aria-hidden="true" />
              </div>
              <div className="book-face book-face-back">
                {flip.dir === 'next' ? target.left : target.right}
              </div>
            </div>
          ) : null}
        </div>

        {/* ---- page dots ---- */}
        <div className="about-bk-dots">
          {pages.map((p, i) => (
            <span
              key={p.page}
              className={i === index ? 'about-bk-dot is-active' : 'about-bk-dot'}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

