import { useRef, useState } from 'react'
import { BookOpen, ChevronDown, ChevronUp, ImagePlus, Loader2, Plus, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { ENDPOINTS } from '../lib/api'
import useCollection from '../hooks/useCollection'
import PageHeader from '../components/PageHeader'
import Spinner from '../components/Spinner'

const EMPTY = { title: '', author: '', tag: '', price: '', description: '' }

/** Open Book — left page picture, right page heading + description. */
export default function BooksAdmin() {
  const { items, loading, busyId, saving, create, remove, move, update } = useCollection(
    ENDPOINTS.books,
    { label: 'Book pages' },
  )
  const [form, setForm] = useState(EMPTY)
  const fileRef = useRef(null)

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    const file = fileRef.current?.files?.[0]
    if (!file) return toast.error('Left page ki picture select karo')
    if (!form.title.trim()) return toast.error('Heading / Title likho')

    const fd = new FormData()
    fd.append('image', file)
    Object.entries(form).forEach(([k, v]) => fd.append(k, v))

    const ok = await create(fd, { isForm: true, success: 'Book page add ho gaya ✅' })
    if (ok) {
      setForm(EMPTY)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const save = (book, field, value) => {
    const clean = String(value ?? '').trim()
    if (clean === String(book[field] ?? '').trim()) return
    update(book._id, { [field]: clean })
  }

  const onBlurSave = (book, field) => (e) => save(book, field, e.target.value)
  const onEnterBlur = (e) => {
    if (e.key === 'Enter') e.currentTarget.blur()
  }

  return (
    <>
      <PageHeader
        eyebrow="New Launches"
        title="Open Book — Pages"
        subtitle="Left page picture, right page heading + description. Frontend par page click karke palat'ta hai."
      />

      <section className="card">
        <div className="card-head">
          <h2 className="card-title">
            <Plus className="h-4 w-4 text-brand-600" /> Naya book page
          </h2>
          <span className="count-pill">{items.length}</span>
        </div>
        <form onSubmit={submit} className="card-body grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="label" htmlFor="book-file">
              Picture — left page (jpg / png / webp / svg — max 5 MB)
            </label>
            <input id="book-file" ref={fileRef} type="file" accept="image/*" className="input" />
          </div>
          <div>
            <label className="label" htmlFor="book-title">
              Heading / Title
            </label>
            <input
              id="book-title"
              value={form.title}
              onChange={set('title')}
              placeholder="The Salt & the Stars"
              className="input"
            />
          </div>
          <div>
            <label className="label" htmlFor="book-author">
              Author (optional)
            </label>
            <input
              id="book-author"
              value={form.author}
              onChange={set('author')}
              placeholder="A. M. Rivers"
              className="input"
            />
          </div>
          <div>
            <label className="label" htmlFor="book-tag">
              Tag (optional)
            </label>
            <input
              id="book-tag"
              value={form.tag}
              onChange={set('tag')}
              placeholder="Fiction"
              className="input"
            />
          </div>
          <div>
            <label className="label" htmlFor="book-price">
              Price (optional)
            </label>
            <input
              id="book-price"
              value={form.price}
              onChange={set('price')}
              placeholder="Rs. 1,200"
              className="input"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="label" htmlFor="book-desc">
              Description — right page
            </label>
            <textarea
              id="book-desc"
              rows={3}
              value={form.description}
              onChange={set('description')}
              placeholder="Chhoti si description likho…"
              className="input"
            />
          </div>
          <div className="sm:col-span-2">
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ImagePlus className="h-4 w-4" />
              )}
              Add book page
            </button>
          </div>
        </form>
      </section>

      <section className="card mt-4">
        <div className="card-head">
          <h2 className="card-title">
            <BookOpen className="h-4 w-4 text-brand-600" /> Pages{' '}
            <span className="count-pill">{items.length}</span>
          </h2>
          <span className="text-xs text-slate-400">Field par click karke seedha edit — blur par save</span>
        </div>
        <div className="card-body">
          {loading ? (
            <Spinner />
          ) : items.length === 0 ? (
            <p className="empty">
              Abhi koi book page nahi hai — Frontend par demo books dikh rahi hain. Upar se picture +
              heading + description add karo.
            </p>
          ) : (
            <ul className="space-y-2">
              {items.map((book, i) => (
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
                      className="input"
                      title="Heading"
                    />
                    <input
                      defaultValue={book.author}
                      onBlur={onBlurSave(book, 'author')}
                      onKeyDown={onEnterBlur}
                      className="input"
                      title="Author"
                    />
                    <input
                      defaultValue={book.tag}
                      onBlur={onBlurSave(book, 'tag')}
                      onKeyDown={onEnterBlur}
                      className="input"
                      title="Tag"
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
                      onClick={() => move(book, -1)}
                      disabled={i === 0 || busyId !== null}
                      className="icon-btn"
                      title="Move up"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => move(book, 1)}
                      disabled={i === items.length - 1 || busyId !== null}
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
