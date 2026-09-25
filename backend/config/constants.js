
export const VISION_TIMEOUT_MS = 10000

export const ITUNES_TIMEOUT_MS = 5000
export const ITUNES_LIMIT = 30
export const MAX_SONGS = 5
export const ITUNES_DEFAULT_COUNTRY = 'US'
export const ITUNES_FALLBACK_QUERY = 'Pop'

export const TOTAL_TIMEOUT_MS = 15000

export const MIN_OVERLAP_FOR_DUAL_TAG = 2

// Allowed categorical mood values (must match lib/prompt.txt Step 3).
export const MOOD_VALUES = {
  emotional_tone: ['melancholic', 'euphoric', 'tender', 'bittersweet', 'somber', 'joyful', 'wistful'],
  energy_character: ['calm', 'driving', 'gentle', 'intense', 'restless', 'steady'],
  sonic_texture: ['warm', 'hazy', 'crisp', 'gritty', 'lush', 'sparse', 'airy'],
  atmosphere: ['intimate', 'expansive', 'nostalgic', 'dreamlike', 'urban', 'pastoral'],
}

// Allowed genre hints (must match lib/prompt.txt Step 4).
export const GENRE_ALLOW_LIST = [
  'Pop', 'Rock', 'Alternative', 'Indie Rock', 'Singer/Songwriter', 'Folk',
  'Electronic', 'Dance', 'Hip-Hop/Rap', 'R&B/Soul', 'Jazz', 'Classical', 'Ambient',
  'World', 'Country', 'K-Pop', 'J-Pop', 'City Pop', 'C-Pop', 'Mandopop', 'Cantopop',
  'Latin', 'Afrobeat', 'Lo-Fi',
  'Soundtrack', 'Reggae', 'Blues', 'Metal',
]

// High-confidence location country name -> iTunes store country code.
// NOTE: mainland China maps to TW, NOT CN — the CN storefront returns zero
// results for every query on the iTunes Search API (verified live), which
// caused Chinese-looking photos to always yield "no song".
export const COUNTRY_CODE_MAP = {
  japan: 'JP',
  korea: 'KR',
  'south korea': 'KR',
  china: 'TW',
  taiwan: 'TW',
  'hong kong': 'HK',
  singapore: 'SG',
  brazil: 'BR',
  jamaica: 'JM',
  'united states': 'US',
  usa: 'US',
  'united kingdom': 'GB',
  uk: 'GB',
  france: 'FR',
  germany: 'DE',
  spain: 'ES',
  italy: 'IT',
  indonesia: 'ID',
}

// iTunes Search API storefronts verified to return results. Any override or
// store code outside this set (e.g. CN, which always returns zero results)
// falls back to ITUNES_DEFAULT_COUNTRY instead of yielding "no song".
export const ITUNES_SUPPORTED_COUNTRIES = new Set([
  'US', 'GB', 'JP', 'KR', 'TW', 'HK', 'SG',
  'BR', 'JM', 'FR', 'DE', 'ES', 'IT', 'ID',
])

export const ERROR_CODES = {
  INVALID_IMAGE: 'INVALID_IMAGE',
  INVALID_ANALYSIS: 'INVALID_ANALYSIS',
  TIMEOUT: 'TIMEOUT',
  NO_RESULTS: 'NO_RESULTS',
  VISION_FAILED: 'VISION_FAILED',
  UPSTREAM_ERROR: 'UPSTREAM_ERROR',
}