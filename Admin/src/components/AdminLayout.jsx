import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import AdminNav from './AdminNav.jsx'
import { pageTitle } from '../lib/pages'

/** Admin shell — background + navbar + page content. */
export default function AdminLayout() {
  const { pathname } = useLocation()

  // naya page khulte hi top se shuru karo (frontend ki tarah) + tab ka title
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 })
    document.title = pageTitle(pathname)
  }, [pathname])

  return (
    <div className="admin-bg">
      <AdminNav />
      <main className="mx-auto w-full max-w-[92rem] px-3 pb-16 pt-5 sm:px-5">
        <Outlet />
      </main>
    </div>
  )
}

