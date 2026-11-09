import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { ExternalLink } from 'lucide-react'
import { FRONTEND_URL } from '../lib/api'
import { SECTIONS } from '../lib/sections'
import PageHeader from '../components/PageHeader'
import DescriptionSections from '../components/DescriptionSections'
import SectionJumpRail from '../components/SectionJumpRail'

/**
 * Description — poora frontend Description page ek hi jagah:
 * Slides, Categories, Open Book, Kids Book, Frames, Products aur Reviews.
 * (Navbar ke har category/home page par bhi yehi content milta hai.)
 */
export default function DescriptionAdmin() {
  const { hash } = useLocation()

  // #slides / #reviews jaisi purani links seedha us section par le jaati hain
  useEffect(() => {
    const wanted = String(hash || '').replace(/^[#/]+/, '')
    if (!wanted) return undefined
    const target = SECTIONS.find((s) => s.key === wanted || s.anchor === wanted)
    if (!target) return undefined

    const id = window.setTimeout(() => {
      document.getElementById(target.anchor)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 120)
    return () => window.clearTimeout(id)
  }, [hash])

  return (
    <>
      <PageHeader
        eyebrow="Description page"
        title="Description — sab kuch"
        subtitle="Slides, Categories, Open Book, Kids Book, Frames, Products aur Reviews — frontend Description page ka poora content yahan ek hi jagah."
        actions={
          <a href={FRONTEND_URL} target="_blank" rel="noreferrer" className="btn-primary">
            <ExternalLink className="h-4 w-4" /> View Frontend
          </a>
        }
      />

      <SectionJumpRail />
      <div className="mt-5">
        <DescriptionSections />
      </div>
    </>
  )
}

