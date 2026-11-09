import { useEffect, useState } from 'react'
import { motion as Motion } from 'framer-motion'
import { BadgePercent, Sparkles } from 'lucide-react'
import '../css/Deals.css'

/**
 * Home page ka "Deal" section — heading + short description + 4 deal cards.
 * Cards Admin → Home → "Home Deals" se aate hain (`/api/home-deals`).
 * Purani price par cross (line-through) lagta hai, nayi price highlight hoti hai.
 */

// Fallback — jab tak admin se koi deal upload na ho
const FALLBACK = [
  {
    _id: 'demo-1',
    title: 'The Salt & the Stars',
    author: 'A. M. Rivers',
    imageUrl: '/banners/science.svg',
    oldPrice: 1200,
    price: 800,
  },
  {
    _id: 'demo-2',
    title: 'Letters from the Riverbank',
    author: 'Noor Verma',
    imageUrl: '/banners/fiction.svg',
    oldPrice: 950,
    price: 690,
  },
  {
    _id: 'demo-3',
    title: 'A Brief History of Tomorrow',
    author: 'E. S. Karan',
    imageUrl: '/banners/history.svg',
    oldPrice: 1450,
    price: 990,
  },
  {
    _id: 'demo-4',
    title: 'Verses for Rainy Evenings',
    author: 'Mira Tal',
    imageUrl: '/banners/poetry.svg',
    oldPrice: 799,
    price: 549,
  },
]

const money = (value) => `Rs. ${Number(value || 0).toLocaleString('en-IN')}`

// Hero ke default texts — admin se settings na mile to yehi dikhte hain
const DEFAULTS = {
  eyebrow: 'Deal of the week',
  heading: 'Aaj ki best deals',
  description:
    'Chuni hui kitaabein — Rs. 1,200 ki jagah sirf Rs. 800, aur bhi bahut kuch. Sirf is hafte ke liye, stock khatam hone se pehle.',
  offerTag: 'Up to 40% off',
}

// red sunburst tag ke teeth — ek baar compute hota hai (SVG polygon)
const STAR_POINTS = (() => {
  const spikes = 30
  const outer = 49.5
  const inner = 40.5
  const points = []
  for (let i = 0; i < spikes * 2; i += 1) {
    const radius = i % 2 === 0 ? outer : inner
    const angle = (Math.PI * i) / spikes
    points.push(
      `${(50 + radius * Math.sin(angle)).toFixed(2)},${(50 - radius * Math.cos(angle)).toFixed(2)}`,
    )
  }
  return points.join(' ')
})()

const discountOf = (deal) => {
  const oldP = Number(deal.oldPrice) || 0
  const newP = Number(deal.price) || 0
  if (oldP <= 0 || newP >= oldP) return 0
  return Math.round(((oldP - newP) / oldP) * 100)
}

export default function HomeDeals() {
  const [deals, setDeals] = useState([])
  const [settings, setSettings] = useState(DEFAULTS)

  // Admin se deals + hero ke texts load karo (na mile to fallback).
  useEffect(() => {
    let cancelled = false

    fetch('/api/home-deals')
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        if (!cancelled) setDeals(Array.isArray(data) ? data : [])
      })
      .catch(() => {
        if (!cancelled) setDeals([])
      })

    fetch('/api/home-deals/settings')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled || !data) return
        setSettings({
          eyebrow: data.eyebrow || DEFAULTS.eyebrow,
          heading: data.heading || DEFAULTS.heading,
          description: data.description || DEFAULTS.description,
          offerTag: data.offerTag || DEFAULTS.offerTag,
        })
      })
      .catch(() => {})

    return () => {
      cancelled = true
    }
  }, [])

  const items = (deals.length ? deals : FALLBACK).slice(0, 4)

  // "Up to 40% off" -> { before: 'Up to', pct: '40%', after: 'off' }
  // (tag me percentage bada aur modern dikhta hai)
  const tagParts = (() => {
    const match = String(settings.offerTag || '').match(/^(.*?)(\d+\s*%)(.*)$/)
    if (!match) return null
    return {
      before: match[1].trim(),
      pct: match[2].replace(/\s+/g, ''),
      after: match[3].trim(),
    }
  })()

  return (
    <section className="relative mx-auto mt-10 w-full max-w-7xl px-4 pb-6 sm:px-6">
      {/* ---- golden + orange offer box: heading + short description ---- */}
      <div className="deal-hero">
        {/* ---- heading + description (left) + red offer tag (right) ---- */}
        <div className="relative flex flex-col items-center gap-6 md:flex-row md:items-center md:justify-between md:gap-8">
          <div className="max-w-2xl text-center md:text-left">
            <span className="deal-hero-badge">
              <Sparkles className="h-3 w-3" /> {settings.eyebrow}
            </span>

            <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
              <span className="bg-gradient-to-r from-gold-700 via-[#d2731f] to-[#e08a2e] bg-clip-text text-transparent dark:from-gold-300 dark:to-[#f0a83c]">
                {settings.heading}
              </span>
            </h2>

            <p className="mt-2 max-w-xl text-sm leading-relaxed text-brand-900/70 md:mx-0 dark:text-gold-100/70">
              {settings.description}
            </p>

            <span className="mt-3 block text-[0.62rem] font-bold uppercase tracking-[0.2em] text-brand-900/45 dark:text-gold-100/50">
              Limited time offer
            </span>
          </div>

          {/* ---- red sunburst offer tag — section ke RIGHT me ---- */}
          <div className="shrink-0 md:pr-1">
            <div className="deal-sticker" title={settings.offerTag}>
              <svg viewBox="0 0 100 100" className="deal-sticker-svg" aria-hidden="true">
                <polygon points={STAR_POINTS} fill="#d42a10" />
                <circle cx="50" cy="50" r="36.5" fill="#c8230b" />
                <circle
                  cx="50"
                  cy="50"
                  r="33"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="0.9"
                  strokeDasharray="2.2 2"
                  opacity="0.9"
                />
              </svg>
              <span className="deal-sticker-text">
                {tagParts ? (
                  <>
                    {tagParts.before ? (
                      <span className="deal-sticker-unit">{tagParts.before}</span>
                    ) : null}
                    <span className="deal-sticker-pct">{tagParts.pct}</span>
                    {tagParts.after ? (
                      <span className="deal-sticker-unit">{tagParts.after}</span>
                    ) : null}
                  </>
                ) : (
                  settings.offerTag
                )}
              </span>
            </div>
          </div>
        </div>

        <div className="deal-hero-divider" aria-hidden="true" />

        {/* ---- 4 deal cards (isi offer box ke andar) ---- */}
        <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {items.map((deal, i) => {
          const off = discountOf(deal)
          return (
            <Motion.article
              key={deal._id || deal.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.45, delay: i * 0.06 }}
              className="deal-card group relative p-2 transition-transform duration-300 hover:-translate-y-1.5"
            >
              {/* ---- asli book shape (3D tilt + spine + pages) ---- */}
              <div className="deal-book">
                <div className="deal-book-inner">
                  <span className="deal-pages" aria-hidden="true" />
                  <div className="deal-cover">
                    <img
                      src={deal.imageUrl}
                      alt={`${deal.title} cover`}
                      loading="lazy"
                      decoding="async"
                    />
                    {off > 0 ? <span className="deal-badge">-{off}%</span> : null}
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <h3 className="line-clamp-2 text-sm font-bold leading-snug text-brand-900 dark:text-white">
                  {deal.title}
                </h3>
                {deal.author ? (
                  <p className="mt-0.5 truncate text-[0.72rem] text-brand-800/65 dark:text-white/55">
                    by {deal.author}
                  </p>
                ) : null}

                <div className="mt-2 flex flex-wrap items-baseline gap-x-2">
                  <span className="text-[0.95rem] font-extrabold text-brand-700 dark:text-brand-100">
                    {money(deal.price)}
                  </span>
                  <span className="text-xs font-semibold text-brand-800/45 line-through decoration-rose-500/70 decoration-2 dark:text-white/40">
                    {money(deal.oldPrice)}
                  </span>
                </div>

                {off > 0 ? (
                  <p className="mt-1 inline-flex items-center gap-1 text-[0.68rem] font-bold text-emerald-700 dark:text-emerald-400">
                    <BadgePercent className="h-3 w-3" /> {money(deal.oldPrice - deal.price)} bachao
                  </p>
                ) : null}
              </div>
            </Motion.article>
          )
        })}
        </div>
      </div>
    </section>
  )
}
