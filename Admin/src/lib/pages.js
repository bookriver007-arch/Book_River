import { findSection } from './sections'

/**
 * Frontend navbar ke page — admin me bhi wahi pages (same labels + slugs).
 * Slug frontend ke `/category/:slug` se exactly match karta hai.
 */
export const CATEGORY_PAGES = [
  {
    slug: 'board-books',
    label: 'Board Books',
    tagline: 'Chhoti haathon ke liye mazboot board kitaabein',
  },
  {
    slug: 'kids-story-books',
    label: 'Kids Story Books',
    tagline: 'Mazedaar kahaniyaan jo bachon ko padhna sikhati hain',
  },
  {
    slug: 'knowledge-books',
    label: 'Knowledge Books',
    tagline: 'Duniya ke baare mein jaanne ke liye',
  },
  {
    slug: 'activity-books',
    label: 'Activity Books',
    tagline: 'Puzzles, mazes, coloring aur bahut kuch',
  },
  {
    slug: 'teen-fiction',
    label: 'Teen Fiction',
    tagline: 'Teenagers ke liye novels — dosti, sapne aur suspense',
  },
  {
    slug: 'adult-novels',
    label: 'Adult Novels',
    tagline: 'Bade padhne walon ke liye gehri aur tawil kahaniyaan',
  },
]

/** admin + frontend dono ka category page path */
export const categoryPath = (slug) => `/category/${slug}`

export const findCategory = (slug) =>
  CATEGORY_PAGES.find((c) => c.slug === String(slug || '').toLowerCase()) || null

/* ---- admin ke apne pages ---- */
export const DASHBOARD_PATH = '/home'
export const DESCRIPTION_PATH = '/description'
export const SETTINGS_PATH = '/settings'
/** Home page ka apna slideshow editor */
export const HOME_SLIDES_PATH = '/home-slides'
/** Home page ka "Deal" section editor */
export const HOME_DEALS_PATH = '/home-deals'
/** Home page ke category sections ki books — har category ka apna page */
export const HOME_BOOKS_PATH = '/home-books'
/** kisi category ke products ka admin page */
export const homeBooksPath = (slug) => `${HOME_BOOKS_PATH}/${slug}`
/** Home page ki latakti kitaab (hanging book) */
export const HOME_HANGING_PATH = '/home-hanging-book'
/** Home page ke About book ke 3 pages */
export const HOME_ABOUT_PATH = '/home-about'
/** Orders — frontend cart se aaye orders (approve / reject) */
export const ORDERS_PATH = '/orders'

/** Description page ke kisi section par jump karne ka link (/description#slides) */
export const sectionHashPath = (anchor) => `${DESCRIPTION_PATH}#${anchor}`

/** har page ka document title */
export function pageTitle(pathname) {
  const section = findSection(pathname)
  if (section) return `${section.label} · Book River Admin`

  if (pathname === DASHBOARD_PATH) return 'Home · Book River Admin'
  if (pathname === DESCRIPTION_PATH) return 'Description · Book River Admin'
  if (pathname === HOME_SLIDES_PATH) return 'Home Slides · Book River Admin'
  if (pathname === HOME_DEALS_PATH) return 'Home Deals · Book River Admin'
  if (pathname === HOME_BOOKS_PATH) return 'Category Books · Book River Admin'
  if (pathname.startsWith(`${HOME_BOOKS_PATH}/`)) {
    const category = findCategory(pathname.split('/')[2])
    return category
      ? `${category.label} — Products · Book River Admin`
      : 'Category Books · Book River Admin'
  }
  if (pathname === HOME_HANGING_PATH) return 'Hanging Book · Book River Admin'
  if (pathname === HOME_ABOUT_PATH) return 'About Book · Book River Admin'
  if (pathname === ORDERS_PATH) return 'Orders · Book River Admin'
  if (pathname === SETTINGS_PATH) return 'Settings · Book River Admin'

  const match = String(pathname || '').match(/^\/category\/([^/]+)/)
  const category = match ? findCategory(match[1]) : null
  if (category) return `${category.label} · Book River Admin`

  return 'Book River Admin'
}
