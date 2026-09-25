import { readFileSync } from 'fs'
import { join } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import { generateObject, generateText } from 'ai'
import { createOpenAICompatible } from '@ai-sdk/openai-compatible'
import { z } from 'zod'
import { MOOD_VALUES, GENRE_ALLOW_LIST } from '../config/constants.js'
import { AppError } from '../utils/errors.js'
import 'dotenv/config'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const PROMPT_PATH = join(__dirname, '../lib/prompt.txt')
const PROMPT_TEMPLATE = readFileSync(PROMPT_PATH, 'utf-8')

// Zod schema mirrors lib/prompt.txt STEP 6 output schema.
// Tolerant by design: Cloudflare vision models frequently omit nullable
// fields, return "" instead of null, or add extra genres. Strict schemas
// turned those recoverable quirks into AI_TypeValidationError ->
// INVALID_ANALYSIS (502). Every field therefore accepts missing/null and
// falls back to a safe default; sanitizers below canonicalize values.
const VisionSchema = z.object({
  description: z.string().max(2000).optional().nullable().default(null),
  location_context: z
    .object({
      detected_landmark: z.string().max(200).optional().nullable().default(null),
      country: z.string().max(80).optional().nullable().default(null),
      confidence: z.string().optional().nullable().default(null),
    })
    .optional()
    .nullable()
    .default(null),
  mood: z
    .object({
      emotional_tone: z.string().optional().nullable().default(null),
      energy_character: z.string().optional().nullable().default(null),
      sonic_texture: z.string().optional().nullable().default(null),
      atmosphere: z.string().optional().nullable().default(null),
    })
    .optional()
    .nullable()
    .default(null),
  genre_hints: z.array(z.string()).optional().nullable().default(null),
  music_query: z.string().max(120).optional().nullable().default(null),
  itunes_country_override: z.string().max(10).optional().nullable().default(null),
})


const MOOD_FALLBACK = Object.fromEntries(
  Object.entries(MOOD_VALUES).map(([key, values]) => [key, values[0]]),
)

function sanitizeMood(mood) {
  const source = mood && typeof mood === 'object' ? mood : {}
  const out = {}
  for (const key of Object.keys(MOOD_VALUES)) {
    const raw = typeof source[key] === 'string' ? source[key].toLowerCase().trim() : ''
    out[key] = MOOD_VALUES[key].includes(raw) ? raw : MOOD_FALLBACK[key]
  }
  return out
}

// Canonicalize against the allow list (case-insensitive) so variants like
// "city pop", "Hip Hop" or "r&b" map to "City Pop", "Hip-Hop/Rap", "R&B/Soul".
// Unknown non-empty genres are kept as-is (iTunes search accepts them);
// only a fully empty result falls back to Pop instead of INVALID_ANALYSIS.
const GENRE_LOOKUP = new Map(GENRE_ALLOW_LIST.map((g) => [g.toLowerCase(), g]))
const GENRE_ALIAS = new Map([
  ['hip hop', 'Hip-Hop/Rap'],
  ['hiphop', 'Hip-Hop/Rap'],
  ['hip-hop', 'Hip-Hop/Rap'],
  ['r&b', 'R&B/Soul'],
  ['rnb', 'R&B/Soul'],
  ['r and b', 'R&B/Soul'],
  ['soul', 'R&B/Soul'],
  ['lofi', 'Lo-Fi'],
  ['lo fi', 'Lo-Fi'],
  ['singer songwriter', 'Singer/Songwriter'],
  ['indie', 'Indie Rock'],
  ['edm', 'Electronic'],
  ['kpop', 'K-Pop'],
  ['jpop', 'J-Pop'],
  ['citypop', 'City Pop'],
  ['city-pop', 'City Pop'],
  ['cpop', 'C-Pop'],
  ['c-pop', 'C-Pop'],
  ['chinese pop', 'C-Pop'],
  ['mandarin pop', 'Mandopop'],
  ['mando-pop', 'Mandopop'],
  ['taiwan pop', 'Mandopop'],
  ['cantonese pop', 'Cantopop'],
  ['canto-pop', 'Cantopop'],
  ['hk-pop', 'Cantopop'],
  ['chinese traditional', 'World'],
  ['chinese folk', 'World'],
])

function canonicalGenre(raw) {
  const cleaned = raw.trim().replace(/\s+/g, ' ')
  if (!cleaned) return null
  const lower = cleaned.toLowerCase()
  if (GENRE_LOOKUP.has(lower)) return GENRE_LOOKUP.get(lower)
  if (GENRE_ALIAS.has(lower)) return GENRE_ALIAS.get(lower)
  return cleaned.slice(0, 40)
}

function sanitizeGenreHints(value) {
  const list = Array.isArray(value) ? value : []
  const cleaned = list
    .filter((g) => typeof g === 'string')
    .map(canonicalGenre)
    .filter(Boolean)
    .filter((g, i, arr) => arr.indexOf(g) === i)
    .slice(0, 2)
  return cleaned.length > 0 ? cleaned : ['Pop']
}

function sanitizeDescription(value) {
  if (typeof value === 'string' && value.trim()) {
    return value.trim().slice(0, 300)
  }
  return 'A photo with a distinctive visual atmosphere.'
}

function sanitizeMusicQuery(value, genreHints) {
  if (typeof value === 'string') {
    const q = value.trim().replace(/\s+/g, ' ').replace(/[^\w\s/-]/g, '').trim().slice(0, 60)
    const words = q.split(' ').filter(Boolean)
    if (words.length >= 1 && words.length <= 4 && q.length > 0) return q
  }
  if (genreHints.length > 0) return genreHints[0].slice(0, 60)
  return 'Pop'
}

function sanitizeLocation(value) {
  if (!value || typeof value !== 'object') {
    return { detected_landmark: null, country: null, confidence: null }
  }
  const landmark = typeof value.detected_landmark === 'string' && value.detected_landmark.trim()
    ? value.detected_landmark.trim().slice(0, 120)
    : null
  const country = typeof value.country === 'string' && value.country.trim()
    ? value.country.trim().slice(0, 80)
    : null
  const confidence = ['high', 'low'].includes(value.confidence) ? value.confidence : null
  return { detected_landmark: landmark, country, confidence }
}

function sanitizeOverride(value) {
  if (typeof value !== 'string') return null
  const code = value.trim().toUpperCase()
  return /^[A-Z]{2}$/.test(code) ? code : null
}

// Shared vision-model request plumbing (used by both structured analysis
// and text repair so the prompt, messages and temperature stay in one place).
const ANALYSIS_INSTRUCTION = 'Analyze this photo and return the JSON analysis.'
const VISION_TEMPERATURE = 0.2
const REPAIR_SYSTEM_SUFFIX = '\nReturn ONLY raw JSON, no markdown, no explanation.'

function getVisionModel(provider, modelId) {
  return provider.chatModel(modelId)
}

function buildVisionMessages(buffer) {
  return [
    {
      role: 'user',
      content: [
        { type: 'text', text: ANALYSIS_INSTRUCTION },
        { type: 'image', image: buffer, mediaType: 'image/jpeg' },
      ],
    },
  ]
}

function extractJsonObject(text) {
  const start = typeof text === 'string' ? text.indexOf('{') : -1
  const end = typeof text === 'string' ? text.lastIndexOf('}') : -1
  if (start === -1 || end <= start) return null
  try {
    const obj = JSON.parse(text.slice(start, end + 1))
    return obj && typeof obj === 'object' ? obj : null
  } catch {
    return null
  }
}

// Last-resort repair: ask the model for plain JSON text and extract the
// object manually. Returns a partial object (possibly empty) or null.
async function tryTextRepair(provider, modelId, buffer) {
  try {
    const { text } = await generateText({
      model: getVisionModel(provider, modelId),
      system: `${PROMPT_TEMPLATE}${REPAIR_SYSTEM_SUFFIX}`,
      messages: buildVisionMessages(buffer),
      temperature: VISION_TEMPERATURE,
    })
    return extractJsonObject(text)
  } catch (repairErr) {
    console.error('[visionService] Text repair failed:', repairErr)
    return null
  }
}

function createCloudflareProvider() {
  const apiKey = process.env.CLOUDFARE_API
  const accountId = process.env.CLOUDFARE_ACCOUNT_ID || ''

  if (!apiKey || !accountId) {
    throw new AppError('VISION_FAILED')
  }

  // Cloudflare Workers AI exposes an OpenAI-compatible chat endpoint.
  // The Vercel AI SDK talks to it via @ai-sdk/openai-compatible.
  return createOpenAICompatible({
    name: 'cloudflare',
    baseURL: `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/v1`,
    apiKey,
  })
}

export async function analyzeImage(buffer) {
  const modelId = process.env.CLOUDFARE_MODEL 
  const provider = createCloudflareProvider()

  let parsed
  try {
    const { object } = await generateObject({
      model: getVisionModel(provider, modelId),
      schema: VisionSchema,
      system: PROMPT_TEMPLATE,
      messages: buildVisionMessages(buffer),
      temperature: VISION_TEMPERATURE,
    })
    parsed = object
  } catch (err) {
    if (err instanceof AppError) throw err
    console.error('[visionService] Error:', err)
    if (err.name === 'AbortError' || err.code === 'ETIMEDOUT') throw new AppError('TIMEOUT')
    if (err.name === 'AI_NoObjectGeneratedError' || err.name === 'AI_TypeValidationError') {
      parsed = await tryTextRepair(provider, modelId, buffer)
      if (parsed) {
        console.warn('[visionService] Recovered analysis via text repair')
      } else {
        throw new AppError('INVALID_ANALYSIS')
      }
    } else {
      throw new AppError('VISION_FAILED')
    }
  }

  const description = sanitizeDescription(parsed?.description)
  // Sanitizers always return usable fallbacks, so INVALID_ANALYSIS is only
  // thrown when there is genuinely nothing to build an analysis from.
  const mood = sanitizeMood(parsed?.mood)
  const genreHints = sanitizeGenreHints(parsed?.genre_hints)

  const locationContext = sanitizeLocation(parsed?.location_context)
  const musicQuery = sanitizeMusicQuery(parsed?.music_query, genreHints)
  const override = sanitizeOverride(parsed?.itunes_country_override)

  return {
    description,
    location_context: locationContext,
    mood,
    genre_hints: genreHints,
    music_query: musicQuery,
    itunes_country_override: override,
  }
}
