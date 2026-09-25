import { Loader2 } from 'lucide-react'

export default function Loader({ message = 'Analyzing your photo...' }) {
  return (
    <div className="border border-black bg-[#b3bd95] p-6" role="status" aria-live="polite">
      <div className="flex flex-col items-center gap-3 py-10">
        <Loader2 className="h-6 w-6 animate-spin text-black" aria-hidden="true" />
        <p className="font-dell-body text-sm text-black">{message}</p>
      </div>
    </div>
  )
}
