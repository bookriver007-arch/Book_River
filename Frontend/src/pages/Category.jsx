import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import CategoryProducts from '../components/CategoryProducts.jsx'

/**
 * Har category ka data (navbar ke slugs se match karta hai).
 * Books ab admin se aati hain — `CategoryProducts` dekhta hai.
 */
const CATEGORIES = {
  'board-books': {
    name: 'Board Books',
    tagline: 'Chhoti haathon ke liye mazboot board kitaabein',
    titles: [
      ['My First Shapes', 'R. Ali', 'Rs. 450'],
      ['Animal Friends', 'S. Noor', 'Rs. 490'],
      ['Colors Around Me', 'A. Hameed', 'Rs. 470'],
      ['Bedtime Rhymes', 'M. Zara', 'Rs. 520'],
      ['Counting 1–10', 'F. Iqbal', 'Rs. 430'],
    ],
  },
  'kids-story-books': {
    name: 'Kids Story Books',
    tagline: 'Mazedaar kahaniyaan jo bachon ko padhna sikhati hain',
    titles: [
      ['The Paper Boat Club', 'Hira S.', 'Rs. 890'],
      ['Moonlight Adventures', 'A. R. Khan', 'Rs. 750'],
      ['The Brave Little Sparrow', 'Sana Iqbal', 'Rs. 690'],
      ['Forest of Whispers', 'T. H. Malik', 'Rs. 820'],
      ['Gul and the Giant Kite', 'Omar J.', 'Rs. 710'],
    ],
  },
  'knowledge-books': {
    name: 'Knowledge Books',
    tagline: 'Duniya ke baare mein jaanne ke liye',
    titles: [
      ['Small Machines, Big Ideas', 'Omar J.', 'Rs. 1,320'],
      ['Empires of Paper', 'T. H. Malik', 'Rs. 1,390'],
      ['The Human Body Atlas', 'Dr. S. Rauf', 'Rs. 1,650'],
      ['Space in Pictures', 'N. Ahmed', 'Rs. 1,480'],
      ['Wonders of the Ocean', 'H. Rauf', 'Rs. 1,390'],
    ],
  },
  'activity-books': {
    name: 'Activity Books',
    tagline: 'Puzzles, mazes, coloring aur bahut kuch',
    titles: [
      ['Maze Mania', 'I. Zaid', 'Rs. 560'],
      ['Coloring Safari', 'M. Zara', 'Rs. 520'],
      ['Brain Games for Kids', 'F. Iqbal', 'Rs. 640'],
      ['Sticker Fun World', 'R. Ali', 'Rs. 480'],
      ['Dot-to-Dot Animals', 'S. Noor', 'Rs. 510'],
    ],
  },
  'teen-fiction': {
    name: 'Teen Fiction',
    tagline: 'Teenagers ke liye novels — dosti, sapne aur suspense',
    titles: [
      ['The Silent River', 'A. R. Khan', 'Rs. 1,150'],
      ['Poems at Midnight', 'Sana Iqbal', 'Rs. 890'],
      ['After the Last Bell', 'N. Ahmed', 'Rs. 980'],
      ['The Notebook Club', 'Hira S.', 'Rs. 940'],
      ['City of Small Lights', 'Omar J.', 'Rs. 1,020'],
    ],
  },
  'adult-novels': {
    name: 'Adult Novels',
    tagline: 'Bade padhne walon ke liye gehri aur tawil kahaniyaan',
    titles: [
      ['The Quiet Deal', 'H. Rauf', 'Rs. 1,050'],
      ['Empires of Paper', 'T. H. Malik', 'Rs. 1,390'],
      ['A House by the River', 'A. R. Khan', 'Rs. 1,240'],
      ['The Long Monsoon', 'Sana Iqbal', 'Rs. 1,180'],
      ['Letters Never Sent', 'Dr. S. Rauf', 'Rs. 1,090'],
    ],
  },
}

/** Category page — navbar ke har category link ka apna page (/category/:slug). */
export default function Category() {
  const { slug } = useParams()
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

  const data = CATEGORIES[slug]

  return (
    <div className="book-page min-h-screen">
      <Navbar categories wide user={user ?? { name: 'Reader' }} onLogout={logout} />

      <main className="mx-auto max-w-7xl px-4 pt-8 sm:px-6">
        <nav className="flex items-center gap-2 text-xs font-semibold text-brand-800/60 dark:text-white/50">
          <Link to="/home" className="hover:underline">
            Home
          </Link>
          <span>/</span>
          <span className="text-brand-900 dark:text-white">{data?.name ?? 'Category'}</span>
        </nav>

        {data ? (
          <>
            {/* ---------- modern category hero ---------- */}
            <header className="relative mt-4 overflow-hidden rounded-3xl border border-amber-200/70 bg-gradient-to-r from-white via-[#fdf8ee] to-[#f7e9cf] px-5 py-7 shadow-[0_24px_50px_-38px_rgba(29,56,100,0.55)] dark:border-white/10 dark:from-white/[0.06] dark:via-white/[0.03] dark:to-white/[0.06] sm:px-8 sm:py-9">
              {/* soft gold glow */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -right-12 -top-16 h-44 w-44 rounded-full bg-gold-300/40 blur-3xl dark:bg-gold-500/20"
              />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-20 left-1/3 h-40 w-40 rounded-full bg-brand-300/30 blur-3xl dark:bg-brand-500/15"
              />

              <div className="relative">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-2.5 py-1 text-[0.6rem] font-bold uppercase tracking-[0.2em] text-brand-700 ring-1 ring-brand-900/10 dark:bg-white/10 dark:text-brand-100 dark:ring-white/15">
                  Book shelf
                </span>

                <h1 className="mt-3 font-display text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl">
                  <span className="bg-gradient-to-r from-brand-900 via-brand-700 to-gold-600 bg-clip-text text-transparent dark:from-white dark:via-brand-100 dark:to-gold-300">
                    {data.name}
                  </span>
                </h1>

                <p className="mt-2.5 max-w-2xl text-sm leading-relaxed text-brand-800/70 dark:text-white/60 sm:text-base">
                  {data.tagline}
                </p>

                {/* gold hairline accent */}
                <span
                  aria-hidden="true"
                  className="mt-4 block h-1 w-24 rounded-full bg-gradient-to-r from-brand-700 via-gold-500 to-transparent"
                />
              </div>
            </header>

            {/* ---- products: search + filters + book-theme grid ---- */}
            <CategoryProducts slug={slug} category={data.name} />
          </>
        ) : (
          <div className="mt-10 rounded-2xl border border-white/70 bg-white/80 p-10 text-center dark:border-white/10 dark:bg-white/5">
            <p className="font-display text-xl font-bold text-brand-900 dark:text-white">
              Category nahi mili
            </p>
            <p className="mt-1 text-sm text-brand-800/70 dark:text-white/60">
              Ye category maujood nahi hai — navbar se koi doosri choose karein.
            </p>
          </div>
        )}

        <Link
          to="/home"
          className="mt-8 inline-flex items-center gap-2 rounded-full border border-brand-300 px-4 py-2 text-sm font-semibold text-brand-800 transition-all hover:border-brand-700 hover:bg-brand-700 hover:text-white dark:border-brand-400/40 dark:text-white dark:hover:bg-brand-600"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>
      </main>

      <Footer />
    </div>
  )
}
