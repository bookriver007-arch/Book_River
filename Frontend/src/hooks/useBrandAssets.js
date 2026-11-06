import { useEffect, useState } from 'react'

/**
 * Reads the image manifest produced by the Vite plugin.
 * The manifest points at the repo-root `Images/` folder, so any picture you
 * drop there is picked up automatically (no copying into the app needed).
 */
export default function useBrandAssets() {
  const [images, setImages] = useState([])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false

    fetch('/images/manifest.json', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled) return
        const list = Array.isArray(data) ? data : data?.images
        if (Array.isArray(list)) setImages(list)
        setReady(true)
      })
      .catch(() => {
        if (!cancelled) setReady(true)
      })

    return () => {
      cancelled = true
    }
  }, [])

  return {
    images,
    ready,
    /** The brand logo ships with the app (optimised, transparent). */
    logoUrl: '/logo.png',
    /** Full list of image URLs from the Images/ folder. */
    imageUrls: images.map((f) => `/images/${encodeURIComponent(f)}`),
  }
}
