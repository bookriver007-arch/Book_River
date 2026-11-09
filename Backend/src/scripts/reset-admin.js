import 'dotenv/config'
import mongoose from 'mongoose'
import connectDB from '../config/db.js'
import Admin from '../models/Admin.js'

/**
 * Owner (admin) ka login set / reset karta hai.
 *
 *   npm run admin:reset              -> env/default se set karega
 *   npm run admin:reset -- mein@gmail.com meraPass123
 *
 * Email/password na do to Backend/.env ke ADMIN_EMAIL / ADMIN_PASSWORD
 * (warna default admin@bookriver.pk / admin123) use hote hain.
 * Account ban jata hai aur status hamesha "approved" hota hai.
 */
const DEFAULT_EMAIL = (process.env.ADMIN_EMAIL || 'admin@bookriver.pk').toLowerCase()
const DEFAULT_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123'
const DEFAULT_NAME = process.env.ADMIN_NAME || 'Book River Admin'

const run = async () => {
  const [, , argEmail, argPassword, argName] = process.argv
  const email = (argEmail || DEFAULT_EMAIL).toLowerCase().trim()
  const password = argPassword || DEFAULT_PASSWORD
  const name = argName || DEFAULT_NAME

  if (!email.includes('@')) {
    console.error('❌ Email sahi nahi hai:', email)
    process.exit(1)
  }
  if (password.length < 6) {
    console.error('❌ Password kam se kam 6 characters ka ho')
    process.exit(1)
  }

  try {
    await connectDB()

    const existing = await Admin.findOne({ email }).select('+password')
    if (existing) {
      existing.password = password
      existing.status = 'approved'
      existing.approvedAt = existing.approvedAt || new Date()
      existing.name = existing.name || name
      await existing.save()
      console.log('\n✅ Admin password reset ho gaya (login ab is se hoga)')
    } else {
      await Admin.create({ name, email, password, status: 'approved', approvedAt: new Date() })
      console.log('\n✅ Naya admin account ban gaya')
    }

    console.log('   Email    :', email)
    console.log('   Password :', password)
    console.log('   Panel    : http://localhost:5174/login\n')

    await mongoose.connection.close()
    process.exit(0)
  } catch (err) {
    console.error('\n❌ ERROR:', err.message)
    process.exit(1)
  }
}

run()
