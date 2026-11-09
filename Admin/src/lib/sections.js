import { Baby, BookOpen, Frame, Images, LayoutGrid, Star, Tags } from 'lucide-react'

/**
 * Admin ke pages — har section ka apna page (frontend navbar ki tarah).
 * `path`   = navbar link / apna route (/slides, /open-book …)
 * `anchor` = purane #hash links ke liye (backwards compatible)
 * `key`    = ENDPOINTS ke key se match karta hai
 */
export const SECTIONS = [
  {
    key: 'slides',
    path: '/slides',
    anchor: 'slides',
    label: 'Slides',
    icon: Images,
    blurb: 'Slideshow pictures — upload, reorder, delete.',
  },
  {
    key: 'categories',
    path: '/categories',
    anchor: 'categories',
    label: 'Categories',
    icon: Tags,
    blurb: 'The orange/gold ribbon boxes that scroll right → left.',
  },
  {
    key: 'books',
    path: '/open-book',
    anchor: 'open-book',
    label: 'Open Book',
    icon: BookOpen,
    blurb: 'Left page picture + right page heading/description.',
  },
  {
    key: 'kids',
    path: '/kids-book',
    anchor: 'kids-book',
    label: 'Kids Book',
    icon: Baby,
    blurb: 'Standing kids book cover and its caption below.',
  },
  {
    key: 'frames',
    path: '/frames',
    anchor: 'frames',
    label: 'Frames',
    icon: Frame,
    blurb: 'Hanging frames gallery (hanging from a rope).',
  },
  {
    key: 'products',
    path: '/products',
    anchor: 'products',
    label: 'Products',
    icon: LayoutGrid,
    blurb: 'Products grid — 5 covers per row.',
  },
  {
    key: 'reviews',
    path: '/reviews',
    anchor: 'reviews',
    label: 'Reviews',
    icon: Star,
    blurb: 'Reader reviews — they scroll in a slider.',
  },
]

/**
 * Purane URL / hash (`/books`, `/kids`, `#reviews`, `/open-book` …) ko
 * sahi section se match karta hai. Kuch match na ho to null.
 */
export function findSection(value) {
  const clean = String(value || '')
    .replace(/^[#/]+/, '')
    .trim()
    .toLowerCase()
  if (!clean) return null

  return (
    SECTIONS.find(
      (s) =>
        s.key === clean ||
        s.anchor === clean ||
        s.path.replace(/^\//, '').toLowerCase() === clean,
    ) || null
  )
}


