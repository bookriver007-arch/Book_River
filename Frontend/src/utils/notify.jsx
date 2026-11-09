import toast from 'react-hot-toast'
import ToastCard from '../components/ToastCard.jsx'

const DEFAULT_MS = 2800

/** har variant ka default title (jab sirf message diya jaye) */
const DEFAULT_TITLES = {
  success: 'Ho gaya!',
  error: 'Kuch galat hua',
  info: 'Info',
  cart: 'Cart me add ho gayi',
  wishlist: 'Wishlist update ho gayi',
  login: 'Welcome!',
  payment: 'Payment / Order',
}

/** ek modern card screen ke center me dikhao */
const show = (variant, title, message, opts = {}) => {
  const duration = opts.duration ?? DEFAULT_MS

  return toast.custom(
    (t) => (
      <ToastCard
        variant={variant}
        title={title}
        message={message}
        visible={t.visible}
        duration={duration}
        onClose={() => toast.dismiss(t.id)}
      />
    ),
    { duration },
  )
}

/** title + message dono ya sirf message */
const pick = (variant, first, second, opts) =>
  second === undefined
    ? show(variant, DEFAULT_TITLES[variant], first, opts)
    : show(variant, first, second, opts)

/**
 * App ke saare notifications — center me, modern card.
 *   notify.cart('Cart me add ho gayi', book.title)
 *   notify.login('Welcome back, Ali!')
 *   notify.payment('Order place ho gaya 🎉', 'BR-123456 · Rs. 1,382.20')
 *   notify.error(err.message)
 */
export const notify = {
  success: (title, message, opts) => pick('success', title, message, opts),
  error: (title, message, opts) => pick('error', title, message, opts),
  info: (title, message, opts) => pick('info', title, message, opts),
  cart: (title, message, opts) => pick('cart', title, message, opts),
  wishlist: (title, message, opts) => pick('wishlist', title, message, opts),
  login: (title, message, opts) => pick('login', title, message, opts),
  payment: (title, message, opts) => pick('payment', title, message, opts),
  dismissAll: () => toast.dismiss(),
}

export default notify
