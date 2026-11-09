import express from 'express'
import mongoose from 'mongoose'
import Order, { ORDER_STATUSES } from '../models/Order.js'
import { optionalAuth } from '../middleware/auth.js'

/**
 * Orders API — frontend cart ka "Place order" yahan aata hai,
 * admin panel (`/orders`) se approve / reject / ship / deliver hota hai.
 *
 *   POST   /api/orders              -> naya order (guest bhi)
 *   GET    /api/orders?status=      -> saare orders (admin)
 *   GET    /api/orders/:id          -> ek order
 *   PATCH  /api/orders/:id          -> { status, statusNote } (approve/reject/…)
 *   DELETE /api/orders/:id          -> order delete
 */
const router = express.Router()

const FREE_SHIP_OVER = 999
const SHIP_FEE = 60

/** checkout ke payment methods */
const PAYMENT_METHODS = ['cod', 'card', 'easypaisa', 'jazzcash', 'bank']

/** "Rs. 1,320.50" / "1320" -> 1320.5 */
const priceOf = (value) => {
  const match = String(value ?? '').replace(/,/g, '').match(/\d+(?:\.\d+)?/)
  return match ? Number(match[0]) : 0
}

/** BR-123456 (unique) */
async function newCode() {
  for (let i = 0; i < 6; i += 1) {
    const code = `BR-${Math.floor(100000 + Math.random() * 900000)}`
    // eslint-disable-next-line no-await-in-loop
    const taken = await Order.exists({ code })
    if (!taken) return code
  }
  return `BR-${Date.now().toString().slice(-8)}`
}

/** DB document -> frontend shape */
const toPublic = (order) => ({
  id: String(order._id),
  code: order.code,
  status: order.status,
  statusNote: order.statusNote,
  customerName: order.customerName,
  customerEmail: order.customerEmail,
  customerPhone: order.customerPhone,
  address: order.address,
  note: order.note,
  items: order.items,
  itemCount: order.itemCount,
  subtotal: order.subtotal,
  shipping: order.shipping,
  total: order.total,
  payment: {
    method: order.payment?.method || 'cod',
    brand: order.payment?.brand || '',
    last4: order.payment?.last4 || '',
    mobile: order.payment?.mobile || '',
    ref: order.payment?.ref || '',
    status: order.payment?.status || 'pending',
  },
  createdAt: order.createdAt,
  updatedAt: order.updatedAt,
  decidedAt: order.decidedAt,
})

// POST — naya order (guest bhi order kar sakta hai)
router.post('/', optionalAuth, async (req, res, next) => {
  try {
    const body = req.body || {}
    const rawItems = Array.isArray(body.items) ? body.items : []

    const items = rawItems
      .map((item) => ({
        bookId: String(item?.bookId || item?.id || item?._id || '').trim(),
        title: String(item?.title || '').trim(),
        author: String(item?.author || '').trim(),
        price: String(item?.price || '').trim(),
        qty: Math.min(99, Math.max(1, Number(item?.qty) || 1)),
        image: String(item?.image || '').trim(),
        category: String(item?.category || '').trim(),
        slug: String(item?.slug || '').trim(),
      }))
      .filter((item) => item.bookId && item.title)

    if (!items.length) {
      return res.status(400).json({ message: 'Cart khali hai — kam se kam ek book chahiye' })
    }

    // paisa server par hi dobara ginte hain (client ki value par bharosa nahi)
    const subtotal = items.reduce((sum, item) => sum + priceOf(item.price) * item.qty, 0)
    const shipping = subtotal >= FREE_SHIP_OVER ? 0 : SHIP_FEE
    const itemCount = items.reduce((sum, item) => sum + item.qty, 0)

    // payment — sirf safe info (poora card number / CVV kabhi nahi)
    const rawPayment = body.payment && typeof body.payment === 'object' ? body.payment : {}
    const method = PAYMENT_METHODS.includes(String(rawPayment.method))
      ? String(rawPayment.method)
      : 'cod'
    const payment = {
      method,
      brand: String(rawPayment.brand || '').slice(0, 20),
      last4: String(rawPayment.last4 || '').replace(/\D/g, '').slice(-4),
      mobile: String(rawPayment.mobile || '').replace(/\D/g, '').slice(-11),
      ref: String(rawPayment.ref || '').slice(0, 60),
      status: 'pending',
    }

    const order = await Order.create({
      code: await newCode(),
      user: req.userId || null,
      customerName: String(body.customerName || body.name || '').trim(),
      customerEmail: String(body.customerEmail || body.email || '').trim(),
      customerPhone: String(body.customerPhone || body.phone || '').trim(),
      address: String(body.address || '').trim(),
      note: String(body.note || '').trim(),
      payment,
      items,
      itemCount,
      subtotal,
      shipping,
      total: subtotal + shipping,
      status: 'pending',
    })

    res.status(201).json(toPublic(order))
  } catch (err) {
    next(err)
  }
})

// GET — saare orders (admin), optional ?status=pending&limit=200
router.get('/', async (req, res, next) => {
  try {
    const { status } = req.query
    const limit = Math.min(500, Math.max(1, Number(req.query.limit) || 200))

    const filter = {}
    if (status && ORDER_STATUSES.includes(String(status))) filter.status = String(status)

    const orders = await Order.find(filter).sort({ createdAt: -1 }).limit(limit)
    res.json(orders.map(toPublic))
  } catch (err) {
    next(err)
  }
})

// GET — public tracking: order CODE se status (login ki zaroorat nahi)
router.get('/track/:code', async (req, res, next) => {
  try {
    const code = String(req.params.code || '').trim().toUpperCase()
    if (!code) return res.status(400).json({ message: 'Order number likho (jaise BR-123456)' })

    const order = await Order.findOne({ code })
    if (!order) return res.status(404).json({ message: `“${code}” ka koi order nahi mila` })

    res.json({
      code: order.code,
      status: order.status,
      statusNote: order.statusNote,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      decidedAt: order.decidedAt,
      customerName: order.customerName,
      itemCount: order.itemCount,
      subtotal: order.subtotal,
      shipping: order.shipping,
      total: order.total,
      payment: {
        method: order.payment?.method || 'cod',
        brand: order.payment?.brand || '',
        last4: order.payment?.last4 || '',
      },
      items: order.items.map((item) => ({
        bookId: item.bookId,
        title: item.title,
        author: item.author,
        price: item.price,
        qty: item.qty,
        image: item.image,
        category: item.category,
        slug: item.slug,
      })),
    })
  } catch (err) {
    next(err)
  }
})

// GET — ek order
router.get('/:id', async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: 'Order nahi mila' })
    }
    const order = await Order.findById(req.params.id)
    if (!order) return res.status(404).json({ message: 'Order nahi mila' })
    res.json(toPublic(order))
  } catch (err) {
    next(err)
  }
})

// PATCH — status badlo (approve / reject / ship / deliver)
router.patch('/:id', async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: 'Order nahi mila' })
    }
    const body = req.body || {}
    const status = String(body.status || '').toLowerCase()

    if (!ORDER_STATUSES.includes(status)) {
      return res.status(400).json({
        message: `Status galat hai — ye chalte hain: ${ORDER_STATUSES.join(', ')}`,
      })
    }

    const update = { status, statusNote: String(body.statusNote || '').trim() }
    if (status !== 'pending') update.decidedAt = new Date()

    const order = await Order.findByIdAndUpdate(req.params.id, { $set: update }, { new: true })
    if (!order) return res.status(404).json({ message: 'Order nahi mila' })

    res.json(toPublic(order))
  } catch (err) {
    next(err)
  }
})

// DELETE — order hatao
router.delete('/:id', async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: 'Order nahi mila' })
    }
    const removed = await Order.findByIdAndDelete(req.params.id)
    if (!removed) return res.status(404).json({ message: 'Order nahi mila' })
    res.json({ message: 'Deleted', id: req.params.id })
  } catch (err) {
    next(err)
  }
})

export default router
