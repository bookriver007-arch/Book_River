import express from 'express'
import CheckoutSettings, { CHECKOUT_DEFAULTS } from '../models/CheckoutSettings.js'
import requireAdmin from '../middleware/adminAuth.js'

/**
 * Checkout settings API (Admin → Checkout, Frontend → Cart).
 *
 *   GET /api/checkout   -> payment methods + tax / shipping (public)
 *   PUT /api/checkout   -> update (admin)
 */
const router = express.Router()

const MAX_METHODS = 10

const clean = (value, fallback = '') => String(value ?? fallback).trim()

const toNumber = (value, fallback = 0, min = 0, max = 1000000) => {
  const parsed = Number(String(value ?? '').replace(/[^0-9.]/g, ''))
  if (!Number.isFinite(parsed)) return fallback
  return Math.min(max, Math.max(min, parsed))
}

const slugify = (value) =>
  clean(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 40)

const toPublic = (doc) => ({
  paymentMethods: (doc.paymentMethods || []).map((method) => ({
    key: method.key,
    title: method.title,
    desc: method.desc,
    enabled: method.enabled !== false,
  })),
  taxEnabled: Boolean(doc.taxEnabled),
  taxLabel: doc.taxLabel || CHECKOUT_DEFAULTS.taxLabel,
  taxPercent: Number(doc.taxPercent) || 0,
  shippingFee: Number(doc.shippingFee) || 0,
  freeShippingOver: Number(doc.freeShippingOver) || 0,
  updatedAt: doc.updatedAt,
})

/** settings doc (na ho to defaults ke saath bana do) */
async function loadSettings() {
  let doc = await CheckoutSettings.findOne({ key: 'main' })
  if (!doc) doc = await CheckoutSettings.create({ key: 'main', ...CHECKOUT_DEFAULTS })
  return doc
}

// GET — public (frontend cart)
router.get('/', async (req, res, next) => {
  try {
    const doc = await loadSettings()
    res.json(toPublic(doc))
  } catch (err) {
    next(err)
  }
})

// PUT — admin update
router.put('/', requireAdmin, async (req, res, next) => {
  try {
    const body = req.body || {}
    const doc = await loadSettings()

    if (Array.isArray(body.paymentMethods)) {
      const used = new Set()
      const methods = body.paymentMethods
        .slice(0, MAX_METHODS)
        .map((method, index) => {
          const title = clean(method?.title)
          let key = slugify(method?.key || title) || `method-${index + 1}`
          while (used.has(key)) key = `${key}-${index + 1}`
          used.add(key)
          return {
            key,
            title: title || CHECKOUT_DEFAULTS.paymentMethods[0].title,
            desc: clean(method?.desc),
            enabled: method?.enabled !== false,
          }
        })
        .filter((method) => method.title)

      if (!methods.length) {
        return res.status(400).json({ message: 'Kam se kam ek payment method chahiye' })
      }
      doc.paymentMethods = methods
    }

    if (body.taxEnabled !== undefined) doc.taxEnabled = Boolean(body.taxEnabled)
    if (body.taxLabel !== undefined) doc.taxLabel = clean(body.taxLabel) || 'Tax'
    if (body.taxPercent !== undefined) doc.taxPercent = toNumber(body.taxPercent, 0, 0, 100)

    if (body.shippingFee !== undefined) doc.shippingFee = toNumber(body.shippingFee, 0, 0, 100000)
    if (body.freeShippingOver !== undefined) {
      doc.freeShippingOver = toNumber(body.freeShippingOver, 0, 0, 1000000)
    }

    await doc.save()
    res.json(toPublic(doc))
  } catch (err) {
    next(err)
  }
})

export default router
