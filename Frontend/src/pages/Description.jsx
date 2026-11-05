import { motion as Motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'

const LOGO = '/logo.png'

const paragraphs = [
  'Book River is an online marketplace where readers and sellers meet. Thousands of handpicked titles — fiction, science, history, business and everything in between — sold by people who genuinely love books.',
  'Read something new, or turn your old shelf into something useful. Honest prices, safe payments and delivery that actually arrives on time.',
  'Every order supports a small business, a student, or a reader who is building their own little library, one book at a time.',
]

export default function Description() {
  return (
    <div className="book-page min-h-screen">
      <Navbar />

      <div className="mx-auto max-w-2xl px-5 py-14 sm:py-20">
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
        >
          <span className="bg-gradient-to-r from-brand-900 to-brand-600 bg-clip-text text-transparent dark:from-brand-200 dark:to-brand-400">
            Book{' '}
          </span>
          <span className="bg-gradient-to-r from-gold-700 to-gold-500 bg-clip-text text-transparent dark:from-gold-400 dark:to-gold-200">
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
              className="text-base leading-relaxed text-brand-800/90 dark:text-brand-200/80 sm:text-lg"
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
        />
      </div>
    </div>
  )
}
