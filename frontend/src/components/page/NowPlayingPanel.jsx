import { ArrowUpRight, Pause, Play } from 'lucide-react'

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

function initials(title) {
  return String(title || '?')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join('') || '?'
}

export default function NowPlayingPanel({ song, playing, currentTime, duration, onToggle, onSeek }) {
  if (!song) return null

  return (
    <section className="border-2 border-black bg-white" aria-label={`Featured preview: ${song.title}`}>
      <div className="flex items-center gap-4 border-b-2 border-black p-4">
        {song.artwork ? (
          <img
            src={song.artwork}
            alt={`${song.title} album artwork`}
            className="h-16 w-16 shrink-0 border border-black object-cover"
          />
        ) : (
          <span
            aria-hidden="true"
            className="flex h-16 w-16 shrink-0 items-center justify-center border border-black bg-[#b3bd95] font-dell-heading text-lg text-black"
          >
            {initials(song.title)}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="font-dell-ui text-[11px] uppercase text-neutral-600">From your photo</p>
          <h3 className="truncate font-dell-heading text-2xl uppercase text-black">{song.title}</h3>
          <p className="truncate font-dell-body text-base text-black">{song.artist}</p>
        </div>
        <span className="shrink-0 border border-black bg-[#fcc20f] px-2 py-1 font-dell-ui text-xs uppercase text-black">
          {song.matchLabel || 'Good Match'}
        </span>
      </div>

      <div className="p-4">
        <p className="font-dell-body text-base text-black">{song.reason}</p>

        {song.previewUrl && (
          <div className="mt-4 flex items-center gap-3">
            <button
              type="button"
              onClick={onToggle}
              aria-label={playing ? `Pause ${song.title} preview` : `Play ${song.title} preview`}
              className="inline-flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center bg-[#000000] text-white transition-colors hover:bg-neutral-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#000000] focus-visible:ring-offset-2"
            >
              {playing ? <Pause className="h-4 w-4" aria-hidden="true" /> : <Play className="h-4 w-4" aria-hidden="true" />}
            </button>
            <span className="shrink-0 font-dell-ui text-xs text-black">{formatTime(currentTime)}</span>
            <input
              type="range"
              min={0}
              max={Number.isFinite(duration) && duration > 0 ? duration : 0}
              step={0.1}
              value={Number.isFinite(currentTime) ? currentTime : 0}
              onChange={(e) => onSeek(Number(e.target.value))}
              aria-label="Seek preview"
              className="h-1 min-w-0 flex-1 cursor-pointer accent-black"
            />
            <span className="shrink-0 font-dell-ui text-xs text-black">{formatTime(duration)}</span>
          </div>
        )}

        {song.externalUrl && (
          <a
            href={song.externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 flex min-h-[44px] w-full items-center justify-center gap-2 bg-[#000000] px-6 font-dell-ui text-xs uppercase text-white transition-colors hover:bg-neutral-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#000000] focus-visible:ring-offset-2"
          >
            Listen on Apple Music
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </a>
        )}
      </div>
    </section>
  )
}
