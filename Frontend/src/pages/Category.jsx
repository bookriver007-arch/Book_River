import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, BookOpen } from 'lucide-react'
import Navbar from '../components/Navbar.jsx'

const COVERS = [
  '/banners/fiction.svg',
  '/banners/poetry.svg',
  '/banners/history.svg',
  '/banners/science.svg',
  '/banners/business.svg',
]

/**
 * Har category ka data (navbar ke slugs se match karta hai).
 * titles: [title, author, price]
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

const booksOf = (slug) =>
  (CATEGORIES[slug]?.titles ?? []).map(([title, author, price], i) => ({
    title,
    author,
    price,
    image: COVERS[i % COVERS.length],
  }))

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
  const books = booksOf(slug)

  return (
    <div className="book-page min-h-screen pb-14">
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
            <header className="mt-3 flex flex-wrap items-end justify-between gap-4">
              <div>
                <h1 className="font-display text-3xl font-bold text-brand-900 dark:text-white">
                  {data.name}
                </h1>
                <p className="mt-1 text-sm text-brand-800/70 dark:text-white/60">{data.tagline}</p>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-brand-700 shadow-sm dark:bg-white/10 dark:text-brand-100">
                <BookOpen className="h-3.5 w-3.5" /> {books.length} books
              </span>
            </header>

            <section className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {books.map((book) => (
                <article
                  key={book.title}
                  className="group overflow-hidden rounded-2xl border border-white/70 bg-white/85 shadow-[0_18px_40px_-30px_rgba(29,56,100,0.55)] backdrop-blur-sm transition-transform duration-300 hover:-translate-y-1.5 dark:border-white/10 dark:bg-white/5"
                >
                  <div className="aspect-[3/4] overflow-hidden bg-brand-100 dark:bg-brand-900/40">
                    <img
                      src={book.image}
                      alt={`${book.title} cover`}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-3.5">
                    <h2 className="line-clamp-2 text-sm font-bold text-brand-900 dark:text-white">
                      {book.title}
                    </h2>
                    <p className="mt-0.5 text-xs text-brand-800/65 dark:text-white/55">
                      by {book.author}
                    </p>
                    <p className="mt-2 text-sm font-bold text-brand-700 dark:text-brand-100">
                      {book.price}
                    </p>
                  </div>
                </article>
              ))}
            </section>
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
    </div>
  )
}
