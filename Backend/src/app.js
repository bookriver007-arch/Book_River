import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import mongoose from 'mongoose'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import connectDB, { dbStatus } from './config/db.js'
import authRouter from './routes/auth.js'
import descriptionAdminRouter from './routes/descriptionAdmin.js'
import descriptionAdminCategoryRouter from './routes/descriptionAdminCategories.js'
import descriptionAdminBooksRouter from './routes/descriptionAdminBooks.js'
import descriptionAdminKidsBookRouter from './routes/descriptionAdminKidsBook.js'
import descriptionAdminFramesRouter from './routes/descriptionAdminFrames.js'
import descriptionAdminProductsRouter from './routes/descriptionAdminProducts.js'
import descriptionAdminReviewsRouter from './routes/descriptionAdminReviews.js'
import homeSlidesRouter from './routes/homeSlides.js'
import homeDealsRouter from './routes/homeDeals.js'
import homeCategoryBooksRouter from './routes/homeCategoryBooks.js'
import homeHangingBookRouter from './routes/homeHangingBook.js'
import homeAboutRouter from './routes/homeAbout.js'
import wishlistRouter from './routes/wishlist.js'
import ordersRouter from './routes/orders.js'
import checkoutRouter from './routes/checkout.js'
import adminAuthRouter from './routes/adminAuth.js'

dotenv.config()

const baseDir = path.dirname(fileURLToPath(import.meta.url))

const app = express()

// ---- Middleware ----
app.use(cors({ origin: process.env.CLIENT_URLS?.split(',') || '*', credentials: true }))
app.use(express.json({ limit: '2mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(morgan('dev'))
app.use(
  '/api',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
  }),
)

// ---- Static: pictures uploaded from the Admin panel ----
app.use('/uploads', express.static(path.resolve(baseDir, '..', 'uploads')))

// ---- Routes ----
app.use('/api/auth', authRouter)
app.use('/api/description-admin/categories', descriptionAdminCategoryRouter)
app.use('/api/description-admin/books', descriptionAdminBooksRouter)
app.use('/api/description-admin/kids-book', descriptionAdminKidsBookRouter)
app.use('/api/description-admin/frames', descriptionAdminFramesRouter)
app.use('/api/description-admin/products', descriptionAdminProductsRouter)
app.use('/api/description-admin/reviews', descriptionAdminReviewsRouter)
// Home page ka apna slideshow (Description ke slides se alag collection)
app.use('/api/home-slides', homeSlidesRouter)
// Home page ka "Deal" section (alag collection)
app.use('/api/home-deals', homeDealsRouter)
// Home page ke category sections ki books (alag collection)
app.use('/api/home-category-books', homeCategoryBooksRouter)
// Home page ki latakti kitaab (hanging book) — apna alag cover
app.use('/api/home-hanging-book', homeHangingBookRouter)
// Home page ka About book (3 pages: heading / description / picture)
app.use('/api/home-about', homeAboutRouter)
// User ki wishlist (login zaroori — MongoDB me save hoti hai)
app.use('/api/wishlist', wishlistRouter)
// Orders — cart ka "Place order" + admin approve/reject/ship/deliver
app.use('/api/orders', ordersRouter)
app.use('/api/checkout', checkoutRouter)
app.use('/api/admin', adminAuthRouter)
app.use('/api/description-admin', descriptionAdminRouter)

app.get('/api/health', (req, res) => {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting']
  const state = dbStatus()
  res.json({
    status: 'ok',
    service: 'Book River API',
    db: {
      state,
      connected: state === 1,
      name: mongoose.connection.name || null,
    },
    time: new Date().toISOString(),
  })
})

// ---- Error handler ----
app.use((err, req, res, next) => {
  console.error(err)
  res.status(err.status || 500).json({ message: err.message || 'Server Error' })
})

// ---- DB connect ----
connectDB()

export default app
