import { motion as Motion } from 'framer-motion'
import { Link } from 'react-router-dom'

const LOGO = '/logo.png'

// Colours taken straight from the logo artwork (darkened for contrast)
const BLUE = '#1d3864'
const BLUE_SOFT = '#2c5698'
const GOLD = '#a9782f'
const GOLD_LIGHT = '#c89859'

const paragraphs = [
  'Book River is an online marketplace where readers and sellers meet. Thousands of handpicked titles — fiction, science, history, business and everything in between — sold by people who genuinely love books.',
  'Read something new, or turn your old shelf into something useful. Honest prices, safe payments and delivery that actually arrives on time.',
  'Every order supports a small business, a student, or a reader who is building their own little library, one book at a time.',
]

export default function Description() {
  return (
    <div className="book-page min-h-screen px-5 py-16 sm:py-24">
      <div className="mx-auto max-w-2xl">
        {/* ---- Logo (clickable -> home) ---- */}
        <Link to="/" className="inline-block" aria-label="Back to home">
          <Motion.img
            src={LOGO}
            alt="Book River logo"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="w-40 cursor-pointer object-contain drop-shadow-[0_12px_26px_rgba(44,86,152,0.25)] transition-transform hover:scale-105 sm:w-48"
          />
        </Link>

        {/* ---- Name ---- */}
        <Motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mt-6 font-display text-4xl font-bold tracking-tight sm:text-5xl"
          style={{
            backgroundImage: `linear-gradient(100deg, ${BLUE} 0%, ${BLUE_SOFT} 45%, ${BLUE} 72%, ${BLUE_SOFT} 100%)`,
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
          }}
        >
          Book{' '}
          <span
            style={{
              backgroundImage: `linear-gradient(100deg, ${GOLD} 0%, ${GOLD_LIGHT} 45%, ${GOLD} 75%, ${GOLD_LIGHT} 100%)`,
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
            }}
          >
            River
          </span>
        </Motion.h1>

        {/* ---- Gold hairline ---- */}
        <Motion.div
          initial={{ opacity: 0, scaleX: 0.3 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.25 }}
          className="gold-rule mt-6 w-48"
        />

        {/* ---- Description ---- */}
        <div className="mt-8 space-y-5">
          {paragraphs.map((text, i) => (
            <Motion.p
              key={i}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.35 + i * 0.12 }}
              className="text-base leading-relaxed text-brand-800/90 sm:text-lg"
            >
              {text}
            </Motion.p>
          ))}
        </div>

        {/* ---- Back link ---- */}
        <Motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-10"
        >
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full bg-brand-700 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-700/25 transition hover:bg-brand-800"
          >
            Back
          </Link>
        </Motion.div>
      </div>
    </div>
  )
}
