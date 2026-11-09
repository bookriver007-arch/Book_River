/**
 * Checkout helpers — payment methods, card/wallet formatting + validation.
 * Cart page inhe use karta hai.
 */
export const PAYMENTS = [
  {
    key: 'cod',
    title: 'Cash on Delivery',
    desc: 'Order milne par cash dein',
  },
  {
    key: 'card',
    title: 'Debit / Credit Card',
    desc: 'Visa · Mastercard · UnionPay',
  },
  {
    key: 'easypaisa',
    title: 'EasyPaisa',
    desc: 'Mobile account se payment',
  },
  {
    key: 'jazzcash',
    title: 'JazzCash',
    desc: 'Mobile account se payment',
  },
  {
    key: 'bank',
    title: 'Bank Transfer',
    desc: 'IBFT / online transfer',
  },
]

export const PAYMENT_TITLE = PAYMENTS.reduce((all, option) => {
  all[option.key] = option.title
  return all
}, {})

export const digitsOnly = (value) => String(value ?? '').replace(/\D/g, '')

/** "4242424242424242" -> "4242 4242 4242 4242" */
export const formatCard = (value) =>
  digitsOnly(value)
    .slice(0, 19)
    .replace(/(.{4})/g, '$1 ')
    .trim()

export const cardBrand = (value) => {
  const number = digitsOnly(value)
  if (/^4/.test(number)) return 'Visa'
  if (/^(5[1-5]|2[2-7])/.test(number)) return 'Mastercard'
  if (/^3[47]/.test(number)) return 'Amex'
  if (/^6/.test(number)) return 'UnionPay'
  return 'Card'
}

/** Luhn check — card number sahi hai ya nahi */
export const luhnOk = (value) => {
  const number = digitsOnly(value)
  if (number.length < 13) return false
  let sum = 0
  let double = false
  for (let i = number.length - 1; i >= 0; i -= 1) {
    let digit = Number(number[i])
    if (double) {
      digit *= 2
      if (digit > 9) digit -= 9
    }
    sum += digit
    double = !double
  }
  return sum % 10 === 0
}

/** "1228" -> "12/28" */
export const formatExpiry = (value) => {
  const number = digitsOnly(value).slice(0, 4)
  return number.length <= 2 ? number : `${number.slice(0, 2)}/${number.slice(2)}`
}

/** MM/YY — aaj ya usse aage */
export const expiryOk = (value) => {
  const match = String(value ?? '').match(/^(\d{2})\/(\d{2})$/)
  if (!match) return false
  const month = Number(match[1])
  if (month < 1 || month > 12) return false
  const end = new Date(2000 + Number(match[2]), month, 1)
  return end > new Date()
}

/** Pakistani mobile: 03xx xxxxxxx (11 digits) */
export const mobileOk = (value) => {
  const number = digitsOnly(value)
  const last11 = number.slice(-11)
  return /^03\d{9}$/.test(last11)
}

/** wallet number ko 0301 3367008 shape me dikhao */
export const formatMobile = (value) => {
  const number = digitsOnly(value).slice(0, 11)
  if (number.length <= 4) return number
  return `${number.slice(0, 4)} ${number.slice(4)}`
}

/**
 * Order ke saath sirf safe payment info jati hai —
 * poora card number ya CVV kabhi save nahi hota.
 */
export const paymentPayload = ({ method, card, wallet, bankRef }) => {
  if (method === 'card') {
    const number = digitsOnly(card.number)
    return {
      method,
      brand: cardBrand(number),
      last4: number.slice(-4),
      ref: '',
      mobile: '',
    }
  }
  if (method === 'easypaisa' || method === 'jazzcash') {
    return {
      method,
      brand: '',
      last4: '',
      ref: '',
      mobile: digitsOnly(wallet.mobile).slice(-11),
    }
  }
  if (method === 'bank') {
    return { method, brand: '', last4: '', ref: String(bankRef || '').trim(), mobile: '' }
  }
  return { method: 'cod', brand: '', last4: '', ref: '', mobile: '' }
}
