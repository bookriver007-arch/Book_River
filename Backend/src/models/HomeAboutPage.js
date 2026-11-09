import mongoose from 'mongoose'

/**
 * Home page ke About book ke pages (1 se 3).
 * Admin → Home → "About Book" se heading / description / picture set hoti hai.
 * Har page par ek picture hoti hai; picture left/right side par alternate hoti hai.
 */
const homeAboutPageSchema = new mongoose.Schema(
  {
    page: { type: Number, required: true, unique: true, min: 1, max: 3 },
    heading: { type: String, trim: true, default: '' },
    description: { type: String, trim: true, default: '' },
    /* har page par 3 pictures — modern collage ke liye */
    imageUrl: { type: String, default: '' },
    image2Url: { type: String, default: '' },
    image3Url: { type: String, default: '' },
  },
  { timestamps: true },
)

export default mongoose.models.HomeAboutPage ||
  mongoose.model('HomeAboutPage', homeAboutPageSchema)
