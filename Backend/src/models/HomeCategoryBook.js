import mongoose from 'mongoose'

/**
 * Home page ke CATEGORY sections ke books.
 * Har book kisi ek category se judi hoti hai (`slug`):
 * board-books, kids-story-books, knowledge-books, activity-books,
 * teen-fiction, adult-novels.
 * Admin → Home → "Category Books" se manage hoti hain.
 */
const homeCategoryBookSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, trim: true, index: true },
    title: { type: String, required: true, trim: true },
    author: { type: String, trim: true, default: '' },
    price: { type: String, trim: true, default: '' },
    description: { type: String, trim: true, default: '' },
    imageUrl: { type: String, required: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
)

export default mongoose.models.HomeCategoryBook ||
  mongoose.model('HomeCategoryBook', homeCategoryBookSchema)
