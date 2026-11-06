import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

/**
 * Users — Sign Up / Login accounts (Frontend → /auth page).
 * Password hamesha bcrypt hash ho kar save hota hai (`select: false` —
 * queries mein password by default nahi aata).
 * Stored in `users`.
 */
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: { type: String, required: true, minlength: 6, select: false },
  },
  { timestamps: true },
)

// password sirf tab hash karo jab naya ho ya badla gaya ho
userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next()
  this.password = await bcrypt.hash(this.password, 10)
  next()
})

// login par plain password ko hash se compare karta hai
userSchema.methods.matchPassword = function matchPassword(plain) {
  return bcrypt.compare(plain, this.password)
}

// frontend ko bhejne ke liye safe shape (password kabhi nahi)
userSchema.methods.toPublic = function toPublic() {
  return {
    id: String(this._id),
    name: this.name,
    email: this.email,
    createdAt: this.createdAt,
  }
}

export default mongoose.models.User || mongoose.model('User', userSchema)
