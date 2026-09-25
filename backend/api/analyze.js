import multer from 'multer'
import { analyzeImage } from '../services/visionService.js'
import { discoverSongs } from '../services/discoveryService.js'
import { generateReasons } from '../services/reasonGenerator.js'
import { processImage } from '../utils/imageProcessor.js'
import { AppError, toSpecErrorResponse } from '../utils/errors.js'
import {
  TOTAL_TIMEOUT_MS,
  COUNTRY_CODE_MAP,
  ITUNES_DEFAULT_COUNTRY,
  ITUNES_FALLBACK_QUERY,
  ITUNES_SUPPORTED_COUNTRIES,
} from '../config/constants.js'

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp']
    cb(null, allowed.includes(file.mimetype))
  },
})

function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new AppError('TIMEOUT')), ms)),
  ])
}

function resolveCountry(vision) {
  const override =
    typeof vision?.itunes_country_override === 'string'
      ? vision.itunes_country_override.trim().toUpperCase()
      : null
  // Only accept storefronts known to return results (CN always returns
  // zero, which caused Chinese photos to yield "no song").
  if (override && /^[A-Z]{2}$/.test(override)) {
    return ITUNES_SUPPORTED_COUNTRIES.has(override) ? override : ITUNES_DEFAULT_COUNTRY
  }

  const loc = vision?.location_context
  if (loc && loc.confidence === 'high' && typeof loc.country === 'string') {
    const mapped = COUNTRY_CODE_MAP[loc.country.trim().toLowerCase()]
    if (mapped) return mapped
  }
  return ITUNES_DEFAULT_COUNTRY
}

function getPrimaryGenre(vision) {
  const g = Array.isArray(vision?.genre_hints) ? vision.genre_hints[0] : null
  return typeof g === 'string' && g.trim() ? g.trim().slice(0, 60) : ITUNES_FALLBACK_QUERY
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Invalid image file' })
  }

  upload.single('image')(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ success: false, error: 'Invalid image file' })
    }
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Invalid image file' })
    }

    try {
      const processed = await processImage(req.file.buffer, req.file.mimetype).catch((procErr) => {
        console.error('[analyze] Image processing failed:', procErr)
        throw new AppError('INVALID_IMAGE')
      })
      const vision = await withTimeout(analyzeImage(processed.buffer), TOTAL_TIMEOUT_MS)
      const country = resolveCountry(vision)

      let songs = []
      try {
        songs = await withTimeout(
          discoverSongs({
            musicQuery: vision.music_query,
            primaryGenre: getPrimaryGenre(vision),
            country,
          }),
          TOTAL_TIMEOUT_MS,
        )
      } catch (discoveryErr) {
        console.error('[analyze] Discovery error:', discoveryErr)
        throw new AppError('VISION_FAILED')
      }

      // Spec: visual analysis is still returned when no music is found.
      if (!songs || songs.length === 0) {
        console.log('pass song');
        return res.status(200).json({
          success: true,
          analysis: vision,
          music: null,
          // Legacy frontend-compatible aliases (5-song contract).
          vibe: { description: vision.description },
          recommendations: [],
          meta: { discoveryMethod: 'itunes-search', previewSource: 'itunes-apple', country },
        })
      }

      const enriched = generateReasons(songs, {
        mood: vision.mood,
        genre_hints: vision.genre_hints,
      })
      const recommendations = songs.map((s, i) => ({ ...s, ...enriched[i] }))
      console.log('pass song');
      return res.status(200).json({
        success: true,
        analysis: vision,
        music: recommendations[0],
        // Legacy frontend-compatible aliases (5-song contract).
        vibe: { description: vision.description },
        recommendations,
        meta: { discoveryMethod: 'itunes-search', previewSource: 'itunes-apple', country },
      })
    } catch (err) {
      console.error('[analyze] Error:', err)
      const { body, status } = toSpecErrorResponse(err)
      return res.status(status).json(body)
    }

    
  })
}

export const config = {
  api: { bodyParser: false },
}
