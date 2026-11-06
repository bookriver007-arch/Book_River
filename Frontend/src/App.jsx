import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext.jsx'

// Lazy load pages -> smaller first paint, faster app start
const Logo = lazy(() => import('./pages/Logo.jsx'))
const Description = lazy(() => import('./pages/Description.jsx'))
const Auth = lazy(() => import('./pages/Auth.jsx'))
const Home = lazy(() => import('./pages/Home.jsx'))
const Category = lazy(() => import('./pages/Category.jsx'))
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
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Logo />} />
          <Route path="/description" element={<Description />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/login" element={<Auth />} />
          <Route path="/signup" element={<Auth />} />
          <Route path="/home" element={<Home />} />
          <Route path="/category/:slug" element={<Category />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Logo />} />
        </Routes>
      </Suspense>
    </ThemeProvider>
  )
}
