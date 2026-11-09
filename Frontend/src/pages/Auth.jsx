import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion as Motion } from 'framer-motion'
import {
  ArrowLeft,
  KeyRound,
  Lock,
  LogIn,
  Mail,
  ShieldCheck,
  User,
  UserPlus,
} from 'lucide-react'
import { notify } from '../utils/notify.jsx'
import Navbar from '../components/Navbar.jsx'
import '../css/Auth.css'

const API = '/api/auth'
const FLIP_MS = 950 // page-turn animation (0.9s) + thoda buffer

/**
 * Sign Up + Login + Forgot password + Authentication — REAL khuli kitaab par.
 * Page change asli page-turn se hota hai: ek paper leaf spine ke around palat kar
 * doosri side par girta hai.
 *   'next' = right page palat kar left par   (Sign Up / Forgot / Auth khulte hain)
 *   'prev' = left page palat kar right par   (wapas Login)
 */
export default function Auth() {
  const navigate = useNavigate()
  const location = useLocation()
  /* login ke baad: jis page par jaana tha wahi khule (warna Home) */
  const afterAuth = () => {
    const from = location.state?.from
    navigate(from && from !== '/auth' ? from : '/home', { replace: true })
  }
  const [signup, setSignup] = useState({ name: '', email: '', password: '' })
  const [login, setLogin] = useState({ email: '', password: '' })
  const [forgot, setForgot] = useState({ email: '' })
  const [verify, setVerify] = useState({ code: '', password: '', confirm: '' })
  const [twofaCode, setTwofaCode] = useState('')
  const [busy, setBusy] = useState('') // 'signup' | 'login' | 'forgot' | 'verify' | ''
  const [leftPage, setLeftPage] = useState('plate') // 'plate' | 'signup' | 'forgot' | 'verify'
  const [rightPage, setRightPage] = useState('login') // 'login' | 'plate'
  const [flip, setFlip] = useState(null) // { dir: 'next' | 'prev', from, to } | null
  const [demoCode, setDemoCode] = useState('') // email service na ho to code yahan dikhta hai
  const [sentTo, setSentTo] = useState('') // "h***z@gmail.com" — code yahan gaya

  // chhoti screen ya reduced-motion -> seedha switch (page-turn nahi)
  const isInstant = () =>
    typeof window !== 'undefined' &&
    (window.matchMedia('(max-width: 767px)').matches ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches)

  const post = async (path, body) => {
    const res = await fetch(`${API}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      const error = new Error(data.message || 'Kuch galat ho gaya — dobara try karein')
      error.data = data
      throw error
    }
    return data
  }

  const saveSession = (data) => {
    if (data?.token) localStorage.setItem('br_token', data.token)
    if (data?.user) localStorage.setItem('br_user', JSON.stringify(data.user))
  }

  // pehle se logged in ho to seedha aage (jis page par jaana tha / Home)
  useEffect(() => {
    if (localStorage.getItem('br_token')) afterAuth()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onSignup = async (e) => {
    e.preventDefault()
    if (busy) return
    setBusy('signup')
    try {
      const data = await post('/register', {
        name: signup.name,
        email: signup.email,
        password: signup.password,
      })
      saveSession(data)
      setSignup({ name: '', email: '', password: '' })
      afterAuth()
    } catch (err) {
      notify.error('Signup nahi hua', err.message)
    } finally {
      setBusy('')
    }
  }

  const onLogin = async (e) => {
    e.preventDefault()
    if (busy) return
    setBusy('login')
    try {
      const data = await post('/login', { email: login.email, password: login.password })
      saveSession(data)
      setLogin({ email: '', password: '' })
      afterAuth()
    } catch (err) {
      /* account par 2FA on hai → code maango */
      if (err.data?.twoFactorRequired) {
        setTwofaCode('')
        showTwofa()
      } else {
        notify.error('Login nahi hua', err.message)
      }
    } finally {
      setBusy('')
    }
  }

  /** 2FA login — authenticator app ka code */
  const onTwofaLogin = async (e) => {
    e.preventDefault()
    if (busy) return
    if (twofaCode.trim().length !== 6) {
      notify.error('Code adhoora hai', '6-digit code poora likho')
      return
    }

    setBusy('twofa')
    try {
      const data = await post('/login', {
        email: login.email,
        password: login.password,
        code: twofaCode.trim(),
      })
      saveSession(data)
      setLogin({ email: '', password: '' })
      setTwofaCode('')
      afterAuth()
    } catch (err) {
      notify.error('Code galat hai', err.message)
    } finally {
      setBusy('')
    }
  }

  /** email par 6-digit code bhejo (forgot password) */
  const sendCode = async ({ silent = false } = {}) => {
    const email = (forgot.email || login.email).trim()
    if (!email) {
      notify.error('Email daalo', 'Jis account ka password bhoola hai wo email likho')
      return false
    }

    setBusy('forgot')
    try {
      const data = await post('/forgot-password', { email })
      setForgot({ email })
      setDemoCode(data.devCode || '')
      setSentTo(data.sentTo || '')

      if (data.devCode) {
        /* email service off — local demo code */
        if (silent) notify.success('Naya code bhej diya', `Demo code: ${data.devCode}`)
        else notify.info('Code ready hai', `Demo code: ${data.devCode}`)
      } else if (silent) {
        notify.success('Naya code bhej diya', data.sentTo || email)
      } else {
        notify.success('Code bhej diya 📧', `${data.sentTo || email} — inbox check karo`)
      }

      return true
    } catch (err) {
      notify.error('Code nahi bheja ja saka', err.message)
      return false
    } finally {
      setBusy('')
    }
  }

  const onForgot = async (e) => {
    e.preventDefault()
    if (busy) return
    const ok = await sendCode()
    if (ok) {
      setVerify({ code: '', password: '', confirm: '' })
      showVerify()
    }
  }

  /** authentication page — code + naya password */
  const onVerify = async (e) => {
    e.preventDefault()
    if (busy) return
    if (verify.code.trim().length !== 6) {
      notify.error('Code adhoora hai', '6-digit code poora likho')
      return
    }
    if (verify.password.length < 6) {
      notify.error('Password chhota hai', 'Kam se kam 6 characters likho')
      return
    }
    if (verify.password !== verify.confirm) {
      notify.error('Password match nahi kar rahe', 'Dono password same likho')
      return
    }

    setBusy('verify')
    try {
      await post('/reset-password', {
        email: forgot.email,
        code: verify.code.trim(),
        newPassword: verify.password,
      })
      notify.success('Password set ho gaya 🔐', 'Ab naye password se login karo')
      setLogin({ email: forgot.email, password: '' })
      setVerify({ code: '', password: '', confirm: '' })
      setDemoCode('')
      showLogin()
    } catch (err) {
      notify.error('Verify nahi hua', err.message)
    } finally {
      setBusy('')
    }
  }

  // Leaf palat kar girne ke baad hi neeche wale page ka content badalta hai —
  // isliye switch kabhi nazar nahi aata (leaf usi waqt wahan hota hai).
  useEffect(() => {
    if (!flip) return undefined
    const id = window.setTimeout(() => {
      if (flip.dir === 'next') setLeftPage(flip.to)
      else setRightPage(flip.to)
      setFlip(null)
    }, FLIP_MS)
    return () => window.clearTimeout(id)
  }, [flip])

  /** right page palat kar left par naya page (Sign Up / Forgot / Authentication) */
  const turnToLeft = (to) => {
    if (flip || leftPage === to) return
    const from = rightPage
    setRightPage('plate') // leaf is waqt right page ko dhak kar rakhta hai
    if (isInstant()) {
      setLeftPage(to)
      return
    }
    setFlip({ dir: 'next', from, to })
  }

  /** left page palat kar right par (wapas Login) */
  const turnToRight = (to = 'login') => {
    if (flip) return
    const from = leftPage
    setLeftPage('plate')
    if (isInstant()) {
      setRightPage(to)
      return
    }
    setFlip({ dir: 'prev', from, to })
  }

  const showSignup = () => turnToLeft('signup')
  const showForgot = () => {
    setForgot((current) => ({ email: current.email || login.email }))
    turnToLeft('forgot')
  }
  const showVerify = () => turnToLeft('verify')
  const showTwofa = () => turnToLeft('twofa')
  const showLogin = () => turnToRight('login')

  /**
   * Sign Up page ka content.
   * `prefix` se input ids unique rehti hain (turning leaf me duplicate render hota hai),
   * `dup` true hone par fields tab-order se bahar rehte hain.
   */
  const renderSignup = (prefix, dup = false) => (
    <div className="abk-paper">
      <h1 className="auth-title">Sign Up</h1>
      <p className="auth-sub">Nayi account banao — apni pasand ki kitaabein save karo.</p>

      <form className="auth-form" onSubmit={onSignup}>
        <div className="auth-field">
          <label htmlFor={`${prefix}-name`}>Full Name</label>
          <div className="auth-input-wrap">
            <User className="auth-ic" />
            <input
              id={`${prefix}-name`}
              type="text"
              placeholder="Your name"
              value={signup.name}
              onChange={(e) => setSignup({ ...signup, name: e.target.value })}
              autoComplete="name"
              tabIndex={dup ? -1 : undefined}
              required
            />
          </div>
        </div>

        <div className="auth-field">
          <label htmlFor={`${prefix}-email`}>Email</label>
          <div className="auth-input-wrap">
            <Mail className="auth-ic" />
            <input
              id={`${prefix}-email`}
              type="email"
              placeholder="you@example.com"
              value={signup.email}
              onChange={(e) => setSignup({ ...signup, email: e.target.value })}
              autoComplete="email"
              tabIndex={dup ? -1 : undefined}
              required
            />
          </div>
        </div>

        <div className="auth-field">
          <label htmlFor={`${prefix}-pass`}>Password</label>
          <div className="auth-input-wrap">
            <Lock className="auth-ic" />
            <input
              id={`${prefix}-pass`}
              type="password"
              placeholder="••••••••"
              value={signup.password}
              onChange={(e) => setSignup({ ...signup, password: e.target.value })}
              autoComplete="new-password"
              minLength={6}
              tabIndex={dup ? -1 : undefined}
              required
            />
          </div>
        </div>

        <button
          type="submit"
          className="auth-btn"
          disabled={busy === 'signup'}
          tabIndex={dup ? -1 : undefined}
        >
          {busy === 'signup' ? 'Creating account…' : 'Create Account'}
        </button>
      </form>

      <div className="auth-alt">
        <span className="auth-alt-line" aria-hidden="true" />
        <span className="auth-alt-text">Already have an account?</span>
        <span className="auth-alt-line" aria-hidden="true" />
      </div>

      <button
        type="button"
        className="auth-btn-alt"
        onClick={showLogin}
        tabIndex={dup ? -1 : undefined}
      >
        <LogIn className="auth-btn-alt-ic" />
        Login
      </button>
    </div>
  )

  /** Login page ka content (prefix/dup ka same matlab — dekho renderSignup). */
  const renderLogin = (prefix, dup = false) => (
    <div className="abk-paper">
      <h1 className="auth-title">Login</h1>
      <p className="auth-sub">Welcome back! Apne account mein daakhil hon.</p>

      <form className="auth-form" onSubmit={onLogin} autoComplete="off">
        <div className="auth-field">
          <label htmlFor={`${prefix}-email`}>Email</label>
          <div className="auth-input-wrap">
            <Mail className="auth-ic" />
            <input
              id={`${prefix}-email`}
              type="email"
              placeholder=""
              value={login.email}
              onChange={(e) => setLogin({ ...login, email: e.target.value })}
              autoComplete="off"
              tabIndex={dup ? -1 : undefined}
              required
            />
          </div>
        </div>

        <div className="auth-field">
          <label htmlFor={`${prefix}-pass`}>Password</label>
          <div className="auth-input-wrap">
            <Lock className="auth-ic" />
            <input
              id={`${prefix}-pass`}
              type="password"
              placeholder=""
              value={login.password}
              onChange={(e) => setLogin({ ...login, password: e.target.value })}
              autoComplete="new-password"
              tabIndex={dup ? -1 : undefined}
              required
            />
          </div>
        </div>

        <div className="auth-row">
          <label className="auth-remember">
            <input type="checkbox" tabIndex={dup ? -1 : undefined} /> Remember me
          </label>
          <button
            type="button"
            className="auth-forgot"
            onClick={showForgot}
            tabIndex={dup ? -1 : undefined}
          >
            Forgot password?
          </button>
        </div>

        <button
          type="submit"
          className="auth-btn"
          disabled={busy === 'login'}
          tabIndex={dup ? -1 : undefined}
        >
          {busy === 'login' ? 'Logging in…' : 'Login'}
        </button>
      </form>

      <div className="auth-alt">
        <span className="auth-alt-line" aria-hidden="true" />
        <span className="auth-alt-text">Don&apos;t have an account?</span>
        <span className="auth-alt-line" aria-hidden="true" />
      </div>

      <button
        type="button"
        className="auth-btn-alt"
        onClick={showSignup}
        tabIndex={dup ? -1 : undefined}
      >
        <UserPlus className="auth-btn-alt-ic" />
        Sign Up
      </button>
    </div>
  )

  /** Forgot password — sirf email, phir 6-digit code. */
  const renderForgot = (prefix, dup = false) => (
    <div className="abk-paper">
      <h1 className="auth-title">Forgot password</h1>
      <p className="auth-sub">
        Apna email daalo — hum 6-digit code bhejenge, phir naya password set kar lena.
      </p>

      <form className="auth-form" onSubmit={onForgot} autoComplete="off">
        <div className="auth-field">
          <label htmlFor={`${prefix}-email`}>Email</label>
          <div className="auth-input-wrap">
            <Mail className="auth-ic" />
            <input
              id={`${prefix}-email`}
              type="email"
              placeholder="you@example.com"
              value={forgot.email}
              onChange={(e) => setForgot({ email: e.target.value })}
              autoComplete="off"
              tabIndex={dup ? -1 : undefined}
              required
            />
          </div>
        </div>

        <button
          type="submit"
          className="auth-btn"
          disabled={busy === 'forgot'}
          tabIndex={dup ? -1 : undefined}
        >
          {busy === 'forgot' ? 'Sending code…' : 'Send code'}
        </button>
      </form>

      <div className="auth-alt">
        <span className="auth-alt-line" aria-hidden="true" />
        <span className="auth-alt-text">Yaad aa gaya?</span>
        <span className="auth-alt-line" aria-hidden="true" />
      </div>

      <button
        type="button"
        className="auth-btn-alt"
        onClick={showLogin}
        tabIndex={dup ? -1 : undefined}
      >
        <ArrowLeft className="auth-btn-alt-ic" />
        Back to login
      </button>
    </div>
  )

  /** Authentication — code verify + naya password. */
  const renderVerify = (prefix, dup = false) => (
    <div className="abk-paper">
      <h1 className="auth-title">Authentication</h1>
      <p className="auth-sub">
        {forgot.email
          ? `${forgot.email} par aaya 6-digit code daalo, phir naya password set karo.`
          : 'Email par aaya 6-digit code daalo, phir naya password set karo.'}
      </p>

      {demoCode ? (
        <p className="auth-note">
          <ShieldCheck className="auth-note-ic" />
          Demo code: <strong className="auth-note-code">{demoCode}</strong> (email service off hai)
        </p>
      ) : sentTo ? (
        <p className="auth-note">
          <Mail className="auth-note-ic" />
          Code bheja gaya: <strong>{sentTo}</strong> — inbox / spam check karo
        </p>
      ) : null}

      <form className="auth-form" onSubmit={onVerify} autoComplete="off">
        <div className="auth-field">
          <label htmlFor={`${prefix}-code`}>6-digit code</label>
          <div className="auth-input-wrap">
            <KeyRound className="auth-ic" />
            <input
              id={`${prefix}-code`}
              type="text"
              inputMode="numeric"
              className="auth-code"
              placeholder="000000"
              maxLength={6}
              value={verify.code}
              onChange={(e) =>
                setVerify({ ...verify, code: e.target.value.replace(/\D/g, '').slice(0, 6) })
              }
              autoComplete="one-time-code"
              tabIndex={dup ? -1 : undefined}
              required
            />
          </div>
        </div>

        <div className="auth-field">
          <label htmlFor={`${prefix}-new`}>New password</label>
          <div className="auth-input-wrap">
            <Lock className="auth-ic" />
            <input
              id={`${prefix}-new`}
              type="password"
              placeholder="••••••••"
              value={verify.password}
              onChange={(e) => setVerify({ ...verify, password: e.target.value })}
              autoComplete="new-password"
              minLength={6}
              tabIndex={dup ? -1 : undefined}
              required
            />
          </div>
        </div>

        <div className="auth-field">
          <label htmlFor={`${prefix}-confirm`}>Confirm password</label>
          <div className="auth-input-wrap">
            <Lock className="auth-ic" />
            <input
              id={`${prefix}-confirm`}
              type="password"
              placeholder="••••••••"
              value={verify.confirm}
              onChange={(e) => setVerify({ ...verify, confirm: e.target.value })}
              autoComplete="new-password"
              minLength={6}
              tabIndex={dup ? -1 : undefined}
              required
            />
          </div>
        </div>

        <button
          type="submit"
          className="auth-btn"
          disabled={busy === 'verify'}
          tabIndex={dup ? -1 : undefined}
        >
          {busy === 'verify' ? 'Verifying…' : 'Verify & set password'}
        </button>
      </form>

      <div className="auth-row auth-row--between">
        <button
          type="button"
          className="auth-forgot"
          onClick={() => sendCode({ silent: true })}
          disabled={busy === 'forgot'}
          tabIndex={dup ? -1 : undefined}
        >
          Resend code
        </button>
        <button
          type="button"
          className="auth-forgot"
          onClick={showLogin}
          tabIndex={dup ? -1 : undefined}
        >
          Back to login
        </button>
      </div>
    </div>
  )

  /** 2FA login — sirf authenticator code (password pehle hi check ho chuka). */
  const renderTwofaLogin = (prefix, dup = false) => (
    <div className="abk-paper">
      <h1 className="auth-title">Authentication</h1>
      <p className="auth-sub">
        {`${login.email} par 2FA on hai — Google Authenticator ka 6-digit code daalo.`}
      </p>

      <form className="auth-form" onSubmit={onTwofaLogin} autoComplete="off">
        <div className="auth-field">
          <label htmlFor={`${prefix}-code`}>6-digit code</label>
          <div className="auth-input-wrap">
            <ShieldCheck className="auth-ic" />
            <input
              id={`${prefix}-code`}
              type="text"
              inputMode="numeric"
              className="auth-code"
              placeholder="000000"
              maxLength={6}
              value={twofaCode}
              onChange={(e) => setTwofaCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              autoComplete="one-time-code"
              tabIndex={dup ? -1 : undefined}
              required
            />
          </div>
        </div>

        <button
          type="submit"
          className="auth-btn"
          disabled={busy === 'twofa'}
          tabIndex={dup ? -1 : undefined}
        >
          {busy === 'twofa' ? 'Verifying…' : 'Verify & login'}
        </button>
      </form>

      <div className="auth-alt">
        <span className="auth-alt-line" aria-hidden="true" />
        <span className="auth-alt-text">App kholo aur current code daalo</span>
        <span className="auth-alt-line" aria-hidden="true" />
      </div>

      <button
        type="button"
        className="auth-btn-alt"
        onClick={showLogin}
        tabIndex={dup ? -1 : undefined}
      >
        <ArrowLeft className="auth-btn-alt-ic" />
        Back to login
      </button>
    </div>
  )

  /**
   * Decoration page — heading + description.
   * Jis page par form nahi hota, wahan yahi dikhti hai
   * (Login me LEFT par, Sign Up me RIGHT par).
   */
  const renderPlate = () => (
    <div className="abk-plate">
      <img src="/logo.png" alt="" className="abk-plate-logo" width="72" height="48" />
      <p className="abk-plate-brand">
        Book <em>River</em>
      </p>
      <span className="abk-plate-rule" aria-hidden="true" />
      <p className="abk-plate-quote">
        “A reader lives a thousand lives before he dies. The man who never reads lives only one.”
      </p>
    </div>
  )

  /** ek page ka content (turning leaf bhi yahi use karta hai) */
  const renderPage = (page, prefix, dup = false) => {
    if (page === 'signup') return renderSignup(prefix, dup)
    if (page === 'login') return renderLogin(prefix, dup)
    if (page === 'forgot') return renderForgot(prefix, dup)
    if (page === 'verify') return renderVerify(prefix, dup)
    if (page === 'twofa') return renderTwofaLogin(prefix, dup)
    return renderPlate()
  }

  return (
    <div className="book-page auth-page">
      <Navbar back shopIcons={false} />

      <main className="auth-main">
        <Motion.div
          className="abk-stage"
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className={leftPage === 'plate' ? 'abk' : 'abk is-open'}>
            {/* hard cover — pages ke neeche se charon taraf bahar jhaankta hai */}
            <span className="abk-cover" aria-hidden="true" />

            {/* ---- LEFT PAGE — Sign Up / Forgot / Authentication YA decoration ---- */}
            <div className="auth-half auth-half-left">
              {/* page-block — open page ke peeche baaki pages ki motai */}
              <span className="abk-block abk-block--left" aria-hidden="true" />
              <div className="abk-page abk-page--left">
                {leftPage === 'plate' ? null : renderPage(leftPage, 'left')}
              </div>
              {leftPage === 'plate' ? renderPlate() : null}
            </div>

            {/* ---- RIGHT PAGE — Login form YA decoration ---- */}
            <div
              className={
                rightPage === 'login'
                  ? 'auth-half auth-half-right'
                  : 'auth-half auth-half-right abk-half--plain'
              }
            >
              <span className="abk-block abk-block--right" aria-hidden="true" />
              <div className="abk-page abk-page--right">
                {rightPage === 'login' ? renderLogin('right') : null}
              </div>
              {rightPage === 'plate' ? renderPlate() : null}
            </div>

            {/* ---- turning leaf: asli page palatne wala paper ---- */}
            {flip && (
              <div className={`abk-flip abk-flip--${flip.dir}`} aria-hidden="true">
                <div className="abk-flip-face">
                  {renderPage(flip.from, 'flip-a', true)}
                  <span className="abk-flip-shade" aria-hidden="true" />
                </div>
                <div className="abk-flip-face abk-flip-face--back">
                  {renderPage(flip.to, 'flip-b', true)}
                </div>
              </div>
            )}

            {/* centre gutter (spine) + gold bookmark ribbon */}
            <span className="abk-gutter" aria-hidden="true" />
            <span className="abk-ribbon" aria-hidden="true" />
          </div>
        </Motion.div>
      </main>
    </div>
  )
}
