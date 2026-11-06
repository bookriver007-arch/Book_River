import mongoose from 'mongoose'

/**
 * Description page slideshow — one picture uploaded from the Admin panel
 * (Admin → DescriptionAdmin page). Stored in the `descriptionadmins` collection.
 * The file itself lives in Backend/uploads/, `imageUrl` points to it.
 */
const descriptionAdminSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true, default: '' },
    imageUrl: { type: String, required: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
)

export default mongoose.models.DescriptionAdmin ||
  mongoose.model('DescriptionAdmin', descriptionAdminSchema)
