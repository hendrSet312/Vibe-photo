import { Loader2 } from 'lucide-react'

const STYLES = {
  primary: 'border-black bg-[#000000] text-white hover:bg-neutral-700',
  secondary: 'border-black bg-white text-black hover:bg-neutral-100',
}

export default function Button({ variant = 'primary', isLoading = false, disabled = false, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`inline-flex min-h-[44px] items-center justify-center gap-2 rounded-none border px-6 font-dell-ui text-xs uppercase transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#000000] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40 ${STYLES[variant] ?? STYLES.primary}`}
    >
      {children}
      {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />}
    </button>
  )
}
