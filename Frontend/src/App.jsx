import { Route, Routes } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext.jsx'
import Logo from './pages/Logo.jsx'
import Description from './pages/Description.jsx'

export default function App() {
  return (
    <ThemeProvider>
      <Routes>
        <Route path="/" element={<Logo />} />
        <Route path="/description" element={<Description />} />
        <Route path="*" element={<Logo />} />
      </Routes>
    </ThemeProvider>
  )
}
