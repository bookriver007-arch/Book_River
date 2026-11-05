import { motion as Motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Sun, Moon } from 'lucide-react'
import useTheme from '../hooks/useTheme.js'

const LOGO = '/logo.png'

export default function Navbar() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <header className="nav-glass sticky top-0 z-50">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-5">
        {/* ---- Logo + Name ---- */}
        <Link to="/" className="group flex items-center gap-2.5">
          <Motion.img
            src={LOGO}
            alt="Book River logo"
            className="h-10 w-10 object-contain transition-transform group-hover:scale-110"
          />
          <span className="font-display text-xl font-bold tracking-tight text-brand-900 dark:text-brand-100">
            Book{' '}
            <span className="bg-gradient-to-r from-gold-700 to-gold-500 bg-clip-text text-transparent dark:from-gold-500 dark:to-gold-300">
              River
            </span>
          </span>
        </Link>

        {/* ---- Right side ---- */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Dark mode toggle */}
          <button
            onClick={toggleTheme}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            title={isDark ? 'Light mode' : 'Dark mode'}
            className={`relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border transition-all duration-300 ${
              isDark
                ? 'border-brand-400/40 bg-[#050b14] text-brand-200 shadow-[0_0_18px_rgba(56,103,166,0.45)] hover:shadow-[0_0_26px_rgba(107,136,174,0.6)]'
                : 'border-white bg-white text-brand-700 shadow-[0_2px_10px_rgba(44,86,152,0.18)] hover:shadow-[0_4px_16px_rgba(44,86,152,0.28)]'
            }`}
          >
            <Motion.span
              key={theme}
              initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              transition={{ duration: 0.35 }}
              className="absolute"
            >
              {isDark ? <Moon className="h-4.5 w-4.5" /> : <Sun className="h-4.5 w-4.5" />}
            </Motion.span>
          </button>

          {/* Sign up */}
          <button
            className="rounded-full bg-gradient-to-r from-brand-700 to-brand-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-700/25 transition-all hover:from-brand-800 hover:to-brand-600 hover:shadow-xl hover:shadow-brand-700/35 active:scale-95"
          >
            Sign Up
          </button>
        </div>
      </nav>
    </header>
  )
}
