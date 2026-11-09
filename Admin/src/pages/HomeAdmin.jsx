import { Link } from 'react-router-dom'
import {
  Anchor,
  BadgePercent,
  BookOpen,
  ClipboardList,
  ExternalLink,
  Images,
  Layers,
} from 'lucide-react'
import PageHeader from '../components/PageHeader'
import {
  CATEGORY_PAGES,
  HOME_ABOUT_PATH,
  HOME_DEALS_PATH,
  HOME_HANGING_PATH,
  HOME_SLIDES_PATH,
  ORDERS_PATH,
  homeBooksPath,
} from '../lib/pages'
import { FRONTEND_URL } from '../lib/api'

/**
 * Admin Home — bas ek kaam: Home page ka slideshow manage karna.
 * (Slides/Categories/Open Book waghera sirf Description page par hain.)
 */
export default function HomeAdmin() {
  return (
    <>
      <PageHeader
        eyebrow="Dashboard"
        title="Admin Home"
        subtitle="Home page ka slideshow yahan se manage hota hai."
        actions={
          <a href={FRONTEND_URL} target="_blank" rel="noreferrer" className="btn-primary">
            <ExternalLink className="h-4 w-4" /> View Frontend
          </a>
        }
      />

      {/* ---- Home page ke sections (Description se alag) ---- */}
      <section className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
        <div className="card">
          <div className="card-head">
            <h2 className="card-title">
              <Images className="h-4 w-4 text-brand-600" /> Home page — Slides
            </h2>
            <span className="count-pill">alag slideshow</span>
          </div>
          <div className="card-body flex flex-wrap items-center justify-between gap-3">
            <p className="max-w-xl text-sm leading-relaxed text-slate-600">
              Home page ka slideshow Description page se <strong>alag</strong> hai. Home ki pictures
              yahan se manage karo — upload, order badlo, delete karo.
            </p>
            <Link to={HOME_SLIDES_PATH} className="btn-primary">
              <Images className="h-4 w-4" /> Home slides manage karo
            </Link>
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <h2 className="card-title">
              <BadgePercent className="h-4 w-4 text-brand-600" /> Home page — Deal Section
            </h2>
            <span className="count-pill">4 deal cards</span>
          </div>
          <div className="card-body flex flex-wrap items-center justify-between gap-3">
            <p className="max-w-xl text-sm leading-relaxed text-slate-600">
              Slideshow ke neeche “Deal” section ke 4 cards — purani price (cross) aur nayi
              discounted price. Yahan se upload, price badlo, delete karo.
            </p>
            <Link to={HOME_DEALS_PATH} className="btn-primary">
              <BadgePercent className="h-4 w-4" /> Deal cards manage karo
            </Link>
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <h2 className="card-title">
              <BookOpen className="h-4 w-4 text-brand-600" /> Home page — Products
            </h2>
            <span className="count-pill">6 pages</span>
          </div>
          <div className="card-body space-y-3">
            <p className="text-sm leading-relaxed text-slate-600">
              Har category ka <strong>apna page</strong> hai — usi category ki books (cover, title,
              price) wahan se upload karo.
            </p>
            <div className="flex flex-wrap gap-2">
              {CATEGORY_PAGES.map((category) => (
                <Link
                  key={category.slug}
                  to={homeBooksPath(category.slug)}
                  className="btn-outline"
                >
                  <BookOpen className="h-3.5 w-3.5" /> {category.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <h2 className="card-title">
              <Anchor className="h-4 w-4 text-brand-600" /> Home page — Hanging Book
            </h2>
            <span className="count-pill">1 cover</span>
          </div>
          <div className="card-body flex flex-wrap items-center justify-between gap-3">
            <p className="max-w-xl text-sm leading-relaxed text-slate-600">
              Category sections me rope se latakti kitaab. Cover yahan se upload karo — Description
              wali kids-book se alag hai.
            </p>
            <Link to={HOME_HANGING_PATH} className="btn-primary">
              <Anchor className="h-4 w-4" /> Hanging book upload karo
            </Link>
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <h2 className="card-title">
              <Layers className="h-4 w-4 text-brand-600" /> Home page — About Book
            </h2>
            <span className="count-pill">3 pages</span>
          </div>
          <div className="card-body flex flex-wrap items-center justify-between gap-3">
            <p className="max-w-xl text-sm leading-relaxed text-slate-600">
              About kitaab ke 3 pages — har page ki heading, description aur picture yahan se set
              karo.
            </p>
            <Link to={HOME_ABOUT_PATH} className="btn-primary">
              <Layers className="h-4 w-4" /> About book manage karo
            </Link>
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <h2 className="card-title">
              <ClipboardList className="h-4 w-4 text-brand-600" /> Orders — Cart
            </h2>
            <span className="count-pill">approve karo</span>
          </div>
          <div className="card-body flex flex-wrap items-center justify-between gap-3">
            <p className="max-w-xl text-sm leading-relaxed text-slate-600">
              Frontend par customer cart se <strong>Place order</strong> karta hai — wo order yahan
              aata hai. Approve / Reject / Ship / Delivered sab wahin se hota hai.
            </p>
            <Link to={ORDERS_PATH} className="btn-primary">
              <ClipboardList className="h-4 w-4" /> Orders kholo
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
