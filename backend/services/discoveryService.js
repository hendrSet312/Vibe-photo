import {
  ITUNES_TIMEOUT_MS,
  ITUNES_LIMIT,
  MAX_SONGS,
  ITUNES_DEFAULT_COUNTRY,
  ITUNES_FALLBACK_QUERY,
  ITUNES_SUPPORTED_COUNTRIES,
} from '../config/constants.js'
import { AppError } from '../utils/errors.js'

function fetchWithTimeout(url, options = {}, timeoutMs) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)
  return fetch(url, { ...options, signal: controller.signal }).finally(() =>
    clearTimeout(timeout),
  )
}

function upscaleArtwork(url) {
  if (!url || typeof url !== 'string') return null
  // iTunes returns 100x100 by default; request a larger image for the UI.
  return url.replace('100x100bb', '600x600bb')
}

function sanitizeCountry(country) {
  if (typeof country === 'string' && /^[A-Za-z]{2}$/.test(country.trim())) {
    const code = country.trim().toUpperCase()
    // Defense in depth with resolveCountry: dead storefronts (e.g. CN)
    // return zero results for every query, so fall back to US.
    if (ITUNES_SUPPORTED_COUNTRIES.has(code)) return code
  }
  return ITUNES_DEFAULT_COUNTRY
}

function mapTrack(t) {
  const title = t.trackName || 'Unknown Title'
  const artist = t.artistName || 'Unknown Artist'
  const album = t.collectionName || null
  const artwork = upscaleArtwork(t.artworkUrl100)
  const preview = t.previewUrl || null
  const trackUrl = t.trackViewUrl || null
  return {
    // Backend-spec normalization.
    title,
    artist,
    artwork,
    duration_ms: typeof t.trackTimeMillis === 'number' ? t.trackTimeMillis : null,
    genre: t.primaryGenreName || null,
    collection: album,
    previewUrl: preview,
    externalUrl: trackUrl,
    trackId: t.trackId,
  }
}

async function searchItunes(query, country) {
  const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&country=${encodeURIComponent(country)}&media=music&entity=song&attribute=genreIndex&limit=${ITUNES_LIMIT}`
  const res = await fetchWithTimeout(url, {}, ITUNES_TIMEOUT_MS)
  if (!res.ok) throw new AppError('UPSTREAM_ERROR')
  const data = await res.json()
  return (data.results || []).map(mapTrack)
}

export async function discoverSongs({ musicQuery, primaryGenre, country, seed } = {}) {
  const store = sanitizeCountry(country)
  const chain = [musicQuery, primaryGenre, ITUNES_FALLBACK_QUERY]
    .filter((q) => typeof q === 'string' && q.trim())
    .map((q) => q.trim())
    .filter((q, i, arr) => arr.findIndex((x) => x.toLowerCase() === q.toLowerCase()) === i)
    .slice(0, 3)

  if (chain.length === 0) return []

  const seen = new Set()
  const picked = []

  for (const query of chain) {
    let results = []
    try {
      results = await searchItunes(query, store)
    } catch (err) {
      if (err instanceof AppError && err.code === 'UPSTREAM_ERROR' && chain.length > 1) continue
      throw err
    }

    results = seededShuffle(results, seed)

    for (const track of results) {
      const idKey = `id:${track.trackId}`
      const nameKey = `name:${String(track.artist).toLowerCase().trim()}|${String(track.title).toLowerCase().trim()}`
      if (seen.has(idKey) || seen.has(nameKey)) continue
      seen.add(idKey)
      seen.add(nameKey)
      picked.push(track)
    }
    if (picked.length >= MAX_SONGS) break
  }

  return picked.slice(0, MAX_SONGS).map(({ trackId: _trackId, ...rest }) => rest)
}

function seededShuffle(arr, seed) {
  const a = [...arr]
  let s = hashString(seed || '')
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) & 0x7fffffff
    const j = s % (i + 1)
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function hashString(str) {
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i)
    h |= 0
  }
  return Math.abs(h)
}

export { sanitizeCountry }
