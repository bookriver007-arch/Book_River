import mongoose from 'mongoose'

const connectDB = async () => {
  const uri = process.env.MONGO_URI

  if (!uri) {
    console.error('❌ MONGO_URI missing — copy .env.example to .env and set it')
    if (process.env.NODE_ENV === 'production') process.exit(1)
    return
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000, // fail fast instead of hanging 30s
    })
    console.log(`✅ MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`)
  } catch (error) {
    console.error(`❌ MongoDB Error: ${error.message}`)
    // Dev mode: server chalte rahe, DB baad me connect ho sakta hai
    if (process.env.NODE_ENV === 'production') process.exit(1)
    console.warn('⚠️  Server running without DB connection (dev mode)')
  }
}

// Log connection state changes (reconnect / disconnect)
mongoose.connection.on('connected', () => console.log('🟢 Mongoose: connected'))
mongoose.connection.on('error', (err) => console.error('🔴 Mongoose error:', err.message))
mongoose.connection.on('disconnected', () => console.warn('🟡 Mongoose: disconnected'))

/** 1 = connected, 0 = connecting, 2 = disconnected */
export const dbStatus = () => mongoose.connection.readyState

export default connectDB

