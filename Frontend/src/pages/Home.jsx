import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'

/**
 * Home — login ke baad khulta hai.
 * (Content abhi khaali hai — jo chahiye wahan add karte jayenge.)
 */
export default function Home() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)

  useEffect(() => {
    if (!localStorage.getItem('br_token')) {
      navigate('/auth', { replace: true })
      return
    }
    try {
      setUser(JSON.parse(localStorage.getItem('br_user')))
    } catch {
      setUser(null)
    }
  }, [navigate])

  const logout = () => {
    localStorage.removeItem('br_token')
    localStorage.removeItem('br_user')
    window.location.replace('/description')
  }

  return (
    <div className="book-page min-h-screen">
      <Navbar categories wide user={user ?? { name: 'Reader' }} onLogout={logout} />

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6" />
    </div>
  )
}
