import express from 'express'
import crypto from 'node:crypto'
import jwt from 'jsonwebtoken'
import Admin from '../models/Admin.js'
import AdminInvite from '../models/AdminInvite.js'
import User from '../models/User.js'
import Order, { ORDER_STATUSES } from '../models/Order.js'
import DescriptionAdminBook from '../models/DescriptionAdminBook.js'
import DescriptionAdminProduct from '../models/DescriptionAdminProduct.js'
import WishlistItem from '../models/WishlistItem.js'
import requireAdmin from '../middleware/adminAuth.js'

/**
 * Admin auth + dashboard stats — mount at /api/admin.
 *   POST /api/admin/login   { email, password } -> token
 *   GET  /api/admin/me      (Bearer)  -> admin info
 *   GET  /api/admin/stats   (Bearer)  -> dashboard ke numbers
 */
const router = express.Router()

const secret = () => process.env.JWT_SECRET || 'book-river-dev-secret'
const expiresIn = () => process.env.JWT_EXPIRES_IN || '7d'

const clean = (value) => String(value ?? '').trim()

const DEFAULT_ADMIN = {
  name: process.env.ADMIN_NAME || 'Book River Admin',
  email: (process.env.ADMIN_EMAIL || 'admin@bookriver.pk').toLowerCase(),
  password: process.env.ADMIN_PASSWORD || 'admin123',
}

/** pehla admin na ho to bana do (status = approved) */
async function ensureFirstAdmin() {
  const count = await Admin.estimatedDocumentCount()
  if (count === 0) {
    await Admin.create({ ...DEFAULT_ADMIN, status: 'approved', approvedAt: new Date() })
    console.log(`👤 Default admin banaya: ${DEFAULT_ADMIN.email}`)
    return
  }

  // purana default admin (status field se pehle bana) — hamesha approved rahe
  await Admin.updateOne(
    { email: DEFAULT_ADMIN.email, status: { $ne: 'approved' } },
    { $set: { status: 'approved', approvedAt: new Date() } },
  )
}

/** team member signup sirf Gmail se */
const GMAIL_RE = /@gmail\.com$/i

const ADMIN_PANEL_URL = () => process.env.ADMIN_PANEL_URL || 'http://localhost:5174'

/** invite code (na ho to bana do) */
async function getInvite() {
  let invite = await AdminInvite.findOne({ key: 'main' })
  if (!invite) {
    invite = await AdminInvite.create({
      key: 'main',
      code: crypto.randomBytes(5).toString('hex'),
    })
  }
  return invite
}

const inviteLink = (code) => `${ADMIN_PANEL_URL()}/login?invite=${code}`

const signAdmin = (admin) =>
  jwt.sign({ id: String(admin._id), role: 'admin' }, secret(), { expiresIn: expiresIn() })

// POST — admin login
router.post('/login', async (req, res, next) => {
  try {
    await ensureFirstAdmin()

    const email = clean(req.body?.email).toLowerCase()
    const password = String(req.body?.password ?? '')
    if (!email || !password) {
      return res.status(400).json({ message: 'Email aur password dono daalo' })
    }

    const admin = await Admin.findOne({ email }).select('+password')
    if (!admin) return res.status(401).json({ message: 'Email ya password galat hai' })

    const ok = await admin.matchPassword(password)
    if (!ok) return res.status(401).json({ message: 'Email ya password galat hai' })

    // approval ka intezar
    if (admin.status === 'pending') {
      return res.status(403).json({
        message: 'Access pending hai — jis admin ne aapko add kiya hai wo approve karega',
        status: 'pending',
      })
    }
    if (admin.status === 'blocked') {
      return res.status(403).json({ message: 'Aapka access band kar diya gaya hai', status: 'blocked' })
    }

    admin.lastLoginAt = new Date()
    await admin.save()

    res.json({ message: 'Welcome back!', token: signAdmin(admin), admin: admin.toPublic() })
  } catch (err) {
    next(err)
  }
})

// GET — kaun admin login hai
router.get('/me', requireAdmin, async (req, res, next) => {
  try {
    const admin = await Admin.findById(req.adminId)
    if (!admin) return res.status(401).json({ message: 'Admin nahi mila' })
    res.json({ admin: admin.toPublic() })
  } catch (err) {
    next(err)
  }
})

// POST — team member sign up (sirf Gmail) → status pending
router.post('/signup', async (req, res, next) => {
  try {
    await ensureFirstAdmin()

    const name = clean(req.body?.name) || 'Team Member'
    const email = clean(req.body?.email).toLowerCase()
    const password = String(req.body?.password ?? '')
    const invite = clean(req.body?.invite)

    if (!GMAIL_RE.test(email)) {
      return res.status(400).json({ message: 'Sirf Gmail (…@gmail.com) se sign up ho sakta hai' })
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password kam se kam 6 characters ka ho' })
    }

    const exists = await Admin.findOne({ email })
    if (exists) {
      return res.status(409).json({ message: 'Ye Gmail pehle se registered hai — login karo' })
    }

    const admin = await Admin.create({
      name,
      email,
      password,
      status: 'pending',
      inviteCode: invite,
    })

    res.status(201).json({
      message: 'Sign up ho gaya — ab admin ki approval ka intezar karo',
      status: 'pending',
      admin: admin.toPublic(),
    })
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({ message: 'Ye Gmail pehle se registered hai — login karo' })
    }
    next(err)
  }
})

// GET — invite link (share karne ke liye)
router.get('/invite', requireAdmin, async (req, res, next) => {
  try {
    const invite = await getInvite()
    res.json({ code: invite.code, link: inviteLink(invite.code), createdAt: invite.createdAt })
  } catch (err) {
    next(err)
  }
})

// POST — naya invite code banao (purana link band)
router.post('/invite/regenerate', requireAdmin, async (req, res, next) => {
  try {
    const invite = await getInvite()
    invite.code = crypto.randomBytes(5).toString('hex')
    invite.createdBy = String(req.adminId || '')
    await invite.save()
    res.json({ code: invite.code, link: inviteLink(invite.code), createdAt: invite.createdAt })
  } catch (err) {
    next(err)
  }
})

// GET — approval ke intezar wale admins
router.get('/requests', requireAdmin, async (req, res, next) => {
  try {
    const pending = await Admin.find({ status: 'pending' }).sort({ createdAt: 1 })
    res.json(pending.map((admin) => admin.toPublic()))
  } catch (err) {
    next(err)
  }
})

// PATCH — approve / reject / block
router.patch('/requests/:id', requireAdmin, async (req, res, next) => {
  try {
    const action = clean(req.body?.action).toLowerCase()
    if (!['approve', 'reject', 'block', 'unblock'].includes(action)) {
      return res.status(400).json({ message: 'Action galat hai (approve / reject / block)' })
    }

    const admin = await Admin.findById(req.params.id)
    if (!admin) return res.status(404).json({ message: 'Admin nahi mila' })

    if (action === 'approve') {
      admin.status = 'approved'
      admin.approvedAt = new Date()
      admin.approvedBy = String(req.adminId || '')
    } else if (action === 'reject' || action === 'block') {
      admin.status = 'blocked'
    } else {
      admin.status = 'approved'
    }

    await admin.save()
    res.json({ message: `Access ${admin.status}`, admin: admin.toPublic() })
  } catch (err) {
    next(err)
  }
})

// GET — saare admins (approved + pending + blocked)
router.get('/admins', requireAdmin, async (req, res, next) => {
  try {
    const admins = await Admin.find().sort({ createdAt: -1 }).limit(100)
    res.json(admins.map((admin) => admin.toPublic()))
  } catch (err) {
    next(err)
  }
})

// GET — dashboard ke numbers
router.get('/stats', requireAdmin, async (req, res, next) => {
  try {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

    const [
      users,
      newUsers,
      orders,
      pending,
      approved,
      shipped,
      delivered,
      rejected,
      revenueRows,
      books,
      products,
      wishlist,
      recentOrders,
      recentUsers,
      admins,
      pendingAdmins,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ createdAt: { $gte: weekAgo } }),
      Order.countDocuments(),
      Order.countDocuments({ status: 'pending' }),
      Order.countDocuments({ status: 'approved' }),
      Order.countDocuments({ status: 'shipped' }),
      Order.countDocuments({ status: 'delivered' }),
      Order.countDocuments({ status: 'rejected' }),
      Order.find({ status: { $in: ['approved', 'shipped', 'delivered'] } }).select('total'),
      DescriptionAdminBook.countDocuments(),
      DescriptionAdminProduct.countDocuments(),
      WishlistItem.countDocuments(),
      Order.find().sort({ createdAt: -1 }).limit(6),
      User.find().sort({ createdAt: -1 }).limit(5).select('name email createdAt'),
      Admin.countDocuments(),
      Admin.countDocuments({ status: 'pending' }),
    ])

    const revenue = revenueRows.reduce((sum, row) => sum + (Number(row.total) || 0), 0)

    res.json({
      counts: {
        users,
        newUsers,
        orders,
        pending,
        approved,
        shipped,
        delivered,
        rejected,
        books,
        products,
        wishlist,
        admins,
        pendingAdmins,
        revenue,
        statuses: ORDER_STATUSES.length,
      },
      recentOrders: recentOrders.map((order) => ({
        id: String(order._id),
        code: order.code,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        itemCount: order.itemCount,
        total: order.total,
        status: order.status,
        payment: order.payment?.method || 'cod',
        createdAt: order.createdAt,
      })),
      recentUsers: recentUsers.map((user) => ({
        id: String(user._id),
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      })),
      generatedAt: new Date().toISOString(),
    })
  } catch (err) {
    next(err)
  }
})

// DELETE — admin ka access record delete karo
router.delete('/requests/:id', requireAdmin, async (req, res, next) => {
  try {
    if (String(req.adminId) === String(req.params.id)) {
      return res.status(400).json({ message: 'Khud ko delete nahi kar sakte' })
    }
    const removed = await Admin.findByIdAndDelete(req.params.id)
    if (!removed) return res.status(404).json({ message: 'Admin nahi mila' })
    res.json({ message: 'Admin access hata diya', id: req.params.id })
  } catch (err) {
    next(err)
  }
})

export default router
