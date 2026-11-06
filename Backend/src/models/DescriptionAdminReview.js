import mongoose from 'mongoose'

/**
 * Reviews — customer reviews scrolling in the Reviews slider
 * (Admin → DescriptionAdmin → "Reviews — Slider").
 * Stored in `descriptionadminreviews`.
 */
const descriptionAdminReviewSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    rating: { type: Number, min: 1, max: 5, default: 5 },
    text: { type: String, required: true, trim: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
)

export default mongoose.models.DescriptionAdminReview ||
  mongoose.model('DescriptionAdminReview', descriptionAdminReviewSchema)
