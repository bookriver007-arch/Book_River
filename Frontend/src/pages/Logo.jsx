import { motion as Motion } from 'framer-motion'

const LOGO = '/logo.png'

export default function Logo() {
  return (
    <div className="book-page flex min-h-screen items-center justify-center px-5 py-16">
      <div className="flex flex-col items-center text-center">
        {/* ---- Logo ---- */}
        <Motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative"
        >
          <div className="absolute inset-0 -z-10">
            <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-200/40 blur-3xl" />
            <div className="absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-200/50 blur-3xl" />
          </div>

          <Motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            className="book-card p-6"
          >
            <div className="absolute inset-x-0 top-0 h-1 rounded-t-2xl bg-gradient-to-r from-brand-400 via-amber-400 to-brand-600" />
            <img
              src={LOGO}
              alt="Book River logo — an open book under a rising sun"
              className="w-64 object-contain drop-shadow-[0_16px_32px_rgba(74,63,53,0.25)] sm:w-80"
            />
          </Motion.div>
        </Motion.div>

        {/* ---- Name ---- */}
        <Motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-8 font-display text-5xl font-bold tracking-tight text-ink-900 sm:text-6xl"
        >
          Book <span className="gold-text">River</span>
        </Motion.h1>

        <Motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="mt-3 text-sm uppercase tracking-[0.25em] text-ink-700/60"
        >
          Your riverside of books
        </Motion.p>
      </div>
    </div>
  )
}
