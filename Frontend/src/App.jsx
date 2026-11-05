import { Route, Routes } from 'react-router-dom'
import Logo from './pages/Logo.jsx'
import Description from './pages/Description.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Logo />} />
      <Route path="/description" element={<Description />} />
      <Route path="*" element={<Logo />} />
    </Routes>
  )
}
