import express from 'express'
import multer from 'multer'
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'
import DescriptionAdminFrame from '../models/DescriptionAdminFrame.js'

/**
 * Description page hanging-frame gallery (Admin → DescriptionAdmin page).
 * Routes mounted at /api/description-admin/frames.
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
    cb(null, `frame-${Date.now()}-${crypto.randomBytes(4).toString('hex')}${ext}`)
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

// GET — all frames in display order (public — used by the Frontend)
router.get('/', async (req, res, next) => {
  try {
    const frames = await DescriptionAdminFrame.find().sort({ order: 1, createdAt: 1 })
    res.json(frames)
  } catch (err) {
    next(err)
  }
})

// POST — add one frame (multipart/form-data: image)
router.post('/', upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Image file required (field name: "image")' })
    const count = await DescriptionAdminFrame.countDocuments()
    const frame = await DescriptionAdminFrame.create({
      imageUrl: `/uploads/${req.file.filename}`,
      order: count,
    })
    res.status(201).json(frame)
  } catch (err) {
    next(err)
  }
})

// PATCH /:id — update order
router.patch('/:id', async (req, res, next) => {
  try {
    const { order } = req.body || {}
    const frame = await DescriptionAdminFrame.findByIdAndUpdate(
      req.params.id,
      order !== undefined ? { order: Number(order) } : {},
      { new: true },
    )
    if (!frame) return res.status(404).json({ message: 'Frame not found' })
    res.json(frame)
  } catch (err) {
    next(err)
  }
})

// DELETE /:id — remove the frame + its picture file
router.delete('/:id', async (req, res, next) => {
  try {
    const frame = await DescriptionAdminFrame.findByIdAndDelete(req.params.id)
    if (!frame) return res.status(404).json({ message: 'Frame not found' })
    fs.promises.unlink(path.join(UPLOADS_DIR, path.basename(frame.imageUrl))).catch(() => {})
    res.json({ message: 'Deleted', id: frame._id })
  } catch (err) {
    next(err)
  }
})

export default router
