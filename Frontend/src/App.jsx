import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { WishlistProvider } from './context/WishlistContext.jsx'
import { CartProvider } from './context/CartContext.jsx'

// Lazy load pages -> smaller first paint, faster app start
const Logo = lazy(() => import('./pages/Logo.jsx'))
const Description = lazy(() => import('./pages/Description.jsx'))
const Auth = lazy(() => import('./pages/Auth.jsx'))
const Home = lazy(() => import('./pages/Home.jsx'))
const Category = lazy(() => import('./pages/Category.jsx'))
const Wishlist = lazy(() => import('./pages/Wishlist.jsx'))
const Cart = lazy(() => import('./pages/Cart.jsx'))
const TrackOrder = lazy(() => import('./pages/TrackOrder.jsx'))
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
              <Route path="/" element={<Logo />} />
              <Route path="/description" element={<Description />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/login" element={<Auth />} />
              <Route path="/signup" element={<Auth />} />
              <Route path="/home" element={<Home />} />
              <Route path="/category/:slug" element={<Category />} />
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/track" element={<TrackOrder />} />
              <Route path="/track-order" element={<TrackOrder />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<Logo />} />
            </Routes>
          </Suspense>
        </CartProvider>
      </WishlistProvider>
    </ThemeProvider>
  )
}
