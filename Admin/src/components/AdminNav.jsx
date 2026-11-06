import { useEffect, useState } from 'react'
import { SECTIONS } from '../lib/sections'

/**
 * Admin navbar — simple. Sirf admin page ke apne sections ke links.
 * Frontend se koi link/jump nahi (na koi external page).
 * Sab sections ek hi page par hain, isliye links #anchor par scroll karte hain
 * aur scroll ke hisaab se active section highlight hota hai.
 */
export default function AdminNav() {
  const [active, setActive] = useState(SECTIONS[0].anchor)

  // scroll-spy (page lazy load hota hai, isliye elements milne tak retry)
  useEffect(() => {
    let observer = null
    let timer = null
    let tries = 0

    const attach = () => {
      const elements = SECTIONS.map((s) => document.getElementById(s.anchor)).filter(Boolean)
      if (!elements.length) {
        if (tries < 20) {
          tries += 1
          timer = window.setTimeout(attach, 150)
        }
        return
      }

      observer = new IntersectionObserver(
        (entries) => {
          const visible = entries
            .filter((e) => e.isIntersecting)
            .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
          if (visible) setActive(visible.target.id)
        },
        { rootMargin: '-25% 0px -55% 0px', threshold: [0.05, 0.25, 0.5] },
      )

      elements.forEach((el) => observer.observe(el))
    }

    attach()

    return () => {
      if (timer) window.clearTimeout(timer)
      if (observer) observer.disconnect()
    }
  }, [])

  const go = (anchor) => (e) => {
    e.preventDefault()
    setActive(anchor)
    document.getElementById(anchor)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    window.history.replaceState(null, '', `#${anchor}`)
  }

  return (
    <header className="sticky top-0 z-40 px-2.5 pt-2.5 sm:px-5 sm:pt-3">
      <div className="anav-shell mx-auto max-w-[92rem]">
        <nav className="anav">
          {/* ---- brand ---- */}
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault()
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
            className="anav-brand"
          >
            <span className="anav-logo">
              <img src="/logo.png" alt="" width="20" height="20" className="h-5 w-5 object-contain" />
            </span>
            <span className="hidden font-bold tracking-tight text-brand-900 sm:inline">
              Book River
            </span>
            <span className="hidden rounded-full bg-brand-50 px-1.5 py-0.5 text-[0.58rem] font-bold uppercase tracking-widest text-brand-700 md:inline">
              Admin
            </span>
          </a>

          <span className="mx-0.5 hidden h-6 w-px shrink-0 bg-slate-200 sm:block" />

          {/* ---- sections ---- */}
          <div className="anav-seg">
            {SECTIONS.map((section) => {
              const Icon = section.icon
              const isActive = active === section.anchor
              return (
                <a
                  key={section.anchor}
                  href={`#${section.anchor}`}
                  onClick={go(section.anchor)}
                  className={isActive ? 'anav-link active' : 'anav-link'}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{section.label}</span>
                </a>
              )
            })}
          </div>
        </nav>
      </div>
    </header>
  )
}
