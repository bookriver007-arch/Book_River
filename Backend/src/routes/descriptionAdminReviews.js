import express from 'express'
import DescriptionAdminReview from '../models/DescriptionAdminReview.js'

/**
 * Reviews slider (Admin → DescriptionAdmin page).
 * Routes mounted at /api/description-admin/reviews.
 */
const router = express.Router()

const clean = (v) => String(v ?? '').trim()

const clampRating = (v) => {
  const n = Number(v)
  if (Number.isNaN(n)) return 5
  return Math.min(5, Math.max(1, Math.round(n)))
}

// GET — all reviews in display order (public — used by the Frontend)
router.get('/', async (req, res, next) => {
  try {
    const reviews = await DescriptionAdminReview.find().sort({ order: 1, createdAt: 1 })
    res.json(reviews)
  } catch (err) {
    next(err)
  }
})

// POST — add one review { name, rating, text }
router.post('/', async (req, res, next) => {
  try {
    const name = clean(req.body?.name)
    const text = clean(req.body?.text)
    if (!name) return res.status(400).json({ message: 'Name is required' })
    if (!text) return res.status(400).json({ message: 'Review text is required' })
    const count = await DescriptionAdminReview.countDocuments()
    const review = await DescriptionAdminReview.create({
      name,
      rating: clampRating(req.body?.rating),
      text,
      order: count,
    })
    res.status(201).json(review)
  } catch (err) {
    next(err)
  }
})

// PATCH /:id — update name / rating / text / order
router.patch('/:id', async (req, res, next) => {
  try {
    const { name, rating, text, order } = req.body || {}
    const update = {}
    if (name !== undefined) {
      const n = clean(name)
      if (!n) return res.status(400).json({ message: 'Name cannot be empty' })
      update.name = n
    }
    if (text !== undefined) {
      const t = clean(text)
      if (!t) return res.status(400).json({ message: 'Text cannot be empty' })
      update.text = t
    }
    if (rating !== undefined) update.rating = clampRating(rating)
    if (order !== undefined) update.order = Number(order)
    const review = await DescriptionAdminReview.findByIdAndUpdate(req.params.id, update, {
      new: true,
    })
    if (!review) return res.status(404).json({ message: 'Review not found' })
    res.json(review)
  } catch (err) {
    next(err)
  }
})

// DELETE /:id
router.delete('/:id', async (req, res, next) => {
  try {
    const review = await DescriptionAdminReview.findByIdAndDelete(req.params.id)
    if (!review) return res.status(404).json({ message: 'Review not found' })
    res.json({ message: 'Deleted', id: review._id })
  } catch (err) {
    next(err)
  }
})

export default router
