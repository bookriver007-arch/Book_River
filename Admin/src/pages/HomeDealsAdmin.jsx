import { useEffect, useRef, useState } from 'react'
import {
  BadgePercent,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  ImagePlus,
  Loader2,
  Plus,
  Save,
  Trash2,
  Type,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { ENDPOINTS, apiList, apiSend, frontendUrl } from '../lib/api'
import useCollection from '../hooks/useCollection'
import PageHeader from '../components/PageHeader'
import Spinner from '../components/Spinner'

const EMPTY = { title: '', author: '', oldPrice: '', price: '' }

const money = (value) => `Rs. ${Number(value || 0).toLocaleString('en-IN')}`

const offPercent = (oldPrice, price) => {
  const oldP = Number(oldPrice) || 0
  const newP = Number(price) || 0
  if (oldP <= 0 || newP >= oldP) return 0
  return Math.round(((oldP - newP) / oldP) * 100)
}

/**
 * Home Deals — Home page ke "Deal" section ke 4 cards.
 * Har card me purani price (cross) aur nayi discounted price hoti hai.
 */
export default function HomeDealsAdmin() {
  const { items, loading, busyId, saving, create, remove, move, update } = useCollection(
    ENDPOINTS.homeDeals,
    { label: 'Home deals' },
  )
  const [form, setForm] = useState(EMPTY)
  const fileRef = useRef(null)

  // ---- section ke texts (heading / description / offer tag) ----
  const [texts, setTexts] = useState({ eyebrow: '', heading: '', description: '', offerTag: '' })
  const [loadingTexts, setLoadingTexts] = useState(true)
  const [savingTexts, setSavingTexts] = useState(false)

  useEffect(() => {
    let cancelled = false
    apiList(`${ENDPOINTS.homeDeals}/settings`)
      .then((data) => {
        if (cancelled || !data) return
        setTexts({
          eyebrow: data.eyebrow || '',
          heading: data.heading || '',
          description: data.description || '',
          offerTag: data.offerTag || '',
        })
      })
      .catch(() => toast.error('Section ke texts load nahi hue'))
      .finally(() => {
        if (!cancelled) setLoadingTexts(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const setText = (key) => (e) => setTexts({ ...texts, [key]: e.target.value })

  const saveTexts = async (e) => {
    e.preventDefault()
    setSavingTexts(true)
    try {
      await apiSend(`${ENDPOINTS.homeDeals}/settings`, { method: 'PATCH', body: texts })
      toast.success('Section ke texts save ho gaye ✅')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSavingTexts(false)
    }
  }

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    const file = fileRef.current?.files?.[0]
    if (!file) return toast.error('Cover picture select karo')
    if (!form.title.trim()) return toast.error('Book ka title likho')
    if (!Number(form.oldPrice) || !Number(form.price)) {
      return toast.error('Purani price aur nayi price dono likho')
    }

    const fd = new FormData()
    fd.append('image', file)
    fd.append('title', form.title.trim())
    fd.append('author', form.author.trim())
    fd.append('oldPrice', String(Number(form.oldPrice)))
    fd.append('price', String(Number(form.price)))

    const ok = await create(fd, { isForm: true, success: 'Deal add ho gayi ✅' })
    if (ok) {
      setForm(EMPTY)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const save = (deal, field, value) => {
    const isNumber = field === 'oldPrice' || field === 'price'
    const next = isNumber ? Number(value) : String(value ?? '').trim()
    const prev = isNumber ? Number(deal[field]) : String(deal[field] ?? '').trim()
    if (next === prev || (isNumber && !next) || (!isNumber && !next)) return
    update(deal._id, { [field]: next })
  }

  const onBlurSave = (deal, field) => (e) => save(deal, field, e.target.value)
  const onEnterBlur = (e) => {
    if (e.key === 'Enter') e.currentTarget.blur()
  }

  return (
    <>
      <PageHeader
        eyebrow="Home page"
        title="Home Page — Deal Section"
        subtitle="Home page par slideshow ke neeche 4 deal cards. Purani price par cross lagta hai, nayi price highlight hoti hai."
        actions={
          <a href={frontendUrl('/home')} target="_blank" rel="noreferrer" className="btn-primary">
            <ExternalLink className="h-4 w-4" /> Home dekho
          </a>
        }
      />

      {/* ---- section ke texts (admin only) ---- */}
      <section className="card mb-4">
        <div className="card-head">
          <h2 className="card-title">
            <Type className="h-4 w-4 text-brand-600" /> Heading, description aur offer tag
          </h2>
          <span className="count-pill">Home page</span>
        </div>
        <form onSubmit={saveTexts} className="card-body grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="deal-eyebrow">
              Chhota badge text
            </label>
            <input
              id="deal-eyebrow"
              value={texts.eyebrow}
              onChange={setText('eyebrow')}
              placeholder="Deal of the week"
              className="input"
              disabled={loadingTexts}
            />
          </div>
          <div>
            <label className="label" htmlFor="deal-heading">
              Heading
            </label>
            <input
              id="deal-heading"
              value={texts.heading}
              onChange={setText('heading')}
              placeholder="Aaj ki best deals"
              className="input"
              disabled={loadingTexts}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="label" htmlFor="deal-desc">
              Short description
            </label>
            <textarea
              id="deal-desc"
              rows={3}
              value={texts.description}
              onChange={setText('description')}
              placeholder="Chuni hui kitaabein — Rs. 1,200 ki jagah sirf Rs. 800…"
              className="input"
              disabled={loadingTexts}
            />
          </div>
          <div>
            <label className="label" htmlFor="deal-offer">
              Offer tag (laal sticker par)
            </label>
            <input
              id="deal-offer"
              value={texts.offerTag}
              onChange={setText('offerTag')}
              placeholder="Up to 45% off"
              className="input"
              disabled={loadingTexts}
            />
            <p className="hint">Ye text Home page ke laal sunburst tag ke andar dikhta hai.</p>
          </div>
          <div className="flex items-end">
            <button type="submit" disabled={savingTexts || loadingTexts} className="btn-primary">
              {savingTexts ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {savingTexts ? 'Saving…' : 'Texts save karo'}
            </button>
          </div>
        </form>
      </section>

      <section className="card">
        <div className="card-head">
          <h2 className="card-title">
            <Plus className="h-4 w-4 text-brand-600" /> Nayi deal add karo
          </h2>
          <span className="count-pill">{items.length}</span>
        </div>
        <form onSubmit={submit} className="card-body grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="label" htmlFor="deal-file">
              Cover picture (jpg / png / webp / svg — max 5 MB)
            </label>
            <input id="deal-file" ref={fileRef} type="file" accept="image/*" className="input" />
          </div>
          <div>
            <label className="label" htmlFor="deal-title">
              Book title
            </label>
            <input
              id="deal-title"
              value={form.title}
              onChange={set('title')}
              placeholder="The Salt & the Stars"
              className="input"
            />
          </div>
          <div>
            <label className="label" htmlFor="deal-author">
              Author (optional)
            </label>
            <input
              id="deal-author"
              value={form.author}
              onChange={set('author')}
              placeholder="A. M. Rivers"
              className="input"
            />
          </div>
          <div>
            <label className="label" htmlFor="deal-old">
              Purani price (cross wali)
            </label>
            <input
              id="deal-old"
              type="number"
              min="0"
              value={form.oldPrice}
              onChange={set('oldPrice')}
              placeholder="1200"
              className="input"
            />
          </div>
          <div>
            <label className="label" htmlFor="deal-new">
              Nayi price (discount ke baad)
            </label>
            <input
              id="deal-new"
              type="number"
              min="0"
              value={form.price}
              onChange={set('price')}
              placeholder="800"
              className="input"
            />
          </div>
          <div className="sm:col-span-2 flex items-center gap-3">
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
              {saving ? 'Saving…' : 'Deal add karo'}
            </button>
            {Number(form.oldPrice) > Number(form.price) && Number(form.price) > 0 ? (
              <span className="text-[0.72rem] font-bold text-emerald-700">
                {money(Number(form.oldPrice) - Number(form.price))} off ({offPercent(form.oldPrice, form.price)}%)
              </span>
            ) : null}
          </div>
        </form>
      </section>

      <section className="card mt-4">
        <div className="card-head">
          <h2 className="card-title">
            <BadgePercent className="h-4 w-4 text-brand-600" /> Deal cards{' '}
            <span className="count-pill">{items.length}</span>
          </h2>
          <span className="text-xs text-slate-400">
            Home par pehli 4 cards dikhengi — naam/prices par click karke badal sakte ho
          </span>
        </div>
        <div className="card-body">
          {loading ? (
            <Spinner />
          ) : items.length === 0 ? (
            <p className="empty">
              Abhi koi deal nahi hai — Home par demo deals dikh rahi hain. Upar se picture + prices
              add karo.
            </p>
          ) : (
            <ul className="space-y-2">
              {items.map((deal, i) => {
                const off = offPercent(deal.oldPrice, deal.price)
                return (
                  <li key={deal._id} className="row items-start">
                    <span className="row-index mt-2">#{i + 1}</span>
                    <div className="relative shrink-0">
                      <img src={deal.imageUrl} alt={deal.title} className="thumb h-20 w-16 object-cover" />
                      {off > 0 ? (
                        <span className="absolute left-1 top-1 rounded-full bg-rose-600/90 px-1.5 py-0.5 text-[0.55rem] font-extrabold text-white">
                          -{off}%
                        </span>
                      ) : null}
                    </div>
                    <div className="grid min-w-0 flex-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
                      <input
                        defaultValue={deal.title}
                        onBlur={onBlurSave(deal, 'title')}
                        onKeyDown={onEnterBlur}
                        className="input lg:col-span-2"
                        title="Book title"
                      />
                      <input
                        defaultValue={deal.author}
                        onBlur={onBlurSave(deal, 'author')}
                        onKeyDown={onEnterBlur}
                        className="input lg:col-span-2"
                        title="Author"
                      />
                      <label className="flex items-center gap-1.5">
                        <span className="text-[0.62rem] font-bold uppercase tracking-wider text-slate-400">
                          Old
                        </span>
                        <input
                          type="number"
                          min="0"
                          defaultValue={deal.oldPrice}
                          onBlur={onBlurSave(deal, 'oldPrice')}
                          onKeyDown={onEnterBlur}
                          className="input line-through decoration-rose-500/60"
                          title="Purani price (cross)"
                        />
                      </label>
                      <label className="flex items-center gap-1.5">
                        <span className="text-[0.62rem] font-bold uppercase tracking-wider text-slate-400">
                          New
                        </span>
                        <input
                          type="number"
                          min="0"
                          defaultValue={deal.price}
                          onBlur={onBlurSave(deal, 'price')}
                          onKeyDown={onEnterBlur}
                          className="input font-semibold text-brand-800"
                          title="Nayi price"
                        />
                      </label>
                    </div>
                    <div className="flex shrink-0 items-center gap-0.5">
                      <button
                        type="button"
                        onClick={() => move(deal, -1)}
                        disabled={i === 0 || busyId !== null}
                        className="icon-btn"
                        title="Move up"
                      >
                        <ChevronUp className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => move(deal, 1)}
                        disabled={i === items.length - 1 || busyId !== null}
                        className="icon-btn"
                        title="Move down"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(deal, deal.title)}
                        disabled={busyId !== null}
                        className="icon-btn icon-btn--danger"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </section>
    </>
  )
}
