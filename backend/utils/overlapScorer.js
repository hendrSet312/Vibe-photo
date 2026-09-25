export function normalizeTrackKey(artist, title) {
  return `${artist.toLowerCase().trim()}|${title.toLowerCase().trim()}`
}

export function scoreOverlaps(tagTrackLists) {
  const counts = new Map()
  const firstSeen = new Map()

  for (const { tag, tracks } of tagTrackLists) {
    for (let i = 0; i < tracks.length; i++) {
      const track = tracks[i]
      const key = normalizeTrackKey(track.artist, track.title)
      const existing = counts.get(key) || { track, overlapScore: 0, tags: [] }
      existing.overlapScore += 1
      existing.tags.push(tag)
      if (!firstSeen.has(key)) {
        firstSeen.set(key, i)
      }
      counts.set(key, existing)
    }
  }

  const results = Array.from(counts.values())
  results.sort((a, b) => {
    if (b.overlapScore !== a.overlapScore) return b.overlapScore - a.overlapScore
    return firstSeen.get(normalizeTrackKey(a.track.artist, a.track.title)) - firstSeen.get(normalizeTrackKey(b.track.artist, b.track.title))
  })

  return results.map(({ track, overlapScore, tags }) => ({ ...track, overlapScore, matchedTags: tags }))
}