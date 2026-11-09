import mongoose from 'mongoose'

/**
 * Checkout settings — payment methods + tax / shipping charges.
 * Singleton (key = 'main'). Admin → Checkout se edit hota hai,
 * Frontend cart wahi se payment options + total banata hai.
 */
const PAYMENT_DEFAULTS = [
  { key: 'cod', title: 'Cash on Delivery', desc: 'Order milne par cash dein', enabled: true },
  { key: 'card', title: 'Debit / Credit Card', desc: 'Visa · Mastercard · UnionPay', enabled: true },
  { key: 'easypaisa', title: 'EasyPaisa', desc: 'Mobile account se payment', enabled: true },
  { key: 'jazzcash', title: 'JazzCash', desc: 'Mobile account se payment', enabled: true },
  { key: 'bank', title: 'Bank Transfer', desc: 'IBFT / online transfer', enabled: true },
]

const DEFAULTS = {
  paymentMethods: PAYMENT_DEFAULTS,
  taxEnabled: false,
  taxLabel: 'Tax',
  taxPercent: 0,
  shippingFee: 60,
  freeShippingOver: 999,
}

const paymentSchema = new mongoose.Schema(
  {
    key: { type: String, trim: true, required: true },
    title: { type: String, trim: true, default: '' },
    desc: { type: String, trim: true, default: '' },
    enabled: { type: Boolean, default: true },
  },
  { _id: false },
)

const checkoutSettingsSchema = new mongoose.Schema(
  {
    key: { type: String, unique: true, default: 'main' },

    paymentMethods: { type: [paymentSchema], default: () => PAYMENT_DEFAULTS.map((m) => ({ ...m })) },

    /* tax / GST */
    taxEnabled: { type: Boolean, default: DEFAULTS.taxEnabled },
    taxLabel: { type: String, trim: true, default: DEFAULTS.taxLabel },
    taxPercent: { type: Number, default: DEFAULTS.taxPercent, min: 0, max: 100 },

    /* shipping charges */
    shippingFee: { type: Number, default: DEFAULTS.shippingFee, min: 0 },
    freeShippingOver: { type: Number, default: DEFAULTS.freeShippingOver, min: 0 },
  },
  { timestamps: true },
)

export const CHECKOUT_DEFAULTS = DEFAULTS

export default mongoose.models.CheckoutSettings ||
  mongoose.model('CheckoutSettings', checkoutSettingsSchema)
