import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'
import connectDB from './config/db.js'

dotenv.config()

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

// ---- Routes (add apne yahan) ----
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Book River API', time: new Date().toISOString() })
})

// ---- Error handler ----
app.use((err, req, res, next) => {
  console.error(err)
  res.status(err.status || 500).json({ message: err.message || 'Server Error' })
})

// ---- DB connect ----
connectDB()

export default app
