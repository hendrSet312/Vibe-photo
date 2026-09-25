const MATCH_LABELS = ['Perfect Match', 'Great Match', 'Great Match', 'Good Match', 'Good Match']

export function getMatchLabel(index) {
  return MATCH_LABELS[index] || 'Good Match'
}

/**
 * Deterministic, template-based reasons tied to the photo's vibe.
 * Context accepts the new backend-spec vision shape:
 * { moodTags, mood, genre_hints, description }.
 */
export function generateReasons(tracks, context = {}) {
  const { moodTags = [], mood = null, genre_hints = [] } = context
  const primary = moodTags[0] || (mood?.emotional_tone ? capitalize(mood.emotional_tone) : null) || genre_hints[0] || 'the mood'
  const primaryLower = String(primary).toLowerCase()
  const secondary = moodTags[1] || (mood?.atmosphere ? capitalize(mood.atmosphere) : null) || genre_hints[1] || 'the atmosphere'
  const secondaryLower = String(secondary).toLowerCase()

  return tracks.map((track, i) => {
    const genre = track.genre ? ` Its ${track.genre.toLowerCase()} texture fits right in.` : ''
    if (i === 0) {
      return {
        reason: `This track perfectly captures the "${primaryLower}" feeling of your photo.${genre}`,
        matchLabel: getMatchLabel(i),
      }
    }
    if (i === 1 && secondary) {
      return {
        reason: `This song bridges the "${primaryLower}" and "${secondaryLower}" tones in your image.${genre}`,
        matchLabel: getMatchLabel(i),
      }
    }
    return {
      reason: `This song echoes the "${primaryLower}" atmosphere of your picture.${genre}`,
      matchLabel: getMatchLabel(i),
    }
  })
}

function capitalize(s) {
  const t = String(s || '').trim().toLowerCase()
  return t ? t.charAt(0).toUpperCase() + t.slice(1) : t
}
