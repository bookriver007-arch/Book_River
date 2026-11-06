import mongoose from 'mongoose'

/**
 * Description page "open book" — one book page managed from the Admin panel
 * (Admin → DescriptionAdmin page). Left page = picture, right page = heading,
 * author, tag & description. Stored in `descriptionadminbooks`.
 */
const descriptionAdminBookSchema = new mongoose.Schema(
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

export default mongoose.models.DescriptionAdminBook ||
  mongoose.model('DescriptionAdminBook', descriptionAdminBookSchema)
