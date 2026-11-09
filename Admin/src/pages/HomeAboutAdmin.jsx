import { useEffect, useRef, useState } from 'react'
import { BookOpen, ExternalLink, ImagePlus, Loader2, RefreshCw, RotateCcw, Save } from 'lucide-react'
import toast from 'react-hot-toast'
import { ENDPOINTS, apiDelete, apiList, apiSend, frontendUrl } from '../lib/api'
import PageHeader from '../components/PageHeader'

const PAGE_LABELS = ['Page 1 — picture LEFT', 'Page 2 — picture RIGHT', 'Page 3 — picture LEFT']

/**
 * Home page ke About book ke 3 pages.
 * Har page par heading, description aur ek picture upload hoti hai.
 */
export default function HomeAboutAdmin() {
  const [pages, setPages] = useState([])
  const [pageNo, setPageNo] = useState(1)
  const [form, setForm] = useState({ heading: '', description: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const fileRefs = useRef({ image: null, image2: null, image3: null })

  const clearFileInputs = () => {
    Object.values(fileRefs.current).forEach((input) => {
      if (input) input.value = ''
    })
  }

  const load = async () => {
    setLoading(true)
    try {
      const data = await apiList(ENDPOINTS.homeAbout)
      setPages(Array.isArray(data) ? data : [])
    } catch {
      setPages([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const current = pages.find((p) => p.page === pageNo) || null

  // page badla -> form bhar do
  useEffect(() => {
    setForm({
      heading: current?.heading || '',
      description: current?.description || '',
    })
    clearFileInputs()
  }, [pageNo, pages]) // eslint-disable-line react-hooks/exhaustive-deps

  const save = async (e) => {
    e.preventDefault()

    const fd = new FormData()
    fd.append('heading', form.heading)
    fd.append('description', form.description)

    Object.entries(fileRefs.current).forEach(([key, input]) => {
      const file = input?.files?.[0]
      if (file) fd.append(key, file)
    })

    setSaving(true)
    try {
      await apiSend(`${ENDPOINTS.homeAbout}/${pageNo}`, { method: 'PATCH', form: fd })
      toast.success(`Page ${pageNo} save ho gaya ✅`)
      clearFileInputs()
      await load()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  const reset = async () => {
    if (!current) return
    if (!window.confirm(`Page ${pageNo} reset karein? (picture bhi delete hogi)`)) return
    try {
      await apiDelete(`${ENDPOINTS.homeAbout}/${pageNo}`)
      toast.success(`Page ${pageNo} reset ho gaya`)
      await load()
    } catch (err) {
      toast.error(err.message)
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Home page"
        title="Home Page — About Book"
        subtitle="Home page ki About kitaab ke 3 pages. Har page par heading, description aur picture yahan se set karo."
        actions={
          <>
            <button type="button" onClick={load} className="btn-outline">
              <RefreshCw className="h-4 w-4" /> Refresh
            </button>
            <a href={frontendUrl('/home')} target="_blank" rel="noreferrer" className="btn-primary">
              <ExternalLink className="h-4 w-4" /> Home dekho
            </a>
          </>
        }
      />

      {/* ---- page tabs ---- */}
      <div className="mb-4 flex flex-wrap gap-2">
        {[1, 2, 3].map((n) => {
          const active = n === pageNo
          const filled = pages.some((p) => p.page === n && p.imageUrl)
          return (
            <button
              key={n}
              type="button"
              onClick={() => setPageNo(n)}
              className={active ? 'btn-primary' : 'btn-outline'}
            >
              <BookOpen className="h-4 w-4" /> Page {n}
              <span className={active ? 'text-white/70' : 'text-slate-400'}>
                {filled ? '✓' : '—'}
              </span>
            </button>
          )
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="card">
          <div className="card-head">
            <h2 className="card-title">
              <ImagePlus className="h-4 w-4 text-brand-600" /> {PAGE_LABELS[pageNo - 1]}
            </h2>
            <span className="count-pill">{current?.imageUrl ? 'set' : 'khali'}</span>
          </div>

          <form onSubmit={save} className="card-body space-y-4">
            <div>
              <label className="label" htmlFor="ab-heading">
                Heading (English)
              </label>
              <input
                id="ab-heading"
                value={form.heading}
                onChange={(e) => setForm({ ...form, heading: e.target.value })}
                placeholder="A shelf for every reader"
                className="input"
              />
            </div>

            <div>
              <label className="label" htmlFor="ab-desc">
                Description (English)
              </label>
              <textarea
                id="ab-desc"
                rows={5}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Book River is a small, carefully curated online bookstore…"
                className="input"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { key: 'image', label: 'Picture 1 (badi)' },
                { key: 'image2', label: 'Picture 2 (overlap)' },
                { key: 'image3', label: 'Picture 3 (polaroid)' },
              ].map((slot) => (
                <div key={slot.key}>
                  <label className="label" htmlFor={`ab-file-${slot.key}`}>
                    {slot.label}
                  </label>
                  <input
                    id={`ab-file-${slot.key}`}
                    ref={(el) => {
                      fileRefs.current[slot.key] = el
                    }}
                    type="file"
                    accept="image/*"
                    className="input"
                  />
                </div>
              ))}
            </div>
            <p className="hint">
              Har page par 3 pictures hoti hain (modern collage). Jo picture na chuno, uski purani
              picture waisi hi rahegi. Max 5 MB each.
            </p>

            <div className="flex flex-wrap items-center gap-2">
              <button type="submit" disabled={saving} className="btn-primary">
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {saving ? 'Saving…' : `Page ${pageNo} save karo`}
              </button>
              <button
                type="button"
                onClick={reset}
                disabled={!current}
                className="btn-outline !text-red-600"
              >
                <RotateCcw className="h-4 w-4" /> Reset
              </button>
            </div>
          </form>
        </section>

        <section className="card">
          <div className="card-head">
            <h2 className="card-title">Page {pageNo} — abhi ka look</h2>
            {loading ? <span className="count-pill">loading…</span> : null}
          </div>
          <div className="card-body">
            {current && (current.imageUrl || current.image2Url || current.image3Url) ? (
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  {[current.imageUrl, current.image2Url, current.image3Url].map((url, i) => (
                    <div
                      key={i}
                      className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50 p-1"
                    >
                      {url ? (
                        <img
                          src={url}
                          alt={`Page ${pageNo} picture ${i + 1}`}
                          className="h-24 w-full rounded object-cover"
                        />
                      ) : (
                        <div className="grid h-24 place-items-center text-[0.6rem] font-bold uppercase text-slate-400">
                          khali
                        </div>
                      )}
                      <p className="mt-1 text-center text-[0.6rem] font-bold uppercase tracking-wider text-slate-400">
                        Pic {i + 1}
                      </p>
                    </div>
                  ))}
                </div>
                <p className="text-center text-sm font-bold text-brand-900">
                  {current.heading || '—'}
                </p>
                <p className="text-center text-xs leading-relaxed text-slate-500">
                  {current.description || '—'}
                </p>
              </div>
            ) : (
              <p className="empty">
                Is page par abhi kuch set nahi — Home par default content dikhega. Upar se picture +
                heading + description save karo.
              </p>
            )}
          </div>
        </section>
      </div>
    </>
  )
}

