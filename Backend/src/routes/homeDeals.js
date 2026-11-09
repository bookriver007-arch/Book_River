import express from 'express'
import multer from 'multer'
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'
import HomeDeal from '../models/HomeDeal.js'
import HomeDealSettings, { HOME_DEAL_DEFAULTS } from '../models/HomeDealSettings.js'

/**
 * Home page "Deal" section API (Admin → Home Deals page).
 * Routes mounted at /api/home-deals.
 * Description page ke products (`/api/description-admin/products`) se alag.
 */
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const UPLOADS_DIR = path.resolve(__dirname, '..', '..', 'uploads')

fs.mkdirSync(UPLOADS_DIR, { recursive: true })

const EXT_BY_MIME = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/avif': '.avif',
  'image/gif': '.gif',
  'image/svg+xml': '.svg',
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const ext = EXT_BY_MIME[file.mimetype] || path.extname(file.originalname).toLowerCase()
    cb(null, `home-deal-${Date.now()}-${crypto.randomBytes(4).toString('hex')}${ext}`)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    if (!EXT_BY_MIME[file.mimetype]) {
      return cb(new Error('Only image files are allowed (jpg, png, webp, avif, gif, svg)'))
    }
    cb(null, true)
  },
})

const router = express.Router()

const toNumber = (value) => {
  const n = Number(String(value ?? '').replace(/[^0-9.]/g, ''))
  return Number.isFinite(n) ? n : 0
}

// GET /api/home-deals — all deal cards in display order (public — Home page)
router.get('/', async (req, res, next) => {
  try {
    const deals = await HomeDeal.find().sort({ order: 1, createdAt: 1 })
    res.json(deals)
  } catch (err) {
    next(err)
  }
})

// GET /api/home-deals/settings — heading / description / offer tag (public)
router.get('/settings', async (req, res, next) => {
  try {
    const doc = await HomeDealSettings.findOne({ key: 'main' })
    res.json(doc || { key: 'main', ...HOME_DEAL_DEFAULTS })
  } catch (err) {
    next(err)
  }
})

// PATCH /api/home-deals/settings — heading / description / offer tag update
// (ye route `/:id` se PEHLE rehna chahiye, warna "settings" id samajh liya jaata hai)
router.patch('/settings', async (req, res, next) => {
  try {
    const { eyebrow, heading, description, offerTag } = req.body || {}
    const update = {}
    if (eyebrow !== undefined) update.eyebrow = String(eyebrow).trim()
    if (heading !== undefined) update.heading = String(heading).trim()
    if (description !== undefined) update.description = String(description).trim()
    if (offerTag !== undefined) update.offerTag = String(offerTag).trim()

    if (!Object.keys(update).length) {
      return res.status(400).json({ message: 'Kuch bhi update karne ko nahi mila' })
    }

    const doc = await HomeDealSettings.findOneAndUpdate(
      { key: 'main' },
      { $set: update, $setOnInsert: { key: 'main' } },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    )
    res.json(doc)
  } catch (err) {
    next(err)
  }
})

// POST /api/home-deals — add one deal (multipart/form-data: image, title, author, oldPrice, price)
router.post('/', upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Image file required (field name: "image")' })
    }
    const title = String(req.body.title || '').trim()
    if (!title) return res.status(400).json({ message: 'Title is required' })

    const oldPrice = toNumber(req.body.oldPrice)
    const price = toNumber(req.body.price)
    if (!oldPrice || !price) {
      return res.status(400).json({ message: 'Old price and new price are required' })
    }

    const count = await HomeDeal.countDocuments()
    const deal = await HomeDeal.create({
      title,
      author: String(req.body.author || '').trim(),
      imageUrl: `/uploads/${req.file.filename}`,
      oldPrice,
      price,
      order: count,
    })
    res.status(201).json(deal)
  } catch (err) {
    next(err)
  }
})

// PATCH /api/home-deals/:id — update any field / order
router.patch('/:id', async (req, res, next) => {
  try {
    const { title, author, oldPrice, price, order } = req.body || {}
    const update = {}
    if (title !== undefined) {
      const clean = String(title).trim()
      if (!clean) return res.status(400).json({ message: 'Title cannot be empty' })
      update.title = clean
    }
    if (author !== undefined) update.author = String(author).trim()
    if (oldPrice !== undefined) update.oldPrice = toNumber(oldPrice)
    if (price !== undefined) update.price = toNumber(price)
    if (order !== undefined) update.order = Number(order)

    const deal = await HomeDeal.findByIdAndUpdate(req.params.id, update, { new: true })
    if (!deal) return res.status(404).json({ message: 'Deal not found' })
    res.json(deal)
  } catch (err) {
    next(err)
  }
})

// DELETE /api/home-deals/:id — remove the card + its picture file
router.delete('/:id', async (req, res, next) => {
  try {
    const deal = await HomeDeal.findByIdAndDelete(req.params.id)
    if (!deal) return res.status(404).json({ message: 'Deal not found' })
    fs.promises.unlink(path.join(UPLOADS_DIR, path.basename(deal.imageUrl))).catch(() => {})
    res.json({ message: 'Deleted', id: deal._id })
  } catch (err) {
    next(err)
  }
})

export default router
