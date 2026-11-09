import express from 'express'
import multer from 'multer'
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'
import HomeHangingBook from '../models/HomeHangingBook.js'

/**
 * Home page ki latakti kitaab (hanging book) — ek hi cover.
 * Routes mounted at /api/home-hanging-book.
 * Description page ki kids-book (`/api/description-admin/kids-book`) se alag.
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
    cb(null, `home-hanging-${Date.now()}-${crypto.randomBytes(4).toString('hex')}${ext}`)
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

// GET — current hanging book cover (public — Home page)
router.get('/', async (req, res, next) => {
  try {
    const book = await HomeHangingBook.findOne().sort({ createdAt: -1 })
    res.json(book || null)
  } catch (err) {
    next(err)
  }
})

// POST — naya cover upload (purana replace ho jaata hai)
router.post('/', upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Image file required (field name: "image")' })
    }
    const old = await HomeHangingBook.findOne().sort({ createdAt: -1 })
    if (old) {
      fs.promises.unlink(path.join(UPLOADS_DIR, path.basename(old.imageUrl))).catch(() => {})
      await old.deleteOne()
    }
    const book = await HomeHangingBook.create({
      title: String(req.body.title || '').trim(),
      imageUrl: `/uploads/${req.file.filename}`,
    })
    res.status(201).json(book)
  } catch (err) {
    next(err)
  }
})

// PATCH — caption (title) update
router.patch('/', async (req, res, next) => {
  try {
    const book = await HomeHangingBook.findOne().sort({ createdAt: -1 })
    if (!book) return res.status(404).json({ message: 'Abhi koi cover upload nahi hua' })
    if (req.body.title !== undefined) book.title = String(req.body.title).trim()
    await book.save()
    res.json(book)
  } catch (err) {
    next(err)
  }
})

// DELETE — cover hatao (file bhi delete)
router.delete('/', async (req, res, next) => {
  try {
    const book = await HomeHangingBook.findOne().sort({ createdAt: -1 })
    if (!book) return res.status(404).json({ message: 'Abhi koi cover upload nahi hua' })
    fs.promises.unlink(path.join(UPLOADS_DIR, path.basename(book.imageUrl))).catch(() => {})
    await book.deleteOne()
    res.json({ message: 'Deleted' })
  } catch (err) {
    next(err)
  }
})

export default router
