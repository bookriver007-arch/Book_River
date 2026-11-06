import mongoose from 'mongoose'

/**
 * Products grid — book cards managed from the Admin panel
 * (Admin → DescriptionAdmin → "Products — Grid").
 * Stored in `descriptionadminproducts`.
 */
const descriptionAdminProductSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    author: { type: String, trim: true, default: '' },
    tag: { type: String, trim: true, default: '' },
    price: { type: String, trim: true, default: '' },
    description: { type: String, trim: true, default: '' },
    imageUrl: { type: String, required: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
)

export default mongoose.models.DescriptionAdminProduct ||
  mongoose.model('DescriptionAdminProduct', descriptionAdminProductSchema)
