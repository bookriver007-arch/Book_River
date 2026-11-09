import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Ban,
  Check,
  CheckCheck,
  ClipboardList,
  Lock,
  Package,
  RefreshCw,
  ShoppingCart,
  Trash2,
  Truck,
} from 'lucide-react'
import toast from 'react-hot-toast'
import PageHeader from '../components/PageHeader'
import { ENDPOINTS, apiDelete, apiList, apiSend } from '../lib/api'
import { confirmAction } from '../lib/confirm'
import { FRONTEND_BASE } from '../lib/api'

/** payment method ke labels */
const PAYMENT_LABEL = {
  cod: 'Cash on Delivery',
  card: 'Card',
  easypaisa: 'EasyPaisa',
  jazzcash: 'JazzCash',
  bank: 'Bank Transfer',
}

/** label + pill colour for every status */
const STATUS = {
  pending: { label: 'Pending', cls: 'bg-amber-100 text-amber-800 ring-amber-200' },
  approved: { label: 'Approved', cls: 'bg-emerald-100 text-emerald-800 ring-emerald-200' },
  rejected: { label: 'Rejected', cls: 'bg-rose-100 text-rose-700 ring-rose-200' },
  shipped: { label: 'Shipped', cls: 'bg-sky-100 text-sky-800 ring-sky-200' },
  delivered: { label: 'Delivered', cls: 'bg-brand-100 text-brand-800 ring-brand-200' },
}

const FILTERS = ['all', 'pending', 'approved', 'shipped']
/** these statuses are final — the order locks and moves into "Complete order history" */
const FINAL_ORDER_STATUSES = ['delivered', 'rejected']

const money = (value) =>
  `Rs. ${Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`

const when = (iso) => {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
  } catch {
    return '—'
  }
}

/**
 * Orders (cart) — frontend ke `/cart` se aaye orders.
 * Yahan se approve / reject / ship / deliver + delete hota hai.
 */
export default function OrdersAdmin() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState(null)
  const [filter, setFilter] = useState('all')

  const reload = useCallback(async () => {
    setLoading(true)
    try {
      const data = await apiList(ENDPOINTS.orders)
      setOrders(Array.isArray(data) ? data : [])
    } catch {
      toast.error('Orders did not load — is the backend (port 5000) running?')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    reload()
  }, [reload])

  const counts = useMemo(() => {
    const active = orders.filter((order) => !FINAL_ORDER_STATUSES.includes(order.status))
    const base = { all: active.length }
    FILTERS.slice(1).forEach((key) => {
      base[key] = active.filter((order) => order.status === key).length
    })
    base.total = orders.length
    base.complete = orders.filter((order) => FINAL_ORDER_STATUSES.includes(order.status)).length
    base.revenue = orders
      .filter((order) => ['approved', 'shipped', 'delivered'].includes(order.status))
      .reduce((sum, order) => sum + Number(order.total || 0), 0)
    return base
  }, [orders])

  const activeOrders = useMemo(
    () => orders.filter((order) => !FINAL_ORDER_STATUSES.includes(order.status)),
    [orders],
  )

  const completedOrders = useMemo(
    () => orders.filter((order) => FINAL_ORDER_STATUSES.includes(order.status)),
    [orders],
  )

  const visible = useMemo(
    () => (filter === 'all' ? activeOrders : activeOrders.filter((order) => order.status === filter)),
    [activeOrders, filter],
  )

  const setStatus = async (order, status, note = '') => {
    if (status === 'rejected') {
      const ok = await confirmAction({
        title: 'Reject order?',
        message: `${order.code} will be rejected — the customer will see "Rejected" in tracking.`,
        confirmLabel: 'Yes, reject',
      })
      if (!ok) return
    }
    setBusyId(order.id)
    try {
      await apiSend(`${ENDPOINTS.orders}/${order.id}`, {
        method: 'PATCH',
        body: { status, statusNote: note },
      })
      toast.success(`Order ${order.code} → ${STATUS[status].label}`)
      await reload()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setBusyId(null)
    }
  }

  const remove = async (order) => {
    const ok = await confirmAction({
      title: 'Delete order?',
      message: `${order.code} will be deleted permanently.`,
      confirmLabel: 'Yes, delete',
    })
    if (!ok) return
    setBusyId(order.id)
    try {
      await apiDelete(`${ENDPOINTS.orders}/${order.id}`)
      toast.success('Order deleted')
      await reload()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setBusyId(null)
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Store"
        title="Orders — Cart"
        subtitle="Approve / reject / ship the orders coming from the frontend here."
        actions={
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={reload} className="btn-outline" disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
            </button>
            <a
              href={`${FRONTEND_BASE}/cart`}
              target="_blank"
              rel="noreferrer"
              className="btn-primary"
            >
              <ShoppingCart className="h-4 w-4" /> Frontend cart
            </a>
          </div>
        }
      />

      {/* ---------- counts ---------- */}
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {[
          { key: 'total', label: 'Total orders', icon: ClipboardList, tone: 'text-brand-600' },
          { key: 'pending', label: 'To approve', icon: Package, tone: 'text-amber-600' },
          { key: 'approved', label: 'Approved', icon: CheckCheck, tone: 'text-emerald-600' },
          { key: 'shipped', label: 'Shipped', icon: Truck, tone: 'text-sky-600' },
          { key: 'complete', label: 'Complete orders', icon: Lock, tone: 'text-rose-600' },
        ].map((stat) => (
          <div key={stat.key} className="card">
            <div className="card-body flex items-center justify-between gap-2 py-3.5">
              <div>
                <p className="text-[0.62rem] font-bold uppercase tracking-widest text-slate-500">
                  {stat.label}
                </p>
                <p className="mt-0.5 text-2xl font-extrabold text-brand-900">
                  {counts[stat.key] || 0}
                </p>
              </div>
              <stat.icon className={`h-6 w-6 ${stat.tone}`} />
            </div>
          </div>
        ))}
      </section>

      <p className="mt-3 text-sm text-slate-600">
        Revenue from approved + shipped + delivered orders:{' '}
        <strong className="text-brand-900">{money(counts.revenue)}</strong>
      </p>

      {/* ---------- filter chips ---------- */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {FILTERS.map((key) => {
          const active = filter === key
          const label = key === 'all' ? 'All' : STATUS[key].label
          return (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={
                active
                  ? 'rounded-full bg-brand-700 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm'
                  : 'rounded-full border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-600 transition hover:border-brand-400 hover:text-brand-700'
              }
            >
              {label} <span className="opacity-70">({counts[key] || 0})</span>
            </button>
          )
        })}
      </div>

      {/* ---------- orders ---------- */}
      {loading ? (
        <div className="mt-5 space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-36 animate-pulse rounded-2xl bg-slate-100" />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-white/70 px-6 py-14 text-center">
          <Package className="mx-auto h-8 w-8 text-slate-300" />
          <p className="mt-3 text-base font-semibold text-slate-700">
            {activeOrders.length
              ? 'No orders with this status'
              : completedOrders.length
                ? 'All orders are complete — they are in the "Complete order history" box below'
                : 'No orders yet'}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Press “Place order” in the frontend cart — the order appears here.
          </p>
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          {visible.map((order) => {
            const meta = STATUS[order.status] || STATUS.pending
            const busy = busyId === order.id

            return (
              <article key={order.id} className="card">
                <div className="card-head flex-wrap gap-2">
                  <h2 className="card-title flex-wrap">
                    <Package className="h-4 w-4 text-brand-600" /> {order.code}
                    <span
                      className={`ml-1 rounded-full px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider ring-1 ${meta.cls}`}
                    >
                      {meta.label}
                    </span>
                  </h2>
                  <span className="text-xs text-slate-500">{when(order.createdAt)}</span>
                </div>

                <div className="card-body space-y-4">
                  {/* customer */}
                  <div className="grid gap-1 text-sm sm:grid-cols-2">
                    <p className="text-slate-600">
                      <span className="font-semibold text-slate-800">Customer:</span>{' '}
                      {order.customerName || 'Guest'}
                    </p>
                    <p className="text-slate-600">
                      <span className="font-semibold text-slate-800">Phone:</span>{' '}
                      {order.customerPhone || '—'}
                    </p>
                    <p className="truncate text-slate-600">
                      <span className="font-semibold text-slate-800">Email:</span>{' '}
                      {order.customerEmail || '—'}
                    </p>
                    <p className="text-slate-600">
                      <span className="font-semibold text-slate-800">Address:</span>{' '}
                      {order.address || '—'}
                    </p>
                    <p className="text-slate-600 sm:col-span-2">
                      <span className="font-semibold text-slate-800">Payment:</span>{' '}
                      {PAYMENT_LABEL[order.payment?.method] || 'Cash on Delivery'}
                      {order.payment?.last4
                        ? ` · ${order.payment.brand || 'Card'} ···· ${order.payment.last4}`
                        : ''}
                      {order.payment?.mobile ? ` · ${order.payment.mobile}` : ''}
                      {order.payment?.ref ? ` · Ref ${order.payment.ref}` : ''}
                    </p>
                    {order.note ? (
                      <p className="text-slate-600 sm:col-span-2">
                        <span className="font-semibold text-slate-800">Note:</span> {order.note}
                      </p>
                    ) : null}
                    <p className="text-slate-600 sm:col-span-2">
                      <span className="font-semibold text-slate-800">Ordered:</span>{' '}
                      {order.createdAt ? new Date(order.createdAt).toLocaleString() : '—'}
                      {order.decidedAt
                        ? ` · Updated: ${new Date(order.decidedAt).toLocaleString()}`
                        : ''}
                    </p>
                  </div>

                  {/* ITEMLIST */}
                  <ul className="space-y-2">
                    {(order.items || []).map((item) => (
                      <li
                        key={`${order.id}-${item.bookId}`}
                        className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white/60 p-2"
                      >
                        {item.image ? (
                          <img
                            src={item.image}
                            alt=""
                            className="h-14 w-10 shrink-0 rounded object-cover"
                          />
                        ) : (
                          <span className="grid h-14 w-10 shrink-0 place-items-center rounded bg-slate-100">
                            <Package className="h-4 w-4 text-slate-400" />
                          </span>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-slate-800">
                            {item.title}
                          </p>
                          <p className="truncate text-xs text-slate-500">
                            {item.author || 'Book River'}
                            {item.category ? ` · ${item.category}` : ''}
                          </p>
                        </div>
                        <p className="shrink-0 text-xs font-semibold text-slate-600">
                          {item.qty} × {item.price || '—'}
                        </p>
                      </li>
                    ))}
                  </ul>

                  <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-slate-500">
                    <span>
                      Items: <strong className="text-slate-800">{order.itemCount}</strong>
                    </span>
                    <span>
                      Subtotal:{' '}
                      <strong className="text-slate-800">{money(order.subtotal)}</strong>
                    </span>
                    <span>
                      Shipping:{' '}
                      <strong className="text-slate-800">
                        {order.shipping ? money(order.shipping) : 'Free'}
                      </strong>
                    </span>
                    {order.tax ? (
                      <span>
                        {order.taxLabel || 'Tax'}:{' '}
                        <strong className="text-slate-800">{money(order.tax)}</strong>
                      </span>
                    ) : null}
                    <span className="text-brand-800">
                      Total: <strong>{money(order.total)}</strong>
                    </span>
                  </div>

                  {/* ACTIONS */}
                  <div className="flex flex-wrap items-center gap-2 border-t border-slate-200 pt-3">
                    {order.status === 'pending' ? (
                      <>
                        <button
                          type="button"
                          onClick={() => setStatus(order, 'approved')}
                          disabled={busy}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-60"
                        >
                          <Check className="h-3.5 w-3.5" /> Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => setStatus(order, 'rejected')}
                          disabled={busy}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 px-3.5 py-2 text-xs font-bold text-rose-600 transition hover:bg-rose-50 disabled:opacity-60"
                        >
                          <Ban className="h-3.5 w-3.5" /> Reject
                        </button>
                      </>
                    ) : null}

                    {order.status === 'approved' ? (
                      <>
                        <button
                          type="button"
                          onClick={() => setStatus(order, 'shipped')}
                          disabled={busy}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-sky-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-sky-700 disabled:opacity-60"
                        >
                          <Truck className="h-3.5 w-3.5" /> Ship it
                        </button>
                        <button
                          type="button"
                          onClick={() => setStatus(order, 'rejected')}
                          disabled={busy}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 px-3.5 py-2 text-xs font-bold text-rose-600 transition hover:bg-rose-50 disabled:opacity-60"
                        >
                          <Ban className="h-3.5 w-3.5" /> Reject
                        </button>
                      </>
                    ) : null}

                    {order.status === 'shipped' ? (
                      <button
                        type="button"
                        onClick={() => setStatus(order, 'delivered')}
                        disabled={busy}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-brand-700 px-3.5 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-brand-800 disabled:opacity-60"
                      >
                        <CheckCheck className="h-3.5 w-3.5" /> Delivered
                      </button>
                    ) : null}

                    {order.status === 'rejected' || order.status === 'delivered' ? (
                      <span className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 px-3.5 py-2 text-xs font-bold text-slate-600">
                        <Lock className="h-3.5 w-3.5" /> Complete — view only
                      </span>
                    ) : null}

                    {order.status !== 'rejected' && order.status !== 'delivered' ? (
                      <button
                        type="button"
                        onClick={() => remove(order)}
                        disabled={busy}
                        className="ml-auto inline-flex items-center gap-1.5 rounded-xl border border-rose-200 px-3.5 py-2 text-xs font-bold text-rose-600 transition hover:bg-rose-50 disabled:opacity-60"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </button>
                    ) : null}
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}
      {/* ---------- Complete order history ---------- */}
      <section className="card mt-4">
        <div className="card-head">
          <h2 className="card-title">
            <Lock className="h-4 w-4 text-rose-600" /> Complete order history
          </h2>
          <span className="count-pill">{completedOrders.length} orders</span>
        </div>
        <div className="card-body space-y-2">
          {completedOrders.length ? (
            completedOrders.map((order) => {
              const meta = STATUS[order.status] || STATUS.pending
              return (
                <details
                  key={order.id}
                  className="rounded-xl border border-slate-200 bg-white/70 p-3"
                >
                  <summary className="flex cursor-pointer flex-wrap items-center gap-2 text-sm">
                    <Package className="h-4 w-4 text-brand-600" />
                    <strong className="text-brand-900">{order.code}</strong>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[0.6rem] font-bold uppercase ring-1 ${meta.cls}`}
                    >
                      {meta.label}
                    </span>
                    <span className="text-slate-600">
                      {order.customerName || 'Guest'} · {order.itemCount} books ·{' '}
                      {money(order.total)}
                    </span>
                    <span className="ml-auto text-[0.7rem] text-slate-500">
                      {order.createdAt ? new Date(order.createdAt).toLocaleString() : ''}
                    </span>
                  </summary>

                  <div className="mt-3 space-y-2 text-[0.8rem]">
                    <div className="grid gap-1 sm:grid-cols-2">
                      <p className="text-slate-600">
                        <span className="font-semibold text-slate-800">Customer:</span>{' '}
                        {order.customerName || 'Guest'}
                      </p>
                      <p className="text-slate-600">
                        <span className="font-semibold text-slate-800">Phone:</span>{' '}
                        {order.customerPhone || '—'}
                      </p>
                      <p className="truncate text-slate-600">
                        <span className="font-semibold text-slate-800">Email:</span>{' '}
                        {order.customerEmail || '—'}
                      </p>
                      <p className="text-slate-600">
                        <span className="font-semibold text-slate-800">Payment:</span>{' '}
                        {PAYMENT_LABEL[order.payment?.method] || 'Cash on Delivery'}
                      </p>
                      <p className="text-slate-600 sm:col-span-2">
                        <span className="font-semibold text-slate-800">Address:</span>{' '}
                        {order.address || '—'}
                      </p>
                      {order.note ? (
                        <p className="text-slate-600 sm:col-span-2">
                          <span className="font-semibold text-slate-800">Note:</span> {order.note}
                        </p>
                      ) : null}
                      <p className="text-slate-600 sm:col-span-2">
                        <span className="font-semibold text-slate-800">Ordered:</span>{' '}
                        {order.createdAt ? new Date(order.createdAt).toLocaleString() : '—'}
                        {order.decidedAt
                          ? ` · Completed: ${new Date(order.decidedAt).toLocaleString()}`
                          : ''}
                      </p>
                    </div>

                    <ul className="space-y-1">
                      {(order.items || []).map((item, index) => (
                        <li
                          key={`${order.id}-h-${item.bookId}-${index}`}
                          className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 px-2.5 py-1 text-[0.74rem]"
                        >
                          <span className="min-w-0 truncate font-semibold text-slate-800">
                            {item.title}
                          </span>
                          <span className="shrink-0 text-slate-500">
                            {item.qty} × {item.price || '—'}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.74rem] text-slate-500">
                      <span>
                        Items: <strong className="text-slate-800">{order.itemCount}</strong>
                      </span>
                      <span>
                        Subtotal: <strong className="text-slate-800">{money(order.subtotal)}</strong>
                      </span>
                      <span>
                        Shipping:{' '}
                        <strong className="text-slate-800">
                          {order.shipping ? money(order.shipping) : 'Free'}
                        </strong>
                      </span>
                      {order.tax ? (
                        <span>
                          {order.taxLabel || 'Tax'}:{' '}
                          <strong className="text-slate-800">{money(order.tax)}</strong>
                        </span>
                      ) : null}
                      <span className="text-brand-800">
                        Total: <strong>{money(order.total)}</strong>
                      </span>
                    </div>
                  </div>
                </details>
              )
            })
          ) : (
            <p className="empty">
              No completed orders yet — once you deliver or reject an order it appears here.
            </p>
          )}
        </div>
      </section>
    </>
  )
}
