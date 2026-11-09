import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { DASHBOARD_PATH } from '../lib/pages'

// Colours taken straight from the logo artwork (frontend ke logo page se same)
const BLUE = '#1d3864'
const BLUE_SOFT = '#2c5698'
const GOLD = '#a9782f'
const GOLD_LIGHT = '#c89859'

/**
 * Admin splash — frontend ke logo page jaisa hi.
 * Admin khulte hi yahi dikhta hai; logo / naam / button par click -> dashboard.
 * Animations pure CSS hain (`.splash-in`, `.splash-rule`) — turant paint hota hai.
 */
export default function LogoAdmin() {
  useEffect(() => {
    document.title = 'Book River | Admin Panel'
  }, [])

  return (
    <div className="logo-page flex min-h-screen items-center justify-center px-5 py-16">
      <div className="flex flex-col items-center text-center">
        {/* ---- Logo (clickable -> Admin Home) ---- */}
        <Link to={DASHBOARD_PATH} className="inline-block" aria-label="Open the admin dashboard">
          <img
            src="/logo.png"
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
        <div className="gold-rule splash-rule mt-7 w-52" style={{ animationDelay: '0.3s' }} />

        {/* ---- Name (clickable -> Admin Home) ---- */}
        <h1
          className="splash-in mt-6 font-display text-5xl font-bold tracking-tight sm:text-6xl"
          style={{ animationDelay: '0.2s' }}
        >
          <Link
            to={DASHBOARD_PATH}
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
        </h1>

        {/* ---- Admin badge ---- */}
        <span
          className="splash-in mt-3 rounded-full bg-white/70 px-3.5 py-1 text-[0.62rem] font-bold uppercase tracking-[0.26em] text-brand-700 ring-1 ring-brand-900/10"
          style={{ animationDelay: '0.5s' }}
        >
          Admin Panel
        </span>

        {/* ---- enter button ---- */}
        <div
          className="splash-in mt-8 flex flex-col items-center gap-2"
          style={{ animationDelay: '0.65s' }}
        >
          <Link to={DASHBOARD_PATH} className="btn-gold px-5 py-2.5">
            Open dashboard
            <ArrowRight className="h-4 w-4" />
          </Link>
          <p className="text-[0.72rem] font-medium text-brand-800/60">
            Or click the logo / name
          </p>
        </div>
      </div>
    </div>
  )
}

