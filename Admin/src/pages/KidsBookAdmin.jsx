import { useCallback, useEffect, useRef, useState } from 'react'
import { Baby, ImagePlus, Loader2, Save, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { ENDPOINTS, apiDelete, apiList, apiSend } from '../lib/api'
import { confirmAction } from '../lib/confirm'
import PageHeader from '../components/PageHeader'
import Spinner from '../components/Spinner'

/** Kids Book — cover of the standing kids book to the right of the first book. */
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
      toast.error('Kids book did not load — is the backend running?')
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
    if (!file) return toast.error('Select a cover picture')

    const fd = new FormData()
    fd.append('image', file)
    fd.append('title', caption)

    setBusy(true)
    try {
      await apiSend(ENDPOINTS.kids, { form: fd })
      toast.success(book ? 'Cover replaced ✅' : 'Cover uploaded ✅')
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
      toast.success('Caption saved ✅')
      await load()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setBusy(false)
    }
  }

  const removeCover = async () => {
    const ok = await confirmAction({
      title: 'Delete cover?',
      message: 'The kids book cover will be deleted permanently.',
      confirmLabel: 'Yes, delete',
    })
    if (!ok) return
    setBusy(true)
    try {
      await apiDelete(ENDPOINTS.kids)
      toast.success('Deleted')
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
        subtitle="The standing kids book to the right of the first book on the frontend gets its cover from here."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="card">
          <div className="card-head">
            <h2 className="card-title">
              <Baby className="h-4 w-4 text-brand-600" /> Current cover
            </h2>
          </div>
          <div className="card-body">
            {loading ? (
              <Spinner />
            ) : !book ? (
              <p className="empty">No cover yet — this card is hidden on the frontend.</p>
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
                    Caption (below the cover)
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
                  <p className="hint">Press Enter or Save caption — it will update.</p>
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
              <ImagePlus className="h-4 w-4 text-brand-600" /> New cover (replace)
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
