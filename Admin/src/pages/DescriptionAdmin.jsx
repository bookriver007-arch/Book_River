import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { ExternalLink } from 'lucide-react'
import { FRONTEND_URL } from '../lib/api'
import { SECTIONS } from '../lib/sections'
import PageHeader from '../components/PageHeader'
import SlidesAdmin from './SlidesAdmin'
import CategoriesAdmin from './CategoriesAdmin'
import BooksAdmin from './BooksAdmin'
import KidsBookAdmin from './KidsBookAdmin'
import FramesAdmin from './FramesAdmin'
import ProductsAdmin from './ProductsAdmin'
import ReviewsAdmin from './ReviewsAdmin'

/** key -> section ka page component */
const SECTION_PAGES = {
  slides: SlidesAdmin,
  categories: CategoriesAdmin,
  books: BooksAdmin,
  kids: KidsBookAdmin,
  frames: FramesAdmin,
  products: ProductsAdmin,
  reviews: ReviewsAdmin,
}

/**
 * Description Admin — SAB KUCH EK HI PAGE PAR.
 * Slides, categories, open book, kids book, frames, products, reviews —
 * navbar ka link seedha us section par scroll kar deta hai.
 */
export default function DescriptionAdmin() {
  const { pathname, hash } = useLocation()

  // purane link (/slides, /books …) ya #hash par seedha us section tak scroll
  useEffect(() => {
    const wanted = (hash || pathname).replace(/^[#/]+/, '')
    if (!wanted) return undefined
    const target = SECTIONS.find((s) => s.key === wanted || s.anchor === wanted)
    if (!target) return undefined

    const id = window.setTimeout(() => {
      document.getElementById(target.anchor)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 180)
    return () => window.clearTimeout(id)
  }, [pathname, hash])

  return (
    <>
      <PageHeader
        eyebrow="Description page"
        title="Description Page — Content"
        subtitle="Sab kuch isi page par hai — Slides, Categories, Open Book, Kids Book, Frames, Products aur Reviews. Navbar se seedha us section par jao."
        actions={
          <a href={FRONTEND_URL} target="_blank" rel="noreferrer" className="btn-primary">
            <ExternalLink className="h-4 w-4" /> View Frontend
          </a>
        }
      />

      <div className="space-y-10 pb-10">
        {SECTIONS.map((section) => {
          const Icon = section.icon
          const SectionPage = SECTION_PAGES[section.key]
          return (
            <section key={section.key} id={section.anchor} className="embedded scroll-mt-24">
              <div className="mb-3 flex items-center gap-3 border-l-4 border-brand-600 pl-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700">
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <h2 className="text-base font-bold leading-tight text-brand-900">
                    {section.label}
                  </h2>
                  <p className="text-[0.72rem] leading-snug text-slate-500">{section.blurb}</p>
                </div>
              </div>
              {SectionPage ? <SectionPage /> : null}
            </section>
          )
        })}
      </div>
    </>
  )
}
