import { useCallback, useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  ArrowRight,
  Ban,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Copy,
  History,
  Package,
  PackageCheck,
  RefreshCw,
  Search,
  ShoppingBag,
  Truck,
  X,
} from 'lucide-react'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import { notify } from '../utils/notify.jsx'
import { moneyOf } from '../utils/money.js'
import {
  clearOrderHistory,
  readOrderHistory,
  rememberFullOrder,
  removeOrder,
} from '../utils/orderHistory.js'
import { confirmAction } from '../utils/confirm.js'

/** tracking ke 4 steps */
const STEPS = [
  { key: 'pending', label: 'Order place', note: 'Aapka order mil gaya', icon: Package },
  { key: 'approved', label: 'Approved', note: 'Admin ne approve kar diya', icon: CheckCircle2 },
  { key: 'shipped', label: 'Shipped', note: 'Order raste me hai', icon: Truck },
  { key: 'delivered', label: 'Delivered', note: 'Ghar pahunch gaya', icon: PackageCheck },
]

const STATUS_META = {
  pending: { label: 'Pending', pill: 'bg-amber-100 text-amber-800 ring-amber-200' },
  approved: { label: 'Approved', pill: 'bg-emerald-100 text-emerald-800 ring-emerald-200' },
  shipped: { label: 'Shipped', pill: 'bg-sky-100 text-sky-800 ring-sky-200' },
  delivered: { label: 'Delivered', pill: 'bg-brand-100 text-brand-800 ring-brand-200' },
  rejected: { label: 'Rejected', pill: 'bg-rose-100 text-rose-700 ring-rose-200' },
}

const PAYMENT_LABEL = {
  cod: 'Cash on Delivery',
  card: 'Debit / Credit Card',
  easypaisa: 'EasyPaisa',
  jazzcash: 'JazzCash',
  bank: 'Bank Transfer',
}

const when = (iso) => {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
  } catch {
    return ''
  }
}

/**
 * Order tracking — order number (BR-XXXXXX) daalo aur status dekho:
 * Pending → Approved → Shipped → Delivered (ya Rejected).
 * Order place hone ke baad customer seedha yahan aata hai.
 */
function HistoryDetail({ info, onTrack }) {
  if (!info) {
    return (
      <p className="text-[0.72rem] text-slate-500 dark:text-slate-400">
        Detail load nahi hui —{' '}
        <button
          type="button"
          onClick={onTrack}
          className="font-bold text-brand-700 hover:underline dark:text-brand-300"
        >
          Track karo
        </button>{' '}
        se poori detail aa jayegi.
      </p>
    )
  }

  return (
    <div className="space-y-3">
      <div className="grid gap-1.5 text-[0.74rem] sm:grid-cols-2">
        <p className="text-slate-600 dark:text-slate-300">
          <strong className="font-bold text-slate-800 dark:text-white">Customer:</strong>{' '}
          {info.customerName || 'Guest'}
        </p>
        <p className="text-slate-600 dark:text-slate-300">
          <strong className="font-bold text-slate-800 dark:text-white">Phone:</strong>{' '}
          {info.customerPhone || '—'}
        </p>
        <p className="truncate text-slate-600 dark:text-slate-300">
          <strong className="font-bold text-slate-800 dark:text-white">Email:</strong>{' '}
          {info.customerEmail || '—'}
        </p>
        <p className="text-slate-600 dark:text-slate-300">
          <strong className="font-bold text-slate-800 dark:text-white">Payment:</strong>{' '}
          {PAYMENT_LABEL[info.payment?.method] || 'Cash on Delivery'}
        </p>
        <p className="text-slate-600 sm:col-span-2 dark:text-slate-300">
          <strong className="font-bold text-slate-800 dark:text-white">Address:</strong>{' '}
          {info.address || '—'}
        </p>
        <p className="text-slate-600 sm:col-span-2 dark:text-slate-300">
          <strong className="font-bold text-slate-800 dark:text-white">Ordered:</strong>{' '}
          {when(info.createdAt)}
          {info.decidedAt ? ` · Updated: ${when(info.decidedAt)}` : ''}
        </p>
        {info.note ? (
          <p className="text-slate-600 sm:col-span-2 dark:text-slate-300">
            <strong className="font-bold text-slate-800 dark:text-white">Note:</strong> {info.note}
          </p>
        ) : null}
      </div>

      <ul className="space-y-1.5">
        {(info.items || []).map((item, index) => (
          <li
            key={`${item.bookId}-${index}`}
            className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 px-2.5 py-1.5 text-[0.72rem] dark:border-white/10"
          >
            <span className="min-w-0 truncate font-semibold text-slate-800 dark:text-white">
              {item.title}
            </span>
            <span className="shrink-0 text-slate-500 dark:text-slate-400">
              {item.qty} × {item.price || '—'}
            </span>
          </li>
        ))}
      </ul>

      <dl className="space-y-1 text-[0.72rem]">
        <div className="flex justify-between">
          <dt className="text-slate-500 dark:text-slate-400">Subtotal ({info.itemCount})</dt>
          <dd className="font-semibold text-slate-800 dark:text-white">{moneyOf(info.subtotal)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-slate-500 dark:text-slate-400">Shipping</dt>
          <dd className="font-semibold text-slate-800 dark:text-white">
            {info.shipping ? moneyOf(info.shipping) : 'Free'}
          </dd>
        </div>
        {info.tax ? (
          <div className="flex justify-between">
            <dt className="text-slate-500 dark:text-slate-400">{info.taxLabel || 'Tax'}</dt>
            <dd className="font-semibold text-slate-800 dark:text-white">{moneyOf(info.tax)}</dd>
          </div>
        ) : null}
        <div className="flex justify-between pt-1">
          <dt className="font-bold text-slate-900 dark:text-white">Total</dt>
          <dd className="font-extrabold text-brand-700 dark:text-brand-300">
            {moneyOf(info.total)}
          </dd>
        </div>
      </dl>
    </div>
  )
}

export default function TrackOrder() {
  const [params, setParams] = useSearchParams()
  const [code, setCode] = useState('')
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [user, setUser] = useState(null)
  const [history, setHistory] = useState(readOrderHistory)
  const [syncing, setSyncing] = useState(false)
  const [openDetail, setOpenDetail] = useState('')

  const urlCode = (params.get('code') || '').toUpperCase()
  const isNew = params.get('new') === '1'

  useEffect(() => {
    try {
      setUser(JSON.parse(localStorage.getItem('br_user')))
    } catch {
      setUser(null)
    }
  }, [])

  const logout = () => {
    localStorage.removeItem('br_token')
    localStorage.removeItem('br_user')
    window.location.replace('/description')
  }

  const track = useCallback(
    async (rawCode, { quiet = false } = {}) => {
      const clean = String(rawCode || '').trim().toUpperCase()
      if (!clean) {
        setError('Order number likho — jaise BR-123456')
        return
      }

      if (!quiet) {
        setLoading(true)
        setError('')
      }

      try {
        const res = await fetch(`/api/orders/track/${encodeURIComponent(clean)}`)
        const data = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(data.message || 'Order nahi mila')

        setOrder(data)
        setError('')
        setHistory(rememberFullOrder(data))
        try {
          localStorage.setItem('br_last_order', data.code)
        } catch {
          // storage band — ignore
        }
        if (!quiet) setParams({ code: data.code }, { replace: true })
      } catch (err) {
        if (!quiet) {
          setOrder(null)
          setError(err.message)
        }
      } finally {
        if (!quiet) setLoading(false)
      }
    },
    [setParams],
  )

  /** saved orders ka fresh status laao (admin ne badla ho to update ho jaye) */
  const syncHistory = useCallback(async () => {
    const saved = readOrderHistory()
    if (!saved.length) return

    setSyncing(true)
    try {
      const fresh = await Promise.all(
        saved.map(async (entry) => {
          try {
            const res = await fetch(`/api/orders/track/${encodeURIComponent(entry.code)}`)
            if (!res.ok) return null
            return await res.json()
          } catch {
            return null
          }
        }),
      )

      fresh.filter(Boolean).forEach((data) => rememberFullOrder(data))
      setHistory(readOrderHistory())
    } finally {
      setSyncing(false)
    }
  }, [])

  // page khulne par + tab wapas active hone par statuses refresh
  useEffect(() => {
    syncHistory()
    const onVisible = () => {
      if (document.visibilityState === 'visible') syncHistory()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [syncHistory])

  // URL ya last order se apne aap track
  useEffect(() => {
    let last = ''
    try {
      last = localStorage.getItem('br_last_order') || ''
    } catch {
      last = ''
    }
    const initial = urlCode || last
    if (!initial) return
    setCode(initial)
    track(initial)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlCode])

  // jab tak final status na aaye, har 20s me refresh
  useEffect(() => {
    if (!order || ['delivered', 'rejected'].includes(order.status)) return undefined
    const id = window.setInterval(() => track(order.code, { quiet: true }), 20000)
    return () => window.clearInterval(id)
  }, [order, track])

  const meta = order ? STATUS_META[order.status] || STATUS_META.pending : null
  const stepIndex = order ? STEPS.findIndex((step) => step.key === order.status) : -1

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(order.code)
      notify.info('Order number copy ho gaya 📋', order.code)
    } catch {
      notify.error('Copy nahi hua', 'Order number haath se likh lo')
    }
  }

  /* old orders list */
  const clearAllHistory = async () => {
    const ok = await confirmAction({
      title: 'Old orders khali karein?',
      message: 'Saved order list se saare orders hat jayenge (orders server par safe hain).',
      confirmLabel: 'Haan, khali karo',
    })
    if (!ok) return
    setHistory(clearOrderHistory())
    notify.info('Old orders list khali kar di 🗑️')
  }

  const removeOneHistory = async (target) => {
    const ok = await confirmAction({
      title: 'Order hatao?',
      message: `${target} list se nikal jayega.`,
      confirmLabel: 'Haan, hatao',
    })
    if (!ok) return
    setHistory(removeOrder(target))
  }

  return (
    <div className="book-page min-h-screen">
      <Navbar categories wide user={user} onLogout={logout} />

      <main className="mx-auto max-w-5xl px-4 pt-8 sm:px-6">
        {/* ---------- header ---------- */}
        <header>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-2.5 py-1 text-[0.62rem] font-bold uppercase tracking-[0.16em] text-brand-700 dark:bg-white/10 dark:text-brand-100">
            <Truck className="h-3 w-3" /> Track order
          </span>
          <h1 className="mt-2 font-display text-3xl font-bold text-brand-900 dark:text-white">
            Order tracking
          </h1>
          <p className="mt-1 text-sm text-brand-800/70 dark:text-white/60">
            Order number daalo — pata chal jayega order approve hua, ship hua ya reject.
          </p>
        </header>

        {/* ---------- search ---------- */}
        <form
          onSubmit={(e) => {
            e.preventDefault()
            track(code)
          }}
          className="mt-5 flex flex-col gap-2 rounded-3xl border border-slate-200/80 bg-white/80 p-3 shadow-sm backdrop-blur sm:flex-row sm:items-center dark:border-white/10 dark:bg-white/[0.04]"
        >
          <div className="flex flex-1 items-center gap-2.5 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 focus-within:border-brand-400 focus-within:ring-4 focus-within:ring-brand-100 dark:border-white/10 dark:bg-white/5 dark:focus-within:ring-brand-500/20">
            <Search className="h-4 w-4 shrink-0 text-slate-400" />
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="BR-123456"
              aria-label="Order number"
              className="w-full bg-transparent text-sm font-semibold uppercase tracking-wide text-slate-800 outline-none placeholder:font-normal placeholder:text-slate-400 dark:text-white"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-700 px-5 py-2.5 text-sm font-bold text-white shadow-sm shadow-brand-700/25 transition hover:bg-brand-800 active:scale-[0.98] disabled:opacity-70"
          >
            {loading ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            ) : (
              <Search className="h-4 w-4" />
            )}
            Track karo
          </button>
        </form>

        {/* ---------- old orders (saved) ---------- */}
        {history.length ? (
          <section className="mt-4 rounded-3xl border border-slate-200/80 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/[0.04]">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="flex items-center gap-1.5 text-[0.68rem] font-bold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                <History className="h-3.5 w-3.5" /> Old orders
                <span className="font-normal normal-case tracking-normal text-slate-400 dark:text-slate-500">
                  ({history.length})
                </span>
              </h2>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={syncHistory}
                  disabled={syncing}
                  className="inline-flex items-center gap-1 text-[0.66rem] font-bold text-brand-700 hover:underline disabled:opacity-60 dark:text-brand-300"
                >
                  <RefreshCw className={`h-3 w-3 ${syncing ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
                <button
                  type="button"
                  onClick={clearAllHistory}
                  className="text-[0.66rem] font-bold text-rose-600 hover:underline dark:text-rose-300"
                >
                  Clear all
                </button>
              </div>
            </div>

            <ul className="mt-3 space-y-2">
              {history.map((entry) => {
                const entryMeta = STATUS_META[entry.status] || STATUS_META.pending
                const open = openDetail === entry.code

                return (
                  <li
                    key={entry.code}
                    className="rounded-2xl border border-slate-200 bg-white transition hover:border-brand-300 dark:border-white/10 dark:bg-white/5"
                  >
                    <div className="flex flex-wrap items-center gap-2 px-3 py-2">
                      <button
                        type="button"
                        onClick={() => {
                          setCode(entry.code)
                          track(entry.code)
                        }}
                        className="min-w-0 flex-1 text-left"
                      >
                        <span className="block text-sm font-bold text-slate-900 dark:text-white">
                          {entry.code}
                        </span>
                        <span className="block text-[0.68rem] text-slate-500 dark:text-slate-400">
                          {when(entry.at)}
                          {entry.itemCount ? ` · ${entry.itemCount} books` : ''}
                          {entry.total ? ` · ${moneyOf(entry.total)}` : ''}
                        </span>
                      </button>

                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[0.58rem] font-bold uppercase ring-1 ${entryMeta.pill}`}
                      >
                        {entryMeta.label}
                      </span>

                      <button
                        type="button"
                        onClick={() => setOpenDetail(open ? '' : entry.code)}
                        className="inline-flex shrink-0 items-center gap-1 rounded-full border border-slate-200 px-2.5 py-1 text-[0.64rem] font-bold text-slate-600 transition hover:border-brand-300 hover:text-brand-700 dark:border-white/15 dark:text-slate-300 dark:hover:text-brand-200"
                      >
                        {open ? (
                          <ChevronUp className="h-3 w-3" />
                        ) : (
                          <ChevronDown className="h-3 w-3" />
                        )}
                        Details
                      </button>

                      <button
                        type="button"
                        onClick={() => removeOneHistory(entry.code)}
                        aria-label={`${entry.code} hatao`}
                        title="List se hatao"
                        className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/15"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {open ? (
                      <div className="border-t border-slate-200 px-3 py-3 dark:border-white/10">
                        <HistoryDetail
                          info={entry.detail}
                          onTrack={() => {
                            setCode(entry.code)
                            track(entry.code)
                          }}
                        />
                      </div>
                    ) : null}
                  </li>
                )
              })}
            </ul>
          </section>
        ) : (
          <section className="mt-4 rounded-3xl border border-dashed border-slate-300 px-4 py-5 text-center dark:border-white/15">
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
              Abhi koi purana order nahi
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Jab bhi koi order track karoge (ya order place karoge), wo yahan save ho jayega —
              baad me yahin se check kar lena.
            </p>
          </section>
        )}

        {/* ---------- error ---------- */}
        {error ? (
          <div className="mt-4 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50/80 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
            <Ban className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{error}</p>
          </div>
        ) : null}

        {/* ---------- naya order ---------- */}
        {order && isNew ? (
          <div className="mt-4 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/90 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            <p>
              <strong>Order place ho gaya 🎉</strong> — admin approve karega, status yahin apne aap
              update hota rahega.
            </p>
          </div>
        ) : null}

        {order ? (
          <section className="mt-5 grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_19rem]">
            {/* ---------- status + timeline ---------- */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-[0.62rem] font-bold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                    Order number
                  </p>
                  <p className="mt-0.5 text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">
                    {order.code}
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-[0.66rem] font-extrabold uppercase tracking-wider ring-1 ${meta.pill}`}
                >
                  {meta.label}
                </span>
              </div>

              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {when(order.createdAt)} ko place hua
              </p>

              {order.status === 'rejected' ? (
                <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50/80 p-4 dark:border-rose-500/30 dark:bg-rose-500/10">
                  <p className="flex items-center gap-2 text-sm font-extrabold text-rose-700 dark:text-rose-200">
                    <Ban className="h-4 w-4" /> Ye order reject ho gaya
                  </p>
                  <p className="mt-1 text-xs text-rose-700/80 dark:text-rose-200/80">
                    {order.statusNote || 'Admin ne ye order accept nahi kiya.'}
                  </p>
                  <p className="mt-1 text-[0.68rem] text-rose-600/70 dark:text-rose-200/60">
                    {when(order.decidedAt || order.updatedAt)}
                  </p>
                </div>
              ) : null}

              <ol className="mt-5">
                {STEPS.map((step, i) => {
                  const done = stepIndex >= i
                  const current = stepIndex === i
                  const stepTime =
                    i === 0 ? order.createdAt : current ? order.decidedAt || order.updatedAt : null
                  const Icon = step.icon

                  return (
                    <li key={step.key} className="relative flex gap-3.5 pb-6 last:pb-0">
                      {i < STEPS.length - 1 ? (
                        <span
                          className={`absolute left-[1.06rem] top-9 h-[calc(100%-1.5rem)] w-0.5 ${
                            stepIndex > i ? 'bg-brand-500' : 'bg-slate-200 dark:bg-white/10'
                          }`}
                        />
                      ) : null}

                      <span
                        className={`relative z-10 grid h-9 w-9 shrink-0 place-items-center rounded-full ${
                          done
                            ? 'bg-gradient-to-br from-brand-600 to-brand-800 text-white shadow-md shadow-brand-700/25'
                            : 'bg-slate-100 text-slate-400 dark:bg-white/10 dark:text-slate-500'
                        } ${current ? 'ring-4 ring-brand-100 dark:ring-brand-500/20' : ''}`}
                      >
                        <Icon className="h-4 w-4" />
                      </span>

                      <div className="min-w-0">
                        <p
                          className={`text-sm font-bold ${
                            done
                              ? 'text-slate-900 dark:text-white'
                              : 'text-slate-400 dark:text-slate-500'
                          }`}
                        >
                          {step.label}
                          {current ? (
                            <span className="ml-1.5 text-[0.6rem] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-300">
                              abhi
                            </span>
                          ) : null}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{step.note}</p>
                        {stepTime ? (
                          <p className="mt-0.5 text-[0.66rem] font-semibold text-brand-600/90 dark:text-brand-300/90">
                            {when(stepTime)}
                          </p>
                        ) : null}
                      </div>
                    </li>
                  )
                })}
              </ol>
            </div>

            {/* ---------- summary + items ---------- */}
            <aside className="space-y-4">
              <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
                <h2 className="text-[0.62rem] font-bold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                  Order summary
                </h2>

                {order.customerName ? (
                  <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                    {order.customerName} ke naam par
                  </p>
                ) : null}

                <ul className="mt-3 space-y-2.5">
                  {(order.items || []).map((item) => (
                    <li key={`${order.code}-${item.bookId}`} className="flex items-start gap-2.5">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt=""
                          loading="lazy"
                          className="h-12 w-9 shrink-0 rounded-md object-cover"
                        />
                      ) : (
                        <span className="grid h-12 w-9 shrink-0 place-items-center rounded-md bg-slate-100 dark:bg-white/10">
                          <Package className="h-3.5 w-3.5 text-slate-400" />
                        </span>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 text-[0.8rem] font-semibold leading-snug text-slate-800 dark:text-slate-100">
                          {item.title}
                        </p>
                        <p className="text-[0.68rem] text-slate-500 dark:text-slate-400">
                          {item.qty} × {item.price || '—'}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="my-3.5 h-px bg-slate-200 dark:bg-white/10" />

                <dl className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <dt className="text-slate-500 dark:text-slate-400">
                      Subtotal ({order.itemCount})
                    </dt>
                    <dd className="font-semibold text-slate-800 dark:text-white">
                      {moneyOf(order.subtotal)}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-slate-500 dark:text-slate-400">Shipping</dt>
                    <dd className="font-semibold text-slate-800 dark:text-white">
                      {order.shipping ? moneyOf(order.shipping) : 'Free'}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between pt-1.5">
                    <dt className="text-sm font-bold text-slate-900 dark:text-white">Total</dt>
                    <dd className="text-base font-extrabold text-brand-700 dark:text-brand-300">
                      {moneyOf(order.total)}
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    track(order.code)
                    notify.info('Status refresh ho raha hai…', order.code)
                  }}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-700 px-4 py-2.5 text-sm font-bold text-white shadow-sm shadow-brand-700/25 transition hover:bg-brand-800 active:scale-[0.98]"
                >
                  <RefreshCw className="h-4 w-4" /> Status refresh
                </button>

                <button
                  type="button"
                  onClick={copyCode}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:border-brand-300 hover:text-brand-700 dark:border-white/10 dark:text-slate-300 dark:hover:text-brand-200"
                >
                  <Copy className="h-4 w-4" /> Order number copy
                </button>

                <Link
                  to="/home"
                  className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 transition hover:border-brand-300 hover:text-brand-700 dark:border-white/10 dark:text-slate-300 dark:hover:text-brand-200"
                >
                  <ShoppingBag className="h-3.5 w-3.5" /> Aur books dekho
                </Link>
              </div>

              <p className="flex items-center justify-center gap-1.5 text-[0.66rem] text-slate-400 dark:text-slate-500">
                <Check className="h-3 w-3" /> Status har 20 second me apne aap update hota hai
                <ArrowRight className="h-3 w-3" />
              </p>
            </aside>
          </section>
        ) : null}
      </main>

      <Footer />
    </div>
  )
}
