import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import AdminLayout from './components/AdminLayout.jsx'

// sab sections EK page par — isliye sirf ek hi page hai
const DescriptionAdmin = lazy(() => import('./pages/DescriptionAdmin.jsx'))

function PageLoader() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-brand-200 border-t-brand-600" />
    </div>
  )
}

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route element={<AdminLayout />}>
          <Route path="/" element={<DescriptionAdmin />} />
          {/* purane links (/slides, /books, /reviews …) bhi isi page par le aate hain */}
          <Route path="*" element={<DescriptionAdmin />} />
        </Route>
      </Routes>
    </Suspense>
  )
}



