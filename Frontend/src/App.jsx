import { Route, Routes } from 'react-router-dom'

export default function App() {
  return (
    <Routes>
      <Route path="*" element={<Placeholder />} />
    </Routes>
  )
}

function Placeholder() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="card w-full max-w-lg p-10 text-center">
        <h1 className="font-display text-3xl font-bold text-brand-700">Book River</h1>
        <p className="mt-3 text-slate-600">
          Frontend setup ready. Ab apne pages yahan banayein — <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm">src/pages/</code>
        </p>
      </div>
    </div>
  )
}
