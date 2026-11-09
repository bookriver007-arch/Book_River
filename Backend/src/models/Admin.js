import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

/**
 * Admin account — Admin panel ka login.
 * Pehla admin apne aap ban jata hai (env ADMIN_EMAIL / ADMIN_PASSWORD,
 * warna default admin@bookriver.pk / admin123). Password bcrypt hash hota hai.
 */
const adminSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, default: 'Admin' },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    password: { type: String, required: true, minlength: 6, select: false },
    role: { type: String, default: 'admin' },
    /* 'pending' = signup hua, admin ki approval baaki · 'approved' = login kar sakta hai */
    status: { type: String, enum: ['pending', 'approved', 'blocked'], default: 'pending' },
    approvedAt: { type: Date, default: null },
    approvedBy: { type: String, trim: true, default: '' },
    inviteCode: { type: String, trim: true, default: '' },
    lastLoginAt: { type: Date, default: null },
  },
  { timestamps: true },
)

adminSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next()
  this.password = await bcrypt.hash(this.password, 10)
  next()
})

adminSchema.methods.matchPassword = function matchPassword(plain) {
  return bcrypt.compare(plain, this.password)
}

adminSchema.methods.toPublic = function toPublic() {
  return {
    id: String(this._id),
    name: this.name,
    email: this.email,
    role: this.role || 'admin',
    status: this.status || 'pending',
    approvedAt: this.approvedAt || null,
    lastLoginAt: this.lastLoginAt || null,
    createdAt: this.createdAt,
  }
}

export default mongoose.models.Admin || mongoose.model('Admin', adminSchema)
