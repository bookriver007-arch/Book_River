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
        subtitle="The Home page slideshow is managed here."
        actions={
          <a href={FRONTEND_URL} target="_blank" rel="noreferrer" className="btn-primary">
            <ExternalLink className="h-4 w-4" /> View Frontend
          </a>
        }
      />

      {/* ---- Home page sections (separate from Description) ---- */}
      <section className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
        <div className="card">
          <div className="card-head">
            <h2 className="card-title">
              <Images className="h-4 w-4 text-brand-600" /> Home page — Slides
            </h2>
            <span className="count-pill">separate slideshow</span>
          </div>
          <div className="card-body flex flex-wrap items-center justify-between gap-3">
            <p className="max-w-xl text-sm leading-relaxed text-slate-600">
              The Home page slideshow is <strong>separate</strong> from the Description page one. Manage
              the Home pictures here — upload, reorder, delete.
            </p>
            <Link to={HOME_SLIDES_PATH} className="btn-primary">
              <Images className="h-4 w-4" /> Manage home slides
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
              4 cards of the “Deal” section below the slideshow — old price (struck) and the new discounted price. Upload, change prices and delete from here.
            </p>
            <Link to={HOME_DEALS_PATH} className="btn-primary">
              <BadgePercent className="h-4 w-4" /> Manage deal cards
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
              Each category has its <strong>own page</strong> — upload that category's books (cover,
              title, price) from there.
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
              The book hanging from a rope in the category sections. Upload the cover here — this is different from the kids book on the Description page.
            </p>
            <Link to={HOME_HANGING_PATH} className="btn-primary">
              <Anchor className="h-4 w-4" /> Upload hanging book
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
              The 3 pages of the About book — set each page's heading, description and picture here.
            </p>
            <Link to={HOME_ABOUT_PATH} className="btn-primary">
              <Layers className="h-4 w-4" /> Manage about book
            </Link>
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <h2 className="card-title">
              <ClipboardList className="h-4 w-4 text-brand-600" /> Orders — Cart
            </h2>
            <span className="count-pill">to approve</span>
          </div>
          <div className="card-body flex flex-wrap items-center justify-between gap-3">
            <p className="max-w-xl text-sm leading-relaxed text-slate-600">
              The frontend customer presses <strong>Place order</strong> in the cart — that order comes
              here. Approve / Reject / Ship / Delivered all happen from there.
            </p>
            <Link to={ORDERS_PATH} className="btn-primary">
              <ClipboardList className="h-4 w-4" /> Open orders
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
