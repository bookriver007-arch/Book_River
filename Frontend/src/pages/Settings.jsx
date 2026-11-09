import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Bell,
  Check,
  Cloud,
  CloudOff,
  Download,
  Eye,
  EyeOff,
  Globe,
  Heart,
  Info,
  KeyRound,
  Loader2,
  LogOut,
  Mail,
  MapPin,
  Monitor,
  Moon,
  Palette,
  Phone,
  Save,
  Shield,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  Sparkles,
  Sun,
  Trash2,
  Truck,
  User,
} from 'lucide-react'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import useTheme from '../hooks/useTheme.js'
import useLang from '../hooks/useLang.js'
import useCart from '../hooks/useCart.js'
import useWishlist from '../hooks/useWishlist.js'
import { notify } from '../utils/notify.jsx'
import { settingsText } from '../utils/settingsI18n.js'
import { confirmAction } from '../utils/confirm.js'

/* ---------------- storage keys + defaults ---------------- */
const PREFS_KEY = 'br_prefs'
const ADDRESS_KEY = 'br_address'
const LOCALE_KEY = 'br_locale'

const DEFAULT_PREFS = { orders: true, offers: true, wishlist: true, newsletter: false }
const DEFAULT_ADDRESS = { fullName: '', phone: '', address: '', city: '' }
const DEFAULT_LOCALE = { language: 'en', numberFormat: 'pk', currency: 'PKR' }

const CITIES = [
  'Karachi',
  'Lahore',
  'Islamabad',
  'Rawalpindi',
  'Faisalabad',
  'Multan',
  'Peshawar',
  'Quetta',
  'Hyderabad',
  'Sialkot',
]

const SECTIONS = [
  { key: 'profile', icon: User },
  { key: 'security', icon: Shield },
  { key: 'address', icon: MapPin },
  { key: 'appearance', icon: Palette },
  { key: 'notifications', icon: Bell },
  { key: 'language', icon: Globe },
  { key: 'privacy', icon: Download },
  { key: 'about', icon: Info },
]

/* ---------------- helpers ---------------- */
const readJson = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key)
    const data = raw ? JSON.parse(raw) : null
    return data && typeof data === 'object' ? data : fallback
  } catch {
    return fallback
  }
}

const writeJson = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* private mode / storage full */
  }
}

/** sirf 4 notification toggles (server prefs me theme/language bhi hoti hai) */
const onlyBooleans = (source) => ({
  orders: source?.orders ?? DEFAULT_PREFS.orders,
  offers: source?.offers ?? DEFAULT_PREFS.offers,
  wishlist: source?.wishlist ?? DEFAULT_PREFS.wishlist,
  newsletter: source?.newsletter ?? DEFAULT_PREFS.newsletter,
})

const prettyDate = (value) => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

const prettyTime = (value) => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

/** 'roman' / 'urdu' jaisi purani values ko 'ur' banao */
const normalizeLang = (value) =>
  value === 'ur' || value === 'roman' || value === 'urdu' ? 'ur' : 'en'

/** ek authenticated API call */
const authApi = async (path, { method = 'GET', body } = {}) => {
  const token = localStorage.getItem('br_token') || ''
  const res = await fetch(`/api/auth${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.message || 'Request failed')
  return data
}

/* ---------------- shared styles ---------------- */
const inputCls =
  'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-brand-400 focus:ring-4 focus:ring-brand-100 disabled:bg-slate-50 disabled:text-slate-400 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-brand-400 dark:focus:ring-brand-500/20'

const labelCls =
  'mb-1.5 block text-[0.68rem] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400'

const btnPrimary =
  'inline-flex items-center justify-center gap-2 rounded-xl bg-brand-700 px-4 py-2.5 text-sm font-bold text-white shadow-sm shadow-brand-700/25 transition hover:bg-brand-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-brand-600 dark:hover:bg-brand-500'

const btnGhost =
  'inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:border-brand-300 hover:text-brand-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:text-slate-300 dark:hover:border-brand-400/40 dark:hover:text-brand-200'

const btnDanger =
  'inline-flex items-center justify-center gap-2 rounded-xl border border-rose-200 px-4 py-2.5 text-sm font-bold text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-rose-400/30 dark:text-rose-300 dark:hover:bg-rose-500/10'

/* ---------------- UI building blocks ---------------- */
function Section({ id, icon, title, subtitle, aside, children }) {
  const Icon = icon

  return (
    <section
      id={id}
      className="scroll-mt-28 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04] sm:p-6"
    >
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand-600 to-brand-800 text-white shadow-md shadow-brand-700/25">
          <Icon className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-lg font-bold leading-tight text-slate-900 dark:text-white">
            {title}
          </h2>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
        </div>
        {aside ? <div className="shrink-0">{aside}</div> : null}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  )
}

function Field({ id, label, hint, icon: Icon, as: Tag = 'input', wrapperClass = '', ...props }) {
  return (
    <div className={wrapperClass}>
      <label htmlFor={id} className={labelCls}>
        {label}
      </label>
      <div className="relative">
        {Icon ? (
          <Icon className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
        ) : null}
        <Tag
          id={id}
          {...props}
          className={`${inputCls} ${Icon ? 'pl-10' : ''} ${Tag === 'textarea' ? 'resize-none' : ''}`}
        />
      </div>
      {hint ? (
        <p className="mt-1 text-[0.68rem] leading-relaxed text-slate-400 dark:text-slate-500">{hint}</p>
      ) : null}
    </div>
  )
}

function Toggle({ on, onChange, label, busy = false }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      disabled={busy}
      onClick={onChange}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
        on ? 'bg-brand-600' : 'bg-slate-300 dark:bg-white/20'
      } ${busy ? 'opacity-60' : ''}`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
          on ? 'left-[1.375rem]' : 'left-0.5'
        }`}
      />
    </button>
  )
}

function ToggleRow({ on, onChange, title, description, icon: Icon, busy }) {
  return (
    <li className="flex items-center justify-between gap-4 py-3">
      <div className="flex min-w-0 items-start gap-2.5">
        {Icon ? (
          <Icon className="mt-0.5 h-4 w-4 shrink-0 text-brand-600 dark:text-brand-300" />
        ) : null}
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-900 dark:text-white">{title}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p>
        </div>
      </div>
      <Toggle on={on} onChange={onChange} label={title} busy={busy} />
    </li>
  )
}

function Btn({
  variant = 'primary',
  busy: isBusy = false,
  icon: Icon,
  children,
  className = '',
  ...props
}) {
  const base = variant === 'ghost' ? btnGhost : variant === 'danger' ? btnDanger : btnPrimary

  return (
    <button type="button" {...props} className={`${base} ${className}`}>
      {isBusy ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : Icon ? (
        <Icon className="h-4 w-4" />
      ) : null}
      {children}
    </button>
  )
}

/** chhota status chip (Saved / Unsaved / Synced) */
function Chip({ tone = 'slate', children, icon: Icon }) {
  const tones = {
    green: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
    amber: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
    slate: 'bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300',
    brand: 'bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-200',
  }

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.62rem] font-bold uppercase tracking-[0.12em] ${tones[tone]}`}
    >
      {Icon ? <Icon className="h-3 w-3" /> : null}
      {children}
    </span>
  )
}

/**
 * Settings — sab kuch working:
 * profile · password · address · theme · notifications · language ·
 * privacy (download / clear / delete) · about.
 * Server par save hota hai (JWT), offline par localStorage fallback.
 */
export default function Settings() {
  const navigate = useNavigate()
  const { theme, mode, setTheme } = useTheme()
  const { setLang: setGlobalLang } = useLang()
  const { items: cartItems, clear: clearCart } = useCart()
  const { items: wishItems, clear: clearWishlist } = useWishlist()

  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState({ name: '', phone: '' })
  const [address, setAddress] = useState(DEFAULT_ADDRESS)
  const [addressSnapshot, setAddressSnapshot] = useState(DEFAULT_ADDRESS)
  const [prefs, setPrefs] = useState(DEFAULT_PREFS)
  const [locale, setLocale] = useState(DEFAULT_LOCALE)
  const [pwd, setPwd] = useState({ current: '', next: '', confirm: '' })
  const [showPwd, setShowPwd] = useState(false)
  const [busy, setBusy] = useState('')
  const [active, setActive] = useState('profile')
  const [sync, setSync] = useState('') // '' | 'syncing' | 'ok' | 'local'
  const [savedAt, setSavedAt] = useState({})
  const [armed, setArmed] = useState('') // 'cart' | 'wishlist' | ''
  const [dangerOpen, setDangerOpen] = useState(false)
  const [dangerPwd, setDangerPwd] = useState('')
  const [dangerText, setDangerText] = useState('')

  /* two-factor (Google Authenticator) */
  const [twofa, setTwofa] = useState({ enabled: false, enabledAt: null })
  const [twofaSetup, setTwofaSetup] = useState(null) // { secret, otpauth }
  const [twofaQr, setTwofaQr] = useState('')
  const [twofaCode, setTwofaCode] = useState('')
  const [twofaPwd, setTwofaPwd] = useState('')
  const [twofaMode, setTwofaMode] = useState('') // '' | 'setup' | 'off'

  const t = settingsText(locale.language)

  /* ---------- server user -> form ---------- */
  const applyUser = useCallback(
    (data) => {
      if (!data) return
      setUser(data)
      setProfile({ name: data.name || '', phone: data.phone || '' })
      setPrefs((prev) => onlyBooleans({ ...prev, ...(data.prefs || {}) }))

      const local = readJson(ADDRESS_KEY, DEFAULT_ADDRESS)
      const nextAddress = {
        fullName: local.fullName || data.name || '',
        phone: data.phone || local.phone || '',
        address: data.address || local.address || '',
        city: data.city || local.city || '',
      }
      setAddress(nextAddress)
      setAddressSnapshot(nextAddress)

      const serverPrefs = data.prefs || {}
      if (serverPrefs.language || serverPrefs.numberFormat) {
        setLocale((prev) => {
          const nextLocale = {
            ...prev,
            language: normalizeLang(serverPrefs.language || prev.language),
            numberFormat: serverPrefs.numberFormat || prev.numberFormat,
          }
          writeJson(LOCALE_KEY, nextLocale)
          return nextLocale
        })
      }
      if (serverPrefs.language) setGlobalLang(normalizeLang(serverPrefs.language))
      if (serverPrefs.theme) setTheme(serverPrefs.theme)
    },
    [setGlobalLang, setTheme],
  )

  // login check + local cache + server se fresh data
  const applyUserRef = useRef(applyUser)
  applyUserRef.current = applyUser

  useEffect(() => {
    if (!localStorage.getItem('br_token')) {
      navigate('/auth', { replace: true })
      return
    }

    setPrefs((prev) => onlyBooleans({ ...prev, ...readJson(PREFS_KEY, {}) }))
    const localAddress = { ...DEFAULT_ADDRESS, ...readJson(ADDRESS_KEY, {}) }
    setAddress(localAddress)
    setAddressSnapshot(localAddress)
    const storedLocale = readJson(LOCALE_KEY, {})
    setLocale({
      ...DEFAULT_LOCALE,
      ...storedLocale,
      language: normalizeLang(storedLocale.language),
    })
    applyUserRef.current(readJson('br_user', null))

    authApi('/me')
      .then((data) => {
        if (!data?.user) return
        applyUserRef.current(data.user)
        localStorage.setItem('br_user', JSON.stringify(data.user))
      })
      .catch(() => {
        /* offline — local cache hi chalega */
      })
  }, [navigate])

  // scroll spy — jo section dikh raha hai wahi nav me active
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (visible?.target?.id) setActive(visible.target.id)
      },
      { rootMargin: '-25% 0px -55% 0px', threshold: [0.1, 0.4, 1] },
    )

    SECTIONS.forEach((section) => {
      const el = document.getElementById(section.key)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [])

  const jump = (key) => {
    setActive(key)
    document.getElementById(key)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const logout = () => {
    localStorage.removeItem('br_token')
    localStorage.removeItem('br_user')
    window.location.replace('/auth')
  }

  /* ---------------- derived values ---------------- */
  const initials = (user?.name || 'Reader').trim().charAt(0).toUpperCase()
  const memberSince = prettyDate(user?.createdAt) || '—'
  const lastPasswordChange = prettyDate(user?.passwordChangedAt) || t.security.never

  const profileDirty =
    profile.name.trim() !== (user?.name || '') || profile.phone.trim() !== (user?.phone || '')

  const addressDirty = ['fullName', 'phone', 'address', 'city'].some(
    (key) => (address[key] || '').trim() !== (addressSnapshot[key] || '').trim(),
  )

  const phoneLooksOk = !address.phone.trim() || /^[0-9+\-()\s]{7,}$/.test(address.phone.trim())

  const strength = useMemo(() => {
    const value = pwd.next
    if (!value) return 0
    let score = 0
    if (value.length >= 6) score += 1
    if (value.length >= 10) score += 1
    if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score += 1
    if (/\d/.test(value)) score += 1
    if (/[^A-Za-z0-9]/.test(value)) score += 1
    return Math.max(1, Math.min(3, Math.ceil(score / 2)))
  }, [pwd.next])

  const strengthLabel = ['', t.security.weak, t.security.medium, t.security.strong][strength]
  const strengthColor = ['', 'bg-rose-500', 'bg-amber-500', 'bg-emerald-500'][strength]

  const anyNotifOn = prefs.orders || prefs.offers || prefs.wishlist || prefs.newsletter
  const stamp = (key) => (savedAt[key] ? prettyTime(savedAt[key]) : '')
  const pwdMatch = Boolean(pwd.next) && pwd.next === pwd.confirm

  /* ---------------- profile ---------------- */
  const saveProfile = async (event) => {
    event.preventDefault()
    const name = profile.name.trim()
    if (!name) {
      notify.error(t.profile.errName, t.profile.errNameMsg)
      return
    }

    setBusy('profile')
    try {
      const data = await authApi('/profile', {
        method: 'PATCH',
        body: { name, phone: profile.phone.trim() },
      })
      const merged = { ...(user || {}), ...(data.user || {}), name }
      setUser(merged)
      localStorage.setItem('br_user', JSON.stringify(merged))
      setSavedAt((prev) => ({ ...prev, profile: new Date().toISOString() }))
      notify.success(t.profile.okTitle, name)
    } catch (err) {
      notify.error(t.profile.errSave, err.message)
    } finally {
      setBusy('')
    }
  }

  /* ---------------- delivery address ---------------- */
  const saveAddress = async (event) => {
    event.preventDefault()
    const clean = {
      fullName: address.fullName.trim() || profile.name.trim(),
      phone: address.phone.trim(),
      address: address.address.trim(),
      city: address.city.trim(),
    }

    if (!clean.address) {
      notify.error(t.address.errEmpty, t.address.errEmptyMsg)
      return
    }
    if (!phoneLooksOk) {
      notify.error(t.address.errPhone, t.address.errPhoneMsg)
      return
    }

    setBusy('address')
    try {
      writeJson(ADDRESS_KEY, clean)
      setAddress(clean)
      setAddressSnapshot(clean)
      setSavedAt((prev) => ({ ...prev, address: new Date().toISOString() }))

      const data = await authApi('/profile', {
        method: 'PATCH',
        body: { address: clean.address, city: clean.city, phone: clean.phone },
      })
      if (data?.user) {
        setUser(data.user)
        localStorage.setItem('br_user', JSON.stringify(data.user))
      }
      notify.success(
        t.address.okTitle,
        [clean.address, clean.city].filter(Boolean).join(', '),
      )
    } catch (err) {
      notify.error(err.message)
    } finally {
      setBusy('')
    }
  }

  const clearAddress = async () => {
    const ok = await confirmAction({
      title: 'Address hata dein?',
      message: 'Saved delivery address delete ho jayega.',
      confirmLabel: 'Haan, hatao',
    })
    if (!ok) return

    setAddress(DEFAULT_ADDRESS)
    setAddressSnapshot(DEFAULT_ADDRESS)
    try {
      localStorage.removeItem(ADDRESS_KEY)
    } catch {
      /* ignore */
    }
    notify.info(t.address.cleared, t.address.clearedMsg)
  }

  /* ---------------- notifications / account prefs ---------------- */
  const syncPrefs = async (patch) => {
    setSync('syncing')
    try {
      const data = await authApi('/profile', { method: 'PATCH', body: { prefs: patch } })
      if (data?.user) {
        setUser(data.user)
        localStorage.setItem('br_user', JSON.stringify(data.user))
      }
      setSync('ok')
    } catch {
      setSync('local')
    }
  }

  const togglePref = (key) => {
    const next = { ...prefs, [key]: !prefs[key] }
    setPrefs(next)
    writeJson(PREFS_KEY, next)
    syncPrefs(next)
  }

  const toggleAllPrefs = () => {
    const value = !anyNotifOn
    const next = { orders: value, offers: value, wishlist: value, newsletter: value }
    setPrefs(next)
    writeJson(PREFS_KEY, next)
    syncPrefs(next)
  }

  /* ---------------- appearance ---------------- */
  const changeTheme = (next) => {
    setTheme(next)
    notify.info(`${t.appearance[next]} — ${t.appearance.onToast}`)
    syncPrefs({ theme: next })
  }

  /* ---------------- language & region ---------------- */
  const changeLocale = (key, value) => {
    const next = { ...locale, [key]: value }
    setLocale(next)
    writeJson(LOCALE_KEY, next)

    // poori website ki bhasha bhi badal do
    if (key === 'language') setGlobalLang(value)

    const detail =
      key === 'language'
        ? value === 'roman'
          ? t.language.roman
          : t.language.en
        : value === 'intl'
          ? t.language.formatIntl
          : t.language.formatPk

    notify.success(t.language.applied, detail)
    syncPrefs({ [key]: value })
  }

  /* ---------------- security ---------------- */
  const changePassword = async (event) => {
    event.preventDefault()
    if (!pwd.current) {
      notify.error(t.security.errCurrent)
      return
    }
    if (pwd.next.length < 6) {
      notify.error(t.security.errShort, t.security.errShortMsg)
      return
    }
    if (pwd.next !== pwd.confirm) {
      notify.error(t.security.errMatch, t.security.errMatchMsg)
      return
    }

    setBusy('password')
    try {
      const data = await authApi('/password', {
        method: 'POST',
        body: { currentPassword: pwd.current, newPassword: pwd.next },
      })
      setPwd({ current: '', next: '', confirm: '' })
      setUser((prev) => (prev ? { ...prev, passwordChangedAt: data.passwordChangedAt } : prev))
      notify.success(t.security.okTitle, t.security.okMsg)
    } catch (err) {
      notify.error(t.security.errToast, err.message)
    } finally {
      setBusy('')
    }
  }

  /* ---------------- two-factor (Google Authenticator) ---------------- */
  const loadTwofa = useCallback(async () => {
    if (!localStorage.getItem('br_token')) return
    try {
      const data = await authApi('/2fa')
      setTwofa({ enabled: Boolean(data.enabled), enabledAt: data.enabledAt || null })
    } catch {
      /* offline / not logged in */
    }
  }, [])

  useEffect(() => {
    loadTwofa()
  }, [loadTwofa])

  const startTwofa = async () => {
    setBusy('2fa')
    try {
      const data = await authApi('/2fa/setup', { method: 'POST', body: {} })
      /* QR library sirf jab zarurat ho tab load ho */
      const { default: QRCode } = await import('qrcode')
      const qr = await QRCode.toDataURL(data.otpauth, { margin: 1, width: 360 })
      setTwofaSetup(data)
      setTwofaQr(qr)
      setTwofaCode('')
      setTwofaMode('setup')
    } catch (err) {
      notify.error(t.security.twoFaErr, err.message)
    } finally {
      setBusy('')
    }
  }

  const confirmTwofa = async (event) => {
    event.preventDefault()
    if (twofaCode.replace(/\D/g, '').length !== 6) {
      notify.error(t.security.twoFaErr, t.security.twoFaCodeHint)
      return
    }

    setBusy('2fa')
    try {
      const data = await authApi('/2fa/enable', {
        method: 'POST',
        body: { code: twofaCode },
      })
      setTwofa({ enabled: true, enabledAt: data.enabledAt || new Date().toISOString() })
      setUser((prev) => (prev ? { ...prev, twoFactorEnabled: true } : prev))
      setTwofaSetup(null)
      setTwofaQr('')
      setTwofaCode('')
      setTwofaMode('')
      notify.success(t.security.twoFaOnTitle, t.security.twoFaOnMsg)
    } catch (err) {
      notify.error(t.security.twoFaErr, err.message)
    } finally {
      setBusy('')
    }
  }

  const turnOffTwofa = async (event) => {
    event.preventDefault()
    if (!twofaPwd) {
      notify.error(t.security.twoFaErr, t.security.twoFaPwdLabel)
      return
    }

    setBusy('2fa')
    try {
      await authApi('/2fa/disable', { method: 'POST', body: { password: twofaPwd } })
      setTwofa({ enabled: false, enabledAt: null })
      setUser((prev) => (prev ? { ...prev, twoFactorEnabled: false } : prev))
      setTwofaPwd('')
      setTwofaMode('')
      notify.success(t.security.twoFaOffTitle, t.security.twoFaOffMsg)
    } catch (err) {
      notify.error(t.security.twoFaErr, err.message)
    } finally {
      setBusy('')
    }
  }

  /* ---------------- privacy ---------------- */
  const downloadData = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      app: 'Book River',
      account: user,
      deliveryAddress: address,
      preferences: {
        notifications: prefs,
        theme: mode,
        language: locale.language,
        numberFormat: locale.numberFormat,
        currency: locale.currency,
      },
      cart: cartItems,
      wishlist: wishItems,
    }

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `book-river-data-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
    notify.success(t.privacy.downloadOk, t.privacy.downloadOkMsg)
  }

  /** pehla tap = arm, doosra tap = clear (galti se clear na ho) */
  const askClear = (which) => {
    if (armed !== which) {
      setArmed(which)
      notify.info(t.confirmClear)
      window.setTimeout(() => setArmed((current) => (current === which ? '' : current)), 4000)
      return
    }

    setArmed('')
    if (which === 'cart') {
      clearCart()
      notify.info(t.privacy.clearedCart)
    } else {
      clearWishlist()
      notify.info(t.privacy.clearedWishlist)
    }
  }

  /* ---------------- account delete ---------------- */
  const deleteAccount = async () => {
    if (!dangerPwd) {
      notify.error(t.privacy.errPwd)
      return
    }
    if (dangerText.trim().toUpperCase() !== 'DELETE') {
      notify.error(t.privacy.errText)
      return
    }

    setBusy('delete')
    try {
      await authApi('/account', { method: 'DELETE', body: { password: dangerPwd } })
      ;['br_token', 'br_user', 'br_address', 'br_prefs', 'br_locale'].forEach((key) =>
        localStorage.removeItem(key),
      )
      clearCart()
      clearWishlist()
      notify.info(t.privacy.deleted, t.privacy.deletedMsg)
      navigate('/auth', { replace: true })
    } catch (err) {
      notify.error(t.privacy.errToast, err.message)
    } finally {
      setBusy('')
      setDangerPwd('')
      setDangerText('')
    }
  }

  /* ---------------- render ---------------- */
  return (
    <div className="book-page min-h-screen">
      <Navbar categories wide user={user ?? { name: 'Reader' }} onLogout={logout} />

      <main className="mx-auto max-w-6xl px-4 pt-8 sm:px-6">
        {/* ---------- header ---------- */}
        <header>
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-2.5 py-1 text-[0.62rem] font-bold uppercase tracking-[0.16em] text-brand-700 dark:bg-white/10 dark:text-brand-100">
              <Sparkles className="h-3 w-3" /> {t.badge}
            </span>
            {sync === 'syncing' ? (
              <Chip tone="brand" icon={Loader2}>
                {t.saving}
              </Chip>
            ) : sync === 'ok' ? (
              <Chip tone="green" icon={Cloud}>
                {t.notifications.synced}
              </Chip>
            ) : sync === 'local' ? (
              <Chip tone="amber" icon={CloudOff}>
                {t.notifications.localOnly}
              </Chip>
            ) : null}
          </div>

          <h1 className="mt-2 font-display text-3xl font-bold text-brand-900 dark:text-white">
            {t.title}
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-brand-800/70 dark:text-white/60">{t.subtitle}</p>
        </header>

        {/* ---------- mobile nav (chips) ---------- */}
        <nav className="-mx-4 mt-5 flex gap-2 overflow-x-auto px-4 pb-1 lg:hidden">
          {SECTIONS.map((section) => {
            const Icon = section.icon
            const isActive = active === section.key
            return (
              <button
                key={section.key}
                type="button"
                onClick={() => jump(section.key)}
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold transition ${
                  isActive
                    ? 'border-brand-700 bg-brand-700 text-white'
                    : 'border-slate-200 bg-white text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {t.nav[section.key]}
              </button>
            )
          })}
        </nav>

        <div className="mt-5 grid gap-5 lg:grid-cols-[15rem_minmax(0,1fr)]">
          {/* ---------- left nav ---------- */}
          <nav className="hidden h-fit rounded-2xl border border-slate-200/80 bg-white p-2 shadow-sm lg:sticky lg:top-24 lg:block dark:border-white/10 dark:bg-white/[0.04]">
            <div className="flex items-center gap-2.5 rounded-xl px-2 py-2">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand-600 to-gold-600 text-sm font-extrabold text-white">
                {initials}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-slate-900 dark:text-white">
                  {user?.name || 'Reader'}
                </p>
                <p className="truncate text-[0.68rem] text-slate-500 dark:text-slate-400">
                  {user?.email || '—'}
                </p>
              </div>
            </div>

            <div className="my-1.5 h-px bg-slate-200 dark:bg-white/10" />

            <ul className="space-y-0.5">
              {SECTIONS.map((section) => {
                const Icon = section.icon
                const isActive = active === section.key
                return (
                  <li key={section.key}>
                    <button
                      type="button"
                      onClick={() => jump(section.key)}
                      className={`flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-[0.8rem] font-semibold transition ${
                        isActive
                          ? 'bg-brand-700 text-white shadow-sm shadow-brand-700/25'
                          : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10'
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      {t.nav[section.key]}
                    </button>
                  </li>
                )
              })}
            </ul>

            <div className="my-1.5 h-px bg-slate-200 dark:bg-white/10" />

            <button
              type="button"
              onClick={logout}
              className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-[0.8rem] font-semibold text-rose-600 transition hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-500/10"
            >
              <LogOut className="h-4 w-4" /> {t.logout}
            </button>
          </nav>

          {/* ---------- sections ---------- */}
          <div className="space-y-4">
            {/* ===== Profile ===== */}
            <Section
              id="profile"
              icon={User}
              title={t.profile.title}
              subtitle={t.profile.sub}
              aside={
                profileDirty ? (
                  <Chip tone="amber">{t.unsaved}</Chip>
                ) : stamp('profile') ? (
                  <Chip tone="green" icon={Check}>{`${t.saved} · ${stamp('profile')}`}</Chip>
                ) : null
              }
            >
              <form onSubmit={saveProfile} className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-3 rounded-xl border border-slate-200/70 bg-slate-50/60 p-3.5 sm:col-span-2 dark:border-white/10 dark:bg-white/[0.03]">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand-600 to-gold-600 text-lg font-extrabold text-white">
                    {initials}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-slate-900 dark:text-white">
                      {user?.name || 'Reader'}
                    </p>
                    <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                      {user?.email || '—'}
                    </p>
                  </div>
                  <div className="ml-auto hidden shrink-0 sm:block">
                    <Chip tone="slate">{`${t.memberSince} ${memberSince}`}</Chip>
                  </div>
                </div>

                <Field
                  id="pf-name"
                  label={t.profile.nameLabel}
                  icon={User}
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  placeholder={t.profile.namePh}
                  autoComplete="name"
                  maxLength={60}
                />
                <Field
                  id="pf-phone"
                  label={t.profile.phoneLabel}
                  icon={Phone}
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  placeholder={t.profile.phonePh}
                  inputMode="tel"
                  autoComplete="tel"
                  maxLength={20}
                />

                <div className="sm:col-span-2">
                  <label htmlFor="pf-email" className={labelCls}>
                    {t.profile.emailLabel}
                  </label>
                  <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 dark:border-white/10 dark:bg-white/5">
                    <Mail className="h-4 w-4 shrink-0 text-slate-400" />
                    <span
                      id="pf-email"
                      className="min-w-0 truncate text-sm font-semibold text-slate-600 dark:text-slate-300"
                    >
                      {user?.email || '—'}
                    </span>
                  </div>
                  <p className="mt-1 text-[0.68rem] text-slate-400 dark:text-slate-500">
                    {t.profile.emailHint}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
                  <Btn
                    type="submit"
                    icon={Save}
                    busy={busy === 'profile'}
                    disabled={busy === 'profile'}
                  >
                    {t.profile.saveBtn}
                  </Btn>
                  <span className="text-[0.68rem] text-slate-400 sm:hidden dark:text-slate-500">
                    {t.memberSince} {memberSince}
                  </span>
                </div>
              </form>
            </Section>

            {/* ===== Security ===== */}
            <Section
              id="security"
              icon={Shield}
              title={t.security.title}
              subtitle={t.security.sub}
              aside={<Chip tone="slate" icon={KeyRound}>{lastPasswordChange}</Chip>}
            >
              <form onSubmit={changePassword} className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label htmlFor="sc-current" className={labelCls}>
                    {t.security.currentLabel}
                  </label>
                  <div className="relative">
                    <KeyRound className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      id="sc-current"
                      type={showPwd ? 'text' : 'password'}
                      value={pwd.current}
                      onChange={(e) => setPwd({ ...pwd, current: e.target.value })}
                      placeholder="••••••"
                      autoComplete="current-password"
                      className={`${inputCls} pl-10 pr-11`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwd((value) => !value)}
                      aria-label={showPwd ? t.security.hide : t.security.show}
                      className="absolute right-2.5 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-slate-400 transition hover:text-slate-700 dark:hover:text-white"
                    >
                      {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Field
                  id="sc-new"
                  label={t.security.newLabel}
                  type={showPwd ? 'text' : 'password'}
                  value={pwd.next}
                  onChange={(e) => setPwd({ ...pwd, next: e.target.value })}
                  placeholder={t.security.newPh}
                  autoComplete="new-password"
                />
                <Field
                  id="sc-confirm"
                  label={t.security.confirmLabel}
                  type={showPwd ? 'text' : 'password'}
                  value={pwd.confirm}
                  onChange={(e) => setPwd({ ...pwd, confirm: e.target.value })}
                  placeholder={t.security.confirmPh}
                  autoComplete="new-password"
                  hint={
                    pwd.next || pwd.confirm
                      ? pwdMatch
                        ? t.security.match
                        : t.security.noMatch
                      : t.security.lenHint
                  }
                />

                <div className="sm:col-span-2">
                  <div className="flex items-center gap-2.5">
                    <div className="flex flex-1 gap-1">
                      {[1, 2, 3].map((step) => (
                        <span
                          key={step}
                          className={`h-1.5 flex-1 rounded-full transition-colors ${
                            strength >= step ? strengthColor : 'bg-slate-200 dark:bg-white/10'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="w-24 shrink-0 text-right text-[0.68rem] font-bold text-slate-500 dark:text-slate-400">
                      {pwd.next ? `${t.security.strength}: ${strengthLabel}` : t.security.strength}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
                  <Btn
                    type="submit"
                    icon={KeyRound}
                    busy={busy === 'password'}
                    disabled={busy === 'password'}
                  >
                    {t.security.updateBtn}
                  </Btn>
                  <Btn variant="ghost" onClick={() => setShowPwd((value) => !value)}>
                    {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    {showPwd ? t.security.hide : t.security.show}
                  </Btn>
                </div>
              </form>

              {/* ---- two-factor (Google Authenticator) ---- */}
              <div className="mt-4 rounded-xl border border-slate-200/70 bg-slate-50/60 p-3.5 dark:border-white/10 dark:bg-white/[0.03]">
                <div className="flex flex-wrap items-center gap-2">
                  <ShieldCheck className="h-4 w-4 shrink-0 text-brand-600 dark:text-brand-300" />
                  <p className="min-w-0 flex-1 text-sm font-bold text-slate-800 dark:text-white">
                    {t.security.twoFaTitle}
                  </p>
                  <Chip tone={twofa.enabled ? 'green' : 'slate'}>
                    {twofa.enabled ? t.security.twoFaOn : t.security.twoFaOff}
                  </Chip>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                  {t.security.twoFaHint}
                </p>

                {twofa.enabled ? (
                  <div className="mt-3 flex flex-wrap items-center gap-2.5">
                    <Chip tone="brand" icon={Check}>
                      {t.security.twoFaEnabledAt} {prettyDate(twofa.enabledAt)}
                    </Chip>
                    {twofaMode === 'off' ? (
                      <form onSubmit={turnOffTwofa} className="flex w-full flex-wrap items-end gap-2">
                        <div className="min-w-[12rem] flex-1">
                          <label htmlFor="tfa-off-pwd" className={labelCls}>
                            {t.security.twoFaPwdLabel}
                          </label>
                          <input
                            id="tfa-off-pwd"
                            type="password"
                            value={twofaPwd}
                            onChange={(e) => setTwofaPwd(e.target.value)}
                            placeholder="••••••"
                            autoComplete="current-password"
                            className={inputCls}
                          />
                        </div>
                        <Btn type="submit" variant="danger" busy={busy === '2fa'}>
                          {t.security.twoFaOffBtn}
                        </Btn>
                        <Btn
                          variant="ghost"
                          onClick={() => {
                            setTwofaMode('')
                            setTwofaPwd('')
                          }}
                        >
                          {t.security.twoFaCancel}
                        </Btn>
                      </form>
                    ) : (
                      <Btn variant="danger" icon={Shield} onClick={() => setTwofaMode('off')}>
                        {t.security.twoFaTurnOff}
                      </Btn>
                    )}
                  </div>
                ) : twofaMode === 'setup' && twofaSetup ? (
                  <div className="mt-3 grid gap-4 sm:grid-cols-[auto_minmax(0,1fr)]">
                    <div className="rounded-xl bg-white p-2 shadow-sm ring-1 ring-slate-200">
                      {twofaQr ? (
                        <img
                          src={twofaQr}
                          alt={t.security.twoFaScan}
                          className="object-contain"
                          style={{ width: 168, height: 168 }}
                        />
                      ) : (
                        <div className="grid place-items-center" style={{ width: 168, height: 168 }}>
                          <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0">
                      <ol className="list-inside list-decimal space-y-1 text-xs text-slate-600 dark:text-slate-300">
                        <li>{t.security.twoFaStep1}</li>
                        <li>{t.security.twoFaStep2}</li>
                        <li>{t.security.twoFaStep3}</li>
                      </ol>

                      <p className="mt-2 text-[0.66rem] font-bold uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500">
                        {t.security.twoFaManual}
                      </p>
                      <code className="mt-1 block w-full select-all break-all rounded-lg bg-white px-2.5 py-1.5 text-[0.72rem] font-bold tracking-[0.14em] text-brand-800 ring-1 ring-slate-200 dark:bg-white/10 dark:text-brand-100 dark:ring-white/10">
                        {twofaSetup.secret}
                      </code>

                      <form onSubmit={confirmTwofa} className="mt-3 flex flex-wrap items-end gap-2">
                        <div className="min-w-[9rem] flex-1">
                          <label htmlFor="tfa-code" className={labelCls}>
                            {t.security.twoFaCodeLabel}
                          </label>
                          <input
                            id="tfa-code"
                            inputMode="numeric"
                            value={twofaCode}
                            onChange={(e) =>
                              setTwofaCode(e.target.value.replace(/\D/g, '').slice(0, 6))
                            }
                            placeholder="000000"
                            maxLength={6}
                            autoComplete="one-time-code"
                            className={`${inputCls} text-center text-lg font-extrabold tracking-[0.4em]`}
                          />
                        </div>
                        <Btn type="submit" icon={ShieldCheck} busy={busy === '2fa'}>
                          {t.security.twoFaConfirm}
                        </Btn>
                        <Btn
                          variant="ghost"
                          onClick={() => {
                            setTwofaMode('')
                            setTwofaSetup(null)
                            setTwofaQr('')
                            setTwofaCode('')
                          }}
                        >
                          {t.security.twoFaCancel}
                        </Btn>
                      </form>
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Btn icon={ShieldCheck} busy={busy === '2fa'} onClick={startTwofa}>
                      {t.security.twoFaEnable}
                    </Btn>
                    <span className="text-[0.68rem] text-slate-400 dark:text-slate-500">
                      {t.security.twoFaApp}
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-slate-200/70 bg-slate-50/60 px-3.5 py-3 dark:border-white/10 dark:bg-white/[0.03]">
                <Smartphone className="h-4 w-4 shrink-0 text-brand-600 dark:text-brand-300" />
                <p className="min-w-0 flex-1 text-xs text-slate-600 dark:text-slate-300">
                  <strong className="font-bold text-slate-800 dark:text-white">
                    {t.security.loggedIn}
                  </strong>{' '}
                  — {t.security.loggedInHint}
                </p>
                <Btn variant="danger" icon={LogOut} onClick={logout} className="!py-1.5 !text-xs">
                  {t.security.logoutBtn}
                </Btn>
              </div>
            </Section>

            {/* ===== Delivery address ===== */}
            <Section
              id="address"
              icon={MapPin}
              title={t.address.title}
              subtitle={t.address.sub}
              aside={
                addressDirty ? (
                  <Chip tone="amber">{t.unsaved}</Chip>
                ) : stamp('address') ? (
                  <Chip tone="green" icon={Check}>{`${t.address.savedOn} · ${stamp('address')}`}</Chip>
                ) : null
              }
            >
              <form onSubmit={saveAddress} className="grid gap-4 sm:grid-cols-2">
                <Field
                  id="ad-name"
                  label={t.address.receiverLabel}
                  icon={User}
                  value={address.fullName}
                  onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                  placeholder={t.address.receiverPh}
                  autoComplete="name"
                  maxLength={60}
                />
                <Field
                  id="ad-phone"
                  label={t.address.phoneLabel}
                  icon={Phone}
                  value={address.phone}
                  onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                  placeholder={t.address.phonePh}
                  inputMode="tel"
                  autoComplete="tel"
                  maxLength={20}
                />
                <Field
                  id="ad-line"
                  as="textarea"
                  rows={2}
                  label={t.address.addressLabel}
                  icon={MapPin}
                  value={address.address}
                  onChange={(e) => setAddress({ ...address, address: e.target.value })}
                  placeholder={t.address.addressPh}
                  autoComplete="street-address"
                  maxLength={200}
                  wrapperClass="sm:col-span-2"
                />

                <div>
                  <Field
                    id="ad-city"
                    label={t.address.cityLabel}
                    value={address.city}
                    onChange={(e) => setAddress({ ...address, city: e.target.value })}
                    placeholder={t.address.cityPh}
                    autoComplete="address-level2"
                    maxLength={40}
                    list="br-cities"
                  />
                  <datalist id="br-cities">
                    {CITIES.map((city) => (
                      <option key={city} value={city} />
                    ))}
                  </datalist>
                  <p className="mt-2 text-[0.62rem] font-bold uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500">
                    {t.address.quickCities}
                  </p>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {CITIES.slice(0, 5).map((city) => (
                      <button
                        key={city}
                        type="button"
                        onClick={() => setAddress({ ...address, city })}
                        className={`rounded-full border px-2.5 py-1 text-[0.68rem] font-semibold transition ${
                          address.city === city
                            ? 'border-brand-600 bg-brand-600 text-white'
                            : 'border-slate-200 text-slate-600 hover:border-brand-300 hover:text-brand-700 dark:border-white/10 dark:text-slate-300'
                        }`}
                      >
                        {city}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-end">
                  <p className="text-[0.68rem] leading-relaxed text-slate-400 dark:text-slate-500">
                    <Truck className="mr-1 inline h-3 w-3" /> {t.address.freeShip}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:col-span-2">
                  <Btn
                    type="submit"
                    icon={Save}
                    busy={busy === 'address'}
                    disabled={busy === 'address'}
                  >
                    {t.address.saveBtn}
                  </Btn>
                  <Btn variant="ghost" icon={Trash2} onClick={clearAddress}>
                    {t.clear}
                  </Btn>
                </div>
              </form>
            </Section>

            {/* ===== Appearance ===== */}
            <Section
              id="appearance"
              icon={Palette}
              title={t.appearance.title}
              subtitle={t.appearance.sub}
              aside={
                <Chip tone="brand" icon={Sparkles}>
                  {theme === 'dark' ? t.appearance.dark : t.appearance.light}
                </Chip>
              }
            >
              <div className="grid gap-2.5 sm:grid-cols-3">
                {[
                  { key: 'light', icon: Sun },
                  { key: 'dark', icon: Moon },
                  { key: 'system', icon: Monitor },
                ].map((option) => {
                  const OptionIcon = option.icon
                  const isOn = mode === option.key
                  return (
                    <button
                      key={option.key}
                      type="button"
                      onClick={() => changeTheme(option.key)}
                      className={`flex items-center gap-3 rounded-xl border p-3.5 text-left transition ${
                        isOn
                          ? 'border-brand-500 bg-brand-50 ring-2 ring-brand-200 dark:border-brand-400 dark:bg-brand-500/15 dark:ring-brand-500/20'
                          : 'border-slate-200 hover:border-brand-300 dark:border-white/10 dark:hover:border-brand-400/40'
                      }`}
                    >
                      <span
                        className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${
                          isOn
                            ? 'bg-brand-700 text-white'
                            : 'bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-300'
                        }`}
                      >
                        <OptionIcon className="h-4 w-4" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-bold text-slate-900 dark:text-white">
                          {t.appearance[option.key]}
                        </span>
                        <span className="block text-[0.68rem] text-slate-500 dark:text-slate-400">
                          {t.appearance[`${option.key}Desc`]}
                        </span>
                      </span>
                      {isOn ? (
                        <Check className="ml-auto h-4 w-4 shrink-0 text-brand-700 dark:text-brand-300" />
                      ) : null}
                    </button>
                  )
                })}
              </div>

              <p className="mt-3 flex items-center gap-1.5 text-[0.68rem] text-slate-400 dark:text-slate-500">
                <Cloud className="h-3 w-3" /> {t.appearance.synced}
              </p>
            </Section>

            {/* ===== Notifications ===== */}
            <Section
              id="notifications"
              icon={Bell}
              title={t.notifications.title}
              subtitle={t.notifications.sub}
              aside={
                sync === 'syncing' ? (
                  <Chip tone="brand" icon={Loader2}>
                    {t.notifications.syncing}
                  </Chip>
                ) : sync === 'ok' ? (
                  <Chip tone="green" icon={Cloud}>
                    {t.saved}
                  </Chip>
                ) : sync === 'local' ? (
                  <Chip tone="amber" icon={CloudOff}>
                    {t.notifications.localOnly}
                  </Chip>
                ) : null
              }
            >
              <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200/70 bg-slate-50/60 px-3.5 py-2.5 dark:border-white/10 dark:bg-white/[0.03]">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {t.notifications.master}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {t.notifications.masterDesc}
                  </p>
                </div>
                <Toggle
                  on={anyNotifOn}
                  onChange={toggleAllPrefs}
                  label={t.notifications.master}
                  busy={sync === 'syncing'}
                />
              </div>

              <ul className="mt-1 divide-y divide-slate-200 dark:divide-white/10">
                <ToggleRow
                  icon={Truck}
                  on={prefs.orders}
                  onChange={() => togglePref('orders')}
                  title={t.notifications.orders}
                  description={t.notifications.ordersDesc}
                  busy={sync === 'syncing'}
                />
                <ToggleRow
                  icon={Sparkles}
                  on={prefs.offers}
                  onChange={() => togglePref('offers')}
                  title={t.notifications.offers}
                  description={t.notifications.offersDesc}
                  busy={sync === 'syncing'}
                />
                <ToggleRow
                  icon={Heart}
                  on={prefs.wishlist}
                  onChange={() => togglePref('wishlist')}
                  title={t.notifications.wishlist}
                  description={t.notifications.wishlistDesc}
                  busy={sync === 'syncing'}
                />
                <ToggleRow
                  icon={Mail}
                  on={prefs.newsletter}
                  onChange={() => togglePref('newsletter')}
                  title={t.notifications.newsletter}
                  description={t.notifications.newsletterDesc}
                  busy={sync === 'syncing'}
                />
              </ul>
            </Section>

            {/* ===== Language & region ===== */}
            <Section
              id="language"
              icon={Globe}
              title={t.language.title}
              subtitle={t.language.sub}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="lg-language" className={labelCls}>
                    {t.language.languageLabel}
                  </label>
                  <div className="relative">
                    <Globe className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <select
                      id="lg-language"
                      value={locale.language}
                      onChange={(e) => changeLocale('language', e.target.value)}
                      className={`${inputCls} cursor-pointer appearance-none pl-10 dark:[&>option]:bg-[#0b1524] dark:[&>option]:text-slate-100`}
                    >
                      <option value="en">{t.language.en}</option>
                      <option value="ur">{t.language.ur}</option>
                    </select>
                  </div>
                  <p className="mt-1 text-[0.68rem] leading-relaxed text-slate-400 dark:text-slate-500">
                    {t.language.langHint}
                  </p>
                </div>

                <div>
                  <label htmlFor="lg-number" className={labelCls}>
                    {t.language.numberLabel}
                  </label>
                  <select
                    id="lg-number"
                    value={locale.numberFormat}
                    onChange={(e) => changeLocale('numberFormat', e.target.value)}
                    className={`${inputCls} cursor-pointer appearance-none dark:[&>option]:bg-[#0b1524] dark:[&>option]:text-slate-100`}
                  >
                    <option value="pk">{t.language.formatPk}</option>
                    <option value="intl">{t.language.formatIntl}</option>
                  </select>
                  <p className="mt-1 text-[0.68rem] leading-relaxed text-slate-400 dark:text-slate-500">
                    {t.language.numberHint}
                  </p>
                </div>

                <div className="flex items-start gap-3 rounded-xl border border-slate-200/70 bg-slate-50/60 p-3.5 sm:col-span-2 dark:border-white/10 dark:bg-white/[0.03]">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-emerald-600 text-[0.62rem] font-extrabold tracking-wide text-white">
                    PKR
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {t.language.currencyLabel}: PKR — Rs.
                    </p>
                    <p className="mt-0.5 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                      {t.language.currencyNote}
                    </p>
                  </div>
                </div>
              </div>
            </Section>

            {/* ===== Privacy & data ===== */}
            <Section id="privacy" icon={Download} title={t.privacy.title} subtitle={t.privacy.sub}>
              <div className="space-y-2.5">
                <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200/70 bg-slate-50/60 p-3.5 dark:border-white/10 dark:bg-white/[0.03]">
                  <Download className="h-4 w-4 shrink-0 text-brand-600 dark:text-brand-300" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {t.privacy.downloadTitle}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {t.privacy.downloadDesc}
                    </p>
                  </div>
                  <Btn variant="ghost" icon={Download} onClick={downloadData}>
                    {t.download}
                  </Btn>
                </div>

                <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200/70 bg-slate-50/60 p-3.5 dark:border-white/10 dark:bg-white/[0.03]">
                  <ShoppingBag className="h-4 w-4 shrink-0 text-brand-600 dark:text-brand-300" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {t.privacy.cartTitle}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {t.privacy.cartCount(cartItems.length)}
                    </p>
                  </div>
                  <Btn
                    variant={armed === 'cart' ? 'danger' : 'ghost'}
                    icon={Trash2}
                    disabled={!cartItems.length}
                    onClick={() => askClear('cart')}
                  >
                    {armed === 'cart' ? t.confirmClear : t.clear}
                  </Btn>
                </div>

                <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200/70 bg-slate-50/60 p-3.5 dark:border-white/10 dark:bg-white/[0.03]">
                  <Heart className="h-4 w-4 shrink-0 text-rose-500" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {t.privacy.wishlistTitle}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {t.privacy.wishlistCount(wishItems.length)}
                    </p>
                  </div>
                  <Btn
                    variant={armed === 'wishlist' ? 'danger' : 'ghost'}
                    icon={Trash2}
                    disabled={!wishItems.length}
                    onClick={() => askClear('wishlist')}
                  >
                    {armed === 'wishlist' ? t.confirmClear : t.clear}
                  </Btn>
                </div>
              </div>


              {/* danger zone */}
              <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50/70 p-3.5 dark:border-rose-500/30 dark:bg-rose-500/10">
                <p className="flex items-center gap-2 text-sm font-bold text-rose-700 dark:text-rose-200">
                  <Trash2 className="h-4 w-4" /> {t.privacy.dangerTitle}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-rose-700/80 dark:text-rose-200/80">
                  {t.privacy.dangerDesc}
                </p>

                {dangerOpen ? (
                  <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
                    <Field
                      id="dz-pwd"
                      label={t.privacy.deletePwdLabel}
                      type="password"
                      value={dangerPwd}
                      onChange={(e) => setDangerPwd(e.target.value)}
                      placeholder={t.privacy.deletePwdPh}
                      autoComplete="current-password"
                    />
                    <Field
                      id="dz-text"
                      label={t.privacy.typeToConfirm}
                      value={dangerText}
                      onChange={(e) => setDangerText(e.target.value)}
                      placeholder="DELETE"
                      autoComplete="off"
                    />
                    <div className="flex flex-wrap items-center gap-2 sm:col-span-2">
                      <Btn
                        variant="danger"
                        icon={Trash2}
                        busy={busy === 'delete'}
                        disabled={
                          busy === 'delete' ||
                          !dangerPwd ||
                          dangerText.trim().toUpperCase() !== 'DELETE'
                        }
                        onClick={deleteAccount}
                      >
                        {t.privacy.deleteConfirmBtn}
                      </Btn>
                      <Btn
                        variant="ghost"
                        onClick={() => {
                          setDangerOpen(false)
                          setDangerPwd('')
                          setDangerText('')
                        }}
                      >
                        {t.cancel}
                      </Btn>
                    </div>
                  </div>
                ) : (
                  <Btn
                    variant="danger"
                    icon={Trash2}
                    className="mt-3"
                    onClick={() => setDangerOpen(true)}
                  >
                    {t.privacy.deleteBtn}
                  </Btn>
                )}
              </div>
            </Section>

            {/* ===== About ===== */}
            <Section id="about" icon={Info} title={t.about.title} subtitle={t.about.sub}>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200/70 bg-slate-50/60 p-4 dark:border-white/10 dark:bg-white/[0.03]">
                  <p className="text-[0.62rem] font-bold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                    {t.about.app}
                  </p>
                  <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
                    Book River <span className="font-semibold text-slate-400">v1.0</span>
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                    {t.about.appDesc}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200/70 bg-slate-50/60 p-4 dark:border-white/10 dark:bg-white/[0.03]">
                  <p className="text-[0.62rem] font-bold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                    {t.about.account}
                  </p>
                  <p className="mt-1 truncate text-sm font-bold text-slate-900 dark:text-white">
                    {user?.email || '—'}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                    {t.memberSince} {memberSince}
                  </p>
                </div>
              </div>

              <p className="mt-4 text-[0.62rem] font-bold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                {t.about.quickLinks}
              </p>
              <div className="mt-1.5 flex flex-wrap gap-2">
                <Btn variant="ghost" icon={ShoppingBag} onClick={() => navigate('/home')}>
                  {t.about.home}
                </Btn>
                <Btn variant="ghost" icon={Truck} onClick={() => navigate('/cart')}>
                  {t.about.cart}
                </Btn>
                <Btn variant="ghost" icon={Heart} onClick={() => navigate('/wishlist')}>
                  {t.about.wishlist}
                </Btn>
                <Btn variant="ghost" icon={MapPin} onClick={() => navigate('/track')}>
                  {t.about.track}
                </Btn>
                <Btn variant="ghost" icon={Mail} onClick={() => navigate('/description')}>
                  {t.about.contact}
                </Btn>
                <Btn variant="danger" icon={LogOut} onClick={logout}>
                  {t.logout}
                </Btn>
              </div>

              <p className="mt-4 text-center text-[0.68rem] text-slate-400 dark:text-slate-500">
                {t.about.madeIn}
              </p>
            </Section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

