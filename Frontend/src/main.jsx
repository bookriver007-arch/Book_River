import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import { LanguageProvider } from './i18n/LanguageContext.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LanguageProvider>
      <BrowserRouter>
        <App />
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
