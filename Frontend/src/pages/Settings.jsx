import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Bell, LogOut, Mail, Moon, Save, Sun, User } from 'lucide-react'
import Navbar from '../components/Navbar.jsx'
import useTheme from '../hooks/useTheme.js'

const PREFS_KEY = 'br_prefs'

/** Settings page — profile, appearance, notifications, account. */
export default function Settings() {
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()
  const [user, setUser] = useState(null)
  const [name, setName] = useState('')
  const [prefs, setPrefs] = useState({ updates: true, orders: true })

  useEffect(() => {
    if (!localStorage.getItem('br_token')) {
      navigate('/auth', { replace: true })
      return
    }

    let parsed = null
    try {
      parsed = JSON.parse(localStorage.getItem('br_user'))
    } catch {
      parsed = null
    }
    setUser(parsed)
    setName(parsed?.name || '')

    try {
      const saved = JSON.parse(localStorage.getItem(PREFS_KEY))
      if (saved) setPrefs({ updates: !!saved.updates, orders: !!saved.orders })
    } catch {
      /* default prefs */
    }
  }, [navigate])

  const logout = () => {
    localStorage.removeItem('br_token')
    localStorage.removeItem('br_user')
    window.location.replace('/description')
  }

  const saveProfile = (e) => {
    e.preventDefault()
    const clean = name.trim()
    if (!clean) {
      toast.error('Name khaali nahi ho sakta')
      return
    }
    const next = { ...(user || {}), name: clean }
    localStorage.setItem('br_user', JSON.stringify(next))
    setUser(next)
    toast.success('Profile save ho gaya ✅')
  }

  const togglePref = (key) => {
    const next = { ...prefs, [key]: !prefs[key] }
    setPrefs(next)
    localStorage.setItem(PREFS_KEY, JSON.stringify(next))
  }

  return (
    <div className="book-page min-h-screen pb-14">
      <Navbar categories wide user={user ?? { name: 'Reader' }} onLogout={logout} />

      <main className="mx-auto max-w-3xl px-4 pt-8 sm:px-6">
        <h1 className="font-display text-3xl font-bold text-brand-900 dark:text-white">Settings</h1>
        <p className="mt-1 text-sm text-brand-800/70 dark:text-white/60">
          Apna profile, theme aur notifications manage karo.
        </p>

        {/* ---- Profile ---- */}
        <form
          onSubmit={saveProfile}
          className="mt-6 rounded-2xl border border-white/70 bg-white/85 p-6 shadow-[0_18px_40px_-30px_rgba(29,56,100,0.55)] backdrop-blur-sm dark:border-white/10 dark:bg-white/5"
        >
          <h2 className="flex items-center gap-2 font-display text-lg font-bold text-brand-900 dark:text-white">
            <User className="h-4.5 w-4.5" /> Profile
          </h2>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="st-name"
                className="mb-1.5 block text-[0.68rem] font-bold uppercase tracking-[0.14em] text-brand-800/70 dark:text-white/60"
              >
                Full name
              </label>
              <input
                id="st-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full rounded-xl border border-brand-300/70 bg-white px-3.5 py-2.5 text-sm text-brand-900 outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20 dark:border-white/15 dark:bg-white/10 dark:text-white"
              />
            </div>

            <div>
              <label
                htmlFor="st-email"
                className="mb-1.5 block text-[0.68rem] font-bold uppercase tracking-[0.14em] text-brand-800/70 dark:text-white/60"
              >
                Email
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-600/60 dark:text-white/40" />
                <input
                  id="st-email"
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full cursor-not-allowed rounded-xl border border-brand-300/50 bg-brand-50/70 py-2.5 pl-9 pr-3.5 text-sm text-brand-800/70 outline-none dark:border-white/10 dark:bg-white/5 dark:text-white/50"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-700 to-brand-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-700/25 transition-all hover:from-brand-800 hover:to-brand-600 active:scale-95"
          >
            <Save className="h-4 w-4" /> Save changes
          </button>
        </form>

        {/* ---- Appearance ---- */}
        <section className="mt-4 rounded-2xl border border-white/70 bg-white/85 p-6 shadow-[0_18px_40px_-30px_rgba(29,56,100,0.55)] backdrop-blur-sm dark:border-white/10 dark:bg-white/5">
          <h2 className="font-display text-lg font-bold text-brand-900 dark:text-white">Appearance</h2>
          <p className="mt-1 text-xs text-brand-800/70 dark:text-white/60">Theme choose karo</p>

          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={() => theme !== 'light' && toggleTheme()}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-all ${
                theme === 'light'
                  ? 'border-brand-700 bg-brand-700 text-white'
                  : 'border-brand-300 text-brand-800 hover:bg-white dark:border-white/20 dark:text-white/80 dark:hover:bg-white/10'
              }`}
            >
              <Sun className="h-4 w-4" /> Light
            </button>
            <button
              type="button"
              onClick={() => theme !== 'dark' && toggleTheme()}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-all ${
                theme === 'dark'
                  ? 'border-brand-600 bg-brand-600 text-white'
                  : 'border-brand-300 text-brand-800 hover:bg-white dark:border-white/20 dark:text-white/80 dark:hover:bg-white/10'
              }`}
            >
              <Moon className="h-4 w-4" /> Dark
            </button>
          </div>
        </section>

        {/* ---- Notifications ---- */}
        <section className="mt-4 rounded-2xl border border-white/70 bg-white/85 p-6 shadow-[0_18px_40px_-30px_rgba(29,56,100,0.55)] backdrop-blur-sm dark:border-white/10 dark:bg-white/5">
          <h2 className="flex items-center gap-2 font-display text-lg font-bold text-brand-900 dark:text-white">
            <Bell className="h-4.5 w-4.5" /> Notifications
          </h2>

          <ul className="mt-3 divide-y divide-brand-200/60 dark:divide-white/10">
            <li className="flex items-center justify-between gap-4 py-3">
              <div>
                <p className="text-sm font-semibold text-brand-900 dark:text-white">New releases</p>
                <p className="text-xs text-brand-800/65 dark:text-white/55">
                  Nayi kitaabein aane par email milta rahe
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={prefs.updates}
                aria-label="New releases notifications"
                onClick={() => togglePref('updates')}
                className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                  prefs.updates ? 'bg-brand-600' : 'bg-brand-200 dark:bg-white/20'
                }`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
                    prefs.updates ? 'left-[1.375rem]' : 'left-0.5'
                  }`}
                />
              </button>
            </li>

            <li className="flex items-center justify-between gap-4 py-3">
              <div>
                <p className="text-sm font-semibold text-brand-900 dark:text-white">Order updates</p>
                <p className="text-xs text-brand-800/65 dark:text-white/55">
                  Order confirm / delivered hone par alert
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={prefs.orders}
                aria-label="Order update notifications"
                onClick={() => togglePref('orders')}
                className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                  prefs.orders ? 'bg-brand-600' : 'bg-brand-200 dark:bg-white/20'
                }`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
                    prefs.orders ? 'left-[1.375rem]' : 'left-0.5'
                  }`}
                />
              </button>
            </li>
          </ul>
        </section>

        {/* ---- Account ---- */}
        <section className="mt-4 rounded-2xl border border-white/70 bg-white/85 p-6 shadow-[0_18px_40px_-30px_rgba(29,56,100,0.55)] backdrop-blur-sm dark:border-white/10 dark:bg-white/5">
          <h2 className="font-display text-lg font-bold text-brand-900 dark:text-white">Account</h2>
          <p className="mt-1 text-xs text-brand-800/70 dark:text-white/60">
            Signed in as {user?.email || '—'}
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => navigate('/home')}
              className="rounded-full border border-brand-300 px-4 py-2 text-sm font-semibold text-brand-800 transition-all hover:border-brand-700 hover:bg-brand-700 hover:text-white dark:border-white/20 dark:text-white/80 dark:hover:bg-brand-600"
            >
              Back to Home
            </button>
            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-2 rounded-full border border-red-300 px-4 py-2 text-sm font-semibold text-red-600 transition-all hover:bg-red-600 hover:text-white dark:border-red-400/40 dark:text-red-300"
            >
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </div>
        </section>
      </main>
    </div>
  )
}
