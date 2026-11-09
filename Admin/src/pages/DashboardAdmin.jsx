import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  BookOpen,
  Check,
  ClipboardList,
  Clock3,
  Copy,
  IndianRupee,
  Link2,
  Loader2,
  RefreshCw,
  ShieldCheck,
  ShoppingBag,
  UserPlus,
  Users,
  X,
} from 'lucide-react'
import toast from 'react-hot-toast'
import PageHeader from '../components/PageHeader'
import { ENDPOINTS, apiList, apiSend } from '../lib/api'
import { ORDERS_PATH } from '../lib/pages'

/** pill for every order status */
const STATUS_STYLE = {
  pending: 'bg-amber-50 text-amber-700',
  approved: 'bg-brand-50 text-brand-700',
  shipped: 'bg-indigo-50 text-indigo-700',
  delivered: 'bg-emerald-50 text-emerald-700',
  rejected: 'bg-rose-50 text-rose-700',
}

const money = (value) =>
  `Rs. ${Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`

const when = (value) =>
  value ? new Date(value).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : '—'

/**
 * Admin dashboard — kitne users, kitne orders, kitne pending, revenue.
 * Numbers `/api/admin/stats` se aate hain (sirf admin token ke saath).
 */
export default function DashboardAdmin() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [invite, setInvite] = useState(null)
  const [requests, setRequests] = useState([])
  const [busyId, setBusyId] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [stats, inviteData, pending] = await Promise.all([
        apiList(ENDPOINTS.adminStats),
        apiList(ENDPOINTS.adminInvite).catch(() => null),
        apiList(ENDPOINTS.adminRequests).catch(() => []),
      ])
      setData(stats)
      setInvite(inviteData)
      setRequests(Array.isArray(pending) ? pending : [])
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const copyInvite = async () => {
    if (!invite?.link) return
    try {
      await navigator.clipboard.writeText(invite.link)
      toast.success('Invite link copied 🔗')
    } catch {
      toast.error('Copy failed — copy the link manually')
    }
  }

  const regenerate = async () => {
    try {
      const next = await apiSend(`${ENDPOINTS.adminInvite}/regenerate`, { method: 'POST' })
      setInvite(next)
      toast.success('New invite link created')
    } catch (err) {
      toast.error(err.message)
    }
  }

  const decide = async (id, action) => {
    setBusyId(id)
    try {
      await apiSend(`${ENDPOINTS.adminRequests}/${id}`, { method: 'PATCH', body: { action } })
      setRequests((prev) => prev.filter((item) => item.id !== id))
      toast.success(
        action === 'approve' ? 'Access approved ✅' : 'Request rejected',
      )
      load()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setBusyId('')
    }
  }

  const counts = data?.counts || {}

  const cards = [
    {
      label: 'Users',
      value: counts.users ?? '—',
      note: `${counts.newUsers ?? 0} naye is hafte`,
      icon: Users,
      tone: 'from-brand-700 to-brand-500',
    },
    {
      label: 'Total orders',
      value: counts.orders ?? '—',
      note: `${counts.books ?? 0} books site par`,
      icon: ShoppingBag,
      tone: 'from-indigo-600 to-indigo-400',
    },
    {
      label: 'Pending orders',
      value: counts.pending ?? '—',
      note: 'approve karne baaki',
      icon: Clock3,
      tone: 'from-amber-600 to-amber-400',
    },
    {
      label: 'Revenue',
      value: money(counts.revenue),
      note: 'approved + shipped + delivered',
      icon: IndianRupee,
      tone: 'from-emerald-600 to-emerald-400',
    },
  ]

  return (
    <>
      <PageHeader
        eyebrow="Admin"
        title="Dashboard"
        subtitle="At a glance: users, orders, pending and revenue."
        actions={
          <button type="button" onClick={load} disabled={loading} className="btn-outline">
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Refresh
          </button>
        }
      />

      {loading && !data ? (
        <p className="flex items-center gap-2 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading numbers…
        </p>
      ) : (
        <div className="space-y-4">
          {/* ---------- stat cards ---------- */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {cards.map((card) => {
              const Icon = card.icon
              return (
                <section key={card.label} className="card">
                  <div className="card-body flex items-center gap-3">
                    <span
                      className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${card.tone} text-white shadow-lg`}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[0.64rem] font-bold uppercase tracking-[0.14em] text-slate-500">
                        {card.label}
                      </p>
                      <p className="text-2xl font-extrabold leading-tight text-brand-900">
                        {card.value}
                      </p>
                      <p className="text-[0.68rem] text-slate-500">{card.note}</p>
                    </div>
                  </div>
                </section>
              )
            })}
          </div>

          {/* ---------- orders by status ---------- */}
          <section className="card">
            <div className="card-head">
              <h2 className="card-title">
                <ClipboardList className="h-4 w-4 text-brand-600" /> Orders by status
              </h2>
              <span className="count-pill">{counts.orders ?? 0} total</span>
            </div>
            <div className="card-body grid grid-cols-2 gap-2 sm:grid-cols-5">
              {['pending', 'approved', 'shipped', 'delivered', 'rejected'].map((key) => (
                <div key={key} className={`rounded-xl px-3 py-2 ${STATUS_STYLE[key]}`}>
                  <p className="text-[0.62rem] font-bold uppercase tracking-[0.12em]">{key}</p>
                  <p className="text-xl font-extrabold">{counts[key] ?? 0}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ---------- team access (invite + approvals) ---------- */}
          <section className="card">
            <div className="card-head">
              <h2 className="card-title">
                <ShieldCheck className="h-4 w-4 text-brand-600" /> Team access — invite link
              </h2>
              <span className="count-pill">{requests.length} pending</span>
            </div>
            <div className="card-body space-y-3">
              <p className="hint">
                Send this link to someone — they sign up with their <strong>Gmail</strong>, then you{' '}
                <strong>Approve</strong> them below. They can log into the admin only after approval.
              </p>

              <div className="flex flex-wrap items-center gap-2">
                <input
                  readOnly
                  value={invite?.link || '…'}
                  onFocus={(e) => e.target.select()}
                  className="input min-w-[15rem] flex-1 text-[0.72rem]"
                />
                <button type="button" onClick={copyInvite} className="btn-primary">
                  <Copy className="h-4 w-4" /> Copy link
                </button>
                <button type="button" onClick={regenerate} className="btn-outline">
                  <RefreshCw className="h-4 w-4" /> New link
                </button>
              </div>

              <div>
                <p className="label">
                  Approval requests {requests.length ? `(${requests.length})` : ''}
                </p>

                {requests.length ? (
                  <div className="space-y-2">
                    {requests.map((request) => (
                      <div
                        key={request.id}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-amber-200 bg-amber-50/70 px-3 py-2"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-[0.82rem] font-bold text-brand-900">
                            <UserPlus className="mr-1 inline h-3.5 w-3.5 text-amber-600" />
                            {request.name || 'Team member'}
                          </p>
                          <p className="truncate text-[0.7rem] text-slate-600">
                            {request.email} · {when(request.createdAt)}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => decide(request.id, 'approve')}
                            disabled={busyId === request.id}
                            className="btn-primary !px-3 !py-1.5 !text-[0.72rem]"
                          >
                            {busyId === request.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Check className="h-3.5 w-3.5" />
                            )}
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => decide(request.id, 'reject')}
                            disabled={busyId === request.id}
                            className="btn-outline !px-3 !py-1.5 !text-[0.72rem]"
                          >
                            <X className="h-3.5 w-3.5" /> Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="empty">
                    No pending requests — all clear. Share the link to get a request.
                  </p>
                )}
              </div>
            </div>
          </section>

          <div className="grid gap-4 lg:grid-cols-2">
            {/* ---------- recent orders ---------- */}
            <section className="card">
              <div className="card-head">
                <h2 className="card-title">
                  <ShoppingBag className="h-4 w-4 text-brand-600" /> Recent orders
                </h2>
                <Link
                  to={ORDERS_PATH}
                  className="text-[0.72rem] font-bold text-brand-700 hover:underline"
                >
                  All orders →
                </Link>
              </div>
              <div className="card-body space-y-2">
                {data?.recentOrders?.length ? (
                  data.recentOrders.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white/70 px-3 py-2"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-[0.8rem] font-bold text-brand-900">
                          {order.code} · {order.customerName || 'Guest'}
                        </p>
                        <p className="text-[0.68rem] text-slate-500">
                          {order.itemCount} books · {money(order.total)} · {when(order.createdAt)}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[0.6rem] font-bold uppercase ${
                          STATUS_STYLE[order.status] || 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="empty">No orders yet.</p>
                )}
              </div>
            </section>

            {/* ---------- recent users + content counts ---------- */}
            <section className="card">
              <div className="card-head">
                <h2 className="card-title">
                  <Users className="h-4 w-4 text-brand-600" /> Naye users
                </h2>
                <span className="count-pill">{counts.users ?? 0}</span>
              </div>
              <div className="card-body space-y-2">
                {data?.recentUsers?.length ? (
                  data.recentUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white/70 px-3 py-2"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-[0.8rem] font-bold text-brand-900">
                          {user.name || 'Reader'}
                        </p>
                        <p className="truncate text-[0.68rem] text-slate-500">{user.email}</p>
                      </div>
                      <span className="shrink-0 text-[0.68rem] text-slate-500">
                        {when(user.createdAt)}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="empty">No user has signed up yet.</p>
                )}

                <div className="mt-3 grid grid-cols-3 gap-2">
                  <div className="rounded-xl bg-slate-50 px-3 py-2 text-center">
                    <p className="text-[0.6rem] font-bold uppercase text-slate-500">Books</p>
                    <p className="text-lg font-extrabold text-brand-900">{counts.books ?? 0}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 px-3 py-2 text-center">
                    <p className="text-[0.6rem] font-bold uppercase text-slate-500">Products</p>
                    <p className="text-lg font-extrabold text-brand-900">{counts.products ?? 0}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 px-3 py-2 text-center">
                    <p className="text-[0.6rem] font-bold uppercase text-slate-500">Wishlist</p>
                    <p className="text-lg font-extrabold text-brand-900">{counts.wishlist ?? 0}</p>
                  </div>
                </div>

                {data?.generatedAt ? (
                  <p className="hint mt-2 flex items-center gap-1">
                    <BookOpen className="h-3 w-3" /> Last update:{' '}
                    {new Date(data.generatedAt).toLocaleTimeString()}
                  </p>
                ) : null}
              </div>
            </section>
          </div>
        </div>
      )}
    </>
  )
}

