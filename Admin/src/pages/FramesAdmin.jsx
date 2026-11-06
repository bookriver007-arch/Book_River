import { useRef } from 'react'
import { ChevronDown, ChevronUp, Frame, ImagePlus, Loader2, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { ENDPOINTS } from '../lib/api'
import useCollection from '../hooks/useCollection'
import PageHeader from '../components/PageHeader'
import Spinner from '../components/Spinner'

/** Hanging frames gallery — Frontend par rope se latke hue scroll karte hain. */
export default function FramesAdmin() {
  const { items, loading, busyId, saving, create, remove, move } = useCollection(
    ENDPOINTS.frames,
    { label: 'Frames' },
  )
  const fileRef = useRef(null)

  const submit = async (e) => {
    e.preventDefault()
    const file = fileRef.current?.files?.[0]
    if (!file) return toast.error('Picture select karo')

    const fd = new FormData()
    fd.append('image', file)

    const ok = await create(fd, { isForm: true, success: 'Frame add ho gaya ✅' })
    if (ok && fileRef.current) fileRef.current.value = ''
  }

  return (
    <>
      <PageHeader
        eyebrow="Gallery"
        title="Hanging Frames"
        subtitle="Frontend par yeh frames rope se latke hue right → left scroll karte hain."
      />

      <section className="card">
        <div className="card-head">
          <h2 className="card-title">
            <ImagePlus className="h-4 w-4 text-brand-600" /> Naya frame
          </h2>
          <span className="count-pill">{items.length}</span>
        </div>
        <form onSubmit={submit} className="card-body flex flex-wrap items-end gap-3">
          <div className="min-w-[16rem] flex-1">
            <label className="label" htmlFor="frame-file">
              Picture (jpg / png / webp / svg — max 5 MB)
            </label>
            <input id="frame-file" ref={fileRef} type="file" accept="image/*" className="input" />
          </div>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Frame className="h-4 w-4" />}
            Add frame
          </button>
        </form>
      </section>

      <section className="card mt-4">
        <div className="card-head">
          <h2 className="card-title">
            <Frame className="h-4 w-4 text-brand-600" /> Frames{' '}
            <span className="count-pill">{items.length}</span>
          </h2>
          <span className="text-xs text-slate-400">Order Frontend par scroll ka order hai</span>
        </div>
        <div className="card-body">
          {loading ? (
            <Spinner />
          ) : items.length === 0 ? (
            <p className="empty">
              Abhi koi frame nahi hai — Frontend par yeh section chhupa hua hai. 8 pictures upload
              karo (ek-ek karke).
            </p>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {items.map((frame, i) => (
                <li
                  key={frame._id}
                  className="overflow-hidden rounded-xl border border-slate-200 bg-white"
                >
                  <div className="relative aspect-[3/4] bg-slate-900/5">
                    <img
                      src={frame.imageUrl}
                      alt={`Frame ${i + 1}`}
                      className="h-full w-full object-cover"
                    />
                    <span className="absolute left-2 top-2 rounded-full bg-slate-900/70 px-2 py-0.5 text-xs font-semibold text-white">
                      #{i + 1}
                    </span>
                    {busyId === frame._id && (
                      <span className="absolute inset-0 grid place-items-center bg-white/60">
                        <Loader2 className="h-5 w-5 animate-spin text-brand-600" />
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-end gap-0.5 px-2 py-1.5">
                    <button
                      type="button"
                      onClick={() => move(frame, -1)}
                      disabled={i === 0 || busyId !== null}
                      className="icon-btn"
                      title="Move up"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => move(frame, 1)}
                      disabled={i === items.length - 1 || busyId !== null}
                      className="icon-btn"
                      title="Move down"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(frame, `Frame ${i + 1}`)}
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
