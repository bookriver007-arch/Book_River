import { SECTIONS } from '../lib/sections'
import SlidesAdmin from '../pages/SlidesAdmin'
import CategoriesAdmin from '../pages/CategoriesAdmin'
import BooksAdmin from '../pages/BooksAdmin'
import KidsBookAdmin from '../pages/KidsBookAdmin'
import FramesAdmin from '../pages/FramesAdmin'
import ProductsAdmin from '../pages/ProductsAdmin'
import ReviewsAdmin from '../pages/ReviewsAdmin'

/** section key -> uska editor component */
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
 * Description page ka poora content — Slides, Categories, Open Book, Kids Book,
 * Frames, Products aur Reviews, sab ek ke neeche ek.
 * `/description` aur har category page dono isi ko dikhate hain.
 * `.embedded` class har section ke andar wala page-header chhupa deti hai.
 */
export default function DescriptionSections() {
  return (
    <div className="space-y-10 pb-10">
      {SECTIONS.map((section) => {
        const Icon = section.icon
        const SectionPage = SECTION_PAGES[section.key]
        return (
          <section key={section.key} id={section.anchor} className="embedded scroll-mt-32">
            <div className="mb-3 flex items-center gap-3 border-l-4 border-brand-600 pl-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700">
                <Icon className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <h2 className="text-base font-bold leading-tight text-brand-900">{section.label}</h2>
                <p className="text-[0.72rem] leading-snug text-slate-500">{section.blurb}</p>
              </div>
            </div>
            {SectionPage ? <SectionPage /> : null}
          </section>
        )
      })}
    </div>
  )
}
