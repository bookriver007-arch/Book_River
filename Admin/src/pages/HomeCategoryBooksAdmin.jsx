import { useRef, useState } from 'react'
import { NavLink, useLocation, useParams } from 'react-router-dom'
import {
  ChevronDown,
  ChevronUp,
  ExternalLink,
  ImagePlus,
  Loader2,
  Plus,
  Trash2,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { ENDPOINTS, frontendUrl, swapOrder } from '../lib/api'
import useCollection from '../hooks/useCollection'
import PageHeader from '../components/PageHeader'
import Spinner from '../components/Spinner'
import { CATEGORY_PAGES, homeBooksPath } from '../lib/pages'

const EMPTY = { title: '', author: '', price: '', description: '' }

/**
 * Ek category ke products ka apna page (`/home-books/<slug>`).
 * Har category (Board Books, Kids Story Books…) ka alag page — wahan se
 * usi category ki books upload / edit / order / delete hoti hain.
 */
export default function HomeCategoryBooksAdmin() {
  const { slug: paramSlug } = useParams()
  const { pathname } = useLocation()
  const { items, loading, busyId, saving, reload, create, remove, update } = useCollection(
    ENDPOINTS.homeCategoryBooks,
    { label: 'Category books' },
  )

  const [form, setForm] = useState(EMPTY)
  const fileRef = useRef(null)

  // route se category (ghalat slug par pehli category)
  const category =
    CATEGORY_PAGES.find((c) => c.slug === String(paramSlug || '').toLowerCase()) || CATEGORY_PAGES[0]
  const slug = category.slug

  // `/category/:slug` par ye admin category page hai, `/home-books/:slug` par home ke products
  const isCategoryPage = pathname.startsWith('/category/')

  const books = items.filter((book) => book.slug === slug)
  const counts = Object.fromEntries(
    CATEGORY_PAGES.map((c) => [c.slug, items.filter((b) => b.slug === c.slug).length]),
  )

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    const file = fileRef.current?.files?.[0]
    if (!file) return toast.error('Book ka cover select karo')
    if (!form.title.trim()) return toast.error('Book ka title likho')

    const fd = new FormData()
    fd.append('image', file)
    fd.append('slug', slug)
    fd.append('title', form.title.trim())
    fd.append('author', form.author.trim())
    fd.append('price', form.price.trim())
    fd.append('description', form.description.trim())

    const ok = await create(fd, { isForm: true, success: `${category.label} me book add ho gayi ✅` })
    if (ok) {
      setForm(EMPTY)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const save = (book, field, value) => {
    const clean = String(value ?? '').trim()
    if (clean === String(book[field] ?? '').trim()) return
    if (!clean) return
    update(book._id, { [field]: clean })
  }

  const onBlurSave = (book, field) => (e) => save(book, field, e.target.value)
  const onEnterBlur = (e) => {
    if (e.key === 'Enter') e.currentTarget.blur()
  }

  // order swap sirf isi category ke andar
  const moveBook = async (book, dir) => {
    const i = books.findIndex((x) => x._id === book._id)
    const neighbour = books[i + dir]
    if (!neighbour) return
    try {
      await swapOrder(ENDPOINTS.homeCategoryBooks, book, neighbour)
      await reload()
    } catch {
      toast.error('Move failed')
    }
  }

  return (
    <>
      <PageHeader
        eyebrow={
          isCategoryPage ? `Category page · /category/${slug}` : 'Home page — products'
        }
        title={`${category.label} — Products`}
        subtitle={category.tagline}
        actions={
          <a
            href={frontendUrl(`/category/${category.slug}`)}
            target="_blank"
            rel="noreferrer"
            className="btn-primary"
          >
            <ExternalLink className="h-4 w-4" /> Page dekho
          </a>
        }
      />

      {/* ---- har category ka apna page ---- */}
      <div className="mb-4 flex flex-wrap gap-2">
        {CATEGORY_PAGES.map((cat) => (
          <NavLink
            key={cat.slug}
            to={homeBooksPath(cat.slug)}
            className={({ isActive }) => (isActive ? 'btn-primary' : 'btn-outline')}
          >
            {cat.label}
            <span className="text-current/70">({counts[cat.slug] || 0})</span>
          </NavLink>
        ))}
      </div>

      <section className="card">
        <div className="card-head">
          <h2 className="card-title">
            <Plus className="h-4 w-4 text-brand-600" /> {category.label} me nayi book add karo
          </h2>
          <span className="count-pill">{books.length}</span>
        </div>
        <form onSubmit={submit} className="card-body grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="label" htmlFor="cb-file">
              Cover picture (jpg / png / webp / svg — max 5 MB)
            </label>
            <input id="cb-file" ref={fileRef} type="file" accept="image/*" className="input" />
          </div>
          <div>
            <label className="label" htmlFor="cb-title">
              Book title
            </label>
            <input
              id="cb-title"
              value={form.title}
              onChange={set('title')}
              placeholder="My First Shapes"
              className="input"
            />
          </div>
          <div>
            <label className="label" htmlFor="cb-author">
              Author (optional)
            </label>
            <input
              id="cb-author"
              value={form.author}
              onChange={set('author')}
              placeholder="R. Ali"
              className="input"
            />
          </div>
          <div>
            <label className="label" htmlFor="cb-price">
              Price (jaise Rs. 450)
            </label>
            <input
              id="cb-price"
              value={form.price}
              onChange={set('price')}
              placeholder="Rs. 450"
              className="input"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="label" htmlFor="cb-desc">
              Description (click par detail me dikhegi)
            </label>
            <textarea
              id="cb-desc"
              rows={3}
              value={form.description}
              onChange={set('description')}
              placeholder="Chhoti si description — rang, shape aur pehle alfaz…"
              className="input"
            />
          </div>
          <div className="flex items-end">
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
              {saving ? 'Saving…' : 'Book add karo'}
            </button>
          </div>
        </form>
      </section>

      <section className="card mt-4">
        <div className="card-head">
          <h2 className="card-title">
            {category.label} — books <span className="count-pill">{books.length}</span>
          </h2>
          <span className="text-xs text-slate-400">
            Home par isi order me dikhengi — title/price par click karke badal sakte ho
          </span>
        </div>
        <div className="card-body">
          {loading ? (
            <Spinner />
          ) : books.length === 0 ? (
            <p className="empty">
              Is category me abhi koi book nahi — Home par demo books dikh rahi hain. Upar se cover +
              title add karo.
            </p>
          ) : (
            <ul className="space-y-2">
              {books.map((book, i) => (
                <li key={book._id} className="row items-start">
                  <span className="row-index mt-2">#{i + 1}</span>
                  <img
                    src={book.imageUrl}
                    alt={book.title}
                    className="thumb h-20 w-16 object-cover"
                  />
                  <div className="grid min-w-0 flex-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
                    <input
                      defaultValue={book.title}
                      onBlur={onBlurSave(book, 'title')}
                      onKeyDown={onEnterBlur}
                      className="input lg:col-span-2"
                      title="Book title"
                    />
                    <input
                      defaultValue={book.author}
                      onBlur={onBlurSave(book, 'author')}
                      onKeyDown={onEnterBlur}
                      className="input"
                      title="Author"
                    />
                    <input
                      defaultValue={book.price}
                      onBlur={onBlurSave(book, 'price')}
                      onKeyDown={onEnterBlur}
                      className="input"
                      title="Price"
                    />
                    <textarea
                      defaultValue={book.description}
                      onBlur={onBlurSave(book, 'description')}
                      rows={2}
                      className="input sm:col-span-2 lg:col-span-4"
                      title="Description"
                    />
                  </div>
                  <div className="flex shrink-0 items-center gap-0.5">
                    <button
                      type="button"
                      onClick={() => moveBook(book, -1)}
                      disabled={i === 0 || busyId !== null}
                      className="icon-btn"
                      title="Move up"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveBook(book, 1)}
                      disabled={i === books.length - 1 || busyId !== null}
                      className="icon-btn"
                      title="Move down"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(book, book.title)}
                      disabled={busyId !== null}
                      className="icon-btn icon-btn--danger"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </>
  )
}
