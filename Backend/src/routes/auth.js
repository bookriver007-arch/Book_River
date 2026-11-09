import express from 'express'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import WishlistItem from '../models/WishlistItem.js'
import requireAuth from '../middleware/auth.js'

/**
 * Auth — Sign Up / Login + Settings (profile, password, account).
 * Routes mounted at /api/auth.
 *   POST   /api/auth/register  { name, email, password }
 *   POST   /api/auth/login     { email, password }
 *   GET    /api/auth/me        (Bearer token)
 *   PATCH  /api/auth/profile   { name, phone, address, city, prefs }
 *   POST   /api/auth/password  { currentPassword, newPassword }
 *   DELETE /api/auth/account   { password }
 */
const router = express.Router()

const PREFS = ['orders', 'offers', 'wishlist', 'newsletter']

/** string preferences (Theme / Language / Number format) — allowed values */
const PREFS_TEXT = {
  theme: ['light', 'dark', 'system'],
  language: ['en', 'ur', 'roman'],
  numberFormat: ['pk', 'intl'],
}

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

// PATCH — profile update (Settings page)
router.patch('/profile', requireAuth, async (req, res, next) => {
  try {
    const body = req.body || {}
    const user = await User.findById(req.userId)
    if (!user) return res.status(401).json({ message: 'Not authorised' })

    if (body.name !== undefined) {
      const name = clean(body.name)
      if (!name) return res.status(400).json({ message: 'Naam khaali nahi ho sakta' })
      user.name = name
    }
    if (body.phone !== undefined) user.phone = clean(body.phone)
    if (body.address !== undefined) user.address = clean(body.address)
    if (body.city !== undefined) user.city = clean(body.city)

    if (body.prefs && typeof body.prefs === 'object') {
      PREFS.forEach((key) => {
        if (body.prefs[key] !== undefined) user.prefs[key] = !!body.prefs[key]
      })

      // theme / language / numberFormat — sirf allowed values
      Object.entries(PREFS_TEXT).forEach(([key, allowed]) => {
        const value = body.prefs[key]
        if (value !== undefined && allowed.includes(String(value))) {
          user.prefs[key] = String(value)
        }
      })
    }

    await user.save()
    res.json({ message: 'Profile update ho gaya', user: user.toPublic() })
  } catch (err) {
    next(err)
  }
})

// POST — password change (purana password verify hota hai)
router.post('/password', requireAuth, async (req, res, next) => {
  try {
    const current = String(req.body?.currentPassword ?? '')
    const newPassword = String(req.body?.newPassword ?? '')

    if (!current) return res.status(400).json({ message: 'Purana password daalo' })
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Naya password kam se kam 6 characters ka ho' })
    }

    const user = await User.findById(req.userId).select('+password')
    if (!user) return res.status(401).json({ message: 'Not authorised' })

    const ok = await user.matchPassword(current)
    if (!ok) return res.status(401).json({ message: 'Purana password galat hai' })

    user.password = newPassword
    user.passwordChangedAt = new Date()
    await user.save()
    res.json({
      message: 'Password update ho gaya',
      passwordChangedAt: user.passwordChangedAt,
    })
  } catch (err) {
    next(err)
  }
})

// DELETE — account delete (password confirm + wishlist bhi saaf)
router.delete('/account', requireAuth, async (req, res, next) => {
  try {
    const password = String(req.body?.password ?? '')
    if (!password) return res.status(400).json({ message: 'Confirm karne ke liye password daalo' })

    const user = await User.findById(req.userId).select('+password')
    if (!user) return res.status(401).json({ message: 'Not authorised' })

    const ok = await user.matchPassword(password)
    if (!ok) return res.status(401).json({ message: 'Password galat hai' })

    await WishlistItem.deleteMany({ user: user._id })
    await user.deleteOne()
    res.json({ message: 'Account delete ho gaya' })
  } catch (err) {
    next(err)
  }
})

export default router
