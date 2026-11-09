import { useState } from 'react'
import { Eye, EyeOff, Loader2, LockKeyhole, LogIn, Mail, UserPlus } from 'lucide-react'
import { saveAdminSession } from '../lib/adminAuth'

/** Admin login — the panel cannot be opened without it. */
export default function AdminLogin({ onLogin }) {
  const invite = new URLSearchParams(window.location.search).get('invite') || ''
  const [mode, setMode] = useState(invite ? 'signup' : 'login')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [show, setShow] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [pendingMsg, setPendingMsg] = useState('')

  const post = async (url, body) => {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(data.message || 'Request failed')
    return data
  }

  const submit = async (event) => {
    event.preventDefault()
    setBusy(true)
    setError('')
    setPendingMsg('')

    try {
      if (mode === 'signup') {
        const data = await post('/api/admin/signup', { ...form, invite })
        setPendingMsg(data.message || 'Signed up — wait for approval')
        setForm({ name: '', email: '', password: '' })
      } else {
        const data = await post('/api/admin/login', form)
        saveAdminSession({ token: data.token, admin: data.admin })
        onLogin?.(data.admin)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_20%_0%,#eef3f9,transparent_55%),radial-gradient(circle_at_100%_100%,#fbeed8,transparent_50%)] px-4 py-10">
      <form
        onSubmit={submit}
        autoComplete="off"
        className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-6 shadow-xl"
      >
        {/* browser ka autofill roko (hidden dummy fields) */}
        <input type="text" name="prevent_autofill_user" autoComplete="off" className="hidden" />
        <input
          type="password"
          name="prevent_autofill_pass"
          autoComplete="new-password"
          className="hidden"
        />
        <div className="flex items-center gap-2.5">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-brand-700 to-brand-500 text-white shadow-lg shadow-brand-700/25">
            <LockKeyhole className="h-5 w-5" />
          </span>
          <div>
            <h1 className="font-display text-lg font-bold text-brand-900">Book River Admin</h1>
            <p className="text-[0.72rem] text-slate-500">Log in to view the panel</p>
          </div>
        </div>

        <div className="mt-4 flex gap-1 rounded-xl bg-slate-100 p-1">
          {[
            { key: 'login', label: 'Login' },
            { key: 'signup', label: 'Sign up (Gmail)' },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => {
                setMode(tab.key)
                setError('')
                setPendingMsg('')
                setForm({ name: '', email: '', password: '' })
                setShow(false)
              }}
              className={`flex-1 rounded-lg px-3 py-1.5 text-[0.76rem] font-bold transition ${
                mode === tab.key
                  ? 'bg-white text-brand-800 shadow-sm'
                  : 'text-slate-500 hover:text-brand-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {invite ? (
          <p className="mt-3 rounded-xl bg-brand-50 px-3 py-2 text-[0.72rem] font-semibold text-brand-800">
            You came from the invite link ✅ — sign up with your <strong>Gmail</strong> account, the
            admin will approve you afterwards.
          </p>
        ) : null}

        <div className="mt-4 space-y-3">
          {mode === 'signup' ? (
            <div>
              <span className="label">Name</span>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input"
                maxLength={40}
                autoComplete="off"
              />
            </div>
          ) : null}

          <div>
            <span className="label">{mode === 'signup' ? 'Gmail address' : 'Email'}</span>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                type="email"
                autoComplete="off"
                className="input pl-9"
              />
            </div>
            {mode === 'signup' ? <p className="hint">Sign up is only possible with a Gmail account</p> : null}
          </div>

          <div>
            <span className="label">Password</span>
            <div className="relative">
              <input
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                type={show ? 'text' : 'password'}
                autoComplete="new-password"
                className="input pr-10"
              />
              <button
                type="button"
                onClick={() => setShow((value) => !value)}
                className="absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-lg text-slate-400 hover:text-slate-700"
                aria-label={show ? 'Hide password' : 'Show password'}
              >
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {error ? (
            <p className="rounded-xl bg-red-50 px-3 py-2 text-[0.76rem] font-semibold text-red-600">
              {error}
            </p>
          ) : null}

          {pendingMsg ? (
            <p className="rounded-xl bg-amber-50 px-3 py-2 text-[0.76rem] font-semibold text-amber-700">
              {pendingMsg}
            </p>
          ) : null}

          <button type="submit" disabled={busy} className="btn-primary w-full justify-center">
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : mode === 'signup' ? (
              <UserPlus className="h-4 w-4" />
            ) : (
              <LogIn className="h-4 w-4" />
            )}
            {mode === 'signup' ? 'Send access request' : 'Login'}
          </button>

          <p className="hint text-center">
            {mode === 'signup'
              ? 'After signing up the request appears in the admin dashboard — you can log in once approved.'
              : 'Need access? Sign up with the invite link, then an admin will approve you.'}
          </p>
        </div>
      </form>
    </div>
  )
}
