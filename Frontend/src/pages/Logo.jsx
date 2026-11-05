import { motion as Motion } from 'framer-motion'

const LOGO = '/logo.png'

// Colours taken straight from the logo artwork (darkened for contrast)
const BLUE = '#1d3864'
const BLUE_SOFT = '#2c5698'
const GOLD = '#a9782f'
const GOLD_LIGHT = '#c89859'

export default function Logo() {
  return (
    <div className="book-page flex min-h-screen items-center justify-center px-5 py-16">
      <div className="flex flex-col items-center text-center">
        {/* ---- Logo (white background already removed) ---- */}
        <Motion.img
          src={LOGO}
          alt="Book River logo — an open book under a rising sun"
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1, y: [0, -10, 0] }}
          transition={{
            opacity: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
            scale: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
            y: { duration: 6, repeat: Infinity, ease: 'easeInOut' },
          }}
          className="w-64 object-contain drop-shadow-[0_18px_38px_rgba(44,86,152,0.28)] sm:w-80"
        />

        {/* ---- Gold hairline (echoes the logo's gold spine) ---- */}
        <Motion.div
          initial={{ opacity: 0, scaleX: 0.3 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="gold-rule mt-7 w-52"
        />

        {/* ---- Name ---- */}
        <Motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 font-display text-5xl font-bold tracking-tight sm:text-6xl"
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
      </div>
    </div>
  )
}
