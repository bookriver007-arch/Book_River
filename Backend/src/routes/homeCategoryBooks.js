import express from 'express'
import multer from 'multer'
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'
import HomeCategoryBook from '../models/HomeCategoryBook.js'

/**
 * Home page ke category sections ke books (Admin → Home → Category Books).
 * Routes mounted at /api/home-category-books.
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
    cb(null, `cat-book-${Date.now()}-${crypto.randomBytes(4).toString('hex')}${ext}`)
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

// GET /api/home-category-books — saari books (public — Home page)
router.get('/', async (req, res, next) => {
  try {
    const filter = req.query.slug ? { slug: String(req.query.slug) } : {}
    const books = await HomeCategoryBook.find(filter).sort({ slug: 1, order: 1, createdAt: 1 })
    res.json(books)
  } catch (err) {
    next(err)
  }
})

// POST /api/home-category-books — nayi book (multipart: image, slug, title, author, price)
router.post('/', upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Image file required (field name: "image")' })
    }
    const slug = String(req.body.slug || '').trim()
    const title = String(req.body.title || '').trim()
    if (!slug) return res.status(400).json({ message: 'Category (slug) is required' })
    if (!title) return res.status(400).json({ message: 'Book title is required' })

    const count = await HomeCategoryBook.countDocuments({ slug })
    const book = await HomeCategoryBook.create({
      slug,
      title,
      author: String(req.body.author || '').trim(),
      price: String(req.body.price || '').trim(),
      description: String(req.body.description || '').trim(),
      imageUrl: `/uploads/${req.file.filename}`,
      order: count,
    })
    res.status(201).json(book)
  } catch (err) {
    next(err)
  }
})

// PATCH /api/home-category-books/:id — title / author / price / order / slug
router.patch('/:id', async (req, res, next) => {
  try {
    const { title, author, price, description, order, slug } = req.body || {}
    const update = {}
    if (title !== undefined) {
      const clean = String(title).trim()
      if (!clean) return res.status(400).json({ message: 'Title cannot be empty' })
      update.title = clean
    }
    if (author !== undefined) update.author = String(author).trim()
    if (price !== undefined) update.price = String(price).trim()
    if (description !== undefined) update.description = String(description).trim()
    if (slug !== undefined) update.slug = String(slug).trim()
    if (order !== undefined) update.order = Number(order)

    const book = await HomeCategoryBook.findByIdAndUpdate(req.params.id, update, { new: true })
    if (!book) return res.status(404).json({ message: 'Book not found' })
    res.json(book)
  } catch (err) {
    next(err)
  }
})

// DELETE /api/home-category-books/:id — book + uski picture file
router.delete('/:id', async (req, res, next) => {
  try {
    const book = await HomeCategoryBook.findByIdAndDelete(req.params.id)
    if (!book) return res.status(404).json({ message: 'Book not found' })
    fs.promises.unlink(path.join(UPLOADS_DIR, path.basename(book.imageUrl))).catch(() => {})
    res.json({ message: 'Deleted', id: book._id })
  } catch (err) {
    next(err)
  }
})

export default router
