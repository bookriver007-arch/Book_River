import express from 'express'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import User from '../models/User.js'
import PasswordReset from '../models/PasswordReset.js'
import WishlistItem from '../models/WishlistItem.js'
import requireAuth from '../middleware/auth.js'
import { generateSecret, otpauthUri, verifyTotp } from '../utils/totp.js'
import { isMailConfigured, maskEmail, resetCodeEmail, sendMail } from '../utils/mailer.js'

/**
 * Auth — Sign Up / Login + Forgot password + Two-factor (Google Authenticator)
 * + Settings (profile, password, account).
 * Routes mounted at /api/auth.
 *   POST   /api/auth/register        { name, email, password }
 *   POST   /api/auth/login           { email, password, code? }
 *   POST   /api/auth/forgot-password { email }               → 6-digit code
 *   POST   /api/auth/reset-password  { email, code, newPassword }
 *   GET    /api/auth/me              (Bearer token)
 *   GET    /api/auth/2fa             (Bearer token)  → status
 *   POST   /api/auth/2fa/setup       (Bearer token)  → { secret, otpauth }
 *   POST   /api/auth/2fa/enable      { code }        (Bearer token)
 *   POST   /api/auth/2fa/disable     { password }    (Bearer token)
 *   PATCH  /api/auth/profile         { name, phone, address, city, prefs }
 *   POST   /api/auth/password        { currentPassword, newPassword }
 *   DELETE /api/auth/account         { password }
 */
const router = express.Router()

const PREFS = ['orders', 'offers', 'wishlist', 'newsletter']

/** reset code kitni der chalta hai */
const CODE_TTL_MINUTES = 10
const CODE_MAX_ATTEMPTS = 5

/** email service (SMTP) na hone tak code response me bhi bhej dete hain */
const isDev = () => process.env.NODE_ENV !== 'production'

const newCode = () => String(Math.floor(100000 + Math.random() * 900000))

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

// POST — login (email + password + 2FA code agar on ho)
router.post('/login', async (req, res, next) => {
  try {
    const email = clean(req.body?.email).toLowerCase()
    const password = String(req.body?.password ?? '')
    const code = clean(req.body?.code)

    if (!EMAIL_RE.test(email)) return res.status(400).json({ message: 'Please enter a valid email' })
    if (!password) return res.status(400).json({ message: 'Please enter your password' })

    const user = await User.findOne({ email }).select('+password +twoFactor.secret')
    if (!user) return res.status(401).json({ message: 'Email or password is incorrect' })

    const ok = await user.matchPassword(password)
    if (!ok) return res.status(401).json({ message: 'Email or password is incorrect' })

    /* password sahi hai — ab 2FA (agar on hai) */
    if (user.twoFactor?.enabled) {
      if (!code) {
        return res.status(401).json({
          message: 'Enter the 6-digit code from your authenticator app',
          twoFactorRequired: true,
        })
      }
      if (!verifyTotp(user.twoFactor.secret, code)) {
        return res.status(401).json({
          message: 'That code is not valid — try the current one',
          twoFactorRequired: true,
        })
      }
    }

    res.json({ message: 'Logged in', token: signToken(user), user: user.toPublic() })
  } catch (err) {
    next(err)
  }
})

// POST — forgot password (6-digit code banata hai)
router.post('/forgot-password', async (req, res, next) => {
  try {
    const email = clean(req.body?.email).toLowerCase()
    if (!EMAIL_RE.test(email)) return res.status(400).json({ message: 'Please enter a valid email' })

    const user = await User.findOne({ email })

    /* account na ho to bhi wahi jawab — email guessing se bachne ke liye */
    if (!user) {
      return res.json({ message: 'If this email is registered, a code has been sent' })
    }

    const code = newCode()
    const codeHash = await bcrypt.hash(code, 10)

    await PasswordReset.deleteMany({ email })
    await PasswordReset.create({
      email,
      codeHash,
      expiresAt: new Date(Date.now() + CODE_TTL_MINUTES * 60 * 1000),
    })

    /* SMTP set hai? to REAL email jati hai */
    if (isMailConfigured()) {
      try {
        const mail = resetCodeEmail({ code, name: user.name, minutes: CODE_TTL_MINUTES })
        await sendMail({
          to: email,
          subject: `Book River — password reset code: ${code}`,
          html: mail.html,
          text: mail.text,
        })
      } catch (mailErr) {
        console.error('[auth] reset email failed:', mailErr.message)
        return res.status(502).json({
          message: 'Email could not be sent — please try again in a moment',
        })
      }

      console.log(`[auth] password reset code emailed to ${maskEmail(email)}`)

      return res.json({
        message: 'Code sent to your email',
        sentTo: maskEmail(email),
        expiresInMinutes: CODE_TTL_MINUTES,
      })
    }

    /* SMTP set nahi hai — local testing ke liye code response/console me */
    console.log(`[auth] password reset code for ${email}: ${code}`)
    console.log('[auth] real email bhejne ke liye Backend/.env me SMTP_USER + SMTP_PASS daalo')

    res.json({
      message: 'Code sent — check your email',
      email,
      expiresInMinutes: CODE_TTL_MINUTES,
      ...(isDev() ? { devCode: code } : {}),
    })
  } catch (err) {
    next(err)
  }
})

// POST — reset password (code verify + naya password)
router.post('/reset-password', async (req, res, next) => {
  try {
    const email = clean(req.body?.email).toLowerCase()
    const code = clean(req.body?.code)
    const newPassword = String(req.body?.newPassword ?? '')

    if (!EMAIL_RE.test(email)) return res.status(400).json({ message: 'Please enter a valid email' })
    if (!/^\d{6}$/.test(code)) {
      return res.status(400).json({ message: 'Enter the 6-digit code' })
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' })
    }

    const record = await PasswordReset.findOne({ email }).sort({ createdAt: -1 })
    if (!record || record.expiresAt.getTime() < Date.now()) {
      return res.status(400).json({ message: 'Code expired — please request a new one' })
    }
    if (record.attempts >= CODE_MAX_ATTEMPTS) {
      return res.status(429).json({ message: 'Too many attempts — request a new code' })
    }

    const ok = await bcrypt.compare(code, record.codeHash)
    if (!ok) {
      record.attempts += 1
      await record.save()
      return res.status(400).json({ message: 'Code is incorrect' })
    }

    const user = await User.findOne({ email }).select('+password')
    if (!user) return res.status(404).json({ message: 'Account not found' })

    user.password = newPassword
    user.passwordChangedAt = new Date()
    await user.save()
    await PasswordReset.deleteMany({ email })

    res.json({ message: 'Password updated — you can log in now' })
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

/* ---------------- two-factor (Google Authenticator) ---------------- */

// GET — 2FA status
router.get('/2fa', requireAuth, async (req, res, next) => {
  try {
    const user = await User.findById(req.userId)
    if (!user) return res.status(401).json({ message: 'Not authorised' })

    res.json({
      enabled: Boolean(user.twoFactor?.enabled),
      enabledAt: user.twoFactor?.enabledAt || null,
    })
  } catch (err) {
    next(err)
  }
})

// POST — 2FA setup (secret banata hai; abhi ON nahi hota)
router.post('/2fa/setup', requireAuth, async (req, res, next) => {
  try {
    const user = await User.findById(req.userId)
    if (!user) return res.status(401).json({ message: 'Not authorised' })
    if (user.twoFactor?.enabled) {
      return res.status(409).json({ message: 'Two-factor is already on' })
    }

    const secret = generateSecret()
    user.twoFactor = { enabled: false, secret, enabledAt: null }
    await user.save()

    res.json({
      secret,
      otpauth: otpauthUri({ secret, label: `Book River:${user.email}` }),
      message: 'Scan the QR code, then confirm with a 6-digit code',
    })
  } catch (err) {
    next(err)
  }
})

// POST — 2FA enable (pehla code verify karke ON)
router.post('/2fa/enable', requireAuth, async (req, res, next) => {
  try {
    const code = clean(req.body?.code)
    const user = await User.findById(req.userId).select('+twoFactor.secret')
    if (!user) return res.status(401).json({ message: 'Not authorised' })

    if (!user.twoFactor?.secret) {
      return res.status(400).json({ message: 'Start the setup again' })
    }
    if (!verifyTotp(user.twoFactor.secret, code)) {
      return res.status(400).json({ message: 'That code is not valid — check the app and try again' })
    }

    user.twoFactor.enabled = true
    user.twoFactor.enabledAt = new Date()
    await user.save()

    res.json({
      message: 'Two-factor authentication is on',
      enabled: true,
      enabledAt: user.twoFactor.enabledAt,
      user: user.toPublic(),
    })
  } catch (err) {
    next(err)
  }
})

// POST — 2FA off (password chahiye)
router.post('/2fa/disable', requireAuth, async (req, res, next) => {
  try {
    const password = String(req.body?.password ?? '')
    if (!password) return res.status(400).json({ message: 'Enter your password to turn 2FA off' })

    const user = await User.findById(req.userId).select('+password')
    if (!user) return res.status(401).json({ message: 'Not authorised' })

    const ok = await user.matchPassword(password)
    if (!ok) return res.status(401).json({ message: 'Password is incorrect' })

    user.twoFactor = { enabled: false, secret: '', enabledAt: null }
    await user.save()

    res.json({ message: 'Two-factor authentication is off', enabled: false, user: user.toPublic() })
  } catch (err) {
    next(err)
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
