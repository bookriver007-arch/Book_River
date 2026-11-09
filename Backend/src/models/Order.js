import mongoose from 'mongoose'

/** Order ke possible status — admin inhe badal sakta hai */
export const ORDER_STATUSES = ['pending', 'approved', 'rejected', 'shipped', 'delivered']

/** Ek order me ek book ki line */
const orderItemSchema = new mongoose.Schema(
  {
    bookId: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    author: { type: String, trim: true, default: '' },
    price: { type: String, trim: true, default: '' },
    qty: { type: Number, default: 1, min: 1 },
    image: { type: String, default: '' },
    category: { type: String, trim: true, default: '' },
    slug: { type: String, trim: true, default: '' },
  },
  { _id: false },
)

/**
 * Order — frontend cart se "Place order" karne par banti hai.
 * Admin panel (`/orders`) se approve / reject / ship / deliver hoti hai.
 */
const orderSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },

    customerName: { type: String, trim: true, default: '' },
    customerEmail: { type: String, trim: true, default: '' },
    customerPhone: { type: String, trim: true, default: '' },
    address: { type: String, trim: true, default: '' },
    note: { type: String, trim: true, default: '' },

    items: { type: [orderItemSchema], default: [] },
    itemCount: { type: Number, default: 0 },
    subtotal: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    taxLabel: { type: String, trim: true, default: '' },
    shipping: { type: Number, default: 0 },
    total: { type: Number, default: 0 },

    /* payment — poora card number / CVV kabhi save nahi hota */
    payment: {
      method: {
        type: String,
        enum: ['cod', 'card', 'easypaisa', 'jazzcash', 'bank'],
        default: 'cod',
      },
      brand: { type: String, trim: true, default: '' },
      last4: { type: String, trim: true, default: '' },
      mobile: { type: String, trim: true, default: '' },
      ref: { type: String, trim: true, default: '' },
      status: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
    },

    status: { type: String, enum: ORDER_STATUSES, default: 'pending', index: true },
    statusNote: { type: String, trim: true, default: '' },
    decidedAt: { type: Date, default: null },
  },
  { timestamps: true },
)

export default mongoose.models.Order || mongoose.model('Order', orderSchema)
