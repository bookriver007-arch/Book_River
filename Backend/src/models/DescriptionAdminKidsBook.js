import mongoose from 'mongoose'

/**
 * Description page kids-book card — one cover image + caption, managed from
 * the Admin panel (Admin → DescriptionAdmin page).
 * Stored in `descriptionadminkidsbooks`.
 */
const descriptionAdminKidsBookSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true, default: '' },
    imageUrl: { type: String, required: true },
  },
  { timestamps: true },
)

export default mongoose.models.DescriptionAdminKidsBook ||
  mongoose.model('DescriptionAdminKidsBook', descriptionAdminKidsBookSchema)
