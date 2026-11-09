import jwt from 'jsonwebtoken'

/** JWT secret — auth routes jaisa hi */
const secret = () => process.env.JWT_SECRET || 'book-river-dev-secret'

/**
 * Admin JWT check — sirf `role: 'admin'` wala token chalta hai.
 * Admin panel ki sensitive APIs (orders update, checkout settings, stats) ise use karti hain.
 */
export default function requireAdmin(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : ''
  if (!token) return res.status(401).json({ message: 'Admin login zaroori hai' })

  try {
    const payload = jwt.verify(token, secret())
    if (payload.role !== 'admin') {
      return res.status(403).json({ message: 'Sirf admin ye kaam kar sakta hai' })
    }
    req.adminId = payload.id
    return next()
  } catch {
    return res.status(401).json({ message: 'Admin session expire — dobara login karo' })
  }
}
