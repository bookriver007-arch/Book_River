import { Route, Routes } from 'react-router-dom'
import Logo from './pages/Logo.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="*" element={<Logo />} />
    </Routes>
  )
}
