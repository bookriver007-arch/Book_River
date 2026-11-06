import dotenv from 'dotenv'
import mongoose from 'mongoose'

dotenv.config()

/**
 * One-off check: kya Sign Up se banaya gaya user MongoDB mein save hua
 * aur password bcrypt hash hai? Phir test users delete kar deta hai.
 */
const run = async () => {
  await mongoose.connect(process.env.MONGO_URI)
  const col = mongoose.connection.collection('users')
  const u = await col.findOne({ email: /@bookriver-test\.com$/ })
  console.log('DB found:', Boolean(u))
  if (u) {
    console.log('name:', u.name, '| email:', u.email)
    console.log('bcrypt hash:', String(u.password).startsWith('$2'))
  }
  const del = await col.deleteMany({ email: /@bookriver-test\.com$/ })
  console.log('test users deleted:', del.deletedCount)
  await mongoose.disconnect()
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
