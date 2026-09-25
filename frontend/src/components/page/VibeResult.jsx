import { RotateCcw } from 'lucide-react'
import Button from '../common/Button'
import SongRow from './SongRow'
import NowPlayingPanel from './NowPlayingPanel'
import usePreviewPlayer from './usePreviewPlayer'

const MOOD_KEYS = ['emotional_tone', 'energy_character', 'sonic_texture', 'atmosphere']

function titleCase(tag) {
  const t = String(tag || '').trim().toLowerCase()
  return t ? t.charAt(0).toUpperCase() + t.slice(1) : t
}

function moodTagsFromAnalysis(analysis) {
  const mood = analysis?.mood
  if (!mood || typeof mood !== 'object') return []
  return MOOD_KEYS.map((key) => titleCase(mood[key])).filter(Boolean)
}

export default function VibeResult({ imageSrc, vibeData, onReset }) {
  const description = vibeData.analysis?.description || vibeData.vibe?.description
  const moodTags = moodTagsFromAnalysis(vibeData.analysis)
  const { recommendations } = vibeData
  const { currentIndex, isPlaying, currentTime, duration, toggle, seekTo } = usePreviewPlayer(recommendations)
  const currentSong = currentIndex === null ? null : recommendations[currentIndex]

  return (
    <div>
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3 lg:gap-8">
        <div className="flex flex-col gap-6 lg:col-span-1">
          <div className="border-2 border-black bg-white p-2">
            <img
              src={imageSrc}
              alt="The photo you uploaded"
              className="mx-auto max-h-[360px] w-full object-contain"
            />
          </div>

          <section className="border-2 border-black bg-white" aria-labelledby="vibe-heading">
            <div className="border-b-2 border-black p-3">
              <h2 id="vibe-heading" className="font-dell-heading text-sm uppercase text-black">Your Vibe</h2>
            </div>
            <div className="p-6">
              <p className="font-dell-body text-base text-black">{description}</p>
              <ul className="mt-4 flex flex-wrap gap-2" aria-label="Mood tags">
                {moodTags.map((tag) => (
                  <li key={tag} className="border border-black bg-[#fcc20f] px-2 py-1 font-dell-ui text-xs uppercase text-black">
                    {tag}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <div className="flex flex-col">
            <Button variant="primary" onClick={onReset}>
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              Try Another Photo
            </Button>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="mb-4 flex items-center gap-4">
            <h2 id="songs-heading" className="shrink-0 font-dell-heading text-sm uppercase text-black">Your Songs</h2>
            <span className="h-0 flex-1 border-t-2 border-black" aria-hidden="true" />
          </div>

          <NowPlayingPanel
            song={currentSong}
            playing={isPlaying}
            currentTime={currentTime}
            duration={duration}
            onToggle={() => toggle(currentIndex)}
            onSeek={seekTo}
          />

          <section className="mt-4 divide-y divide-black border-2 border-black bg-white" aria-label="Song list">
            {recommendations.map((song, i) => (
              <SongRow
                key={`${song.artist}-${song.title}-${i}`}
                song={song}
                number={String(i + 1).padStart(2, '0')}
                active={i === currentIndex}
                onToggle={() => toggle(i)}
              />
            ))}
          </section>
        </div>
      </div>
    </div>
  )
}
