import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'

dotenv.config()

import analyzeHandler from './api/analyze.js'
import healthHandler from './api/health.js'

const app = express()
// Backend spec: fixed application port, no PORT in .env.
const PORT = 3000

const allowedOrigin = process.env.FRONTEND_URL || 'http://localhost:5173'
const apiKey = process.env.API_KEY

function requireApiKey(req, res, next) {
  if (!apiKey) {
    console.warn('[auth] API_KEY not set, skipping auth check')
    return next()
  }
  const key = req.headers['x-api-key'] || req.query.api_key
  if (key !== apiKey) {
    return res.status(401).json({ success: false, error: 'Unauthorized' })
  }
  next()
}

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}))
app.use(cors({ origin: allowedOrigin, credentials: true }))
app.use(express.json({ limit: '10mb' }))

const analyzeLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { success: false, error: 'Too many requests, please wait a moment' },
  standardHeaders: true,
  legacyHeaders: false,
})

// Backend-spec health check.
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Photo Vibe Backend is running' })
})
// Legacy alias kept for existing clients/Vercel rewrites.
app.get('/api/health', healthHandler)
app.post('/api/analyze', analyzeLimiter, requireApiKey, analyzeHandler)

app.use((err, req, res, next) => {
  console.error('Server error:', err)
  res.status(500).json({ success: false, error: 'Image analysis failed' })
})

app.listen(PORT, () => {
  console.log(`Backend dev server running on http://localhost:${PORT}`)
})

export default app
