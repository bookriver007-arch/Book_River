import { Link } from 'react-router-dom'
import { Clock, MapPin } from 'lucide-react'
import { notify } from '../utils/notify.jsx'
import '../css/Description.css'

/* ---------------- contact (real) ---------------- */
const CONTACT = {
  email: 'kidsbookvilla@gmail.com',
  phone: '0301 3367008',
  phoneLink: 'tel:+923013367008',
  whatsapp:
    'https://api.whatsapp.com/send/?phone=923013367008&text&type=phone_number&app_absent=0',
  instagram: 'https://www.instagram.com/kids_book_villa/',
  facebook: 'https://www.facebook.com/people/Kidsbookvilla/61593190111247/',
  hours: 'Mon – Sat · 9:00 am – 8:00 pm',
}

/* ---------------- brand glyphs (official shapes) ---------------- */

function InstagramIcon({ className = 'h-[1.05rem] w-[1.05rem]' }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16Zm0 1.62c-3.14 0-3.5.01-4.73.07-.9.04-1.38.19-1.7.31-.43.17-.73.37-1.05.69-.32.32-.52.62-.69 1.05-.12.32-.27.8-.31 1.7-.06 1.23-.07 1.59-.07 4.73s.01 3.5.07 4.73c.04.9.19 1.38.31 1.7.17.43.37.73.69 1.05.32.32.62.52 1.05.69.32.12.8.27 1.7.31 1.23.06 1.59.07 4.73.07s3.5-.01 4.73-.07c.9-.04 1.38-.19 1.7-.31.43-.17.73-.37 1.05-.69.32-.32.52-.62.69-1.05.12-.32.27-.8.31-1.7.06-1.23.07-1.59.07-4.73s-.01-3.5-.07-4.73c-.04-.9-.19-1.38-.31-1.7a2.1 2.1 0 0 0-.69-1.05 2.1 2.1 0 0 0-1.05-.69c-.32-.12-.8-.27-1.7-.31-1.23-.06-1.59-.07-4.73-.07Zm0 2.76a5.46 5.46 0 1 1 0 10.92 5.46 5.46 0 0 1 0-10.92Zm0 1.62a3.84 3.84 0 1 0 0 7.68 3.84 3.84 0 0 0 0-7.68Zm5.66-2.9a1.28 1.28 0 1 1 0 2.56 1.28 1.28 0 0 1 0-2.56Z" />
    </svg>
  )
}

function FacebookIcon({ className = 'h-[1.05rem] w-[1.05rem]' }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.9h2.54V9.85c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.23.2 2.23.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.45 2.9h-2.33V22c4.78-.76 8.45-4.92 8.45-9.94Z" />
    </svg>
  )
}

function WhatsAppIcon({ className = 'h-[1.05rem] w-[1.05rem]' }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.95 1.16-.17.2-.35.22-.65.07-.3-.15-1.12-.41-2.14-1.32-.79-.7-1.33-1.57-1.48-1.87-.15-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.6-.92-2.19-.24-.58-.49-.5-.67-.5h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.01-1.04 2.47 0 1.45 1.06 2.86 1.21 3.06.15.2 2.09 3.19 5.06 4.47.71.31 1.26.49 1.69.62.71.23 1.36.2 1.87.12.57-.08 1.75-.71 2-1.4.25-.7.25-1.29.17-1.42-.07-.12-.27-.2-.57-.35ZM12.04 21.5h-.01a9.4 9.4 0 0 1-4.79-1.31l-.34-.2-3.56.93.95-3.47-.22-.36a9.37 9.37 0 0 1-1.44-5A9.44 9.44 0 0 1 18.7 5.36a9.32 9.32 0 0 1 2.77 6.66 9.44 9.44 0 0 1-9.43 9.48ZM20.06 4a11.37 11.37 0 0 0-8.02-3.33A11.4 11.4 0 0 0 .64 12.05c0 2 .52 3.94 1.5 5.66L.5 23.5l5.95-1.56a11.36 11.36 0 0 0 5.58 1.45h.01c6.29 0 11.41-5.12 11.41-11.42 0-3.05-1.19-5.92-3.35-8.07Z" />
    </svg>
  )
}

function EmailIcon({ className = 'h-[1.05rem] w-[1.05rem]' }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M2.4 6.1A2.5 2.5 0 0 1 4.9 4h14.2a2.5 2.5 0 0 1 2.5 2.1l-9.6 6.1L2.4 6.1Zm-.4 1.7v9.3A2.5 2.5 0 0 0 4.5 19.6h15a2.5 2.5 0 0 0 2.5-2.5V7.8l-9.4 6a1.3 1.3 0 0 1-1.4 0L2 7.8Z" />
    </svg>
  )
}

function PhoneIcon({ className = 'h-[1.05rem] w-[1.05rem]' }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M6.6 2.6c.7-.2 1.4.1 1.8.7l1.9 3c.3.5.3 1.2-.1 1.7l-1 1.3c-.2.3-.3.7-.1 1 .9 1.8 2.4 3.3 4.2 4.2.3.2.7.1 1-.1l1.3-1c.5-.4 1.2-.4 1.7-.1l3 1.9c.6.4.9 1.1.7 1.8l-.6 2c-.2.7-.8 1.2-1.5 1.3-1.2.1-2.4 0-3.6-.3-3.9-1-7.2-3.4-9.4-6.8-1.1-1.7-1.8-3.6-2-5.6-.1-.8.3-1.5 1-1.8l2.3-1Z" />
    </svg>
  )
}
/* ---------------- links ---------------- */

const CATEGORY_LINKS = [
  { label: 'Board Books', slug: 'board-books' },
  { label: 'Kids Story Books', slug: 'kids-story-books' },
  { label: 'Knowledge Books', slug: 'knowledge-books' },
  { label: 'Activity Books', slug: 'activity-books' },
  { label: 'Teen Fiction', slug: 'teen-fiction' },
  { label: 'Adult Novels', slug: 'adult-novels' },
]

/** Help / info — every link explains the real policy */
const HELP_LINKS = [
  {
    label: 'Shipping & Delivery',
    title: 'Free delivery over Rs. 999',
    note: 'Orders are delivered in 2–4 working days across Pakistan. Below Rs. 999 shipping is Rs. 60.',
  },
  {
    label: 'Returns & Refunds',
    title: '7-day easy returns',
    note: 'Damaged or wrong book? Message us on WhatsApp within 7 days and we will replace or refund it.',
  },
  {
    label: 'FAQs',
    title: 'Frequently asked questions',
    note: 'Cash on Delivery, WhatsApp ordering, order tracking by order number and free shipping over Rs. 999.',
  },
  {
    label: 'Privacy Policy',
    title: 'Your privacy matters',
    note: 'We only store your name, email, phone and address — used just to deliver your orders.',
  },
  {
    label: 'Terms & Conditions',
    title: 'Terms & conditions',
    note: 'Prices may change without notice. Every order is confirmed after admin approval.',
  },
]

/** brand buttons — each in its own official colour */
const SOCIALS = [
  { label: 'Instagram', href: CONTACT.instagram, Icon: InstagramIcon, cls: 'social-ig' },
  { label: 'Facebook', href: CONTACT.facebook, Icon: FacebookIcon, cls: 'social-fb' },
  { label: 'WhatsApp', href: CONTACT.whatsapp, Icon: WhatsAppIcon, cls: 'social-wa' },
  { label: 'Email', href: `mailto:${CONTACT.email}`, Icon: EmailIcon, cls: 'social-mail' },
  { label: 'Call', href: CONTACT.phoneLink, Icon: PhoneIcon, cls: 'social-phone' },
]

const PAYMENTS = ['Cash on Delivery', 'JazzCash', 'EasyPaisa', 'Bank Transfer']

/**
 * Site footer — dark navy + gold. English copy, 4 columns:
 * brand + brand-colour buttons · Shop · Help · Get in touch.
 */
export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-grid">

          {/* ---------- brand ---------- */}
          <div className="footer-brand">
            <Link to="/" className="footer-logo">
              <img src="/logo.png" alt="Book River logo" width="44" height="44" />
              <span>
                Book <em>River</em>
              </span>
            </Link>

            <p className="footer-tag">
              A new story on every shelf — handpicked books for little readers and big dreamers.
            </p>
            <p className="footer-villa">Kids Book Villa · Online Book Store</p>

            <div className="footer-social">
              {SOCIALS.map((social) => {
                const SocialIcon = social.Icon
                const external = social.href.startsWith('http')
                return (
                  <a
                    key={social.label}
                    className={social.cls}
                    href={social.href}
                    target={external ? '_blank' : undefined}
                    rel={external ? 'noreferrer' : undefined}
                    aria-label={social.label}
                    title={social.label}
                  >
                    <SocialIcon />
                  </a>
                )
              })}
            </div>
          </div>

          {/* ---------- shop ---------- */}
          <div className="footer-col">
            <h3>Shop</h3>
            <ul className="footer-two-col">
              {CATEGORY_LINKS.map((category) => (
                <li key={category.slug}>
                  <Link to={`/category/${category.slug}`}>{category.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ---------- help & info ---------- */}
          <div className="footer-col">
            <h3>Help &amp; Info</h3>
            <ul className="footer-help">
              <li>
                <Link to="/description">About Us</Link>
              </li>
              <li>
                <a href={`mailto:${CONTACT.email}`}>Contact Us</a>
              </li>
              {HELP_LINKS.map((item) => (
                <li key={item.label}>
                  <button type="button" onClick={() => notify.info(item.title, item.note)}>
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>


          {/* ---------- get in touch ---------- */}
          <div className="footer-col">
            <h3>Get in Touch</h3>

            <div className="footer-contact">
              <a className="footer-contact-row" href={`mailto:${CONTACT.email}`}>
                <span className="tile tile-mail">
                  <EmailIcon className="h-4 w-4" />
                </span>
                <span className="min-w-0">
                  <span className="label">Email</span>
                  <span className="value">{CONTACT.email}</span>
                </span>
              </a>

              <a className="footer-contact-row" href={CONTACT.phoneLink}>
                <span className="tile tile-phone">
                  <PhoneIcon className="h-4 w-4" />
                </span>
                <span className="min-w-0">
                  <span className="label">Phone</span>
                  <span className="value">{CONTACT.phone}</span>
                </span>
              </a>

              <a
                className="footer-contact-row"
                href={CONTACT.whatsapp}
                target="_blank"
                rel="noreferrer"
              >
                <span className="tile tile-wa">
                  <WhatsAppIcon className="h-4 w-4" />
                </span>
                <span className="min-w-0">
                  <span className="label">WhatsApp</span>
                  <span className="value">Order or ask on chat</span>
                </span>
              </a>

              <div className="footer-contact-row">
                <span className="tile">
                  <MapPin className="h-4 w-4" />
                </span>
                <span className="min-w-0">
                  <span className="label">Store</span>
                  <span className="value">Pakistan · Online</span>
                </span>
              </div>

              <div className="footer-contact-row">
                <span className="tile">
                  <Clock className="h-4 w-4" />
                </span>
                <span className="min-w-0">
                  <span className="label">Opening Hours</span>
                  <span className="value">{CONTACT.hours}</span>
                </span>
              </div>
            </div>

            <a className="footer-wa-btn" href={CONTACT.whatsapp} target="_blank" rel="noreferrer">
              <WhatsAppIcon className="h-4 w-4" /> Chat on WhatsApp
            </a>
          </div>
        </div>

        {/* ---------- bottom ---------- */}
        <div className="footer-bottom">
          <p>© {year} Book River · Kids Book Villa. All rights reserved.</p>

          <div className="footer-pay">
            <span className="footer-pay-label">We accept</span>
            {PAYMENTS.map((method) => (
              <span key={method} className="footer-pay-pill">
                {method}
              </span>
            ))}
          </div>

          <p className="footer-heart">
            Made with <span>❤</span> in Pakistan
          </p>
        </div>
      </div>
    </footer>
  )
}

