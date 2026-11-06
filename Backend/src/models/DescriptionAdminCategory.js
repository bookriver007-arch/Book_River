import mongoose from 'mongoose'

/**
 * Description page category ribbon — one name box ("Poetry Books", "Novels"...)
 * managed from the Admin panel (Admin → DescriptionAdmin page).
 * Stored in the `descriptionadmincategories` collection.
 */
const descriptionAdminCategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
)

export default mongoose.models.DescriptionAdminCategory ||
  mongoose.model('DescriptionAdminCategory', descriptionAdminCategorySchema)
