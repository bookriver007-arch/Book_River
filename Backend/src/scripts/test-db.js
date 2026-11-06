import mongoose from 'mongoose'

/**
 * Temporary connection checker — run it with:
 *   node src/scripts/test-db.js
 * It pings the database and prints the result, then exits.
 */
import 'dotenv/config'
import connectDB from '../config/db.js'

const ping = async () => {
  try {
    await connectDB()

    if (mongoose.connection.readyState !== 1) {
      console.error('\n❌ FAILED: MongoDB se connect nahi ho paya.')
      console.error('   Check: MONGO_URI in Backend/.env')
      console.error('   Check: MongoDB service running hai ya nahi')
      process.exit(1)
    }

    const result = await mongoose.connection.db.admin().ping()
    const dbs = await mongoose.connection.db.admin().listDatabases()

    console.log('\n✅ MongoDB CONNECTED!')
    console.log('   Ping      :', result.ok === 1 ? 'ok' : result)
    console.log('   Host      :', mongoose.connection.host)
    console.log('   Port      :', mongoose.connection.port)
    console.log('   Database  :', mongoose.connection.name)
    console.log('   Databases :', dbs.databases.map((d) => d.name).join(', '))
    console.log('\n🎉 Sab kuch ready hai!\n')

    process.exit(0)
  } catch (err) {
    console.error('\n❌ ERROR:', err.message)
    process.exit(1)
  }
}

ping()

