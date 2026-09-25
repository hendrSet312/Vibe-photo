# Photo Vibe — Backend

**Photo Vibe Backend** is a lightweight Express.js API that analyzes an uploaded photograph, extracts its visual mood and contextual information using **Cloudflare Workers AI**, and generates **five song recommendations** through the **iTunes Search API**.

The backend acts as the bridge between the uploaded image and the frontend music experience.

---

## Architecture

```text
User Photo
    │
    ▼
React Frontend
    │
    │ POST /api/analyze
    ▼
Express Backend
    │
    ▼
Cloudflare AI
    │
    │ Structured visual analysis
    ▼
Mood + Location + Genre + Music Query
    │
    ▼
iTunes Search API
    │
    │ Multiple song candidates
    ▼
Song Selection + Deduplication
    │
    ▼
5 Song Recommendations
    │
    ▼
React Frontend
```

The system separates responsibilities:

* **Cloudflare Workers AI** interprets the photograph.
* **Cloudflare Workers AI** identifies the visual mood and, when possible, geographic context.
* **Cloudflare Workers AI** suggests suitable music genres and generates a concise music search query.
* **iTunes Search API** retrieves actual songs.
* **The backend** selects and normalizes five suitable songs.
* **The frontend** presents the visual vibe and five music recommendations.

---

# Project Structure

```text
backend/
│
├── src/
│   ├── server.js
│   │
│   ├── routes/
│   │   └── analyzeRoutes.js
│   │
│   ├── controllers/
│   │   └── analyzeController.js
│   │
│   ├── services/
│   │   ├── geminiService.js
│   │   └── itunesService.js
│   │
│   └── prompts/
│       └── vibePrompt.js
│
├── uploads/
│
├── .env
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

# File Responsibilities

## `src/server.js`

The main entry point of the backend.

Responsibilities:

* Initialize the Express application.
* Load environment variables.
* Configure JSON parsing.
* Configure CORS.
* Register API routes.
* Start the HTTP server.

The backend uses a fixed/default application port rather than requiring `PORT` to be configured through `.env`.

Example:

```javascript
const PORT = 3000;
```

---

## `src/routes/analyzeRoutes.js`

Defines the API endpoint responsible for image analysis.

Main endpoint:

```text
POST /api/analyze
```

Responsibilities:

* Define the `/analyze` route.
* Configure image upload handling.
* Forward the uploaded image to the controller.

The route should remain lightweight and should not contain the main Gemini or iTunes business logic.

---

## `src/controllers/analyzeController.js`

The controller is responsible for orchestrating the complete image-to-music pipeline.

Responsibilities:

1. Receive the uploaded image.
2. Validate the image.
3. Send the image to Gemini.
4. Receive the structured visual analysis.
5. Determine the iTunes country.
6. Send the generated music query to iTunes.
7. Apply the iTunes fallback strategy.
8. Collect enough unique songs for five recommendations.
9. Normalize the song information.
10. Return the analysis and recommendations to the frontend.

Conceptually:

```text
Image
  ↓
Gemini Analysis
  ↓
Structured Vibe Data
  ↓
Music Query
  ↓
iTunes Search
  ↓
Multiple Candidates
  ↓
Deduplication
  ↓
5 Recommendations
  ↓
API Response
```

The controller handles orchestration while the individual services handle external API communication.

---

# `src/services/cloudflareService.js`

Handles communication with the Cloudflare Workers AI API via the Vercel AI SDK.

The pipeline uses `generateObject` from the `ai` package with the
`@ai-sdk/openai-compatible` provider pointed at Cloudflare's
OpenAI-compatible endpoint
(`https://api.cloudflare.com/client/v4/accounts/{ACCOUNT_ID}/ai/v1`).
Auth uses the `CLOUDFARE_API` key. The model id comes from
`CLOUDFARE_MODEL` (default `@cf/meta/llama-4-scout-17b-16e-instruct`).
Scout is required here: older vision models such as
`@cf/meta/llama-3.2-11b-vision-instruct` use a legacy input schema where
`/image` must be array/binary, so the OpenAI-compatible `image_url` parts
sent by the SDK are rejected with code 5006.
A Zod schema enforces the structured JSON output, replacing manual
JSON extraction.

Responsibilities:

* Initialize the Vercel AI SDK Cloudflare provider (`createOpenAICompatible`).
 * Send the uploaded image for visual analysis.
 * Use the internal analysis instructions as the system prompt.
 * Request structured output via `generateObject` + Zod schema.
 * Validate the expected response structure.
 * Return the analysis to the controller.

Cloudflare Workers AI provides the following information.

### Description

A short atmospheric description of the photograph.

### Location Context

Potential geographic context when the photograph contains enough evidence.

Example:

```json
{
  "detected_landmark": null,
  "country": "Japan",
  "confidence": "high"
}
```

If the location cannot be identified reliably, the corresponding fields can be `null`.

### Mood

The system uses four categorical mood dimensions:

```json
{
  "emotional_tone": "wistful",
  "energy_character": "calm",
  "sonic_texture": "warm",
  "atmosphere": "nostalgic"
}
```

There are **no numerical mood scores**.

### Genre Hints

Cloudflare Workers AI returns one or two possible music genres.

Example:

```json
[
  "City Pop",
  "J-Pop"
]
```

### Music Query

Cloudflare Workers AI converts the visual interpretation into a short search query suitable for the iTunes Search API.

Example:

```text
City Pop nostalgic
```

The query is intentionally short so it can be used directly for music discovery.

---

# `src/prompts/vibePrompt.js`

Contains the internal instructions used by Cloudflare Workers AI for photograph analysis.

The prompt defines:

* How the photograph should be interpreted.
* The allowed mood categories.
* The allowed genre categories.
* How location context should be determined.
* How genre hints should be selected.
* How the music query should be generated.
* The required JSON structure.

The actual Gemini prompt is intentionally **not included in this README**.

---

# `src/services/itunesService.js`

Handles communication with the iTunes Search API.

The service receives the music query generated by Gemini and searches for matching songs.

The request uses the iTunes Search API with parameters equivalent to:

```text
term=<music_query>
country=<country>
entity=song
```

The country defaults to:

```text
US
```

unless Gemini provides a valid country override.

For example:

```text
music_query = City Pop nostalgic
country = JP
```

The backend searches using the generated query and Japanese iTunes catalog.

---

# Five-Song Recommendation Strategy

The backend is designed to return **five song recommendations**.

The recommendations are collected from iTunes search results while avoiding duplicate tracks.

The system does not require Gemini to identify five individual songs. Gemini only provides the visual interpretation and search query. iTunes is responsible for finding multiple actual songs.

---

## Search Step 1 — Full Music Query

The first search uses the complete Gemini-generated query.

Example:

```text
City Pop nostalgic
```

The backend requests song results from iTunes and collects usable tracks.

If at least five unique songs are available, the backend selects five recommendations.

```text
"City Pop nostalgic"
        │
        ▼
iTunes
        │
        ▼
Song 1
Song 2
Song 3
Song 4
Song 5
```

---

## Search Step 2 — Genre Fallback

If the first search does not provide five usable songs, the backend performs another search using the primary genre hint.

Example:

```text
City Pop
```

Only additional unique tracks are used to fill the remaining recommendation slots.

For example:

```text
First search:
3 usable songs

Second search:
4 additional usable songs

Final result:
5 unique songs
```

---

## Search Step 3 — Absolute Fallback

If there are still fewer than five recommendations, the backend performs a final search using:

```text
Pop
```

Additional unique songs are used to fill the remaining slots.

The complete logic is:

```text
Gemini Music Query
       │
       ▼
"City Pop nostalgic"
       │
       ├── 5+ usable songs
       │       ↓
       │    Select 5
       │
       └── <5 usable songs
                │
                ▼
            "City Pop"
                │
                ├── Enough songs
                │       ↓
                │    Fill remaining slots
                │
                └── Still insufficient
                         │
                         ▼
                       "Pop"
                         │
                         ▼
                  Fill remaining slots
```

The backend therefore prioritizes the most contextually relevant search first and progressively broadens the search only when necessary.

---

# Song Deduplication

The backend should avoid returning the same track multiple times when combining results from different searches.

A suitable unique identifier can be based on the iTunes track ID.

Conceptually:

```javascript
const seenTrackIds = new Set();
```

Before adding a song to the recommendation list, the backend checks whether its track ID has already been included.

This prevents situations such as:

```text
Search 1:
Song A
Song B
Song C

Search 2:
Song B
Song D
Song E
```

from producing:

```text
Song A
Song B
Song C
Song B
Song D
```

Instead, the final recommendations become:

```text
Song A
Song B
Song C
Song D
Song E
```

---

# Song Selection

The backend can select five songs from the available usable candidates.

Selection can be implemented by:

* Taking the first five suitable results, or
* Randomizing among a limited number of high-ranked candidates.

The recommendation system is intended for **music discovery based on visual atmosphere**, rather than identifying one objectively correct song.

Therefore, multiple songs can reasonably match the same photograph.

---

# iTunes Response Normalization

The iTunes API returns a larger response containing many fields.

The backend extracts only the fields required by Photo Vibe.

Relevant iTunes fields include:

```text
trackId
trackName
artistName
collectionName
artworkUrl100
previewUrl
trackViewUrl
trackTimeMillis
primaryGenreName
```

These are converted into the application's normalized structure:

```json
{
  "title": "Song Title",
  "artist": "Artist Name",
  "album": "Album Name",
  "artwork": "https://...",
  "preview": "https://...",
  "track_url": "https://...",
  "duration_ms": 210000,
  "genre": "Alternative"
}
```

The frontend therefore does not need to understand the complete raw iTunes response.

---

# API

## Health Check

### `GET /`

Used to verify that the backend is running.

Example response:

```json
{
  "message": "Photo Vibe Backend is running"
}
```

---

# Image Analysis

## `POST /api/analyze`

Analyzes an uploaded photograph and returns its visual vibe together with five song recommendations.

### Request

The endpoint expects:

```text
Content-Type: multipart/form-data
```

with an image field:

```text
image
```

Example:

```bash
curl -X POST http://localhost:3000/api/analyze \
  -F "image=@photo.jpg"
```

---

# Successful Response

A successful response has the following structure:

```json
{
  "success": true,
  "analysis": {
    "description": "A nostalgic evening atmosphere with warm city lights and a quiet sense of movement.",
    "location_context": {
      "detected_landmark": null,
      "country": "Japan",
      "confidence": "high"
    },
    "mood": {
      "emotional_tone": "wistful",
      "energy_character": "calm",
      "sonic_texture": "warm",
      "atmosphere": "nostalgic"
    },
    "genre_hints": [
      "City Pop",
      "J-Pop"
    ],
    "music_query": "City Pop nostalgic",
    "itunes_country_override": "JP"
  },
  "music": [
    {
      "title": "Example Song One",
      "artist": "Example Artist One",
      "album": "Example Album One",
      "artwork": "https://...",
      "preview": "https://...",
      "track_url": "https://...",
      "duration_ms": 220000,
      "genre": "City Pop"
    },
    {
      "title": "Example Song Two",
      "artist": "Example Artist Two",
      "album": "Example Album Two",
      "artwork": "https://...",
      "preview": "https://...",
      "track_url": "https://...",
      "duration_ms": 215000,
      "genre": "J-Pop"
    },
    {
      "title": "Example Song Three",
      "artist": "Example Artist Three",
      "album": "Example Album Three",
      "artwork": "https://...",
      "preview": "https://...",
      "track_url": "https://...",
      "duration_ms": 205000,
      "genre": "City Pop"
    },
    {
      "title": "Example Song Four",
      "artist": "Example Artist Four",
      "album": "Example Album Four",
      "artwork": "https://...",
      "preview": "https://...",
      "track_url": "https://...",
      "duration_ms": 230000,
      "genre": "J-Pop"
    },
    {
      "title": "Example Song Five",
      "artist": "Example Artist Five",
      "album": "Example Album Five",
      "artwork": "https://...",
      "preview": "https://...",
      "track_url": "https://...",
      "duration_ms": 210000,
      "genre": "City Pop"
    }
  ]
}
```

The `music` property is an **array of five song objects**.

---

# Frontend Integration

The frontend consumes the normalized response rather than communicating directly with Gemini or iTunes.

For example:

```javascript
const recommendations = response.music;
```

The frontend can render the five songs:

```jsx
{music.map((song) => (
  <div key={song.track_url}>
    <img src={song.artwork} alt={song.title} />

    <h3>{song.title}</h3>
    <p>{song.artist}</p>

    <audio controls src={song.preview} />
  </div>
))}
```

The mood information can be displayed as:

```text
Wistful · Calm · Warm · Nostalgic
```

The artwork can be displayed using:

```jsx
<img src={song.artwork} alt={song.title} />
```

The `preview` field can be used for audio playback, while `track_url` can be used to link to the full track page.

---

# Error Handling

## Invalid Image

```json
{
  "success": false,
  "error": "Invalid image file"
}
```

---

## Gemini Failure

```json
{
  "success": false,
  "error": "Image analysis failed"
}
```

Possible causes include:

* Invalid Gemini credentials.
* Gemini service failure.
* Unsupported image.
* Request failure.

---

## Invalid Gemini Response

```json
{
  "success": false,
  "error": "Invalid analysis response"
}
```

This prevents malformed Gemini output from continuing through the music recommendation pipeline.

---

## Fewer Than Five Songs Available

The system attempts three searches:

```text
1. Full music query
2. Primary genre
3. Pop
```

If fewer than five usable songs are available after all fallback searches, the backend should return all available unique recommendations rather than inventing or duplicating songs.

For example:

```json
{
  "success": true,
  "analysis": {
    "...": "..."
  },
  "music": [
    {
      "title": "Available Song",
      "artist": "Artist",
      "album": "Album",
      "artwork": "https://...",
      "preview": "https://...",
      "track_url": "https://...",
      "duration_ms": 210000,
      "genre": "Pop"
    }
  ]
}
```

The intended target is **five unique songs**, but the backend should not fabricate results when the external API cannot provide enough usable tracks.

---

# No Music Results

If all iTunes searches fail completely, the visual analysis can still be returned while the music array is empty.

Example:

```json
{
  "success": true,
  "analysis": {
    "...": "..."
  },
  "music": []
}
```

This allows the frontend to display the photograph's vibe even when music discovery is unavailable.

---

# Environment Configuration

## `.env`

The backend requires only the Cloudflare Workers AI configuration:

```env
CLOUDFARE_API_TOKEN=your_cloudflare_api_token
CLOUDFARE_MODEL=@cf/meta/llama-4-scout-17b-16e-instruct
```

There is intentionally **no `PORT` variable**.

The backend uses port `3000` directly in `server.js`.

The Cloudflare API token must remain private and must never be exposed to the frontend.

---

## `.env.example`

The environment template should contain:

```env
CLOUDFARE_API_TOKEN=your_cloudflare_api_token
CLOUDFARE_MODEL=@cf/meta/llama-4-scout-17b-16e-instruct
```

Create the local environment file:

```bash
cp .env.example .env
```

Then replace the placeholder values with the actual Cloudflare configuration.

---

# `uploads/`

Temporary storage for uploaded photographs when disk-based upload handling is used.

Depending on the implementation, uploaded images can be:

1. Stored temporarily.
2. Sent to Gemini.
3. Processed.
4. Deleted after processing.

If the backend uses in-memory image buffers, this directory may not be actively used.

---

# `.gitignore`

The `.gitignore` file should prevent sensitive and unnecessary files from being tracked.

Typical entries:

```text
node_modules/
.env
uploads/
*.log
```

The `.env` file must remain local because it contains the Cloudflare API key.

---

# `package.json`

Defines the backend project configuration.

It contains:

* Project metadata.
* Dependencies.
* Development dependencies.
* NPM scripts.

The project requires packages for:

* Express server functionality.
* CORS.
* Environment variable management.
* Multipart image upload handling.
* Vercel AI SDK (`ai`) + Cloudflare Workers AI via `@ai-sdk/openai-compatible`.
* Schema validation with `zod`.
* HTTP requests to the iTunes Search API.

---

# Local Development

Install dependencies:

```bash
npm install
```

Create the environment file:

```bash
cp .env.example .env
```

Configure:

```env
CLOUDFARE_API_TOKEN=your_cloudflare_api_token
CLOUDFARE_MODEL=@cf/meta/llama-4-scout-17b-16e-instruct
```

Start the backend:

```bash
npm start
```

The backend runs on:

```text
http://localhost:3000
```

Verify the server:

```text
GET http://localhost:3000/
```

Then send an image to:

```text
POST http://localhost:3000/api/analyze
```

---

# Complete Data Flow

```text
┌──────────────────────┐
│     User Photo       │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│    Express API       │
│   POST /api/analyze  │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│    Gemini Vision     │
│                      │
│ • Description        │
│ • Location           │
│ • Mood               │
│ • Genre hints        │
│ • Music query        │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│   iTunes Search      │
│                      │
│ Full query           │
│      ↓               │
│ Genre fallback       │
│      ↓               │
│ Pop fallback         │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ Deduplicate Songs    │
│      +               │
│ Select up to 5       │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ Normalize Metadata   │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│    JSON Response     │
│                      │
│ Visual Analysis      │
│        +             │
│ 5 Recommendations    │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│    React Frontend    │
│                      │
│ • Photo              │
│ • Mood               │
│ • Artwork            │
│ • Song information   │
│ • Audio previews     │
└──────────────────────┘
```

---

# Design Principles

## 1. Gemini Handles Visual Interpretation

Gemini is responsible for understanding what the photograph feels like.

It provides:

* Visual atmosphere.
* Mood categories.
* Geographic context when identifiable.
* Genre suggestions.
* A concise music search query.

---

## 2. iTunes Handles Music Discovery

The iTunes Search API is responsible for finding actual music.

It provides:

* Song titles.
* Artists.
* Albums.
* Artwork.
* Audio previews.
* Track links.
* Duration.
* Genre metadata.

---

## 3. Five Recommendations

Photo Vibe returns up to **five unique song recommendations**.

The system prioritizes:

1. The complete Gemini music query.
2. The primary genre.
3. `Pop` as the final fallback.

This allows the recommendations to remain relevant while providing broader fallback searches when the initial query has insufficient results.

---

## 4. No Numerical Mood Scores

Photo Vibe does not represent mood using numerical scores.

Instead, the application uses interpretable categorical descriptors such as:

```text
Wistful
Calm
Warm
Nostalgic
```

These descriptors are directly derived from the Gemini visual analysis.

---

## 5. Backend as an Abstraction Layer

The frontend communicates only with the Photo Vibe backend.

```text
React
  │
  ▼
Photo Vibe API
  │
  ├── Gemini
  │
  └── iTunes
```

This keeps external API credentials and integration details away from the client.

---

# Summary

Photo Vibe Backend provides an image-to-music discovery pipeline:

```text
Photograph
    ↓
Gemini Vision
    ↓
Visual Vibe
    ↓
Genre + Music Query
    ↓
iTunes Search
    ↓
Deduplication
    ↓
5 Song Recommendations
    ↓
Frontend
```

Gemini determines the photograph's atmosphere and translates it into a music-oriented search query.

iTunes then supplies actual songs, metadata, artwork, and audio previews.

The backend combines both services into a single, consistent API response containing the **visual analysis and up to five unique song recommendations** for the Photo Vibe frontend.
