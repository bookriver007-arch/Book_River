import express from 'express'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'

/**
 * Auth — Sign Up / Login (Frontend → /auth page).
 * Routes mounted at /api/auth.
 *   POST /api/auth/register  { name, email, password }
 *   POST /api/auth/login     { email, password }
 *   GET  /api/auth/me        (Authorization: Bearer <token>)
 */
const router = express.Router()

const clean = (v) => String(v ?? '').trim()
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const secret = () => process.env.JWT_SECRET || 'book-river-dev-secret'
const expiresIn = () => process.env.JWT_EXPIRES_IN || '7d'

const signToken = (user) => jwt.sign({ id: String(user._id) }, secret(), { expiresIn: expiresIn() })

// POST — naya account (password hash ho kar MongoDB mein save hota hai)
router.post('/register', async (req, res, next) => {
  try {
    const name = clean(req.body?.name)
    const email = clean(req.body?.email).toLowerCase()
    const password = String(req.body?.password ?? '')

    if (!name) return res.status(400).json({ message: 'Please enter your full name' })
    if (!EMAIL_RE.test(email)) return res.status(400).json({ message: 'Please enter a valid email' })
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' })
    }

    const exists = await User.findOne({ email })
    if (exists) {
      return res.status(409).json({ message: 'This email is already registered — please login' })
    }

    const user = await User.create({ name, email, password })
    res.status(201).json({
      message: 'Account created',
      token: signToken(user),
      user: user.toPublic(),
    })
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({ message: 'This email is already registered — please login' })
    }
    next(err)
  }
})

// POST — login (email + password check)
router.post('/login', async (req, res, next) => {
  try {
    const email = clean(req.body?.email).toLowerCase()
    const password = String(req.body?.password ?? '')

    if (!EMAIL_RE.test(email)) return res.status(400).json({ message: 'Please enter a valid email' })
    if (!password) return res.status(400).json({ message: 'Please enter your password' })

    const user = await User.findOne({ email }).select('+password')
    if (!user) return res.status(401).json({ message: 'Email or password is incorrect' })

    const ok = await user.matchPassword(password)
    if (!ok) return res.status(401).json({ message: 'Email or password is incorrect' })

    res.json({ message: 'Logged in', token: signToken(user), user: user.toPublic() })
  } catch (err) {
    next(err)
  }
})

// GET — token se current user
router.get('/me', async (req, res) => {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : ''
  if (!token) return res.status(401).json({ message: 'Not authorised' })

  try {
    const payload = jwt.verify(token, secret())
    const user = await User.findById(payload.id)
    if (!user) return res.status(401).json({ message: 'Not authorised' })
    res.json({ user: user.toPublic() })
  } catch {
    res.status(401).json({ message: 'Session expired — please login again' })
  }
})

export default router
