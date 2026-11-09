import {
  AlertTriangle,
  CheckCircle2,
  CreditCard,
  Heart,
  Info,
  LogIn,
  ShoppingCart,
  X,
} from 'lucide-react'

/** har variant ka icon + colours */
const VARIANTS = {
  success: {
    icon: CheckCircle2,
    badge: 'from-emerald-500 to-emerald-600 shadow-emerald-500/30',
    bar: 'bg-emerald-500',
    ring: 'ring-emerald-200/70 dark:ring-emerald-400/20',
  },
  error: {
    icon: AlertTriangle,
    badge: 'from-rose-500 to-rose-600 shadow-rose-500/30',
    bar: 'bg-rose-500',
    ring: 'ring-rose-200/70 dark:ring-rose-400/20',
  },
  info: {
    icon: Info,
    badge: 'from-sky-500 to-sky-600 shadow-sky-500/30',
    bar: 'bg-sky-500',
    ring: 'ring-sky-200/70 dark:ring-sky-400/20',
  },
  cart: {
    icon: ShoppingCart,
    badge: 'from-brand-500 to-brand-700 shadow-brand-500/30',
    bar: 'bg-brand-600',
    ring: 'ring-brand-200/70 dark:ring-brand-400/20',
  },
  wishlist: {
    icon: Heart,
    badge: 'from-rose-400 to-pink-600 shadow-rose-400/30',
    bar: 'bg-rose-500',
    ring: 'ring-rose-200/70 dark:ring-rose-400/20',
  },
  login: {
    icon: LogIn,
    badge: 'from-gold-500 to-gold-700 shadow-gold-500/30',
    bar: 'bg-gold-600',
    ring: 'ring-gold-200/70 dark:ring-gold-400/20',
  },
  payment: {
    icon: CreditCard,
    badge: 'from-emerald-500 to-teal-600 shadow-emerald-500/30',
    bar: 'bg-emerald-500',
    ring: 'ring-emerald-200/70 dark:ring-emerald-400/20',
  },
}

/**
 * Modern notification card — screen ke center me aata hai.
 * Icon badge + title + message + close + niche progress bar.
 */
export default function ToastCard({
  variant = 'info',
  title,
  message,
  visible = true,
  onClose,
  duration = 2800,
}) {
  const meta = VARIANTS[variant] || VARIANTS.info
  const Icon = meta.icon

  return (
    <div
      role="status"
      aria-live="polite"
      className={`toast-card pointer-events-auto w-[min(92vw,23.5rem)] overflow-hidden rounded-2xl bg-white/95 shadow-2xl ring-1 backdrop-blur-xl dark:bg-[#0e1a2b]/95 ${
        meta.ring
      } ${visible ? 'toast-card--in' : 'toast-card--out'}`}
    >
      <div className="flex items-start gap-3 p-4">
        <span
          className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br text-white shadow-lg ${meta.badge}`}
        >
          <Icon className="h-5 w-5" />
        </span>

        <div className="min-w-0 flex-1 pt-0.5">
          {title ? (
            <p className="text-[0.9rem] font-extrabold leading-tight tracking-tight text-slate-900 dark:text-white">
              {title}
            </p>
          ) : null}
          {message ? (
            <p className="mt-0.5 line-clamp-2 text-[0.8rem] leading-relaxed text-slate-600 dark:text-slate-300">
              {message}
            </p>
          ) : null}
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Band karo"
          className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-white"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <span className="block h-[3px] w-full bg-slate-100 dark:bg-white/10">
        <span
          className={`toast-bar block h-full ${meta.bar}`}
          style={{ animationDuration: `${duration}ms` }}
        />
      </span>
    </div>
  )
}
