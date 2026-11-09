import express from 'express'
import multer from 'multer'
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'
import HomeAboutPage from '../models/HomeAboutPage.js'

/**
 * Home page ke About book ke 3 pages (Admin → Home → About Book).
 * Routes mounted at /api/home-about.
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
    cb(null, `about-p${req.params.page}-${Date.now()}-${crypto.randomBytes(4).toString('hex')}${ext}`)
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

// ek page par 3 pictures tak (image, image2, image3)
const uploadFields = upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'image2', maxCount: 1 },
  { name: 'image3', maxCount: 1 },
])

const IMAGE_SLOTS = [
  { field: 'image', key: 'imageUrl' },
  { field: 'image2', key: 'image2Url' },
  { field: 'image3', key: 'image3Url' },
]

// GET /api/home-about — saare pages (public — Home page)
router.get('/', async (req, res, next) => {
  try {
    const pages = await HomeAboutPage.find().sort({ page: 1 })
    res.json(pages)
  } catch (err) {
    next(err)
  }
})

// PATCH /api/home-about/:page — heading / description / 3 pictures (upsert)
// multipart/form-data: heading, description, image, image2, image3 (sab optional)
router.patch('/:page', uploadFields, async (req, res, next) => {
  try {
    const pageNo = Number(req.params.page)
    if (![1, 2, 3].includes(pageNo)) {
      return res.status(400).json({ message: 'Page 1, 2 ya 3 hona chahiye' })
    }

    const update = {}
    if (req.body.heading !== undefined) update.heading = String(req.body.heading).trim()
    if (req.body.description !== undefined) {
      update.description = String(req.body.description).trim()
    }

    const files = req.files || {}
    const old = await HomeAboutPage.findOne({ page: pageNo })

    for (const slot of IMAGE_SLOTS) {
      const file = files[slot.field]?.[0]
      if (!file) continue
      update[slot.key] = `/uploads/${file.filename}`
      if (old && old[slot.key]) {
        fs.promises.unlink(path.join(UPLOADS_DIR, path.basename(old[slot.key]))).catch(() => {})
      }
    }

    const doc = await HomeAboutPage.findOneAndUpdate(
      { page: pageNo },
      { $set: update, $setOnInsert: { page: pageNo } },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    )
    res.json(doc)
  } catch (err) {
    next(err)
  }
})

// DELETE /api/home-about/:page — page reset (picture bhi delete)
router.delete('/:page', async (req, res, next) => {
  try {
    const pageNo = Number(req.params.page)
    const doc = await HomeAboutPage.findOne({ page: pageNo })
    if (!doc) return res.status(404).json({ message: 'Page nahi mila' })
    for (const slot of IMAGE_SLOTS) {
      if (doc[slot.key]) {
        fs.promises.unlink(path.join(UPLOADS_DIR, path.basename(doc[slot.key]))).catch(() => {})
      }
    }
    await doc.deleteOne()
    res.json({ message: 'Reset ho gaya', page: pageNo })
  } catch (err) {
    next(err)
  }
})

export default router
