import { useEffect, useState } from 'react'
import { AlertTriangle, X } from 'lucide-react'
import { setConfirmHandler } from '../utils/confirm.js'

/**
 * Chhota Yes / No box — delete ya kisi bhi khatarnaak kaam se pehle.
 * Sab jagah `confirmAction({...})` se khulta hai (main.jsx me ek dafa mount).
 */
export default function ConfirmDialog() {
  const [request, setRequest] = useState(null)

  useEffect(() => {
    setConfirmHandler((options) => new Promise((resolve) => setRequest({ ...options, resolve })))
    return () => setConfirmHandler(null)
  }, [])

  useEffect(() => {
    if (!request) return undefined

    const onKey = (event) => {
      if (event.key === 'Escape') {
        request.resolve(false)
        setRequest(null)
      }
      if (event.key === 'Enter') {
        request.resolve(true)
        setRequest(null)
      }
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [request])

  if (!request) return null

  const close = (answer) => {
    request.resolve(answer)
    setRequest(null)
  }

  const {
    title = 'Confirm karein?',
    message = 'Ye cheez delete ho jayegi — wapas nahi aayegi.',
    confirmLabel = 'Haan, delete',
    cancelLabel = 'Nahi',
  } = request

  return (
    <div
      className="fixed inset-0 z-[120] grid place-items-center bg-slate-900/50 px-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onClick={() => close(false)}
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-[19rem] rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-2xl dark:border-white/15 dark:bg-white"
      >
        <button
          type="button"
          onClick={() => close(false)}
          aria-label="Close"
          className="ml-auto grid h-6 w-6 place-items-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
        >
          <X className="h-3.5 w-3.5" />
        </button>

        <span className="mx-auto -mt-3 grid h-11 w-11 place-items-center rounded-full bg-rose-50 text-rose-600">
          <AlertTriangle className="h-5 w-5" />
        </span>

        <p className="mt-2 text-sm font-bold text-slate-900">{title}</p>
        <p className="mt-1 text-[0.74rem] leading-relaxed text-slate-500">{message}</p>

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={() => close(false)}
            className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-[0.78rem] font-bold text-slate-600 transition hover:bg-slate-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={() => close(true)}
            className="flex-1 rounded-xl bg-rose-600 px-3 py-2 text-[0.78rem] font-bold text-white shadow-sm transition hover:bg-rose-700 active:scale-[0.98]"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
