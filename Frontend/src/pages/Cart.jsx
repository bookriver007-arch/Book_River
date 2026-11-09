import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  Banknote,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  Landmark,
  MapPin,
  Minus,
  Phone,
  Plus,
  Receipt,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  Trash2,
  Truck,
  User,
} from 'lucide-react'
import { notify } from '../utils/notify.jsx'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import useCart from '../hooks/useCart.js'
import { MAX_QTY } from '../context/cartStore.js'
import { moneyOf, priceOf } from '../utils/money.js'
import { rememberOrder } from '../utils/orderHistory.js'
import { confirmAction } from '../utils/confirm.js'
import {
  PAYMENTS,
  cardBrand,
  digitsOnly,
  expiryOk,
  formatCard,
  formatExpiry,
  formatMobile,
  luhnOk,
  mobileOk,
  paymentPayload,
} from '../utils/checkout.js'

const FREE_SHIP_OVER = 999
const SHIP_FEE = 60

const ADDRESS_KEY = 'br_address'
const DEFAULT_DELIVERY = { fullName: '', phone: '', address: '', city: '' }

/** har payment method ka icon */
const PAYMENT_ICONS = {
  cod: Banknote,
  card: CreditCard,
  easypaisa: Smartphone,
  jazzcash: Smartphone,
  bank: Landmark,
}

const CITIES = ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan', 'Peshawar']

const inputCls =
  'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-brand-400 focus:ring-4 focus:ring-brand-100 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-brand-400 dark:focus:ring-brand-500/20'

const labelCls =
  'mb-1.5 block text-[0.66rem] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400'

const errCls = 'mt-1 block text-[0.68rem] font-semibold text-rose-600 dark:text-rose-300'

/** checkout ke 3 steps */
const STEPS = [
  { n: 1, title: 'Order review', desc: 'Books check karo', next: 'Delivery address' },
  { n: 2, title: 'Delivery address', desc: 'Kahan bhejna hai', next: 'Payment method' },
  { n: 3, title: 'Payment method', desc: 'Kaise dena hai', next: 'Place order' },
]

/** checkout steps — har step ka circle, ek ke baad ek enter hota hai */
function Stepper({ step, maxStep, onJump, horizontal = false }) {
  /** circle ka look: done (tick) / active (number) / upcoming (outline) */
  const circle = (done, active) =>
    [
      'grid shrink-0 place-items-center rounded-full font-extrabold transition-all duration-300',
      done
        ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
        : active
          ? 'bg-gradient-to-br from-brand-600 to-brand-800 text-white ring-4 ring-brand-100 shadow-lg shadow-brand-700/30 dark:ring-brand-500/25'
          : 'border-2 border-slate-200 bg-white text-slate-400',
    ].join(' ')

  if (horizontal) {
    return (
      <ol className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:gap-1">
        {STEPS.map((item, index) => {
          const done = item.n < step
          const active = item.n === step
          const clickable = item.n <= maxStep && !active
          const isLast = index === STEPS.length - 1

          return (
            <li
              key={item.n}
              className="stepper-item flex items-center gap-2.5 sm:flex-1"
              style={{ animationDelay: `${index * 90}ms` }}
            >
              <button
                type="button"
                onClick={() => (clickable ? onJump(item.n) : undefined)}
                disabled={!clickable}
                aria-current={active ? 'step' : undefined}
                aria-label={item.title}
                className={`${circle(done, active)} h-10 w-10 text-[0.72rem] tracking-tight ${
                  clickable ? 'cursor-pointer hover:scale-105' : 'cursor-default'
                }`}
              >
                {done ? <CheckCircle2 className="h-4 w-4" /> : `0${item.n}`}
              </button>

              <span className="min-w-0 flex-1">
                <span className="block text-[0.58rem] font-extrabold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">
                  {`Step 0${item.n}`}
                </span>
                <span
                  className={`block truncate text-[0.82rem] font-bold leading-tight ${
                    active
                      ? 'text-brand-800 dark:text-white'
                      : done
                        ? 'text-slate-700 dark:text-slate-300'
                        : 'text-slate-400 dark:text-slate-500'
                  }`}
                >
                  {item.title}
                </span>
                <span className="hidden truncate text-[0.64rem] text-slate-400 sm:block dark:text-slate-500">
                  {item.desc}
                </span>
              </span>

              {!isLast ? (
                <span className="hidden shrink-0 items-center gap-0.5 sm:flex">
                  <span
                    className={`h-0.5 w-4 rounded-full lg:w-6 ${
                      done ? 'bg-emerald-400' : 'bg-slate-200 dark:bg-white/20'
                    }`}
                  />
                  <ChevronRight
                    className={`h-4 w-4 ${done ? 'text-emerald-400' : 'text-slate-300 dark:text-white/25'}`}
                  />
                </span>
              ) : null}
            </li>
          )
        })}
      </ol>
    )
  }

  return (
    <ol>
      {STEPS.map((item, index) => {
        const done = item.n < step
        const active = item.n === step
        const clickable = item.n <= maxStep && !active
        const isLast = index === STEPS.length - 1

        return (
          <li
            key={item.n}
            className="stepper-item flex gap-3"
            style={{ animationDelay: `${index * 90}ms` }}
          >
            {/* circle + connector line */}
            <div className="flex flex-col items-center">
              <button
                type="button"
                onClick={() => (clickable ? onJump(item.n) : undefined)}
                disabled={!clickable}
                aria-current={active ? 'step' : undefined}
                aria-label={item.title}
                className={`${circle(done, active)} h-9 w-9 text-[0.78rem] ${
                  clickable ? 'cursor-pointer hover:scale-105' : 'cursor-default'
                }`}
              >
                {done ? <CheckCircle2 className="h-4 w-4" /> : item.n}
              </button>

              {!isLast ? (
                <span
                  className={`my-1 w-0.5 flex-1 rounded-full transition-colors ${
                    done ? 'bg-emerald-400' : 'bg-slate-200 dark:bg-white/20'
                  }`}
                  style={{ minHeight: '1.15rem' }}
                />
              ) : null}
            </div>

            {/* title + description */}
            <button
              type="button"
              onClick={() => (clickable ? onJump(item.n) : undefined)}
              disabled={!clickable}
              className={`-mt-0.5 mb-1 min-w-0 flex-1 rounded-lg px-1 py-0.5 text-left transition ${
                clickable ? 'cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5' : 'cursor-default'
              }`}
            >
              <span
                className={`block truncate text-[0.8rem] font-bold ${
                  active
                    ? 'text-brand-800 dark:text-white'
                    : done
                      ? 'text-slate-700 dark:text-slate-300'
                      : 'text-slate-400 dark:text-slate-500'
                }`}
              >
                {item.title}
              </span>
              <span className="block truncate text-[0.66rem] text-slate-400 dark:text-slate-500">
                {item.desc}
              </span>
            </button>
          </li>
        )
      })}
    </ol>
  )
}


/** Cart page — jahan se koi bhi product buy (order place) ho sakta hai. */
export default function Cart() {
  const { items, count, subtotal, setQty, remove, clear } = useCart()
  const [user, setUser] = useState(null)
  const [delivery, setDelivery] = useState(DEFAULT_DELIVERY)
  const [payment, setPayment] = useState('cod')
  const [card, setCard] = useState({ number: '', name: '', expiry: '', cvv: '' })
  const [wallet, setWallet] = useState({ mobile: '' })
  const [bankRef, setBankRef] = useState('')
  const [errors, setErrors] = useState({})
  const [checkout, setCheckout] = useState(null)
  const [step, setStep] = useState(1)
  const [maxStep, setMaxStep] = useState(1)
  const [placing, setPlacing] = useState(false)
  const navigate = useNavigate()

  // saved profile + address se checkout form bhar do
  useEffect(() => {
    let cachedUser = null
    let savedAddress = {}

    try {
      cachedUser = JSON.parse(localStorage.getItem('br_user'))
    } catch {
      cachedUser = null
    }
    try {
      savedAddress = JSON.parse(localStorage.getItem(ADDRESS_KEY)) || {}
    } catch {
      savedAddress = {}
    }

    setUser(cachedUser)
    setDelivery({
      fullName: savedAddress.fullName || cachedUser?.name || '',
      phone: savedAddress.phone || cachedUser?.phone || '',
      address: savedAddress.address || cachedUser?.address || '',
      city: savedAddress.city || cachedUser?.city || '',
    })
  }, [])

  /* ---------- Admin → Checkout settings (payment + tax + shipping) ---------- */
  useEffect(() => {
    let alive = true
    fetch('/api/checkout')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (alive && data) setCheckout(data)
      })
      .catch(() => {
        /* offline — defaults hi chalenge */
      })
    return () => {
      alive = false
    }
  }, [])

  const methods =
    checkout?.paymentMethods?.length > 0
      ? checkout.paymentMethods.filter((method) => method.enabled !== false)
      : PAYMENTS
  const freeOver = Number(checkout?.freeShippingOver ?? FREE_SHIP_OVER) || 0
  const shippingFee = Number(checkout?.shippingFee ?? SHIP_FEE) || 0
  const taxPercent = checkout?.taxEnabled ? Number(checkout.taxPercent) || 0 : 0
  const taxLabel = checkout?.taxLabel || 'Tax'
  const paymentTitle = methods.find((method) => method.key === payment)?.title || 'Cash on Delivery'

  // admin ne method band kar diya ho to pehle available par jao
  useEffect(() => {
    if (methods.length && !methods.some((method) => method.key === payment)) {
      setPayment(methods[0].key)
    }
  }, [methods, payment])

  const shipping = Math.max(
    0,
    subtotal === 0
      ? 0
      : subtotal >= freeOver
        ? 0
        : shippingFee,
  )
  const tax = taxPercent > 0 ? Math.round(subtotal * (taxPercent / 100)) : 0
  const total = subtotal + shipping + tax

  const logout = () => {
    localStorage.removeItem('br_token')
    localStorage.removeItem('br_user')
    window.location.replace('/auth')
  }

  const removeItem = async (item) => {
    const ok = await confirmAction({
      title: 'Cart se hatao?',
      message: `${item.title} cart se nikal jayegi.`,
      confirmLabel: 'Haan, hatao',
    })
    if (!ok) return
    remove(item.id)
    notify.cart('Cart se hata di 🗑️', item.title)
  }

  /** "Buy" — order backend par jata hai (admin `/orders` par approve karega) */
  /** delivery ka ek field badlo (error bhi saaf) */
  const setField = (key, value) => {
    setDelivery((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => (prev[key] ? { ...prev, [key]: '' } : prev))
  }

  /** step 2 — delivery ki validation */
  const deliveryErrors = () => {
    const next = {}
    if (!delivery.fullName.trim()) next.fullName = 'Poora naam likho'
    if (!mobileOk(delivery.phone)) next.phone = 'Sahi phone number likho (03xx xxxxxxx)'
    if (!delivery.address.trim()) next.address = 'Ghar ka pata likho'
    if (!delivery.city.trim()) next.city = 'Sheher likho'
    return next
  }

  /** step 3 — payment ki validation */
  const paymentErrors = () => {
    const next = {}

    if (payment === 'card') {
      if (!luhnOk(card.number)) next.number = 'Card number sahi nahi hai'
      if (!card.name.trim()) next.cardName = 'Card par likha naam likho'
      if (!expiryOk(card.expiry)) next.expiry = 'Expiry MM/YY — aage ki date'
      if (!/^\d{3,4}$/.test(card.cvv)) next.cvv = 'CVV 3 ya 4 digit'
    }

    if (payment === 'easypaisa' || payment === 'jazzcash') {
      if (!mobileOk(wallet.mobile)) next.mobile = 'Mobile number 03xx xxxxxxx'
    }

    if (payment === 'bank' && bankRef.trim().length < 4) {
      next.bankRef = 'Transaction ID / reference likho'
    }

    return next
  }

  /** errors set karo — pehli ghalti wale step par scroll */
  const showErrors = (next) => {
    setErrors(next)
    const first = Object.values(next)[0]
    if (!first) return true

    notify.error('Checkout adhoora hai', first)
    const deliveryKeys = ['fullName', 'phone', 'address', 'city']
    const onDelivery = Object.keys(next).some((key) => deliveryKeys.includes(key))
    document
      .getElementById(onDelivery ? 'checkout-delivery' : 'checkout-payment')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    return false
  }

  /** step navigation */
  const goTo = (target) => {
    if (target <= maxStep) setStep(target)
  }

  const goNext = () => {
    if (step === 1) {
      setMaxStep((value) => Math.max(value, 2))
      setStep(2)
      return
    }
    if (step === 2) {
      if (!showErrors(deliveryErrors())) return
      setErrors({})
      setMaxStep((value) => Math.max(value, 3))
      setStep(3)
    }
  }

  const goBack = () => setStep((value) => Math.max(1, value - 1))

  const placeOrder = async () => {
    if (!items.length || placing) return
    if (!showErrors({ ...deliveryErrors(), ...paymentErrors() })) return

    const cleanDelivery = {
      fullName: delivery.fullName.trim(),
      phone: delivery.phone.trim(),
      address: delivery.address.trim(),
      city: delivery.city.trim(),
    }

    // agli baar checkout apne aap bhar jaye
    try {
      localStorage.setItem(ADDRESS_KEY, JSON.stringify(cleanDelivery))
    } catch {
      /* private mode */
    }

    setPlacing(true)

    try {
      let token = ''
      try {
        token = localStorage.getItem('br_token') || ''
      } catch {
        token = ''
      }

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          customerName: cleanDelivery.fullName,
          customerEmail: user?.email || '',
          customerPhone: cleanDelivery.phone,
          address: [cleanDelivery.address, cleanDelivery.city].filter(Boolean).join(', '),
          note: paymentTitle,
          payment: paymentPayload({ method: payment, card, wallet, bankRef }),
          items: items.map((item) => ({
            bookId: item.id,
            title: item.title,
            author: item.author,
            price: item.price,
            qty: item.qty,
            image: item.image,
            category: item.category,
            slug: item.slug,
          })),
        }),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.message || 'Order save nahi hua')

      const placed = {
        id: data.code || 'BR-000000',
        total: Number(data.total) || total,
        books: Number(data.itemCount) || count,
      }
      clear()
      rememberOrder({
        code: placed.id,
        status: 'pending',
        total: placed.total,
        itemCount: placed.books,
        at: new Date().toISOString(),
      })
      notify.payment(
        'Order place ho gaya 🎉',
        `${placed.id} · ${moneyOf(placed.total)} · ${paymentTitle}`,
      )
      // seedha tracking page par — status wahin se track hoga
      navigate(`/track?code=${encodeURIComponent(placed.id)}&new=1`)
    } catch (err) {
      notify.error('Order save nahi hua', `${err.message} — backend chalu hai? dobara try karo`)
    } finally {
      setPlacing(false)
    }
  }

  return (
    <div className="book-page min-h-screen">
      <Navbar categories wide user={user} onLogout={logout} />

      <main className="mx-auto max-w-7xl px-4 pt-8 sm:px-6">
        {/* ---------- header ---------- */}
            <header className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-2.5 py-1 text-[0.62rem] font-bold uppercase tracking-[0.16em] text-brand-700 dark:bg-white/10 dark:text-brand-100">
                  <ShoppingBag className="h-3 w-3" /> Cart
                </span>
                <h1 className="mt-2 font-display text-3xl font-bold text-brand-900 dark:text-white">
                  My Cart
                </h1>
                <p className="mt-1 text-sm text-brand-800/70 dark:text-white/60">
                  {items.length
                    ? `${count} ${count === 1 ? 'book' : 'books'} cart me — checkout karke order place karo.`
                    : 'Cart abhi khali hai — koi bhi book add karo.'}
                </p>
              </div>

              {items.length > 0 ? (
                <button
                  type="button"
                  onClick={async () => {
                    const ok = await confirmAction({
                      title: 'Cart khali karein?',
                      message: 'Saari books cart se nikal jayengi.',
                      confirmLabel: 'Haan, khali karo',
                    })
                    if (!ok) return
                    clear()
                    notify.info('Cart khali kar di 🧺')
                  }}
                  className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-rose-300 hover:text-rose-600 dark:border-white/15 dark:text-slate-300 dark:hover:text-rose-300"
                >
                  <Trash2 className="h-4 w-4" /> Clear cart
                </button>
              ) : null}
            </header>

            {/* ---------- empty state ---------- */}
            {items.length === 0 ? (
              <section className="mt-8 rounded-3xl border border-dashed border-slate-300 bg-white/70 px-6 py-14 text-center dark:border-white/15 dark:bg-white/5">
                <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-brand-50 text-brand-600 dark:bg-white/10 dark:text-brand-200">
                  <ShoppingBag className="h-5 w-5" />
                </span>
                <p className="mt-3 text-base font-semibold text-slate-700 dark:text-white">
                  Cart khali hai
                </p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Koi bhi book kholo aur “Add to cart” dabao — wo seedha yahan aa jayegi.
                </p>
                <Link
                  to="/home"
                  className="mt-5 inline-flex items-center gap-2 rounded-full bg-brand-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-brand-700/25 transition hover:bg-brand-800"
                >
                  Books dekho <ArrowRight className="h-4 w-4" />
                </Link>
              </section>
            ) : (
              <>
              {/* ---------- steps (01 → 02 → 03) ---------- */}
              <div className="mt-6 rounded-2xl border border-slate-200/80 bg-white px-3.5 py-3 shadow-sm sm:px-5 dark:border-white/10 dark:bg-white/[0.04]">
                <Stepper step={step} maxStep={maxStep} onJump={goTo} horizontal />
              </div>

              <div className="mt-5 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_21rem]">
                {/* ---------- items + checkout ---------- */}
                <div className="space-y-5">
                  {step > 1 ? (
                    <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-200/80 bg-white px-4 py-3 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                        {count} {count === 1 ? 'book' : 'books'} · {moneyOf(total)}
                      </p>
                      <button
                        type="button"
                        onClick={() => goTo(1)}
                        className="text-[0.72rem] font-bold text-brand-700 hover:underline dark:text-brand-300"
                      >
                        Edit cart
                      </button>
                    </div>
                  ) : null}

                  {step === 1 ? (
                  <div className="space-y-3">
                  {items.map((item) => (
                    <article
                      key={item.id}
                      className="flex gap-4 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-sm transition hover:shadow-md dark:border-white/10 dark:bg-white/[0.04]"
                    >
                      <Link
                        to={item.slug ? `/category/${item.slug}` : '/home'}
                        className="shrink-0 overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800"
                      >
                        <img
                          src={item.image}
                          alt={`${item.title} cover`}
                          loading="lazy"
                          decoding="async"
                          className="h-28 w-20 object-cover transition-transform duration-500 hover:scale-105 sm:h-32 sm:w-24"
                        />
                      </Link>

                      <div className="flex min-w-0 flex-1 flex-col">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            {item.category ? (
                              <span className="text-[0.58rem] font-bold uppercase tracking-[0.16em] text-brand-600 dark:text-brand-300">
                                {item.category}
                              </span>
                            ) : null}
                            <h2 className="mt-0.5 line-clamp-2 text-sm font-bold leading-snug text-slate-900 dark:text-white sm:text-base">
                              {item.title}
                            </h2>
                            <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
                              {item.author ? `by ${item.author}` : 'Book River'}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeItem(item)}
                            aria-label={`${item.title} cart se hatao`}
                            title="Cart se hatao"
                            className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/15 dark:hover:text-rose-300"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-3">
                          <div className="inline-flex items-center overflow-hidden rounded-xl border border-slate-200 dark:border-white/15">
                            <button
                              type="button"
                              onClick={() => setQty(item.id, item.qty - 1)}
                              aria-label="Quantity kam karo"
                              className="grid h-8 w-8 place-items-center text-slate-600 transition hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-white/10"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="grid h-8 w-9 place-items-center border-x border-slate-200 text-sm font-bold text-slate-900 dark:border-white/15 dark:text-white">
                              {item.qty}
                            </span>
                            <button
                              type="button"
                              onClick={() => setQty(item.id, Math.min(MAX_QTY, item.qty + 1))}
                              disabled={item.qty >= MAX_QTY}
                              aria-label="Quantity barhao"
                              className="grid h-8 w-8 place-items-center text-slate-600 transition hover:bg-slate-50 disabled:opacity-40 dark:text-slate-300 dark:hover:bg-white/10"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>

                          <div className="text-right">
                            <p className="text-sm font-bold text-slate-900 dark:text-white">
                              {moneyOf(priceOf(item.price) * item.qty)}
                            </p>
                            {item.qty > 1 ? (
                              <p className="text-[0.68rem] text-slate-400 dark:text-slate-500">
                                {moneyOf(priceOf(item.price))} each
                              </p>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                  </div>
                  ) : null}

                  {/* ===== step 2: delivery details ===== */}
                  {step === 2 ? (
                  <section
                    id="checkout-delivery"
                    className="scroll-mt-24 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04]"
                  >
                    <div className="flex items-start gap-2.5">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand-600 to-brand-800 text-white shadow-md shadow-brand-700/25">
                        <MapPin className="h-4 w-4" />
                      </span>
                      <div className="min-w-0">
                        <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
                          Delivery details
                        </h2>
                        <p className="text-[0.7rem] text-slate-500 dark:text-slate-400">
                          Ye pata order ke saath admin ko jayega — Settings se bhi aa jata hai.
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div>
                        <label htmlFor="ck-name" className={labelCls}>
                          Full name
                        </label>
                        <div className="relative">
                          <User className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                          <input
                            id="ck-name"
                            value={delivery.fullName}
                            onChange={(e) => setField('fullName', e.target.value)}
                            placeholder="Ali Raza"
                            autoComplete="name"
                            maxLength={60}
                            className={`${inputCls} pl-10`}
                          />
                        </div>
                        {errors.fullName ? <span className={errCls}>{errors.fullName}</span> : null}
                      </div>

                      <div>
                        <label htmlFor="ck-phone" className={labelCls}>
                          Phone
                        </label>
                        <div className="relative">
                          <Phone className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                          <input
                            id="ck-phone"
                            value={delivery.phone}
                            onChange={(e) => setField('phone', e.target.value)}
                            placeholder="03xx xxxxxxx"
                            inputMode="tel"
                            autoComplete="tel"
                            maxLength={20}
                            className={`${inputCls} pl-10`}
                          />
                        </div>
                        {errors.phone ? <span className={errCls}>{errors.phone}</span> : null}
                      </div>

                      <div className="sm:col-span-2">
                        <label htmlFor="ck-address" className={labelCls}>
                          Address
                        </label>
                        <textarea
                          id="ck-address"
                          rows={2}
                          value={delivery.address}
                          onChange={(e) => setField('address', e.target.value)}
                          placeholder="House / street / area"
                          autoComplete="street-address"
                          maxLength={200}
                          className={`${inputCls} resize-none`}
                        />
                        {errors.address ? <span className={errCls}>{errors.address}</span> : null}
                      </div>

                      <div>
                        <label htmlFor="ck-city" className={labelCls}>
                          City
                        </label>
                        <input
                          id="ck-city"
                          list="ck-cities"
                          value={delivery.city}
                          onChange={(e) => setField('city', e.target.value)}
                          placeholder="Karachi"
                          autoComplete="address-level2"
                          maxLength={40}
                          className={inputCls}
                        />
                        <datalist id="ck-cities">
                          {CITIES.map((city) => (
                            <option key={city} value={city} />
                          ))}
                        </datalist>
                        {errors.city ? <span className={errCls}>{errors.city}</span> : null}
                      </div>

                      <div className="flex items-end">
                        <p className="text-[0.68rem] leading-relaxed text-slate-400 dark:text-slate-500">
                          <Truck className="mr-1 inline h-3 w-3" /> {paymentTitle} · Free shipping
                          over {moneyOf(freeOver)}
                        </p>
                      </div>
                    </div>
                  </section>
                  ) : null}

                {/* ===== step 3: payment method ===== */}
                {step === 3 ? (
                <section
                  id="checkout-payment"
                  className="scroll-mt-24 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04]"
                >
                  <div className="flex items-start gap-2.5">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-gold-600 to-gold-800 text-white shadow-md shadow-gold-700/25">
                      <CreditCard className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
                        Payment method
                      </h2>
                      <p className="text-[0.7rem] text-slate-500 dark:text-slate-400">
                        Cash on delivery, card ya mobile wallet — jo aasan ho
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    {methods.map((option) => {
                      const Icon = PAYMENT_ICONS[option.key] || CreditCard
                      const active = payment === option.key
                      return (
                        <button
                          key={option.key}
                          type="button"
                          onClick={() => setPayment(option.key)}
                          aria-pressed={active}
                          className={`flex items-center gap-2.5 rounded-xl border p-3 text-left transition ${
                            active
                              ? 'border-brand-500 bg-brand-50 ring-2 ring-brand-200 dark:border-brand-400 dark:bg-brand-500/15 dark:ring-brand-500/20'
                              : 'border-slate-200 hover:border-brand-300 dark:border-white/10 dark:hover:border-brand-400/40'
                          }`}
                        >
                          <span
                            className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${
                              active
                                ? 'bg-brand-700 text-white'
                                : 'bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-300'
                            }`}
                          >
                            <Icon className="h-4 w-4" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-[0.8rem] font-bold text-slate-900 dark:text-white">
                              {option.title}
                            </span>
                            <span className="block text-[0.66rem] text-slate-500 dark:text-slate-400">
                              {option.desc}
                            </span>
                          </span>
                          {active ? (
                            <CheckCircle2 className="h-4 w-4 shrink-0 text-brand-700 dark:text-brand-300" />
                          ) : null}
                        </button>
                      )
                    })}
                  </div>

                  {/* debit / credit card fields */}
                  {payment === 'card' ? (
                    <div className="mt-4 grid gap-3 rounded-2xl border border-slate-200/70 bg-slate-50/70 p-3.5 sm:grid-cols-2 dark:border-white/10 dark:bg-white/[0.03]">
                      <div className="sm:col-span-2">
                        <label htmlFor="ck-card" className={labelCls}>
                          Card number
                        </label>
                        <div className="relative">
                          <CreditCard className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                          <input
                            id="ck-card"
                            value={card.number}
                            onChange={(e) => setCard({ ...card, number: formatCard(e.target.value) })}
                            placeholder="4242 4242 4242 4242"
                            inputMode="numeric"
                            autoComplete="cc-number"
                            maxLength={23}
                            className={`${inputCls} pl-10 pr-24`}
                          />
                          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[0.6rem] font-bold uppercase tracking-[0.12em] text-slate-400">
                            {cardBrand(card.number)}
                          </span>
                        </div>
                        {errors.number ? <span className={errCls}>{errors.number}</span> : null}
                      </div>

                      <div className="sm:col-span-2">
                        <label htmlFor="ck-cardname" className={labelCls}>
                          Name on card
                        </label>
                        <input
                          id="ck-cardname"
                          value={card.name}
                          onChange={(e) => setCard({ ...card, name: e.target.value })}
                          placeholder="ALI RAZA"
                          autoComplete="cc-name"
                          maxLength={40}
                          className={`${inputCls} uppercase`}
                        />
                        {errors.cardName ? <span className={errCls}>{errors.cardName}</span> : null}
                      </div>

                      <div>
                        <label htmlFor="ck-expiry" className={labelCls}>
                          Expiry
                        </label>
                        <input
                          id="ck-expiry"
                          value={card.expiry}
                          onChange={(e) => setCard({ ...card, expiry: formatExpiry(e.target.value) })}
                          placeholder="MM/YY"
                          inputMode="numeric"
                          autoComplete="cc-exp"
                          maxLength={5}
                          className={inputCls}
                        />
                        {errors.expiry ? <span className={errCls}>{errors.expiry}</span> : null}
                      </div>

                      <div>
                        <label htmlFor="ck-cvv" className={labelCls}>
                          CVV
                        </label>
                        <input
                          id="ck-cvv"
                          type="password"
                          value={card.cvv}
                          onChange={(e) =>
                            setCard({ ...card, cvv: digitsOnly(e.target.value).slice(0, 4) })
                          }
                          placeholder="123"
                          inputMode="numeric"
                          autoComplete="cc-csc"
                          maxLength={4}
                          className={inputCls}
                        />
                        {errors.cvv ? <span className={errCls}>{errors.cvv}</span> : null}
                      </div>

                      <p className="text-[0.64rem] leading-relaxed text-slate-500 sm:col-span-2 dark:text-slate-400">
                        <ShieldCheck className="mr-1 inline h-3 w-3" /> Card number sirf check hota
                        hai — server par sirf last 4 digits jate hain, CVV kabhi save nahi hota.
                      </p>
                    </div>
                  ) : null}

                  {/* easypaisa / jazzcash */}
                  {payment === 'easypaisa' || payment === 'jazzcash' ? (
                    <div className="mt-4 grid gap-3 rounded-2xl border border-slate-200/70 bg-slate-50/70 p-3.5 dark:border-white/10 dark:bg-white/[0.03]">
                      <div>
                        <label htmlFor="ck-mobile" className={labelCls}>
                          {payment === 'easypaisa' ? 'EasyPaisa number' : 'JazzCash number'}
                        </label>
                        <div className="relative">
                          <Smartphone className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                          <input
                            id="ck-mobile"
                            value={wallet.mobile}
                            onChange={(e) => setWallet({ mobile: formatMobile(e.target.value) })}
                            placeholder="0301 3367008"
                            inputMode="tel"
                            autoComplete="tel"
                            maxLength={12}
                            className={`${inputCls} pl-10`}
                          />
                        </div>
                        {errors.mobile ? <span className={errCls}>{errors.mobile}</span> : null}
                      </div>
                      <p className="text-[0.64rem] leading-relaxed text-slate-500 dark:text-slate-400">
                        Order place karne ke baad admin isi number par WhatsApp/call karega —
                        payment confirm hone par order approve hoga.
                      </p>
                    </div>
                  ) : null}

                  {/* bank transfer */}
                  {payment === 'bank' ? (
                    <div className="mt-4 grid gap-3 rounded-2xl border border-slate-200/70 bg-slate-50/70 p-3.5 dark:border-white/10 dark:bg-white/[0.03]">
                      <div>
                        <label htmlFor="ck-ref" className={labelCls}>
                          Transaction ID / reference
                        </label>
                        <div className="relative">
                          <Landmark className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                          <input
                            id="ck-ref"
                            value={bankRef}
                            onChange={(e) => setBankRef(e.target.value)}
                            placeholder="jaise 123456789012"
                            maxLength={40}
                            className={`${inputCls} pl-10`}
                          />
                        </div>
                        {errors.bankRef ? <span className={errCls}>{errors.bankRef}</span> : null}
                      </div>
                      <p className="text-[0.64rem] leading-relaxed text-slate-500 dark:text-slate-400">
                        IBFT / online transfer ke baad bank ki di hui transaction ID yahan likho —
                        admin verify karke order approve karega.
                      </p>
                    </div>
                  ) : null}

                  {payment === 'cod' ? (
                    <p className="mt-3 rounded-xl bg-emerald-50 px-3 py-2 text-[0.7rem] font-medium text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-200">
                      Order ghar pahunchne par rider ko cash dein — koi advance nahi.
                    </p>
                  ) : null}
                </section>
                ) : null}

              </div>

              {/* ---------- summary ---------- */}
                <aside className="rounded-3xl border border-slate-200/80 bg-white p-4 shadow-sm lg:sticky lg:top-24 dark:border-white/10 dark:bg-white/[0.04]">
                  <h2 className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                    Order summary
                  </h2>

                  <dl className="mt-4 space-y-2.5 text-sm">
                    <div className="flex items-center justify-between">
                      <dt className="text-slate-500 dark:text-slate-400">Subtotal ({count})</dt>
                      <dd className="font-semibold text-slate-900 dark:text-white">
                        {moneyOf(subtotal)}
                      </dd>
                    </div>
                    <div className="flex items-center justify-between">
                      <dt className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                        <Truck className="h-3.5 w-3.5" /> Shipping
                      </dt>
                      <dd className="font-semibold text-slate-900 dark:text-white">
                        {shipping === 0 ? (
                          <span className="text-emerald-600 dark:text-emerald-300">Free</span>
                        ) : (
                          moneyOf(shipping)
                        )}
                      </dd>
                    </div>

                    {tax > 0 ? (
                      <div className="flex items-center justify-between">
                        <dt className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                          <Receipt className="h-3.5 w-3.5" /> {`${taxLabel} (${taxPercent}%)`}
                        </dt>
                        <dd className="font-semibold text-slate-900 dark:text-white">
                          {moneyOf(tax)}
                        </dd>
                      </div>
                    ) : null}

                    <div className="flex items-start justify-between gap-2">
                      <dt className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                        <CreditCard className="h-3.5 w-3.5" /> Payment
                      </dt>
                      <dd className="text-right font-semibold text-slate-900 dark:text-white">
                        {paymentTitle}
                        {payment === 'card' && digitsOnly(card.number).length >= 4 ? (
                          <span className="block text-[0.66rem] font-medium text-slate-400 dark:text-slate-500">
                            {cardBrand(card.number)} ···· {digitsOnly(card.number).slice(-4)}
                          </span>
                        ) : null}
                        {(payment === 'easypaisa' || payment === 'jazzcash') && wallet.mobile ? (
                          <span className="block text-[0.66rem] font-medium text-slate-400 dark:text-slate-500">
                            {wallet.mobile}
                          </span>
                        ) : null}
                      </dd>
                    </div>
                  </dl>

                  {shipping > 0 ? (
                    <p className="mt-2.5 rounded-xl bg-amber-50 px-3 py-2 text-[0.72rem] font-medium text-amber-800 dark:bg-amber-500/15 dark:text-amber-200">
                      {moneyOf(Math.max(0, freeOver - subtotal))} aur add karo → shipping free!
                    </p>
                  ) : null}

                  <div className="my-4 h-px bg-slate-200 dark:bg-white/10" />

                  <div className="flex items-end justify-between">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">Total</span>
                    <span className="text-xl font-extrabold text-brand-700 dark:text-brand-300">
                      {moneyOf(total)}
                    </span>
                  </div>

                  {step < 3 ? (
                    <button
                      type="button"
                      onClick={goNext}
                      className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-700 px-4 py-3 text-sm font-bold text-white shadow-md shadow-brand-700/25 transition hover:bg-brand-800 active:scale-[0.98]"
                    >
                      Continue · {STEPS[step]?.title}
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={placeOrder}
                      disabled={placing}
                      className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-700 px-4 py-3 text-sm font-bold text-white shadow-md shadow-brand-700/25 transition hover:bg-brand-800 active:scale-[0.98] disabled:cursor-wait disabled:opacity-70"
                    >
                      {placing ? (
                        <>
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                          Order lag raha hai…
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-4 w-4" /> Place order · {moneyOf(total)}
                        </>
                      )}
                    </button>
                  )}

                  {step > 1 ? (
                    <button
                      type="button"
                      onClick={goBack}
                      disabled={placing}
                      className="mt-2 inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 transition hover:border-brand-300 hover:text-brand-700 dark:border-white/10 dark:text-slate-300 dark:hover:text-brand-200"
                    >
                      Back
                    </button>
                  ) : null}

                  <p className="mt-2.5 flex items-center justify-center gap-1.5 text-[0.68rem] font-medium text-slate-500 dark:text-slate-400">
                    <ShieldCheck className="h-3.5 w-3.5" /> Secure checkout · {paymentTitle}
                  </p>

                  <Link
                    to="/home"
                    className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 transition hover:border-brand-300 hover:text-brand-700 dark:border-white/10 dark:text-slate-300 dark:hover:text-brand-200"
                  >
                    Aur books dekho
                  </Link>
                </aside>
              </div>
              </>
            )}
      </main>

      <Footer />
    </div>
  )
}
