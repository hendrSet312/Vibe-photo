import { Link } from 'react-router-dom'
import { Music, Camera, Sparkles, ArrowRight } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 md:py-20">
      <section className="text-center max-w-3xl mx-auto mb-16 md:mb-24" aria-labelledby="hero-heading">

        <h1 id="hero-heading" className="text-5xl md:text-7xl font-light tracking-tight text-neutral-900 mb-6 leading-tight">
          What does your{' '}
          <span className="font-medium">photo</span>{' '}
          sound like?
        </h1>

        <p className="text-lg md:text-xl text-neutral-600 mb-10 max-w-2xl mx-auto leading-relaxed">
          Upload a photograph and let our AI translate its visual atmosphere — colors, lighting, mood —
          into a curated playlist that captures its exact vibe.
        </p>

        <Link
          to="/upload"
          className="inline-flex items-center gap-2 px-8 py-4 bg-[#000000] text-white text-lg font-dell-ui rounded-none hover:bg-neutral-700 transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-2"
        >
          <Camera className="w-5 h-5" aria-hidden="true" />
          <span>Find My Vibe</span>
          <ArrowRight className="w-5 h-5" aria-hidden="true" />
        </Link>
      </section>

      
      <section className="mt-20 md:mt-28 text-center" aria-labelledby="how-heading">
        <h2 id="how-heading" className="text-2xl md:text-3xl font-semibold text-neutral-900 mb-12">
          How it works
        </h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center p-6">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-neutral-100 rounded-xl mb-4" aria-hidden="true">
              <Camera className="w-7 h-7 text-neutral-900" />
            </div>
            <h3 className="text-lg font-medium text-neutral-900 mb-2">Upload Your Photo</h3>
            <p className="text-neutral-600 text-sm">Drag & drop or select any JPG, PNG, or WEBP image up to 10MB</p>
          </div>
          <div className="text-center p-6">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-neutral-100 rounded-xl mb-4" aria-hidden="true">
              <Sparkles className="w-7 h-7 text-neutral-900" />
            </div>
            <h3 className="text-lg font-medium text-neutral-900 mb-2">AI Analyzes the Vibe</h3>
            <p className="text-neutral-600 text-sm">Colors, lighting, composition & mood translated to musical attributes</p>
          </div>
          <div className="text-center p-6">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-neutral-100 rounded-xl mb-4" aria-hidden="true">
              <Music className="w-7 h-7 text-neutral-900" />
            </div>
            <h3 className="text-lg font-medium text-neutral-900 mb-2">Discover Your Playlist</h3>
            <p className="text-neutral-600 text-sm">Get 5 curated songs with reasoning & direct Apple Music links</p>
          </div>
        </div>
      </section>
    </div>
  )
}