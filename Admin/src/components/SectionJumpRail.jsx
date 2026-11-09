import { Link } from 'react-router-dom'
import { SECTIONS } from '../lib/sections'
import { sectionHashPath } from '../lib/pages'

/**
 * Description page ke 7 sections par jump karne wali chips.
 * Har link `/description#anchor` par jaata hai — Description page hi wo
 * sections dikhata hai (kisi doosre page par ye content nahi aata).
 */
export default function SectionJumpRail() {
  return (
    <div className="anav-chips">
      {SECTIONS.map((section) => {
        const Icon = section.icon
        return (
          <Link
            key={section.key}
            to={sectionHashPath(section.anchor)}
            className="anav-chip"
            title={section.blurb}
          >
            <Icon className="h-3.5 w-3.5" />
            <span>{section.label}</span>
          </Link>
        )
      })}
    </div>
  )
}
