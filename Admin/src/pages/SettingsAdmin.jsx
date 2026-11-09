import { useCallback, useEffect, useState } from 'react'
import { Database, ExternalLink, Loader2, RefreshCw, Server, Tags } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { SECTIONS } from '../lib/sections'
import { CATEGORY_PAGES } from '../lib/pages'
import { FRONTEND_BASE, FRONTEND_URL, apiList } from '../lib/api'

/**
 * Settings — frontend ka link, backend ki live health aur admin ki chhoti info.
 * (Admin login abhi nahi hai, isliye yahan koi profile form nahi.)
 */
export default function SettingsAdmin() {
  const [health, setHealth] = useState({ loading: true, ok: false, data: null, error: '' })

  const check = useCallback(async () => {
    setHealth({ loading: true, ok: false, data: null, error: '' })
    try {
      const data = await apiList('/api/health')
      setHealth({ loading: false, ok: true, data, error: '' })
    } catch (err) {
      setHealth({ loading: false, ok: false, data: null, error: err.message })
    }
  }, [])

  useEffect(() => {
    check()
  }, [check])

  const dbState = health.data?.db
    ? `${health.data.db.connected ? 'connected' : 'disconnected'}${
        health.data.db.name ? ` · ${health.data.db.name}` : ''
      }`
    : '—'

  return (
    <>
      <PageHeader
        eyebrow="Admin"
        title="Settings"
        subtitle="Frontend address, backend health and admin panel info."
        actions={
          <button type="button" onClick={check} disabled={health.loading} className="btn-outline">
            {health.loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Refresh
          </button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-2">
        {/* ---- frontend ---- */}
        <section className="card">
          <div className="card-head">
            <h2 className="card-title">
              <ExternalLink className="h-4 w-4 text-brand-600" /> Frontend
            </h2>
            <span className="count-pill">port 5173</span>
          </div>
          <div className="card-body space-y-3">
            <div>
              <span className="label">Base URL</span>
              <p className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-700">
                {FRONTEND_BASE}
              </p>
            </div>
            <div>
              <span className="label">Description page</span>
              <p className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-700">
                {FRONTEND_URL}
              </p>
            </div>
            <a href={FRONTEND_URL} target="_blank" rel="noreferrer" className="btn-primary">
              <ExternalLink className="h-4 w-4" /> Open frontend
            </a>
          </div>
        </section>

        {/* ---- backend ---- */}
        <section className="card">
          <div className="card-head">
            <h2 className="card-title">
              <Server className="h-4 w-4 text-brand-600" /> Backend status
            </h2>
            <span
              className={
                health.loading
                  ? 'count-pill'
                  : health.ok
                    ? 'rounded-full bg-emerald-50 px-2 py-0.5 text-[0.68rem] font-bold text-emerald-700'
                    : 'rounded-full bg-red-50 px-2 py-0.5 text-[0.68rem] font-bold text-red-600'
              }
            >
              {health.loading ? 'checking…' : health.ok ? 'online' : 'offline'}
            </span>
          </div>
          <div className="card-body space-y-3">
            {health.loading ? (
              <p className="flex items-center gap-2 text-sm text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin" /> Checking backend…
              </p>
            ) : health.ok ? (
              <ul className="space-y-2 text-sm text-slate-700">
                <li className="row justify-between">
                  <span className="flex items-center gap-2 font-semibold">
                    <Server className="h-4 w-4 text-brand-600" /> Service
                  </span>
                  <span>{health.data?.service || 'Book River API'}</span>
                </li>
                <li className="row justify-between">
                  <span className="flex items-center gap-2 font-semibold">
                    <Database className="h-4 w-4 text-brand-600" /> Database
                  </span>
                  <span>{dbState}</span>
                </li>
                <li className="row justify-between">
                  <span className="font-semibold">Time</span>
                  <span>
                    {health.data?.time ? new Date(health.data.time).toLocaleString() : '—'}
                  </span>
                </li>
              </ul>
            ) : (
              <p className="empty">
                Cannot reach the backend — is the server running on port 5000? ({health.error})
              </p>
            )}
            <p className="hint">
              API base: <code>/api</code> — proxied by Vite to <code>http://localhost:5000</code>.
            </p>
          </div>
        </section>

        {/* ---- admin info ---- */}
        <section className="card lg:col-span-2">
          <div className="card-head">
            <h2 className="card-title">
              <Tags className="h-4 w-4 text-brand-600" /> Admin panel
            </h2>
            <span className="count-pill">v1.0</span>
          </div>
          <div className="card-body grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-200/80 bg-white/70 p-3">
              <p className="text-[0.68rem] font-bold uppercase tracking-[0.1em] text-slate-500">
                Content pages
              </p>
              <p className="mt-1 text-2xl font-bold text-brand-900">{SECTIONS.length}</p>
              <p className="text-[0.72rem] text-slate-500">Slides · Categories · Open Book · …</p>
            </div>
            <div className="rounded-xl border border-slate-200/80 bg-white/70 p-3">
              <p className="text-[0.68rem] font-bold uppercase tracking-[0.1em] text-slate-500">
                Category pages
              </p>
              <p className="mt-1 text-2xl font-bold text-brand-900">{CATEGORY_PAGES.length}</p>
              <p className="text-[0.72rem] text-slate-500">Board Books · Teen Fiction · …</p>
            </div>
            <div className="rounded-xl border border-slate-200/80 bg-white/70 p-3">
              <p className="text-[0.68rem] font-bold uppercase tracking-[0.1em] text-slate-500">
                Login
              </p>
              <p className="mt-1 text-sm font-bold text-brand-900">Admin login ON</p>
              <p className="text-[0.72rem] text-slate-500">
                Opening the panel asks for email + password
              </p>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}

