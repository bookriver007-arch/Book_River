import crypto from 'node:crypto'

/**
 * TOTP (Google Authenticator compatible) — bina kisi extra package ke.
 *   secret  : Base32 string (20 random bytes)
 *   code    : 6 digits, har 30 second badalta hai, SHA1 (RFC 6238)
 */
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'

const base32Encode = (buffer) => {
  let bits = 0
  let value = 0
  let output = ''

  for (const byte of buffer) {
    value = (value << 8) | byte
    bits += 8
    while (bits >= 5) {
      output += ALPHABET[(value >>> (bits - 5)) & 31]
      bits -= 5
    }
  }
  if (bits > 0) output += ALPHABET[(value << (5 - bits)) & 31]

  return output
}

const base32Decode = (input) => {
  const clean = String(input || '')
    .toUpperCase()
    .replace(/=+$/, '')
    .replace(/\s+/g, '')

  let bits = 0
  let value = 0
  const bytes = []

  for (const char of clean) {
    const index = ALPHABET.indexOf(char)
    if (index === -1) continue
    value = (value << 5) | index
    bits += 5
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 255)
      bits -= 8
    }
  }

  return Buffer.from(bytes)
}

/** naya secret (Base32) */
export const generateSecret = (size = 20) => base32Encode(crypto.randomBytes(size))

/** ek waqt ka 6-digit code */
export const totp = (secret, { step = 30, digits = 6, at = Date.now() } = {}) => {
  const key = base32Decode(secret)
  if (!key.length) return ''

  const counter = Math.floor(at / 1000 / step)
  const buffer = Buffer.alloc(8)
  buffer.writeUInt32BE(Math.floor(counter / 2 ** 32), 0)
  buffer.writeUInt32BE(counter % 2 ** 32, 4)

  const hmac = crypto.createHmac('sha1', key).update(buffer).digest()
  const offset = hmac[hmac.length - 1] & 0x0f
  const binary =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff)

  return String(binary % 10 ** digits).padStart(digits, '0')
}

/** code check — clock thoda aage/peeche ho to bhi chal jaye (window = 1) */
export const verifyTotp = (secret, token, { window = 1, step = 30, digits = 6 } = {}) => {
  const code = String(token || '').replace(/\D/g, '')
  if (code.length !== digits) return false

  const now = Date.now()
  for (let drift = -window; drift <= window; drift += 1) {
    const expected = totp(secret, { step, digits, at: now + drift * step * 1000 })
    if (!expected || expected.length !== code.length) continue
    if (crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(code))) return true
  }

  return false
}

/** Google Authenticator ka QR isi link se banta hai */
export const otpauthUri = ({ secret, label, issuer = 'Book River' }) =>
  `otpauth://totp/${encodeURIComponent(label)}?secret=${secret}&issuer=${encodeURIComponent(
    issuer,
  )}&algorithm=SHA1&digits=6&period=30`
