import { Outlet } from 'react-router-dom'
import AdminNav from './AdminNav.jsx'

/** Admin shell — background + navbar + page content. */
export default function AdminLayout() {
  return (
    <div className="admin-bg">
      <AdminNav />
      <main className="mx-auto w-full max-w-[92rem] px-3 pb-16 pt-5 sm:px-5">
        <Outlet />
      </main>
    </div>
  )
}
