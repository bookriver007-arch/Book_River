import express from 'express'
import multer from 'multer'
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'
import DescriptionAdmin from '../models/DescriptionAdmin.js'

/**
 * Description page slideshow API (Admin → DescriptionAdmin page).
 * Routes mounted at /api/description-admin.
 */
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const UPLOADS_DIR = path.resolve(__dirname, '..', '..', 'uploads')

// Make sure the folder exists so multer can write into it.
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
    cb(null, `slide-${Date.now()}-${crypto.randomBytes(4).toString('hex')}${ext}`)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    if (!EXT_BY_MIME[file.mimetype]) return cb(new Error('Only image files are allowed (jpg, png, webp, avif, gif, svg)'))
    cb(null, true)
  },
})

const router = express.Router()

// GET /api/description-admin — all pictures in display order (public — used by the Frontend)
router.get('/', async (req, res, next) => {
  try {
    const slides = await DescriptionAdmin.find().sort({ order: 1, createdAt: 1 })
    res.json(slides)
  } catch (err) {
    next(err)
  }
})

// POST /api/description-admin — upload one picture (multipart/form-data: image, optional title)
router.post('/', upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Image file required (field name: "image")' })
    const count = await DescriptionAdmin.countDocuments()
    const slide = await DescriptionAdmin.create({
      title: (req.body.title || '').trim(),
      imageUrl: `/uploads/${req.file.filename}`,
      order: count,
    })
    res.status(201).json(slide)
  } catch (err) {
    next(err)
  }
})

// PATCH /api/description-admin/:id — update title and/or order
router.patch('/:id', async (req, res, next) => {
  try {
    const { title, order } = req.body || {}
    const slide = await DescriptionAdmin.findByIdAndUpdate(
      req.params.id,
      {
        ...(title !== undefined ? { title: String(title).trim() } : {}),
        ...(order !== undefined ? { order: Number(order) } : {}),
      },
      { new: true },
    )
    if (!slide) return res.status(404).json({ message: 'Slide not found' })
    res.json(slide)
  } catch (err) {
    next(err)
  }
})

// DELETE /api/description-admin/:id — remove the slide + its picture file
router.delete('/:id', async (req, res, next) => {
  try {
    const slide = await DescriptionAdmin.findByIdAndDelete(req.params.id)
    if (!slide) return res.status(404).json({ message: 'Slide not found' })
    fs.promises.unlink(path.join(UPLOADS_DIR, path.basename(slide.imageUrl))).catch(() => {})
    res.json({ message: 'Deleted', id: slide._id })
  } catch (err) {
    next(err)
  }
})

export default router
