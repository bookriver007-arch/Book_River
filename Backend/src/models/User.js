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

    /* profile extras (Settings page) */
    phone: { type: String, trim: true, default: '' },
    address: { type: String, trim: true, default: '' },
    city: { type: String, trim: true, default: '' },

    /* notification preferences */
    prefs: {
      orders: { type: Boolean, default: true },
      offers: { type: Boolean, default: true },
      wishlist: { type: Boolean, default: true },
      newsletter: { type: Boolean, default: false },

      /* app preferences (Settings → Appearance / Language & region) */
      theme: { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
      language: { type: String, enum: ['en', 'ur', 'roman'], default: 'en' },
      numberFormat: { type: String, enum: ['pk', 'intl'], default: 'pk' },
    },

    /* kab password change hua (Settings → Security) */
    passwordChangedAt: { type: Date },
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
    phone: this.phone || '',
    address: this.address || '',
    city: this.city || '',
    prefs: {
      orders: this.prefs?.orders ?? true,
      offers: this.prefs?.offers ?? true,
      wishlist: this.prefs?.wishlist ?? true,
      newsletter: this.prefs?.newsletter ?? false,
      theme: this.prefs?.theme || 'system',
      language: this.prefs?.language === 'en' ? 'en' : this.prefs?.language ? 'ur' : 'en',
      numberFormat: this.prefs?.numberFormat || 'pk',
    },
    passwordChangedAt: this.passwordChangedAt || null,
    createdAt: this.createdAt,
  }
}

export default mongoose.models.User || mongoose.model('User', userSchema)
