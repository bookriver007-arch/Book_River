import mongoose from 'mongoose'

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI)
    console.log(`✅ MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`)
  } catch (error) {
    console.error(`❌ MongoDB Error: ${error.message}`)
    // Dev mode: server chalte rahe, DB baad me connect ho sakta hai
    if (process.env.NODE_ENV === 'production') process.exit(1)
    console.warn('⚠️  Server running without DB connection (dev mode)')
  }
}

export default connectDB
