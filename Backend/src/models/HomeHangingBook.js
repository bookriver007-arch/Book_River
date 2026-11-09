import mongoose from 'mongoose'

/**
 * Home page par rope se latakti kitaab (hanging book).
 * Description page ki kids-book se ALAG — apna cover, apna admin page
 * (Admin → Home → Hanging Book).
 */
const homeHangingBookSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true, default: '' },
    imageUrl: { type: String, required: true },
  },
  { timestamps: true },
)

export default mongoose.models.HomeHangingBook ||
  mongoose.model('HomeHangingBook', homeHangingBookSchema)
