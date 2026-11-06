import mongoose from 'mongoose'

/**
 * Description page hanging-frame gallery — pictures managed from the Admin panel
 * (Admin → DescriptionAdmin page). Shown as hanging frames scrolling
 * right -> left. Stored in `descriptionadminframes`.
 */
const descriptionAdminFrameSchema = new mongoose.Schema(
  {
    imageUrl: { type: String, required: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
)

export default mongoose.models.DescriptionAdminFrame ||
  mongoose.model('DescriptionAdminFrame', descriptionAdminFrameSchema)
