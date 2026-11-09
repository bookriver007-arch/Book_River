/**
 * Order status helpers — Track order aur Saved orders dono pages use karte hain.
 * (labels, pill colours, payment labels aur date format)
 */
export const FINAL_STATUSES = ['delivered', 'rejected']

export const STATUS_META = {
  pending: { label: 'Pending', pill: 'bg-amber-100 text-amber-800 ring-amber-200' },
  approved: { label: 'Approved', pill: 'bg-emerald-100 text-emerald-800 ring-emerald-200' },
  shipped: { label: 'Shipped', pill: 'bg-sky-100 text-sky-800 ring-sky-200' },
  delivered: { label: 'Delivered', pill: 'bg-brand-100 text-brand-800 ring-brand-200' },
  rejected: { label: 'Rejected', pill: 'bg-rose-100 text-rose-700 ring-rose-200' },
}

export const PAYMENT_LABEL = {
  cod: 'Cash on Delivery',
  card: 'Debit / Credit Card',
  easypaisa: 'EasyPaisa',
  jazzcash: 'JazzCash',
  bank: 'Bank Transfer',
}

/** ISO date → "9 Nov 2026, 12:39 pm" */
export const when = (iso) => {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
  } catch {
    return ''
  }
}
