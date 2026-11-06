import { motion as Motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import useBrandAssets from '../hooks/useBrandAssets.js'
import '../css/Logo.css'

// Colours taken straight from the logo artwork (darkened for contrast)
const BLUE = '#1d3864'
const BLUE_SOFT = '#2c5698'
const GOLD = '#a9782f'
const GOLD_LIGHT = '#c89859'

export default function Logo() {
  const { logoUrl } = useBrandAssets()

  return (
    <div className="logo-page flex min-h-screen items-center justify-center px-5 py-16">
      <div className="flex flex-col items-center text-center">
        {/* ---- Logo (clickable -> Description) ---- */}
        <Link to="/description" className="inline-block" aria-label="Go to description">
          {/* CSS float animation instead of a framer-motion infinite loop:
              no React re-renders, runs entirely on the GPU. */}
          <img
            src={logoUrl}
            alt="Book River logo — an open book under a rising sun"
            width="320"
            height="214"
            loading="eager"
            decoding="async"
            className="w-64 cursor-pointer object-contain drop-shadow-[0_18px_38px_rgba(44,86,152,0.28)] transition-transform duration-300 hover:scale-105 sm:w-80"
            style={{ animation: 'float-soft 6s ease-in-out infinite' }}
          />
        </Link>

        {/* ---- Gold hairline (echoes the logo's gold spine) ---- */}
        <Motion.div
          initial={{ opacity: 0, scaleX: 0.3 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="gold-rule mt-7 w-52"
        />

        {/* ---- Name (clickable -> Description) ---- */}
        <Motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 font-display text-5xl font-bold tracking-tight sm:text-6xl"
        >
          <Link
            to="/description"
            className="inline-block cursor-pointer transition-transform hover:scale-[1.04]"
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
          </Link>
        </Motion.h1>
      </div>
    </div>
  )
}
