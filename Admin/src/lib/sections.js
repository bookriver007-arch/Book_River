import { Baby, BookOpen, Frame, Images, LayoutGrid, Star, Tags } from 'lucide-react'

/**
 * Admin page ke sections — sab EK page par stack hote hain.
 * `anchor` = scroll target (navbar link `#anchor` par jata hai)
 * `key` = ENDPOINTS ke key se match karta hai
 */
export const SECTIONS = [
  {
    key: 'slides',
    anchor: 'slides',
    label: 'Slides',
    icon: Images,
    blurb: 'Slideshow ki pictures — upload, order badlo, delete karo.',
  },
  {
    key: 'categories',
    anchor: 'categories',
    label: 'Categories',
    icon: Tags,
    blurb: 'Ribbon ke orange/gold boxes jo right → left scroll karte hain.',
  },
  {
    key: 'books',
    anchor: 'open-book',
    label: 'Open Book',
    icon: BookOpen,
    blurb: 'Left page picture + right page heading/description.',
  },
  {
    key: 'kids',
    anchor: 'kids-book',
    label: 'Kids Book',
    icon: Baby,
    blurb: 'Standing kids-book cover aur uske neeche caption.',
  },
  {
    key: 'frames',
    anchor: 'frames',
    label: 'Frames',
    icon: Frame,
    blurb: 'Hanging frames gallery (rope se latke hue).',
  },
  {
    key: 'products',
    anchor: 'products',
    label: 'Products',
    icon: LayoutGrid,
    blurb: 'Products grid — ek row me 5 covers.',
  },
  {
    key: 'reviews',
    anchor: 'reviews',
    label: 'Reviews',
    icon: Star,
    blurb: 'Readers ke reviews — slider me scroll hote hain.',
  },
]

