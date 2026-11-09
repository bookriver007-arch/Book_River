import { useEffect, useState } from 'react'
import '../css/Description.css'
import '../css/HangingBook.css'

/**
 * Rope se LATAKTI hui kitaab (Description page wali kids-book).
 * Cover admin se aata hai: Admin → Description → Kids Book.
 * Rope ke saath halka swing khud hota rehta hai (`kidsbook-swing`, pure CSS).
 * `side` = 'left' | 'right' — left wali book ka tilt mirror hota hai.
 */

// ek hi API call → saari latakti kitaabein isi data se banti hain
let kidsBookPromise = null

function loadKidsBook() {
  if (!kidsBookPromise) {
    kidsBookPromise = fetch('/api/home-hanging-book')
      .then((r) => (r.ok ? r.json() : null))
      .then((home) => {
        if (home && home.imageUrl) return home
        // fallback — Home ka cover na ho to Description wali kids-book dikhe
        return fetch('/api/description-admin/kids-book')
          .then((r) => (r.ok ? r.json() : null))
          .then((data) => (data && data.imageUrl ? data : null))
      })
      .catch(() => null)
  }
  return kidsBookPromise
}

export default function HangingBook({ side = 'right' }) {
  const [book, setBook] = useState(null)

  useEffect(() => {
    let cancelled = false
    loadKidsBook().then((data) => {
      if (!cancelled && data) setBook(data)
    })
    return () => {
      cancelled = true
    }
  }, [])

  // cover upload nahi hua -> kuch nahi dikhta
  if (!book) return null

  return (
    <div className={`hanging-book hanging-book--${side}`} aria-hidden="true">
      <div className="hanging-book-inner">
        <div className="kidsbook-hang">
          {/* rope jis se kitaab latakti hai */}
          <span className="kidsbook-rope" aria-hidden="true" />
          <div className="kidsbook">
            <div className="kidsbook-cover">
              <img
                className="kidsbook-photo"
                src={book.imageUrl}
                alt={book.title || 'Kids book cover'}
                loading="lazy"
                decoding="async"
              />
            </div>
            <div className="kidsbook-pages" aria-hidden="true" />
          </div>
        </div>
        <span className="hanging-book-shadow" aria-hidden="true" />
      </div>
    </div>
  )
}
