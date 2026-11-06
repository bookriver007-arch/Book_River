import { useCallback, useEffect, useRef, useState } from 'react'
import { Baby, ImagePlus, Loader2, Save, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { ENDPOINTS, apiDelete, apiList, apiSend } from '../lib/api'
import PageHeader from '../components/PageHeader'
import Spinner from '../components/Spinner'

/** Kids Book — pehli book ke right wali standing kids-book ka cover. */
export default function KidsBookAdmin() {
  const [book, setBook] = useState(null)
  const [caption, setCaption] = useState('')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const fileRef = useRef(null)

  const load = useCallback(async () => {
    try {
      const data = await apiList(ENDPOINTS.kids)
      const current = data && data._id ? data : null
      setBook(current)
      setCaption(current?.title || '')
    } catch {
      toast.error('Kids book load nahi hui — backend chalu hai?')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const upload = async (e) => {
    e.preventDefault()
    const file = fileRef.current?.files?.[0]
    if (!file) return toast.error('Cover picture select karo')

    const fd = new FormData()
    fd.append('image', file)
    fd.append('title', caption)

    setBusy(true)
    try {
      await apiSend(ENDPOINTS.kids, { form: fd })
      toast.success(book ? 'Cover replace ho gaya ✅' : 'Cover upload ho gaya ✅')
      if (fileRef.current) fileRef.current.value = ''
      await load()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setBusy(false)
    }
  }

  const saveCaption = async () => {
    if (!book) return
    const clean = caption.trim()
    if (clean === (book.title || '').trim()) return
    setBusy(true)
    try {
      await apiSend(ENDPOINTS.kids, { method: 'PATCH', body: { title: clean } })
      toast.success('Caption save ho gaya ✅')
      await load()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setBusy(false)
    }
  }

  const removeCover = async () => {
    if (!window.confirm('Kids book cover delete karein?')) return
    setBusy(true)
    try {
      await apiDelete(ENDPOINTS.kids)
      toast.success('Delete ho gaya')
      await load()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="New Launches"
        title="Kids Book — Cover"
        subtitle="Frontend par pehli book ke right wale standing kids-book ka cover yahan se aata hai."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="card">
          <div className="card-head">
            <h2 className="card-title">
              <Baby className="h-4 w-4 text-brand-600" /> Abhi ka cover
            </h2>
          </div>
          <div className="card-body">
            {loading ? (
              <Spinner />
            ) : !book ? (
              <p className="empty">Abhi koi cover nahi hai — Frontend par ye card chhupa hua hai.</p>
            ) : (
              <div className="flex flex-wrap items-start gap-4">
                <img
                  src={book.imageUrl}
                  alt={book.title || 'Kids book cover'}
                  className="thumb object-cover"
                  style={{ width: '7.5rem', height: '10rem' }}
                />
                <div className="min-w-[12rem] flex-1">
                  <label className="label" htmlFor="kids-caption">
                    Caption (cover ke neeche)
                  </label>
                  <input
                    id="kids-caption"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveCaption()
                    }}
                    className="input"
                    placeholder="10 Little Penguins"
                  />
                  <p className="hint">Enter ya Save caption dabao — update ho jayega.</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={saveCaption}
                      disabled={busy}
                      className="btn-primary"
                    >
                      {busy ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      Save caption
                    </button>
                    <button
                      type="button"
                      onClick={removeCover}
                      disabled={busy}
                      className="btn-outline"
                    >
                      <Trash2 className="h-4 w-4" /> Remove
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="card">
          <div className="card-head">
            <h2 className="card-title">
              <ImagePlus className="h-4 w-4 text-brand-600" /> Naya cover (replace)
            </h2>
          </div>
          <form onSubmit={upload} className="card-body grid gap-3">
            <div>
              <label className="label" htmlFor="kids-file">
                Picture (jpg / png / webp — max 5 MB)
              </label>
              <input id="kids-file" ref={fileRef} type="file" accept="image/*" className="input" />
            </div>
            <div>
              <label className="label" htmlFor="kids-new-caption">
                Caption (optional)
              </label>
              <input
                id="kids-new-caption"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="input"
                placeholder="10 Little Penguins"
              />
            </div>
            <div>
              <button type="submit" disabled={busy} className="btn-primary">
                {busy ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ImagePlus className="h-4 w-4" />
                )}
                {book ? 'Replace' : 'Upload'}
              </button>
            </div>
          </form>
        </section>
      </div>
    </>
  )
}
