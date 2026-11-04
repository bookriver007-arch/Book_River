import { motion as Motion } from 'framer-motion'

const LOGO = '/logo.png'

// Colours taken straight from the logo artwork
const BLUE = '#2c5698'
const GOLD = '#d7a558'

export default function Logo() {
  return (
    <div className="flex min-h-screen items-center justify-center px-5 py-16">
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
          className="w-64 object-contain drop-shadow-[0_16px_32px_rgba(44,86,152,0.22)] sm:w-80"
        />

        {/* ---- Name ---- */}
        <Motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-8 font-display text-5xl font-bold tracking-tight sm:text-6xl"
          style={{ color: BLUE }}
        >
          Book <span style={{ color: GOLD }}>River</span>
        </Motion.h1>
      </div>
    </div>
  )
}
