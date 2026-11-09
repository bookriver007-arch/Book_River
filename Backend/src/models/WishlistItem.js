import mongoose from 'mongoose'

/**
 * Wishlist — har user ki apni saved books (MongoDB me).
 * `bookId` = frontend ki book id (mongo _id ya slug+title).
 * Ek user ek book sirf ek baar save kar sakta hai (unique index).
 */
const wishlistItemSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    bookId: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    author: { type: String, trim: true, default: '' },
    price: { type: String, trim: true, default: '' },
    image: { type: String, default: '' },
    category: { type: String, trim: true, default: '' },
    slug: { type: String, trim: true, default: '' },
  },
  { timestamps: true },
)

// ek user + ek book = ek hi entry
wishlistItemSchema.index({ user: 1, bookId: 1 }, { unique: true })

export default mongoose.models.WishlistItem ||
  mongoose.model('WishlistItem', wishlistItemSchema)
