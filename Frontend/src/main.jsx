import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import ConfirmDialog from './components/ConfirmDialog.jsx'
import { LanguageProvider } from './i18n/LanguageContext.jsx'
import './index.css'
import './css/mobile.css'

/**
 * Dev helper — phone par overflow dhoondhne ke liye.
 * Browser console me `brOverflow()` chalao: jo bhi element screen se bahar
 * nikal raha hai, uska tag/class aur width list ho jayegi.
 */
if (import.meta.env.DEV && typeof window !== 'undefined') {
  window.brOverflow = () => {
    const width = document.documentElement.clientWidth
    const rows = []

    document.querySelectorAll('body *').forEach((el) => {
      const box = el.getBoundingClientRect()
      if (!box.width || box.width <= width + 1) return
      const style = getComputedStyle(el)
      if (style.position === 'fixed') return
      rows.push({
        el: `${el.tagName.toLowerCase()}${el.className ? `.${String(el.className).split(' ').slice(0, 3).join('.')}` : ''}`,
        width: Math.round(box.width),
        right: Math.round(box.right),
      })
    })

    if (!rows.length) {
      console.log('%cNo horizontal overflow ✅', 'color:#0a7a3f;font-weight:700')
      return []
    }

    console.table(rows.slice(0, 25))
    return rows
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LanguageProvider>
      <BrowserRouter>
        <App />
        <ConfirmDialog />
        {/* navbar ke thoda neeche, page ke TOP par — horizontally center */}
        <Toaster
          position="top-center"
          gutter={12}
          containerStyle={{ top: '4.6rem' }}
          toastOptions={{ duration: 2800 }}
        />
      </BrowserRouter>
    </LanguageProvider>
  </StrictMode>,
)
