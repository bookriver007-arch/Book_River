import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion as Motion } from 'framer-motion'
import { Lock, LogIn, Mail, User, UserPlus } from 'lucide-react'
import { notify } from '../utils/notify.jsx'
import Navbar from '../components/Navbar.jsx'
import '../css/Auth.css'

const API = '/api/auth'
const FLIP_MS = 950 // page-turn animation (0.9s) + thoda buffer

/**
 * Sign Up + Login — REAL khuli kitaab par.
 * Page change asli page-turn se hota hai: ek paper leaf spine ke around palat kar
 * doosri side par girta hai.
 *   'next' = right page palat kar left par   (Sign Up khulta hai)
 *   'prev' = left page palat kar right par   (wapas Login)
 */
export default function Auth() {
  const navigate = useNavigate()
  const [signup, setSignup] = useState({ name: '', email: '', password: '' })
  const [login, setLogin] = useState({ email: '', password: '' })
  const [busy, setBusy] = useState('') // 'signup' | 'login' | ''
  const [leftPage, setLeftPage] = useState('plate') // 'plate' | 'signup'
  const [rightPage, setRightPage] = useState('login') // 'login' | 'plate'
  const [flip, setFlip] = useState(null) // 'next' | 'prev' | null

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
    if (!res.ok) throw new Error(data.message || 'Kuch galat ho gaya — dobara try karein')
    return data
  }

  const saveSession = (data) => {
    if (data?.token) localStorage.setItem('br_token', data.token)
    if (data?.user) localStorage.setItem('br_user', JSON.stringify(data.user))
  }

  // pehle se logged in ho to seedha Home par
  useEffect(() => {
    if (localStorage.getItem('br_token')) navigate('/home', { replace: true })
  }, [navigate])

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
      navigate('/home')
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
      navigate('/home')
    } catch (err) {
      notify.error('Login nahi hua', err.message)
    } finally {
      setBusy('')
    }
  }

  // Leaf palat kar girne ke baad hi neeche wale page ka content badalta hai —
  // isliye switch kabhi nazar nahi aata (leaf usi waqt wahan hota hai).
  useEffect(() => {
    if (!flip) return undefined
    const id = window.setTimeout(() => {
      if (flip === 'next') setLeftPage('signup')
      else setRightPage('login')
      setFlip(null)
    }, FLIP_MS)
    return () => window.clearTimeout(id)
  }, [flip])

  /**
   * Login -> Sign Up
   * right page ka form palat kar left par girta hai; neeche se left par Sign Up
   * form aur right par decoration (plate) aa jati hai.
   */
  const showSignup = () => {
    if (flip || leftPage === 'signup') return
    setRightPage('plate') // leaf is waqt right page ko dhak kar rakhta hai
    if (isInstant()) {
      setLeftPage('signup')
      return
    }
    setFlip('next')
  }

  /** Sign Up -> Login — left page ka form palat kar right par girta hai. */
  const showLogin = () => {
    if (flip || leftPage === 'plate') return
    setLeftPage('plate') // leaf is waqt left page ko dhak kar rakhta hai
    if (isInstant()) {
      setRightPage('login')
      return
    }
    setFlip('prev')
  }

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
          <span className="auth-forgot">Forgot password?</span>
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
          <div className={leftPage === 'signup' ? 'abk is-open' : 'abk'}>
            {/* hard cover — pages ke neeche se charon taraf bahar jhaankta hai */}
            <span className="abk-cover" aria-hidden="true" />

            {/* ---- LEFT PAGE — Sign Up form YA decoration ---- */}
            <div className="auth-half auth-half-left">
              {/* page-block — open page ke peeche baaki pages ki motai */}
              <span className="abk-block abk-block--left" aria-hidden="true" />
              <div className="abk-page abk-page--left">
                {leftPage === 'signup' ? renderSignup('su') : null}
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
                {rightPage === 'login' ? renderLogin('li') : null}
              </div>
              {rightPage === 'plate' ? renderPlate() : null}
            </div>

            {/* ---- turning leaf: asli page palatne wala paper ---- */}
            {flip && (
              <div className={`abk-flip abk-flip--${flip}`} aria-hidden="true">
                <div className="abk-flip-face">
                  {flip === 'next' ? renderLogin('flip-li', true) : renderSignup('flip-su', true)}
                  <span className="abk-flip-shade" aria-hidden="true" />
                </div>
                <div className="abk-flip-face abk-flip-face--back">
                  {flip === 'next' ? renderSignup('flip-su', true) : renderLogin('flip-li', true)}
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


