import express from 'express'
import requireAuth from '../middleware/auth.js'
import WishlistItem from '../models/WishlistItem.js'

/**
 * Wishlist API — user ke hisaab se MongoDB me save.
 * Routes mounted at /api/wishlist (sab routes par login zaroori).
 *   GET    /api/wishlist                -> meri wishlist
 *   POST   /api/wishlist   { ...book }  -> add (duplicate ignore)
 *   DELETE /api/wishlist/:bookId        -> ek book hatao
 *   DELETE /api/wishlist                -> sab clear
 */
const router = express.Router()

router.use(requireAuth)

/** DB document -> frontend shape */
const toPublic = (item) => ({
  id: item.bookId,
  title: item.title,
  author: item.author,
  price: item.price,
  image: item.image,
  category: item.category,
  slug: item.slug,
})

// GET — meri wishlist (naye pehle)
router.get('/', async (req, res, next) => {
  try {
    const items = await WishlistItem.find({ user: req.userId }).sort({ createdAt: -1 })
    res.json(items.map(toPublic))
  } catch (err) {
    next(err)
  }
})

// POST — book save karo
router.post('/', async (req, res, next) => {
  try {
    const body = req.body || {}
    const bookId = String(body.id || body.bookId || '').trim()
    const title = String(body.title || '').trim()
    if (!bookId) return res.status(400).json({ message: 'Book id is required' })
    if (!title) return res.status(400).json({ message: 'Book title is required' })

    const item = await WishlistItem.findOneAndUpdate(
      { user: req.userId, bookId },
      {
        $setOnInsert: {
          user: req.userId,
          bookId,
          title,
          author: String(body.author || '').trim(),
          price: String(body.price || '').trim(),
          image: String(body.image || '').trim(),
          category: String(body.category || '').trim(),
          slug: String(body.slug || '').trim(),
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    )

    res.status(201).json(toPublic(item))
  } catch (err) {
    next(err)
  }
})

// DELETE — ek book wishlist se hatao
router.delete('/:bookId', async (req, res, next) => {
  try {
    const bookId = decodeURIComponent(req.params.bookId)
    const removed = await WishlistItem.findOneAndDelete({ user: req.userId, bookId })
    if (!removed) return res.status(404).json({ message: 'Ye book wishlist me nahi hai' })
    res.json({ message: 'Removed', id: bookId })
  } catch (err) {
    next(err)
  }
})

// DELETE — poori wishlist clear
router.delete('/', async (req, res, next) => {
  try {
    const result = await WishlistItem.deleteMany({ user: req.userId })
    res.json({ message: 'Cleared', deleted: result.deletedCount || 0 })
  } catch (err) {
    next(err)
  }
})

export default router
