import { useRef, useState } from 'react'
import { ChevronDown, ChevronUp, ExternalLink, ImagePlus, Loader2, RefreshCw, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { ENDPOINTS, FRONTEND_URL } from '../lib/api'
import useCollection from '../hooks/useCollection'
import PageHeader from '../components/PageHeader'
import Spinner from '../components/Spinner'

/** Slides — description page ke slideshow ki pictures. */
export default function SlidesAdmin() {
  const { items, loading, busyId, saving, reload, create, remove, move } = useCollection(
    ENDPOINTS.slides,
    { label: 'Slides' },
  )
  const [title, setTitle] = useState('')
  const fileRef = useRef(null)

  const submit = async (e) => {
    e.preventDefault()
    const file = fileRef.current?.files?.[0]
    if (!file) return toast.error('Select a picture first')

    const fd = new FormData()
    fd.append('image', file)
    fd.append('title', title)

    const ok = await create(fd, { isForm: true, success: 'Picture uploaded ✅' })
    if (ok) {
      setTitle('')
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Description page"
        title="Image Slides"
        subtitle="The pictures you upload here are the ones shown on the frontend Description page."
        actions={
          <>
            <button type="button" onClick={reload} className="btn-outline">
              <RefreshCw className="h-4 w-4" /> Refresh
            </button>
            <a href={FRONTEND_URL} target="_blank" rel="noreferrer" className="btn-primary">
              <ExternalLink className="h-4 w-4" /> View Frontend
            </a>
          </>
        }
      />

      <section className="card">
        <div className="card-head">
          <h2 className="card-title">
            <ImagePlus className="h-4 w-4 text-brand-600" /> Upload a new picture
          </h2>
        </div>
        <form onSubmit={submit} className="card-body grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="slide-file">
              Picture (jpg / png / webp / svg — max 5 MB)
            </label>
            <input id="slide-file" ref={fileRef} type="file" accept="image/*" className="input" />
          </div>
          <div>
            <label className="label" htmlFor="slide-title">
              Title (optional)
            </label>
            <input
              id="slide-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Fiction collection"
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
              {saving ? 'Uploading…' : 'Upload'}
            </button>
          </div>
        </form>
      </section>

      <section className="card mt-4">
        <div className="card-head">
          <h2 className="card-title">
            Slides <span className="count-pill">{items.length}</span>
          </h2>
          <span className="text-xs text-slate-400">
            They appear on the frontend in this order
          </span>
        </div>
        <div className="card-body">
          {loading ? (
            <Spinner />
          ) : items.length === 0 ? (
            <p className="empty">
              No pictures uploaded yet — the 5 built-in banners are showing on the frontend. Upload a picture above.
            </p>
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((slide, i) => (
                <li
                  key={slide._id}
                  className="overflow-hidden rounded-xl border border-slate-200 bg-white"
                >
                  <div className="relative aspect-video bg-slate-900/5">
                    <img
                      src={slide.imageUrl}
                      alt={slide.title || `Slide ${i + 1}`}
                      className="h-full w-full object-cover"
                    />
                    <span className="absolute left-2 top-2 rounded-full bg-slate-900/70 px-2 py-0.5 text-xs font-semibold text-white">
                      #{i + 1}
                    </span>
                    {busyId === slide._id && (
                      <span className="absolute inset-0 grid place-items-center bg-white/60">
                        <Loader2 className="h-5 w-5 animate-spin text-brand-600" />
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-2 px-3 py-2">
                    <p className="truncate text-sm font-medium text-slate-700">
                      {slide.title || 'Untitled'}
                    </p>
                    <div className="flex shrink-0 items-center gap-0.5">
                      <button
                        type="button"
                        onClick={() => move(slide, -1)}
                        disabled={i === 0 || busyId !== null}
                        className="icon-btn"
                        title="Move up"
                      >
                        <ChevronUp className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => move(slide, 1)}
                        disabled={i === items.length - 1 || busyId !== null}
                        className="icon-btn"
                        title="Move down"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(slide, slide.title || 'This picture')}
                        disabled={busyId !== null}
                        className="icon-btn icon-btn--danger"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
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
