import { lazy, Suspense, useState } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import AdminLayout from './components/AdminLayout.jsx'
import { SECTIONS, findSection } from './lib/sections'
import { isAdminLoggedIn } from './lib/adminAuth'
import {
  ADMIN_DASHBOARD_PATH,
  CHECKOUT_PATH,
  DASHBOARD_PATH,
  DESCRIPTION_PATH,
  HOME_ABOUT_PATH,
  HOME_BOOKS_PATH,
  HOME_DEALS_PATH,
  HOME_HANGING_PATH,
  HOME_SLIDES_PATH,
  ORDERS_PATH,
  SETTINGS_PATH,
  categoryPath,
  homeBooksPath,
  sectionHashPath,
} from './lib/pages'

// splash + frontend ke pages
const LogoAdmin = lazy(() => import('./pages/LogoAdmin.jsx'))
const HomeAdmin = lazy(() => import('./pages/HomeAdmin.jsx'))
const HomeSlidesAdmin = lazy(() => import('./pages/HomeSlidesAdmin.jsx'))
const HomeDealsAdmin = lazy(() => import('./pages/HomeDealsAdmin.jsx'))
const HomeCategoryBooksAdmin = lazy(() => import('./pages/HomeCategoryBooksAdmin.jsx'))
const HomeHangingBookAdmin = lazy(() => import('./pages/HomeHangingBookAdmin.jsx'))
const HomeAboutAdmin = lazy(() => import('./pages/HomeAboutAdmin.jsx'))
const CategoryAdmin = lazy(() => import('./pages/CategoryAdmin.jsx'))
const DescriptionAdmin = lazy(() => import('./pages/DescriptionAdmin.jsx'))
const SettingsAdmin = lazy(() => import('./pages/SettingsAdmin.jsx'))
const OrdersAdmin = lazy(() => import('./pages/OrdersAdmin.jsx'))
const CheckoutAdmin = lazy(() => import('./pages/CheckoutAdmin.jsx'))
const DashboardAdmin = lazy(() => import('./pages/DashboardAdmin.jsx'))
const AdminLogin = lazy(() => import('./pages/AdminLogin.jsx'))

// Slides, Categories, Open Book, Kids Book, Frames, Products, Reviews —
// sab sirf Description page ke andar hain (alag pages nahi).

function PageLoader() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-brand-200 border-t-brand-600" />
    </div>
  )
}

/** purane links (/books, /kids, /reviews, /all …) ko sahi page par bhej do */
function LegacyRedirect() {
  const { pathname } = useLocation()

  const section = findSection(pathname)
  if (section) return <Navigate to={sectionHashPath(section.anchor)} replace />

  const category = String(pathname || '').match(/^\/category\/([^/]+)/)
  if (category) return <Navigate to={categoryPath(category[1])} replace />

  return <Navigate to={DASHBOARD_PATH} replace />
}

export default function App() {
  const [loggedIn, setLoggedIn] = useState(isAdminLoggedIn)

  /* admin login ke bina panel nahi khulta */
  if (!loggedIn) {
    return (
      <Suspense fallback={<PageLoader />}>
        <AdminLogin onLogin={() => setLoggedIn(true)} />
      </Suspense>
    )
  }

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* admin khulte hi dashboard */}
        <Route path="/" element={<Navigate to={ADMIN_DASHBOARD_PATH} replace />} />
        <Route path="/logo" element={<LogoAdmin />} />

        <Route element={<AdminLayout />}>
          {/* dashboard — users / orders / pending / revenue */}
          <Route path={ADMIN_DASHBOARD_PATH} element={<DashboardAdmin />} />

          {/* home page ka content editor */}
          <Route path={DASHBOARD_PATH} element={<HomeAdmin />} />

          {/* frontend ke pages */}
          <Route path={DESCRIPTION_PATH} element={<DescriptionAdmin />} />
          <Route path={HOME_SLIDES_PATH} element={<HomeSlidesAdmin />} />
          <Route path={HOME_DEALS_PATH} element={<HomeDealsAdmin />} />
          <Route path={HOME_HANGING_PATH} element={<HomeHangingBookAdmin />} />
          <Route path={HOME_ABOUT_PATH} element={<HomeAboutAdmin />} />
          <Route path={SETTINGS_PATH} element={<SettingsAdmin />} />
          {/* frontend cart se aaye orders — approve / reject / ship */}
          <Route path={ORDERS_PATH} element={<OrdersAdmin />} />
          <Route path={CHECKOUT_PATH} element={<CheckoutAdmin />} />
          <Route path="/category/:slug" element={<CategoryAdmin />} />

          {/* har category ke products ka apna page */}
          <Route path={`${HOME_BOOKS_PATH}/:slug`} element={<HomeCategoryBooksAdmin />} />
          <Route
            path={HOME_BOOKS_PATH}
            element={<Navigate to={homeBooksPath('board-books')} replace />}
          />
          {/* purana link */}
          <Route
            path="/home-category-books"
            element={<Navigate to={homeBooksPath('board-books')} replace />}
          />

          {/* purane section links (/slides, /open-book …) -> Description page ka section */}
          {SECTIONS.map((section) => (
            <Route
              key={section.key}
              path={section.path}
              element={<Navigate to={sectionHashPath(section.anchor)} replace />}
            />
          ))}

          {/* purana /all link -> Description */}
          <Route path="/all" element={<Navigate to={DESCRIPTION_PATH} replace />} />

          {/* baaki sab — purane bookmarks bhi sahi page par pahunch jaate hain */}
          <Route path="*" element={<LegacyRedirect />} />
        </Route>
      </Routes>
    </Suspense>
  )
}




