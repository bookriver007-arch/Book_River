import { useState } from 'react'
import { ChevronDown, ChevronUp, Loader2, Plus, Star, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { ENDPOINTS } from '../lib/api'
import useCollection from '../hooks/useCollection'
import PageHeader from '../components/PageHeader'
import Spinner from '../components/Spinner'

const EMPTY = { name: '', rating: 5, text: '' }

/** Reviews — the slider that scrolls right → left on the frontend. */
export default function ReviewsAdmin() {
  const { items, loading, busyId, saving, create, remove, move, update } = useCollection(
    ENDPOINTS.reviews,
    { label: 'Reviews' },
  )
  const [form, setForm] = useState(EMPTY)

  const submit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return toast.error('Enter the reader name')
    if (!form.text.trim()) return toast.error('Write the review')

    const ok = await create(
      { name: form.name.trim(), rating: Number(form.rating), text: form.text.trim() },
      { success: 'Review added ✅' },
    )
    if (ok) setForm(EMPTY)
  }

  const save = (review, field, value) => {
    const next = field === 'rating' ? Number(value) : String(value ?? '').trim()
    const prev = field === 'rating' ? review.rating : String(review[field] ?? '').trim()
    if (next === prev) return
    if (field !== 'rating' && !next) return
    update(review._id, { [field]: next })
  }

  const onBlurSave = (review, field) => (e) => save(review, field, e.target.value)
  const onChangeSave = (review, field) => (e) => save(review, field, e.target.value)

  return (
    <>
      <PageHeader
        eyebrow="Social proof"
        title="Reviews — Slider"
        subtitle="On the frontend these reviews scroll right → left."
      />

      <section className="card">
        <div className="card-head">
          <h2 className="card-title">
            <Plus className="h-4 w-4 text-brand-600" /> New review
          </h2>
          <span className="count-pill">{items.length}</span>
        </div>
        <form onSubmit={submit} className="card-body grid gap-4 sm:grid-cols-3">
          <div>
            <label className="label" htmlFor="rev-name">
              Reader name
            </label>
            <input
              id="rev-name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ayesha K."
              className="input"
            />
          </div>
          <div>
            <label className="label" htmlFor="rev-rating">
              Rating
            </label>
            <select
              id="rev-rating"
              value={form.rating}
              onChange={(e) => setForm({ ...form, rating: e.target.value })}
              className="input"
            >
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n}>
                  {'★'.repeat(n)} ({n})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="rev-text">
              Review
            </label>
            <input
              id="rev-text"
              value={form.text}
              onChange={(e) => setForm({ ...form, text: e.target.value })}
              placeholder="The books were great and delivery was fast…"
              className="input"
            />
          </div>
          <div className="sm:col-span-3">
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Add review
            </button>
          </div>
        </form>
      </section>

      <section className="card mt-4">
        <div className="card-head">
          <h2 className="card-title">
            <Star className="h-4 w-4 text-brand-600" /> Reviews{' '}
            <span className="count-pill">{items.length}</span>
          </h2>
          <span className="text-xs text-slate-400">
            Click a name/review to edit — it saves on blur
          </span>
        </div>
        <div className="card-body">
          {loading ? (
            <Spinner />
          ) : items.length === 0 ? (
            <p className="empty">
              No reviews yet — demo reviews are showing on the frontend. Add a review above.
            </p>
          ) : (
            <ul className="space-y-2">
              {items.map((review, i) => (
                <li key={review._id} className="row items-start">
                  <span className="row-index mt-2">#{i + 1}</span>
                  <div className="grid min-w-0 flex-1 gap-2 sm:grid-cols-[10rem_7rem_1fr]">
                    <input
                      defaultValue={review.name}
                      onBlur={onBlurSave(review, 'name')}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') e.currentTarget.blur()
                      }}
                      className="input"
                      title="Name"
                    />
                    <select
                      defaultValue={review.rating}
                      onChange={onChangeSave(review, 'rating')}
                      className="input"
                      title="Rating"
                    >
                      {[5, 4, 3, 2, 1].map((n) => (
                        <option key={n} value={n}>
                          {n} ★
                        </option>
                      ))}
                    </select>
                    <textarea
                      defaultValue={review.text}
                      onBlur={onBlurSave(review, 'text')}
                      rows={2}
                      className="input"
                      title="Review"
                    />
                  </div>
                  <div className="flex shrink-0 items-center gap-0.5">
                    <button
                      type="button"
                      onClick={() => move(review, -1)}
                      disabled={i === 0 || busyId !== null}
                      className="icon-btn"
                      title="Move up"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => move(review, 1)}
                      disabled={i === items.length - 1 || busyId !== null}
                      className="icon-btn"
                      title="Move down"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(review, review.name)}
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
