import express from 'express'
import multer from 'multer'
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'
import DescriptionAdminProduct from '../models/DescriptionAdminProduct.js'

/**
 * Products grid (Admin → DescriptionAdmin page).
 * Routes mounted at /api/description-admin/products.
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
    cb(null, `product-${Date.now()}-${crypto.randomBytes(4).toString('hex')}${ext}`)
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

// GET — all products in display order (public — used by the Frontend)
router.get('/', async (req, res, next) => {
  try {
    const products = await DescriptionAdminProduct.find().sort({ order: 1, createdAt: 1 })
    res.json(products)
  } catch (err) {
    next(err)
  }
})

// POST — add one product (multipart/form-data: image, title, price?, author?, tag?, description?)
router.post('/', upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Image file required (field name: "image")' })
    const title = clean(req.body.title)
    if (!title) return res.status(400).json({ message: 'Title is required' })
    const count = await DescriptionAdminProduct.countDocuments()
    const product = await DescriptionAdminProduct.create({
      title,
      author: clean(req.body.author),
      tag: clean(req.body.tag),
      price: clean(req.body.price),
      description: clean(req.body.description),
      imageUrl: `/uploads/${req.file.filename}`,
      order: count,
    })
    res.status(201).json(product)
  } catch (err) {
    next(err)
  }
})

// PATCH /:id — update text fields and/or order
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
    const product = await DescriptionAdminProduct.findByIdAndUpdate(req.params.id, update, {
      new: true,
    })
    if (!product) return res.status(404).json({ message: 'Product not found' })
    res.json(product)
  } catch (err) {
    next(err)
  }
})

// DELETE /:id — remove the product + its picture file
router.delete('/:id', async (req, res, next) => {
  try {
    const product = await DescriptionAdminProduct.findByIdAndDelete(req.params.id)
    if (!product) return res.status(404).json({ message: 'Product not found' })
    fs.promises.unlink(path.join(UPLOADS_DIR, path.basename(product.imageUrl))).catch(() => {})
    res.json({ message: 'Deleted', id: product._id })
  } catch (err) {
    next(err)
  }
})

export default router
