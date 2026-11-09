import mongoose from 'mongoose'

/**
 * Home page slideshow — Admin → "Home Slides" page se manage hoti hai.
 * Description page ke slides se ye ALAG collection hai (`homeslides`),
 * taake Home aur Description ke slides ek doosre ko na badlein.
 */
const homeSlideSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true, default: '' },
    imageUrl: { type: String, required: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
)

export default mongoose.models.HomeSlide || mongoose.model('HomeSlide', homeSlideSchema)
