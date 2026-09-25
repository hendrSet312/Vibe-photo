import { Music, Camera, GitFork } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t border-[#000000] bg-white mt-auto">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-[#000000]">
            An experimental bridge between visual art and auditory expression.
          </p>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#0000ee] transition-colors"
              aria-label="View on GitHub"
            >
              <GitFork className="w-5 h-5" aria-hidden="true" />
            </a>
            <span className="text-xs text-[#000000] flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5" aria-hidden="true" />
              <Music className="w-3.5 h-3.5" aria-hidden="true" />
              Made with curiosity
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}