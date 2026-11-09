import { useEffect, useRef, useState } from 'react'
import { ExternalLink, ImagePlus, Loader2, RefreshCw, Save, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { ENDPOINTS, apiDelete, apiList, apiSend, frontendUrl } from '../lib/api'
import { confirmAction } from '../lib/confirm'
import PageHeader from '../components/PageHeader'

/**
 * Home page ki LATAKTI KITAAB (rope se hanging book) — apna cover.
 * Description page ki kids-book se alag hai; yahan upload karoge to
 * sirf Home page par dikhega.
 */
export default function HomeHangingBookAdmin() {
  const [book, setBook] = useState(null)
  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState('')
  const [saving, setSaving] = useState(false)
  const [savingTitle, setSavingTitle] = useState(false)
  const fileRef = useRef(null)

  const load = async () => {
    setLoading(true)
    try {
      const data = await apiList(ENDPOINTS.homeHangingBook)
      setBook(data && data.imageUrl ? data : null)
      setTitle(data?.title || '')
    } catch {
      setBook(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const submit = async (e) => {
    e.preventDefault()
    const file = fileRef.current?.files?.[0]
    if (!file) return toast.error('Select the cover picture first')

    const fd = new FormData()
    fd.append('image', file)
    fd.append('title', title.trim())

    setSaving(true)
    try {
      await apiSend(ENDPOINTS.homeHangingBook, { form: fd })
      toast.success('Hanging book cover uploaded ✅')
      if (fileRef.current) fileRef.current.value = ''
      await load()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  const saveTitle = async () => {
    if (!book) return
    setSavingTitle(true)
    try {
      await apiSend(ENDPOINTS.homeHangingBook, { method: 'PATCH', body: { title: title.trim() } })
      toast.success('Caption saved ✅')
      await load()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSavingTitle(false)
    }
  }

  const removeCover = async () => {
    const ok = await confirmAction({
      title: 'Delete cover?',
      message: 'The hanging book cover will be deleted permanently.',
      confirmLabel: 'Yes, delete',
    })
    if (!ok) return
    try {
      await apiDelete(ENDPOINTS.homeHangingBook)
      toast.success('Cover deleted')
      await load()
    } catch (err) {
      toast.error(err.message)
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Home page"
        title="Home Page — Hanging Book"
        subtitle="The book hanging from a rope in the Home page category sections. Upload the cover here — different from the kids book on the Description page."
        actions={
          <>
            <button type="button" onClick={load} className="btn-outline">
              <RefreshCw className="h-4 w-4" /> Refresh
            </button>
            <a href={frontendUrl('/home')} target="_blank" rel="noreferrer" className="btn-primary">
              <ExternalLink className="h-4 w-4" /> View Home
            </a>
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-2">
        {/* ---- upload form ---- */}
        <section className="card">
          <div className="card-head">
            <h2 className="card-title">
              <ImagePlus className="h-4 w-4 text-brand-600" /> Upload / replace cover
            </h2>
            <span className="count-pill">{book ? '1 cover' : 'empty'}</span>
          </div>
          <form onSubmit={submit} className="card-body space-y-4">
            <div>
              <label className="label" htmlFor="hb-file">
                Cover picture (jpg / png / webp / svg — max 5 MB)
              </label>
              <input id="hb-file" ref={fileRef} type="file" accept="image/*" className="input" />
            </div>
            <div>
              <label className="label" htmlFor="hb-title">
                Caption / title (optional — alt text)
              </label>
              <input
                id="hb-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Spider-Man — Cosmic Chaos"
                className="input"
              />
            </div>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
              {saving ? 'Uploading…' : 'Upload'}
            </button>
            <p className="hint">
              If you upload a new cover, the old cover (and its file) is replaced automatically.
            </p>
          </form>
        </section>

        {/* ---- current cover ---- */}
        <section className="card">
          <div className="card-head">
            <h2 className="card-title">Current cover</h2>
            {book ? <span className="count-pill">live</span> : null}
          </div>
          <div className="card-body">
            {loading ? (
              <p className="flex items-center gap-2 text-sm text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading…
              </p>
            ) : book ? (
              <div className="space-y-3">
                <div className="mx-auto w-44 rounded-xl border border-slate-200 bg-slate-50 p-2">
                  <img
                    src={book.imageUrl}
                    alt={book.title || 'Hanging book cover'}
                    className="w-full rounded-lg object-cover"
                  />
                </div>
                {book.title ? (
                  <p className="text-center text-xs font-semibold text-slate-500">{book.title}</p>
                ) : null}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={saveTitle}
                    disabled={savingTitle}
                    className="btn-outline"
                  >
                    {savingTitle ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Caption save
                  </button>
                  <button type="button" onClick={removeCover} className="btn-outline !text-red-600">
                    <Trash2 className="h-4 w-4" /> Delete
                  </button>
                </div>
                <p className="hint">Write the caption in the form above and press “Save caption”.</p>
              </div>
            ) : (
              <p className="empty">
                No cover uploaded yet — the hanging book will not show on the Home page. Upload a picture above.
              </p>
            )}
          </div>
        </section>
      </div>
    </>
  )
}
