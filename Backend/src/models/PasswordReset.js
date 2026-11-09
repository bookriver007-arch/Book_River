import mongoose from 'mongoose'

/**
 * Password reset codes — "Forgot password" flow ke liye.
 * Har email ka ek hi active code rehta hai (naya maangne par purana delete).
 * Code bcrypt hash ho kar save hota hai, 10 minute me expire hota hai.
 * Stored in `password_resets`.
 */
const passwordResetSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    codeHash: { type: String, required: true },
    attempts: { type: Number, default: 0 },
    expiresAt: { type: Date, required: true, index: true },
  },
  { timestamps: true },
)

export default mongoose.model('PasswordReset', passwordResetSchema)
