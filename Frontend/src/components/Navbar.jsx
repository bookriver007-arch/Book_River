import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { motion as Motion } from 'framer-motion'
import {
  ArrowLeft,
  ChevronDown,
  Heart,
  Home,
  LogOut,
  Moon,
  PackageSearch,
  Settings as SettingsIcon,
  ShoppingCart,
  Sun,
  UserPlus,
} from 'lucide-react'
import useTheme from '../hooks/useTheme.js'
import useLang from '../hooks/useLang.js'
import useBrandAssets from '../hooks/useBrandAssets.js'
import useWishlist from '../hooks/useWishlist.js'
import useCart from '../hooks/useCart.js'

const CATEGORIES = [
  { label: 'Board Books', slug: 'board-books' },
  { label: 'Kids Story Books', slug: 'kids-story-books' },
  { label: 'Knowledge Books', slug: 'knowledge-books' },
  { label: 'Activity Books', slug: 'activity-books' },
  { label: 'Teen Fiction', slug: 'teen-fiction' },
  { label: 'Adult Novels', slug: 'adult-novels' },
]

/* ek hi jaisa pill look — active par gradient highlight slide karta hai */
const pillBase =
  'relative flex shrink-0 items-center whitespace-nowrap rounded-full px-2 py-1 text-[0.71rem] font-semibold transition-colors duration-200 sm:px-2.5 sm:text-[0.75rem]'

const pillTone = 'text-brand-800/75 hover:text-brand-900 dark:text-white/70 dark:hover:text-white'

const pillClass = ({ isActive }) => `${pillBase} ${isActive ? 'text-white' : pillTone}`

/**
 * Active pill ka gradient background — same layoutId hone ki wajah se
 * ek category se doosri par jaate waqt highlight smoothly slide karta hai.
 */
function ActivePill() {
  return (
    <Motion.span
      layoutId="nav-active-pill"
      initial={false}
      transition={{ type: 'spring', stiffness: 460, damping: 34 }}
      className="nav-pill-bg"
      aria-hidden="true"
    />
  )
}

/**
 * Modern navbar (single line, floating capsule):
 * [logo] │ categories (scroll) │ [Home] [Settings] │ [🌙] [user ▾]
 *  - scroll par compact ho jaati hai
 *  - user chip par click -> Home / Settings / Logout dropdown
 *  - back=true   -> Back button (Auth page)
 *  - login nahi  -> Sign Up button
 */
export default function Navbar({
  back = false,
  user = null,
  onLogout = null,
  categories = false,
  wide = false,
  shopIcons = true,
}) {
  const { theme, toggleTheme } = useTheme()
  const { isUrdu, toggleLang } = useLang()
  const { logoUrl } = useBrandAssets()
  const { count: wishlistCount } = useWishlist()
  const { count: cartCount } = useCart()
  const navigate = useNavigate()

  const isDark = theme === 'dark'
  const initial = (user?.name || user?.email || 'R').trim().charAt(0).toUpperCase()
  const firstName = (user?.name || 'Reader').trim().split(' ')[0]

  // scroll hone par navbar compact + thodi zyada solid (sirf 1 state, passive listener)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // user chip ka dropdown (Home / Settings / Logout)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    if (!menuOpen) return undefined

    const onPointerDown = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) setMenuOpen(false)
    }
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }

    document.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [menuOpen])

  const closeMenu = () => setMenuOpen(false)

  const themeButton = (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Light mode' : 'Dark mode'}
      className="nav-icon-btn"
    >
      <Motion.span
        key={theme}
        initial={{ rotate: -90, scale: 0.4, opacity: 0 }}
        animate={{ rotate: 0, scale: 1, opacity: 1 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="grid place-items-center"
      >
        {isDark ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
      </Motion.span>
    </button>
  )

  /** EN / اردو toggle — poori site ki bhasha */
  const langButton = (
    <button
      type="button"
      onClick={toggleLang}
      aria-label={isUrdu ? 'Switch to English' : 'اردو میں دیکھیں'}
      title={isUrdu ? 'English' : 'اردو'}
      className="nav-icon-btn w-auto px-2 text-[0.66rem] font-extrabold tracking-wide"
    >
      {isUrdu ? 'EN' : 'اردو'}
    </button>
  )

  const utilityButtons = (
    <>
      {langButton}
      {themeButton}
    </>
  )

  const wishlistButton = (
    <Link
      to="/wishlist"
      aria-label={wishlistCount ? `Wishlist (${wishlistCount} books)` : 'Wishlist'}
      title="Wishlist"
      className="nav-icon-btn relative"
    >
      <Heart className="h-3.5 w-3.5" />
      {wishlistCount > 0 ? (
        <span className="absolute -right-1 -top-0.5 grid h-4 min-w-[1rem] place-items-center rounded-full bg-rose-500 px-1 text-[0.56rem] font-bold leading-none text-white shadow">
          {wishlistCount > 9 ? '9+' : wishlistCount}
        </span>
      ) : null}
    </Link>
  )

  const cartButton = (
    <Link
      to="/cart"
      aria-label={cartCount ? `Cart (${cartCount} items)` : 'Cart'}
      title="Cart"
      className="nav-icon-btn relative"
    >
      <ShoppingCart className="h-3.5 w-3.5" />
      {cartCount > 0 ? (
        <span className="absolute -right-1 -top-0.5 grid h-4 min-w-[1rem] place-items-center rounded-full bg-brand-600 px-1 text-[0.56rem] font-bold leading-none text-white shadow">
          {cartCount > 9 ? '9+' : cartCount}
        </span>
      ) : null}
    </Link>
  )

  const trackButton = (
    <Link
      to="/track"
      aria-label="Order tracking"
      title="Order tracking — status dekho"
      className="nav-icon-btn relative"
    >
      <PackageSearch className="h-3.5 w-3.5" />
    </Link>
  )

  const userChip = (
    <div ref={menuRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setMenuOpen((open) => !open)}
        aria-haspopup="menu"
        aria-expanded={menuOpen}
        aria-label="Account menu"
        className="nav-user cursor-pointer"
      >
        <span className="nav-avatar" aria-hidden="true">
          {initial}
        </span>
        <span className="hidden max-w-[6rem] truncate text-[0.73rem] font-bold sm:inline">
          {firstName}
        </span>
        <ChevronDown
          className={`hidden h-3 w-3 opacity-70 transition-transform duration-300 sm:block ${
            menuOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {menuOpen && (
        <Motion.div
          role="menu"
          initial={{ opacity: 0, y: -8, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          className="nav-menu"
        >
          <div className="nav-menu-head">
            <p className="truncate text-[0.84rem] font-bold text-brand-900 dark:text-white">
              {user?.name || 'Reader'}
            </p>
            <p className="truncate text-[0.7rem] text-brand-800/60 dark:text-white/50">
              {user?.email || 'Signed in'}
            </p>
          </div>

          <button
            type="button"
            role="menuitem"
            onClick={() => {
              closeMenu()
              navigate('/home')
            }}
            className="nav-menu-item"
          >
            <Home className="h-4 w-4" /> Home
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              closeMenu()
              navigate('/settings')
            }}
            className="nav-menu-item"
          >
            <SettingsIcon className="h-4 w-4" /> Settings
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              closeMenu()
              navigate('/track')
            }}
            className="nav-menu-item"
          >
            <PackageSearch className="h-4 w-4" /> Track order
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              closeMenu()
              onLogout?.()
            }}
            className="nav-menu-item nav-menu-item--danger"
          >
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </Motion.div>
      )}
    </div>
  )

  return (
    <header className={`sticky top-0 z-50 pt-2.5 sm:pt-3 ${wide ? 'px-3 sm:px-6' : 'px-4 sm:px-10'}`}>
      <div
        className={`nav-shell mx-auto ${wide ? 'max-w-none' : 'max-w-[80rem]'} ${
          scrolled ? 'nav-shell--scrolled' : ''
        }`}
      >
        <nav
          className={`nav-glass flex items-center gap-1.5 rounded-[calc(2rem-1px)] px-2 transition-all duration-300 sm:gap-2.5 sm:px-3 ${
            scrolled ? 'h-[3.25rem]' : 'h-[3.75rem]'
          }`}
        >
          {/* ---- Logo (soft disc + gold rim) ---- */}
          <Link to="/" className="nav-logo group flex shrink-0 items-center gap-2 pl-0.5">
            <span className="nav-logo-tile">
              <img
                src={logoUrl}
                alt="Book River logo"
                width="20"
                height="20"
                loading="eager"
                decoding="async"
                className="h-5 w-5 object-contain transition-transform duration-500 group-hover:scale-110 dark:brightness-125"
              />
            </span>
            <span className="hidden font-display text-[0.98rem] font-bold tracking-tight text-brand-900 lg:inline dark:text-white">
              Book{' '}
              <span className="bg-gradient-to-r from-gold-700 to-gold-500 bg-clip-text text-transparent dark:from-gold-400 dark:to-gold-200">
                River
              </span>
            </span>
          </Link>

          <span className="hidden h-7 w-px shrink-0 bg-gradient-to-b from-transparent via-brand-900/15 to-transparent sm:block dark:via-white/20" />

          {/* ---- categories + Home + Settings (ek hi segmented track) ---- */}
          {categories || user ? (
            <div className="nav-seg md:justify-between">
              {categories
                ? CATEGORIES.map((c) => (
                    <NavLink key={c.slug} to={`/category/${c.slug}`} className={pillClass}>
                      {({ isActive }) => (
                        <>
                          {isActive ? <ActivePill /> : null}
                          <span className="relative z-10">{c.label}</span>
                        </>
                      )}
                    </NavLink>
                  ))
                : null}

              {user ? (
                <>
                  <NavLink to="/home" className={pillClass}>
                    {({ isActive }) => (
                      <>
                        {isActive ? <ActivePill /> : null}
                        <span className="relative z-10">Home</span>
                      </>
                    )}
                  </NavLink>
                  <NavLink to="/settings" className={pillClass}>
                    {({ isActive }) => (
                      <>
                        {isActive ? <ActivePill /> : null}
                        <span className="relative z-10">Settings</span>
                      </>
                    )}
                  </NavLink>
                </>
              ) : null}
            </div>
          ) : (
            <div className="flex-1" />
          )}

          {/* ---- right cluster: (wishlist + cart + track) + theme + (user ▾ | Back | Sign Up) ---- */}
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            {shopIcons ? (
              <>
                {wishlistButton}
                {cartButton}
                {trackButton}
              </>
            ) : null}
            {user ? (
              <>
                {utilityButtons}
                {userChip}
              </>
            ) : back ? (
              <>
                {utilityButtons}
                <button
                  type="button"
                  onClick={() => navigate('/description')}
                  className="nav-cta flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full bg-gradient-to-r from-brand-700 to-brand-500 px-3 py-1.5 text-[0.74rem] font-semibold text-white shadow-lg shadow-brand-700/25 transition-all hover:from-brand-800 hover:to-brand-600 hover:shadow-xl active:scale-95"
                >
                  <ArrowLeft className="h-3 w-3" />
                  <span className="relative z-10">Back</span>
                </button>
              </>
            ) : (
              <>
                {utilityButtons}
                <Link
                  to="/auth"
                  className="nav-cta flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full bg-gradient-to-r from-brand-700 via-brand-600 to-gold-700 px-3.5 py-1.5 text-[0.74rem] font-semibold text-white shadow-lg shadow-brand-700/25 transition-all hover:shadow-xl active:scale-95"
                >
                  <UserPlus className="h-3 w-3" />
                  <span className="relative z-10">Sign Up</span>
                </Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  )
}


