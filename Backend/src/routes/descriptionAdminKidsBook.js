import express from 'express'
import multer from 'multer'
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'
import DescriptionAdminKidsBook from '../models/DescriptionAdminKidsBook.js'

/**
 * Description page kids-book cover (Admin → DescriptionAdmin page).
 * Routes mounted at /api/description-admin/kids-book.
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
    cb(null, `kidsbook-${Date.now()}-${crypto.randomBytes(4).toString('hex')}${ext}`)
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

// GET — the current kids book cover (public — used by the Frontend)
router.get('/', async (req, res, next) => {
  try {
    const book = await DescriptionAdminKidsBook.findOne().sort({ createdAt: -1 })
    res.json(book || null)
  } catch (err) {
    next(err)
  }
})

// POST — upload a new cover (replaces the old one)
router.post('/', upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Image file required (field name: "image")' })
    const old = await DescriptionAdminKidsBook.findOne().sort({ createdAt: -1 })
    if (old) {
      fs.promises.unlink(path.join(UPLOADS_DIR, path.basename(old.imageUrl))).catch(() => {})
      await old.deleteOne()
    }
    const book = await DescriptionAdminKidsBook.create({
      title: String(req.body.title || '').trim(),
      imageUrl: `/uploads/${req.file.filename}`,
    })
    res.status(201).json(book)
  } catch (err) {
    next(err)
  }
})

// PATCH — update the caption only
router.patch('/', async (req, res, next) => {
  try {
    const book = await DescriptionAdminKidsBook.findOne().sort({ createdAt: -1 })
    if (!book) return res.status(404).json({ message: 'No kids book uploaded yet' })
    if (req.body.title !== undefined) book.title = String(req.body.title).trim()
    await book.save()
    res.json(book)
  } catch (err) {
    next(err)
  }
})

// DELETE — remove the card (cover image + file)
router.delete('/', async (req, res, next) => {
  try {
    const book = await DescriptionAdminKidsBook.findOne().sort({ createdAt: -1 })
    if (!book) return res.status(404).json({ message: 'No kids book uploaded yet' })
    fs.promises.unlink(path.join(UPLOADS_DIR, path.basename(book.imageUrl))).catch(() => {})
    await book.deleteOne()
    res.json({ message: 'Deleted' })
  } catch (err) {
    next(err)
  }
})

export default router
