import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  ClipboardList,
  ExternalLink,
  House,
  ScrollText,
  Settings as SettingsIcon,
} from 'lucide-react'
import { ENDPOINTS, FRONTEND_URL } from '../lib/api'
import {
  CATEGORY_PAGES,
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
 * Teen Fiction · Adult Novels | Description · Home · Settings | [Frontend ↗]
 *
 * Slides, Categories, Open Book, Kids Book, Frames, Products, Reviews — ye sab
 * sirf Description page ke andar hain, isliye navbar me alag se nahi hain.
 */
export default function AdminNav() {
  // pending orders ka badge (approve karna baaki hai)
  const [pendingOrders, setPendingOrders] = useState(0)

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

            <div className="anav-seg anav-seg--spread">
              {CATEGORY_PAGES.map((category) => (
                <NavLink
                  key={category.slug}
                  to={categoryPath(category.slug)}
                  className={linkClass}
                  title={category.tagline}
                >
                  {category.label}
                </NavLink>
              ))}

              <span className="mx-0.5 hidden h-5 w-px shrink-0 bg-slate-200 md:block" />

              <NavLink
                to={DESCRIPTION_PATH}
                className={linkClass}
                title="Description page — saare sections ek jagah"
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
            </div>

            <a
              href={FRONTEND_URL}
              target="_blank"
              rel="noreferrer"
              className="anav-cta"
              title="Frontend par dekho"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Frontend</span>
            </a>
          </div>
        </nav>
      </div>
    </header>
  )
}

