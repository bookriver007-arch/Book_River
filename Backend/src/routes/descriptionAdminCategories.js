import express from 'express'
import DescriptionAdminCategory from '../models/DescriptionAdminCategory.js'

/**
 * Description page category ribbon boxes (Admin → DescriptionAdmin page).
 * Routes mounted at /api/description-admin/categories.
 */
const router = express.Router()

// GET — all category boxes in display order (public — used by the Frontend)
router.get('/', async (req, res, next) => {
  try {
    const categories = await DescriptionAdminCategory.find().sort({ order: 1, createdAt: 1 })
    res.json(categories)
  } catch (err) {
    next(err)
  }
})

// POST — add one box { name }
router.post('/', async (req, res, next) => {
  try {
    const name = String(req.body?.name || '').trim()
    if (!name) return res.status(400).json({ message: 'Name is required' })
    const count = await DescriptionAdminCategory.countDocuments()
    const category = await DescriptionAdminCategory.create({ name, order: count })
    res.status(201).json(category)
  } catch (err) {
    next(err)
  }
})

// PATCH /:id — rename and/or reorder
router.patch('/:id', async (req, res, next) => {
  try {
    const { name, order } = req.body || {}
    const update = {}
    if (name !== undefined) {
      const clean = String(name).trim()
      if (!clean) return res.status(400).json({ message: 'Name cannot be empty' })
      update.name = clean
    }
    if (order !== undefined) update.order = Number(order)
    const category = await DescriptionAdminCategory.findByIdAndUpdate(req.params.id, update, {
      new: true,
    })
    if (!category) return res.status(404).json({ message: 'Category not found' })
    res.json(category)
  } catch (err) {
    next(err)
  }
})

// DELETE /:id — remove one box
router.delete('/:id', async (req, res, next) => {
  try {
    const category = await DescriptionAdminCategory.findByIdAndDelete(req.params.id)
    if (!category) return res.status(404).json({ message: 'Category not found' })
    res.json({ message: 'Deleted', id: category._id })
  } catch (err) {
    next(err)
  }
})

export default router
