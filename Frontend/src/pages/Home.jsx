import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion as Motion } from 'framer-motion'
import Navbar from '../components/Navbar.jsx'
import Slideshow from '../components/Slideshow.jsx'
import HomeDeals from '../components/HomeDeals.jsx'
import HomeCategories from '../components/HomeCategories.jsx'
import AboutBook from '../components/AboutBook.jsx'
import Footer from '../components/Footer.jsx'

/**
 * Home — login ke baad khulta hai.
 * Home ka apna slideshow (Admin → Home Slides) — Description ke slides se alag,
 * aur `tall` se height me bada.
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
    window.location.replace('/auth')
  }

  return (
    <div className="book-page min-h-screen">
      <Navbar categories wide user={user ?? { name: 'Reader' }} onLogout={logout} />

      {/* ---- Home page ka ALAG slideshow (Admin → Home Slides) ---- */}
      <Motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="px-3 pt-2 sm:px-5 sm:pt-3"
      >
        <Slideshow tall endpoint="/api/home-slides" />
      </Motion.div>

      {/* ---- Deal section: heading + short description + 4 deal cards ---- */}
      <HomeDeals />

      {/* ---- 6 category sections (arrows + left/right latakti kitaabein) ---- */}
      <HomeCategories />

      {/* ---- About / knowledge section (khuli kitaab style) ---- */}
      <AboutBook />

      <Footer />
    </div>
  )
}
