import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  Ban,
  ChevronDown,
  ChevronUp,
  History,
  PackageCheck,
  RefreshCw,
  Search,
  ShoppingBag,
  Truck,
  X,
} from 'lucide-react'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import OrderDetail from '../components/OrderDetail.jsx'
import { notify } from '../utils/notify.jsx'
import { moneyOf } from '../utils/money.js'
import { confirmAction } from '../utils/confirm.js'
import { FINAL_STATUSES, STATUS_META, when } from '../utils/orderStatus.js'
import {
  clearOrderHistory,
  readOrderHistory,
  rememberFullOrder,
  removeOrder,
} from '../utils/orderHistory.js'

/** sections — har status ka apna group, poora group ek click me band ho sakta hai */
const GROUPS = [
  {
    key: 'active',
    label: 'In progress',
    hint: 'Abhi chal rahe orders',
    statuses: ['pending', 'approved', 'shipped'],
    icon: Truck,
    accent: 'text-sky-700 dark:text-sky-200',
  },
  {
    key: 'delivered',
    label: 'Delivered',
    hint: 'Complete ho chuke orders',
    statuses: ['delivered'],
    icon: PackageCheck,
    accent: 'text-emerald-700 dark:text-emerald-200',
  },
  {
    key: 'rejected',
    label: 'Rejected',
    hint: 'Cancel / reject ho chuke orders',
    statuses: ['rejected'],
    icon: Ban,
    accent: 'text-rose-700 dark:text-rose-200',
  },
]

const CLOSED_KEY = 'br_order_groups_closed'

const readClosedGroups = () => {
  try {
    const raw = localStorage.getItem(CLOSED_KEY)
    const data = raw ? JSON.parse(raw) : null
    return data && typeof data === 'object' ? data : {}
  } catch {
    return {}
  }
}

const writeClosedGroups = (value) => {
  try {
    localStorage.setItem(CLOSED_KEY, JSON.stringify(value))
  } catch {
    /* private mode */
  }
}

/**
 * Saved orders — jo bhi order kabhi track hua wo yahan save rehta hai.
 * Orders status ke hisaab se sections me hain (In progress / Delivered / Rejected)
 * aur har section ko ek click me band ya khol sakte ho.
 */
export default function OrderHistory() {
  const [user, setUser] = useState(null)
  const [items, setItems] = useState(readOrderHistory)
  const [syncing, setSyncing] = useState(false)
  const [openCode, setOpenCode] = useState('')
  const [query, setQuery] = useState('')
  const [closedGroups, setClosedGroups] = useState(readClosedGroups)

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
    window.location.replace('/auth')
  }

  /** saved orders ka fresh status laao */
  const sync = useCallback(async () => {
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
      setItems(readOrderHistory())
    } finally {
      setSyncing(false)
    }
  }, [])

  useEffect(() => {
    sync()
    const onVisible = () => {
      if (document.visibilityState === 'visible') sync()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [sync])

  const clearAll = async () => {
    const ok = await confirmAction({
      title: 'Old orders khali karein?',
      message: 'Saved order list se saare orders hat jayenge (orders server par safe hain).',
      confirmLabel: 'Haan, khali karo',
    })
    if (!ok) return
    setItems(clearOrderHistory())
    setOpenCode('')
    notify.info('Old orders list khali kar di 🗑️')
  }

  const removeOne = async (code) => {
    const ok = await confirmAction({
      title: 'Order hatao?',
      message: `${code} list se nikal jayega.`,
      confirmLabel: 'Haan, hatao',
    })
    if (!ok) return
    setItems(removeOrder(code))
    if (openCode === code) setOpenCode('')
  }

  const visible = useMemo(() => {
    const needle = query.trim().toUpperCase()
    if (!needle) return items
    return items.filter((entry) => String(entry.code).toUpperCase().includes(needle))
  }, [items, query])

  /* sections banao (sirf wahi jisme items hain) */
  const groups = useMemo(
    () =>
      GROUPS.map((group) => {
        const list = visible.filter((entry) => group.statuses.includes(entry.status))
        const total = list.reduce((sum, entry) => sum + (Number(entry.total) || 0), 0)
        return { ...group, list, total }
      }).filter((group) => group.list.length),
    [visible],
  )

  const allClosed = groups.length > 0 && groups.every((group) => closedGroups[group.key])

  const toggleGroup = (key) => {
    const next = { ...closedGroups, [key]: !closedGroups[key] }
    setClosedGroups(next)
    writeClosedGroups(next)
  }

  const toggleAll = () => {
    const next = { ...closedGroups }
    groups.forEach((group) => {
      next[group.key] = !allClosed
    })
    setClosedGroups(next)
    writeClosedGroups(next)
  }

  return (
    <div className="book-page min-h-screen">
      <Navbar categories wide user={user} onLogout={logout} />

      <main className="mx-auto max-w-3xl px-4 pt-8 sm:px-6">
        <header>
          <Link
            to="/track"
            className="inline-flex items-center gap-1.5 text-[0.7rem] font-bold text-brand-700 hover:underline dark:text-brand-300"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Order tracking
          </Link>
          <h1 className="mt-2 flex items-center gap-2 font-display text-3xl font-bold text-brand-900 dark:text-white">
            <History className="h-6 w-6 text-brand-600 dark:text-brand-300" /> Saved orders
          </h1>
          <p className="mt-1 text-sm text-brand-800/70 dark:text-white/60">
            Har order jo tum ne track kiya — yahan save rehta hai. Status apne aap update hota hai.
          </p>
        </header>

        {/* ---------- toolbar ---------- */}
        <div className="mt-5 flex flex-col gap-2 rounded-3xl border border-slate-200/80 bg-white/80 p-3 shadow-sm backdrop-blur sm:flex-row sm:items-center dark:border-white/10 dark:bg-white/[0.04]">
          <div className="flex flex-1 items-center gap-2.5 rounded-2xl border border-slate-200 bg-white px-3.5 py-2 focus-within:border-brand-400 focus-within:ring-4 focus-within:ring-brand-100 dark:border-white/10 dark:bg-white/5 dark:focus-within:ring-brand-500/20">
            <Search className="h-4 w-4 shrink-0 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search order number"
              aria-label="Search saved orders"
              className="w-full bg-transparent text-sm font-semibold text-slate-800 outline-none placeholder:font-normal placeholder:text-slate-400 dark:text-white"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label="Clear search"
                className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-white/10"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            ) : null}
          </div>

          <div className="flex items-center justify-between gap-2 sm:justify-end">
            {groups.length ? (
              <button
                type="button"
                onClick={toggleAll}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-[0.7rem] font-bold text-slate-600 transition hover:border-brand-300 hover:text-brand-700 dark:border-white/10 dark:text-slate-300 dark:hover:text-brand-200"
              >
                {allClosed ? (
                  <ChevronDown className="h-3.5 w-3.5" />
                ) : (
                  <ChevronUp className="h-3.5 w-3.5" />
                )}
                {allClosed ? 'Open all' : 'Close all'}
              </button>
            ) : null}
            <button
              type="button"
              onClick={sync}
              disabled={syncing}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-[0.7rem] font-bold text-brand-700 transition hover:border-brand-300 disabled:opacity-60 dark:border-white/10 dark:text-brand-300"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${syncing ? 'animate-spin' : ''}`} /> Refresh
            </button>
            <button
              type="button"
              onClick={clearAll}
              disabled={!items.length}
              className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 px-3 py-2 text-[0.7rem] font-bold text-rose-600 transition hover:border-rose-300 hover:bg-rose-50 disabled:opacity-50 dark:border-rose-400/30 dark:text-rose-300 dark:hover:bg-rose-500/10"
            >
              <X className="h-3.5 w-3.5" /> Clear all
            </button>
          </div>
        </div>

        {/* ---------- sections ---------- */}
        {items.length ? (
          groups.length ? (
            <div className="mt-4 space-y-3">
              {groups.map((group) => {
                const GroupIcon = group.icon
                const groupOpen = !closedGroups[group.key]

                return (
                  <section
                    key={group.key}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-white/[0.04]"
                  >
                    <button
                      type="button"
                      onClick={() => toggleGroup(group.key)}
                      aria-expanded={groupOpen}
                      className="flex w-full flex-wrap items-center gap-2.5 px-3.5 py-3 text-left transition hover:bg-slate-50/80 dark:hover:bg-white/[0.06]"
                    >
                      <span
                        className={`grid h-8 w-8 shrink-0 place-items-center rounded-full bg-slate-100 dark:bg-white/10 ${group.accent}`}
                      >
                        <GroupIcon className="h-4 w-4" />
                      </span>

                      <span className="min-w-0 flex-1">
                        <span
                          className={`block text-[0.66rem] font-extrabold uppercase tracking-[0.16em] ${group.accent}`}
                        >
                          {group.label}
                          <span className="ml-1.5 rounded-full bg-slate-100 px-1.5 py-0.5 text-[0.58rem] font-bold text-slate-600 dark:bg-white/10 dark:text-slate-300">
                            {group.list.length}
                          </span>
                        </span>
                        <span className="block text-[0.66rem] text-slate-500 dark:text-slate-400">
                          {group.hint}
                        </span>
                      </span>

                      {group.total ? (
                        <span className="shrink-0 text-[0.7rem] font-extrabold text-slate-700 dark:text-slate-200">
                          {moneyOf(group.total)}
                        </span>
                      ) : null}

                      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-slate-200 text-slate-500 dark:border-white/15 dark:text-slate-300">
                        {groupOpen ? (
                          <ChevronUp className="h-3.5 w-3.5" />
                        ) : (
                          <ChevronDown className="h-3.5 w-3.5" />
                        )}
                      </span>
                    </button>

                    {groupOpen ? (
                      <ul className="space-y-2 border-t border-slate-200 bg-slate-50/60 p-2 dark:border-white/10 dark:bg-white/[0.02]">
                        {group.list.map((entry) => {
                          const meta = STATUS_META[entry.status] || STATUS_META.pending
                          const open = openCode === entry.code
                          const final = FINAL_STATUSES.includes(entry.status)

                          return (
                            <li
                              key={entry.code}
                              className="overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:border-brand-300 dark:border-white/10 dark:bg-white/[0.04]"
                            >
                              <div className="flex flex-wrap items-center gap-2 px-3 py-2.5">
                                <button
                                  type="button"
                                  onClick={() => setOpenCode(open ? '' : entry.code)}
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
                                  className={`shrink-0 rounded-full px-2 py-0.5 text-[0.58rem] font-bold uppercase ring-1 ${meta.pill}`}
                                >
                                  {meta.label}
                                </span>

                                <button
                                  type="button"
                                  onClick={() => setOpenCode(open ? '' : entry.code)}
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
                                  onClick={() => removeOne(entry.code)}
                                  aria-label={`${entry.code} hatao`}
                                  title="List se hatao"
                                  className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/15"
                                >
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              </div>

                              {open ? (
                                <div className="border-t border-slate-200 px-3 py-3 dark:border-white/10">
                                  {final ? (
                                    <div
                                      className={`mb-3 flex flex-wrap items-center gap-2 rounded-2xl px-3 py-2 ring-1 ${
                                        entry.status === 'rejected'
                                          ? 'bg-rose-50/90 ring-rose-200 dark:bg-rose-500/10 dark:ring-rose-400/25'
                                          : 'bg-emerald-50/90 ring-emerald-200 dark:bg-emerald-500/10 dark:ring-emerald-400/25'
                                      }`}
                                    >
                                      <span
                                        className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-white ${
                                          entry.status === 'rejected'
                                            ? 'bg-rose-500'
                                            : 'bg-emerald-600'
                                        }`}
                                      >
                                        {entry.status === 'rejected' ? (
                                          <Ban className="h-3.5 w-3.5" />
                                        ) : (
                                          <PackageCheck className="h-3.5 w-3.5" />
                                        )}
                                      </span>
                                      <p
                                        className={`text-[0.66rem] font-extrabold uppercase tracking-[0.14em] ${
                                          entry.status === 'rejected'
                                            ? 'text-rose-700 dark:text-rose-200'
                                            : 'text-emerald-800 dark:text-emerald-200'
                                        }`}
                                      >
                                        {entry.status === 'rejected'
                                          ? 'Order closed'
                                          : 'Order complete'}
                                      </p>
                                      <span className="ml-auto text-[0.66rem] font-semibold text-slate-500 dark:text-slate-400">
                                        {when(entry.detail?.decidedAt || entry.at)}
                                      </span>
                                    </div>
                                  ) : null}

                                  <OrderDetail info={entry.detail} />

                                  <Link
                                    to={`/track?code=${encodeURIComponent(entry.code)}`}
                                    className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-brand-700 px-3.5 py-2 text-[0.7rem] font-bold text-white transition hover:bg-brand-800"
                                  >
                                    <History className="h-3.5 w-3.5" /> Live tracking kholo
                                  </Link>
                                </div>
                              ) : null}
                            </li>
                          )
                        })}
                      </ul>
                    ) : null}
                  </section>
                )
              })}
            </div>
          ) : (
            <p className="mt-6 rounded-2xl border border-dashed border-slate-300 px-4 py-6 text-center text-sm font-semibold text-slate-500 dark:border-white/15 dark:text-slate-400">
              Is number se koi saved order nahi mila
            </p>
          )
        ) : (
          <section className="mt-4 rounded-3xl border border-dashed border-slate-300 px-4 py-8 text-center dark:border-white/15">
            <History className="mx-auto h-6 w-6 text-slate-400" />
            <p className="mt-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
              Abhi koi purana order nahi
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Jab bhi koi order track karoge (ya order place karoge), wo yahan save ho jayega.
            </p>
            <Link
              to="/track"
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-brand-700 px-4 py-2 text-xs font-bold text-white transition hover:bg-brand-800"
            >
              <History className="h-3.5 w-3.5" /> Order tracking
            </Link>
          </section>
        )}

        <div className="mt-6 flex justify-center">
          <Link
            to="/home"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 transition hover:border-brand-300 hover:text-brand-700 dark:border-white/10 dark:text-slate-300 dark:hover:text-brand-200"
          >
            <ShoppingBag className="h-3.5 w-3.5" /> Aur books dekho
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  )
}
