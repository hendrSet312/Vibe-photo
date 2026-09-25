import { Link } from 'react-router-dom'
import { Music, Camera } from 'lucide-react'

export default function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#000000] text-white border-b border-[#000000]">
      <nav className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between" aria-label="Main navigation">
        <Link to="/" className="flex items-center gap-2 text-neutral-900 hover:text-neutral-700 transition-colors" aria-label="Photo Vibe Home">
          <div className="flex items-center gap-1.5">
            <Camera className="w-6 h-6 text-white" aria-hidden="true" />
            <Music className="w-6 h-6 text-white" aria-hidden="true" />
          </div>
          <span className="text-xl text-white font-semibold font-dell-ui">Photo Vibe</span>
        </Link>
      </nav>
    </header>
  )
}