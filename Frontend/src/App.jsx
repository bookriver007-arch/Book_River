import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { WishlistProvider } from './context/WishlistContext.jsx'
import { CartProvider } from './context/CartContext.jsx'
import RequireAuth from './components/RequireAuth.jsx'

// Lazy load pages -> smaller first paint, faster app start
const Logo = lazy(() => import('./pages/Logo.jsx'))
const Description = lazy(() => import('./pages/Description.jsx'))
const Auth = lazy(() => import('./pages/Auth.jsx'))
const Home = lazy(() => import('./pages/Home.jsx'))
const Category = lazy(() => import('./pages/Category.jsx'))
const Wishlist = lazy(() => import('./pages/Wishlist.jsx'))
const Cart = lazy(() => import('./pages/Cart.jsx'))
const TrackOrder = lazy(() => import('./pages/TrackOrder.jsx'))
const OrderHistory = lazy(() => import('./pages/OrderHistory.jsx'))
const Settings = lazy(() => import('./pages/Settings.jsx'))

function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-50 dark:bg-[#0a121f]">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-brand-200 border-t-brand-600" />
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <WishlistProvider>
        <CartProvider>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* public — login / signup + Logo + Description page (footer/products) */}
              <Route path="/auth" element={<Auth />} />
              <Route path="/login" element={<Auth />} />
              <Route path="/signup" element={<Auth />} />
              <Route path="/" element={<Logo />} />
              <Route path="/description" element={<Description />} />

              {/* protected — in pages par login zaroori hai */}
              <Route path="/home" element={<RequireAuth><Home /></RequireAuth>} />
              <Route
                path="/category/:slug"
                element={
                  <RequireAuth>
                    <Category />
                  </RequireAuth>
                }
              />
              <Route path="/wishlist" element={<RequireAuth><Wishlist /></RequireAuth>} />
              <Route path="/cart" element={<RequireAuth><Cart /></RequireAuth>} />
              <Route path="/track" element={<RequireAuth><TrackOrder /></RequireAuth>} />
              <Route path="/track-order" element={<RequireAuth><TrackOrder /></RequireAuth>} />
              <Route path="/orders" element={<RequireAuth><OrderHistory /></RequireAuth>} />
              <Route path="/settings" element={<RequireAuth><Settings /></RequireAuth>} />
              <Route path="*" element={<Logo />} />
            </Routes>
          </Suspense>
        </CartProvider>
      </WishlistProvider>
    </ThemeProvider>
  )
}
