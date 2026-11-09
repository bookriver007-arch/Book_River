import mongoose from 'mongoose'

/**
 * Admin invite link — Admin dashboard se copy karke team ko bheja jata hai.
 * Naya member us link se Gmail se signup karta hai, phir admin approve karta hai.
 */
const inviteSchema = new mongoose.Schema(
  {
    key: { type: String, unique: true, default: 'main' },
    code: { type: String, required: true },
    createdBy: { type: String, trim: true, default: '' },
  },
  { timestamps: true },
)

export default mongoose.models.AdminInvite || mongoose.model('AdminInvite', inviteSchema)
