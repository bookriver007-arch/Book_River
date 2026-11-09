import mongoose from 'mongoose'

/**
 * Home page "Deal" section ke product cards — Admin → "Home Deals" page se
 * manage hote hain (Home page ka apna section, Description se alag).
 * `oldPrice` par frontend me cross (strikethrough) lagta hai, `price` discount
 * ke baad wala rate hai.
 */
const homeDealSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    author: { type: String, trim: true, default: '' },
    imageUrl: { type: String, required: true },
    oldPrice: { type: Number, required: true, min: 0 },
    price: { type: Number, required: true, min: 0 },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
)

export default mongoose.models.HomeDeal || mongoose.model('HomeDeal', homeDealSchema)
