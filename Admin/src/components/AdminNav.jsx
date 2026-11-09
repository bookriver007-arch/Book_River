import { useEffect, useRef, useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  ChevronDown,
  ClipboardList,
  CreditCard,
  House,
  LayoutDashboard,
  LogOut,
  ScrollText,
  Settings as SettingsIcon,
  Tags,
} from 'lucide-react'
import { ENDPOINTS } from '../lib/api'
import { clearAdminSession, getAdmin } from '../lib/adminAuth'
import {
  ADMIN_DASHBOARD_PATH,
  CATEGORY_PAGES,
  CHECKOUT_PATH,
  DASHBOARD_PATH,
  DESCRIPTION_PATH,
  ORDERS_PATH,
  SETTINGS_PATH,
  categoryPath,
} from '../lib/pages'

const linkClass = ({ isActive }) => (isActive ? 'anav-link active' : 'anav-link')

/**
 * Admin navbar — frontend navbar jaisa hi (ek row).
 * [logo] | Board Books · Kids Story Books · Knowledge Books · Activity Books ·
 * Teen Fiction · Adult Novels | Dashboard · Description · Home · Settings · Orders · Checkout | Logout
 *
 * Slides, Categories, Open Book, Kids Book, Frames, Products, Reviews — ye sab
 * sirf Description page ke andar hain, isliye navbar me alag se nahi hain.
 */
export default function AdminNav() {
  // pending orders ka badge (approve karna baaki hai)
  const [pendingOrders, setPendingOrders] = useState(0)
  const admin = getAdmin()
  const menuRef = useRef(null)

  /** close the pages dropdown */
  const closeMenu = () => {
    if (menuRef.current) menuRef.current.open = false
  }

  // bahar click karne par dropdown band
  useEffect(() => {
    const onDown = (event) => {
      if (menuRef.current?.open && !menuRef.current.contains(event.target)) {
        menuRef.current.open = false
      }
    }
    document.addEventListener('pointerdown', onDown)
    return () => document.removeEventListener('pointerdown', onDown)
  }, [])

  const logout = () => {
    clearAdminSession()
    window.location.reload()
  }

  useEffect(() => {
    let cancelled = false
    fetch(ENDPOINTS.orders)
      .then((res) => (res.ok ? res.json() : []))
      .then((list) => {
        if (cancelled || !Array.isArray(list)) return
        setPendingOrders(list.filter((order) => order.status === 'pending').length)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <header className="sticky top-0 z-40 px-2.5 pt-2.5 sm:px-5 sm:pt-3">
      <div className="anav-shell mx-auto max-w-[92rem]">
        <nav className="anav-stack">
          {/* ---------- row 1 — frontend ke pages ---------- */}
          <div className="anav-row">
            <NavLink to={DASHBOARD_PATH} className="anav-brand" title="Book River Admin — Home">
              <span className="anav-logo">
                <img
                  src="/logo.png"
                  alt=""
                  width="20"
                  height="20"
                  className="h-5 w-5 object-contain"
                />
              </span>
              <span className="hidden font-bold tracking-tight text-brand-900 sm:inline">
                Book River
              </span>
              <span className="hidden rounded-full bg-brand-50 px-1.5 py-0.5 text-[0.58rem] font-bold uppercase tracking-widest text-brand-700 md:inline">
                Admin
              </span>
            </NavLink>

            <span className="mx-0.5 hidden h-6 w-px shrink-0 bg-slate-200 sm:block" />

            <div className="anav-seg">
              {/* ---- shop pages (dropdown) ---- */}
              <details className="anav-menu" ref={menuRef}>
                <summary className="anav-link" title="Shop ke category pages">
                  <Tags className="h-3.5 w-3.5" />
                  <span className="hidden lg:inline">Pages</span>
                  <ChevronDown className="h-3 w-3 opacity-70" />
                </summary>

                <div className="anav-menu-panel">
                  <p className="anav-menu-title">Shop pages</p>
                  {CATEGORY_PAGES.map((category) => (
                    <NavLink
                      key={category.slug}
                      to={categoryPath(category.slug)}
                      className="anav-menu-item"
                      title={category.tagline}
                      onClick={closeMenu}
                    >
                      {category.label}
                    </NavLink>
                  ))}
                </div>
              </details>

              <span className="mx-0.5 hidden h-5 w-px shrink-0 bg-slate-200 md:block" />

              <NavLink
                to={ADMIN_DASHBOARD_PATH}
                end
                className={linkClass}
                title="Dashboard — users, orders, revenue"
              >
                <LayoutDashboard className="h-3.5 w-3.5" />
                <span>Dashboard</span>
              </NavLink>

              <NavLink
                to={DESCRIPTION_PATH}
                className={linkClass}
                title="Description page — all sections in one place"
              >
                <ScrollText className="h-3.5 w-3.5" />
                <span>Description</span>
              </NavLink>

              <NavLink to={DASHBOARD_PATH} end className={linkClass} title="Dashboard">
                <House className="h-3.5 w-3.5" />
                <span>Home</span>
              </NavLink>

              <NavLink to={SETTINGS_PATH} className={linkClass} title="Settings">
                <SettingsIcon className="h-3.5 w-3.5" />
                <span>Settings</span>
              </NavLink>

              <NavLink
                to={ORDERS_PATH}
                className={linkClass}
                title="Cart ke orders — approve / reject / ship"
              >
                <ClipboardList className="h-3.5 w-3.5" />
                <span>Orders</span>
                {pendingOrders > 0 ? (
                  <span className="ml-0.5 rounded-full bg-rose-500 px-1.5 text-[0.56rem] font-bold leading-[1.1rem] text-white">
                    {pendingOrders > 9 ? '9+' : pendingOrders}
                  </span>
                ) : null}
              </NavLink>
              <NavLink
                to={CHECKOUT_PATH}
                className={linkClass}
                title="Payment methods + tax / shipping"
              >
                <CreditCard className="h-3.5 w-3.5" />
                <span>Checkout</span>
              </NavLink>
            </div>

            <button
              type="button"
              onClick={logout}
              className="anav-link"
              title={`Logout${admin?.email ? ` (${admin.email})` : ''}`}
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Logout</span>
            </button>
          </div>
        </nav>
      </div>
    </header>
  )
}

