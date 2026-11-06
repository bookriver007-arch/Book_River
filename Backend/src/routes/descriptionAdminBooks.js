import express from 'express'
import multer from 'multer'
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'
import DescriptionAdminBook from '../models/DescriptionAdminBook.js'

/**
 * Description page open-book pages (Admin → DescriptionAdmin page).
 * Routes mounted at /api/description-admin/books.
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
    cb(null, `book-${Date.now()}-${crypto.randomBytes(4).toString('hex')}${ext}`)
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

const clean = (v) => String(v ?? '').trim()

// GET — all book pages in display order (public — used by the Frontend)
router.get('/', async (req, res, next) => {
  try {
    const books = await DescriptionAdminBook.find().sort({ order: 1, createdAt: 1 })
    res.json(books)
  } catch (err) {
    next(err)
  }
})

// POST — add one book page (multipart/form-data: image, title, author?, tag?, description?)
router.post('/', upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Image file required (field name: "image")' })
    const title = clean(req.body.title)
    if (!title) return res.status(400).json({ message: 'Title (heading) is required' })
    const count = await DescriptionAdminBook.countDocuments()
    const book = await DescriptionAdminBook.create({
      title,
      author: clean(req.body.author),
      tag: clean(req.body.tag),
      price: clean(req.body.price),
      description: clean(req.body.description),
      imageUrl: `/uploads/${req.file.filename}`,
      order: count,
    })
    res.status(201).json(book)
  } catch (err) {
    next(err)
  }
})

// PATCH /:id — update any text field and/or order
router.patch('/:id', async (req, res, next) => {
  try {
    const { title, author, tag, price, description, order } = req.body || {}
    const update = {}
    if (title !== undefined) {
      const t = clean(title)
      if (!t) return res.status(400).json({ message: 'Title cannot be empty' })
      update.title = t
    }
    if (author !== undefined) update.author = clean(author)
    if (tag !== undefined) update.tag = clean(tag)
    if (price !== undefined) update.price = clean(price)
    if (description !== undefined) update.description = clean(description)
    if (order !== undefined) update.order = Number(order)
    const book = await DescriptionAdminBook.findByIdAndUpdate(req.params.id, update, { new: true })
    if (!book) return res.status(404).json({ message: 'Book page not found' })
    res.json(book)
  } catch (err) {
    next(err)
  }
})

// DELETE /:id — remove the book page + its picture file
router.delete('/:id', async (req, res, next) => {
  try {
    const book = await DescriptionAdminBook.findByIdAndDelete(req.params.id)
    if (!book) return res.status(404).json({ message: 'Book page not found' })
    fs.promises.unlink(path.join(UPLOADS_DIR, path.basename(book.imageUrl))).catch(() => {})
    res.json({ message: 'Deleted', id: book._id })
  } catch (err) {
    next(err)
  }
})

export default router
