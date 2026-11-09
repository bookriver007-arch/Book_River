import { moneyOf } from '../utils/money.js'
import { PAYMENT_LABEL, when } from '../utils/orderStatus.js'

/**
 * Ek order ki poori detail — customer, items, subtotal / shipping / tax / total.
 * Track page aur Saved orders page dono isi ko dikhate hain.
 */
export default function OrderDetail({ info, onTrack }) {
  if (!info) {
    return (
      <p className="text-[0.72rem] text-slate-500 dark:text-slate-400">
        Detail load nahi hui —{' '}
        <button
          type="button"
          onClick={onTrack}
          className="font-bold text-brand-700 hover:underline dark:text-brand-300"
        >
          Track karo
        </button>{' '}
        se poori detail aa jayegi.
      </p>
    )
  }

  return (
    <div className="space-y-3">
      <div className="grid gap-1.5 text-[0.74rem] sm:grid-cols-2">
        <p className="text-slate-600 dark:text-slate-300">
          <strong className="font-bold text-slate-800 dark:text-white">Customer:</strong>{' '}
          {info.customerName || 'Guest'}
        </p>
        <p className="text-slate-600 dark:text-slate-300">
          <strong className="font-bold text-slate-800 dark:text-white">Phone:</strong>{' '}
          {info.customerPhone || '—'}
        </p>
        <p className="truncate text-slate-600 dark:text-slate-300">
          <strong className="font-bold text-slate-800 dark:text-white">Email:</strong>{' '}
          {info.customerEmail || '—'}
        </p>
        <p className="text-slate-600 dark:text-slate-300">
          <strong className="font-bold text-slate-800 dark:text-white">Payment:</strong>{' '}
          {PAYMENT_LABEL[info.payment?.method] || 'Cash on Delivery'}
        </p>
        <p className="text-slate-600 sm:col-span-2 dark:text-slate-300">
          <strong className="font-bold text-slate-800 dark:text-white">Address:</strong>{' '}
          {info.address || '—'}
        </p>
        <p className="text-slate-600 sm:col-span-2 dark:text-slate-300">
          <strong className="font-bold text-slate-800 dark:text-white">Ordered:</strong>{' '}
          {when(info.createdAt)}
          {info.decidedAt ? ` · Updated: ${when(info.decidedAt)}` : ''}
        </p>
        {info.note ? (
          <p className="text-slate-600 sm:col-span-2 dark:text-slate-300">
            <strong className="font-bold text-slate-800 dark:text-white">Note:</strong> {info.note}
          </p>
        ) : null}
      </div>

      <ul className="space-y-1.5">
        {(info.items || []).map((item, index) => (
          <li
            key={`${item.bookId}-${index}`}
            className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 px-2.5 py-1.5 text-[0.72rem] dark:border-white/10"
          >
            <span className="min-w-0 truncate font-semibold text-slate-800 dark:text-white">
              {item.title}
            </span>
            <span className="shrink-0 text-slate-500 dark:text-slate-400">
              {item.qty} × {item.price || '—'}
            </span>
          </li>
        ))}
      </ul>

      <dl className="space-y-1 text-[0.72rem]">
        <div className="flex justify-between">
          <dt className="text-slate-500 dark:text-slate-400">Subtotal ({info.itemCount})</dt>
          <dd className="font-semibold text-slate-800 dark:text-white">{moneyOf(info.subtotal)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-slate-500 dark:text-slate-400">Shipping</dt>
          <dd className="font-semibold text-slate-800 dark:text-white">
            {info.shipping ? moneyOf(info.shipping) : 'Free'}
          </dd>
        </div>
        {info.tax ? (
          <div className="flex justify-between">
            <dt className="text-slate-500 dark:text-slate-400">{info.taxLabel || 'Tax'}</dt>
            <dd className="font-semibold text-slate-800 dark:text-white">{moneyOf(info.tax)}</dd>
          </div>
        ) : null}
        <div className="flex justify-between pt-1">
          <dt className="font-bold text-slate-900 dark:text-white">Total</dt>
          <dd className="font-extrabold text-brand-700 dark:text-brand-300">
            {moneyOf(info.total)}
          </dd>
        </div>
      </dl>
    </div>
  )
}
