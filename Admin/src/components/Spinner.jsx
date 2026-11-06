import { Loader2 } from 'lucide-react'

/** Loading spinner (list ke beech me). */
export default function Spinner({ className = 'py-10' }) {
  return (
    <div className={`flex justify-center ${className}`}>
      <Loader2 className="h-6 w-6 animate-spin text-brand-500" />
    </div>
  )
}
