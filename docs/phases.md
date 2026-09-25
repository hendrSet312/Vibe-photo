# Phases

## Phase 1: Project Setup & Static Shell

- [ ] Initialize Vite + React project with JavaScript template
- [ ] Configure Tailwind CSS and install Lucide React
- [ ] Implement responsive `Navbar` and `Footer` components
- [ ] Build static Homepage layout with headline, copy, and "Find My Vibe" CTA
- [ ] Add example photo grid using static assets from `src/constants/`
      **Done when:** Landing page renders correctly on mobile/desktop with artistic, minimal styling and no console errors.

## Phase 2: Upload Flow & State Management

- [x] Implement `PhotoUploader` component with drag-and-drop support
- [x] Add client-side file validation (JPG/PNG/WEBP, max 10MB) with error feedback
- [x] Create `ImagePreview` component with replace/remove functionality
- [x] Wire up frontend state machine (EMPTY → PHOTO_SELECTED → ANALYZING → RESULT → ERROR)
- [x] Add loading spinner/skeleton for ANALYZING state (accounting for up to 15s processing time)
      **Done when:** User can upload a valid photo, see preview, and observe smooth state transitions without backend.

## Phase 3: Mock Analysis & Result Display

- [x] Implement `vibeApi.js` service returning mock JSON matching the **finalized backend contract** (description, moodTags, recommendations with `externalUrl`, `previewUrl` & `matchLabel`)
- [x] Build `VibeResult` component showing the evocative description and 2-4 mood tags (including the Setting tag). **No numeric vibe bars.**
- [x] Create `SongRecommendation` card displaying artwork, title, artist, deterministic `reason`, `matchLabel` badge, a play button for the 30-second `previewUrl`, and a "Listen on Deezer" button using `externalUrl`
- [x] Add "Try Another Photo" flow to reset state and return to upload
- [x] Ensure all mock data maps correctly to UI elements and handles missing `externalUrl` / `previewUrl` gracefully
      **Done when:** Full end-to-end flow works with mock data; user sees the curated 5-song result page with direct Deezer links and audio previews.

## Phase 4: Backend Implementation & Integration

- [ ] Initialize Node.js/Express backend project structure
- [ ] Implement `visionService.js` with OpenRouter VLM integration (constrained JSON output)
- [ ] Implement controller country resolution (override, high-confidence location map, US default) and mood handling directly from the Gemini analysis (no separate mapping service)
- [ ] Set up `discoveryService.js` with Spotify Search API and Local Feature Dataset fallback logic
- [ ] Implement `similarity.js` scoring engine and `reasonGenerator.js` templates
- [ ] Create `/api/analyze` endpoint with image validation, timeout handling, and error codes
- [ ] Update frontend `vibeApi.js` to call the real backend endpoint instead of returning mock data
- [ ] Handle CORS and environment variable configuration for local development
      **Done when:** Frontend successfully receives real AI-generated vibes and Itunes-linked song recommendations from the backend.

## Phase 5: Polish & Acceptance Validation

- [ ] Add subtle enter/exit animations for state transitions
- [ ] Verify responsive behavior across mobile, tablet, and desktop breakpoints
- [ ] Test error states (invalid file, simulated API failure/timeout) with user-friendly messages
- [ ] Confirm no API keys or secrets are exposed in browser bundle
- [ ] Validate all MVP acceptance criteria from PRD §31 are met
      **Done when:** Product feels artistic and experimental; all checkboxes in PRD 