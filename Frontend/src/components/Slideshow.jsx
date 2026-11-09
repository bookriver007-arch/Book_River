import { useEffect, useMemo, useState } from 'react'
import '../css/Description.css'

/* ============================================================
   SLIDESHOW — one picture at a time, auto-rotating right -> left.
   Pictures come from the Admin panel (saved in MongoDB, served by
   GET /api/description-admin). The built-in banners below only show
   when the admin has not uploaded anything yet.
   Styles: ../css/Description.css
   ============================================================ */

// Built-in banners — fallback when the admin has not uploaded anything yet.
const FALLBACK = [
  { src: '/banners/fiction.svg', title: 'Fiction' },
  { src: '/banners/science.svg', title: 'Science' },
  { src: '/banners/history.svg', title: 'History' },
  { src: '/banners/business.svg', title: 'Business' },
  { src: '/banners/poetry.svg', title: 'Poetry' },
]

const SLIDE_MS = 4200 // how long each picture stays on screen
const SNAP_MS = 900 // slide transition (0.85s) + a small buffer

/**
 * Admin slides ka full-width slideshow (Description + Home dono use karte hain).
 * `tall`     = zyada unchi picture band (Home page ke liye).
 * `endpoint` = kaunse slides — Home ka apna `/api/home-slides`, Description ka
 *              `/api/description-admin` (default).
 */
export default function Slideshow({ tall = false, endpoint = '/api/description-admin' }) {
  const [index, setIndex] = useState(0) // 0..count (count = extra duplicate slide)
  const [animate, setAnimate] = useState(true) // turned off while snapping back
  const [paused, setPaused] = useState(false)
  const [apiSlides, setApiSlides] = useState([])

  // Load the pictures uploaded from the Admin panel (saved in MongoDB).
  useEffect(() => {
    let cancelled = false
    fetch(endpoint)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        if (!cancelled) setApiSlides(Array.isArray(data) ? data : [])
      })
      .catch(() => {
        if (!cancelled) setApiSlides([])
      })
    return () => {
      cancelled = true
    }
  }, [endpoint])

  // Admin-uploaded slides first; built-in banners as fallback.
  const slides = useMemo(() => {
    if (!apiSlides.length) return FALLBACK
    return apiSlides.map((slide) => ({
      src: slide.imageUrl,
      title: slide.title || 'Book River',
    }))
  }, [apiSlides])

  const count = slides.length

  // Start from the first picture whenever the picture list changes.
  useEffect(() => {
    setIndex(0)
    setAnimate(true)
  }, [slides])

  // Pause while the tab is hidden (saves CPU / battery).
  useEffect(() => {
    const onVisibility = () => setPaused(document.hidden)
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [])

  // Auto-advance: one picture at a time.
  useEffect(() => {
    if (paused || count <= 1 || index >= count) return undefined
    const id = window.setTimeout(() => setIndex(index + 1), SLIDE_MS)
    return () => window.clearTimeout(id)
  }, [index, paused, count])

  // The track carries one extra slide (a duplicate of the first picture) so
  // the last -> first wrap also moves right -> left. On the duplicate we snap
  // back to the real first slide with the transition off — seamless loop.
  useEffect(() => {
    if (count <= 1 || index !== count) return undefined
    const id = window.setTimeout(() => {
      setAnimate(false)
      setIndex(0)
      // Double rAF: let the browser paint the snapped position before the
      // transition is switched back on (otherwise it animates all the way back).
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setAnimate(true))
      })
    }, SNAP_MS)
    return () => window.clearTimeout(id)
  }, [index, count])

  const track = count > 0 ? [...slides, slides[0]] : []

  return (
    <section
      className="w-full"
      aria-label="Book River collection"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className={tall ? 'slideshow-viewport slideshow-viewport--tall' : 'slideshow-viewport'}>
        <div
          className="slideshow-track"
          style={{
            transform: `translate3d(-${index * 100}%, 0, 0)`,
            transition: animate ? undefined : 'none',
          }}
        >
          {track.map((slide, i) => (
            <figure
              className="slideshow-slide"
              key={`${slide.src}-${i}`}
              aria-hidden={i >= count || undefined}
            >
              <img
                src={slide.src}
                alt={`${slide.title} — Book River`}
                loading={i < 2 ? 'eager' : 'lazy'}
                decoding="async"
                draggable="false"
              />
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
