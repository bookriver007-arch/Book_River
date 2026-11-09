import mongoose from 'mongoose'

/**
 * Home page "Deal" section ki heading / description / offer tag.
 * Singleton document (key = 'main') — Admin → Home → "Deal cards manage karo"
 * se edit hota hai. Cards alag collection (`homedeals`) me hain.
 */
const DEFAULTS = {
  eyebrow: 'Deal of the week',
  heading: 'Aaj ki best deals',
  description:
    'Chuni hui kitaabein — Rs. 1,200 ki jagah sirf Rs. 800, aur bhi bahut kuch. Sirf is hafte ke liye, stock khatam hone se pehle.',
  offerTag: 'Up to 40% off',
}

const homeDealSettingsSchema = new mongoose.Schema(
  {
    key: { type: String, unique: true, default: 'main' },
    eyebrow: { type: String, trim: true, default: DEFAULTS.eyebrow },
    heading: { type: String, trim: true, default: DEFAULTS.heading },
    description: { type: String, trim: true, default: DEFAULTS.description },
    offerTag: { type: String, trim: true, default: DEFAULTS.offerTag },
  },
  { timestamps: true },
)

export const HOME_DEAL_DEFAULTS = DEFAULTS

export default mongoose.models.HomeDealSettings ||
  mongoose.model('HomeDealSettings', homeDealSettingsSchema)
