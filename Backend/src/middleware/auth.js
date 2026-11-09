import jwt from 'jsonwebtoken'

/** JWT secret — auth routes jaisa hi */
const secret = () => process.env.JWT_SECRET || 'book-river-dev-secret'

/**
 * Bearer token check — sahi token par `req.userId` set karta hai.
 * Wishlist jaisi user-specific API ise use karti hain.
 */
export default function requireAuth(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : ''
  if (!token) return res.status(401).json({ message: 'Please login first' })

  try {
    const payload = jwt.verify(token, secret())
    req.userId = payload.id
    return next()
  } catch {
    return res.status(401).json({ message: 'Session expired — please login again' })
  }
}

/**
 * Guest ko bhi allowed rakhta hai — token ho to user id set kar deta hai,
 * warna chupchaap aage badh jaata hai (jaise "Place order" bina login).
 */
export function optionalAuth(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : ''
  if (token) {
    try {
      req.userId = jwt.verify(token, secret()).id
    } catch {
      // token galat/expire -> guest ki tarah treat karo
    }
  }
  return next()
}

