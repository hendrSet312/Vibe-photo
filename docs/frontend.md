```markdown
# Photo Vibe — Frontend

**Photo Vibe** is an interactive web experience that transforms a photograph into a musical vibe profile. It bridges the gap between visual expression and music discovery, allowing users to answer the question: *"What does my photo sound like?"*

This repository contains the **frontend implementation** built with React, Vite, and Tailwind CSS.

---

## 🚀 Tech Stack

-   **Framework:** React 18 (Vite)
-   **Language:** JavaScript (ES6+)
-   **Styling:** Tailwind CSS
-   **Icons:** Lucide React
-   **Package Manager:** Yarn
-   **Hosting:** Vercel

---

## 📂 Project Structure

```text
src/
├── app/                # Main application entry and routing
```markdown
# Photo Vibe — Frontend

**Photo Vibe** is an interactive web experience that transforms a photograph into a musical vibe profile. It bridges the gap between visual expression and music discovery, allowing users to answer the question: *"What does my photo sound like?"*

This repository contains the **frontend implementation** built with React, Vite, and Tailwind CSS.

---

## 🚀 Tech Stack

-   **Framework:** React 18 (Vite)
-   **Language:** JavaScript (ES6+)
-   **Styling:** Tailwind CSS
-   **Icons:** Lucide React
-   **Package Manager:** Yarn
-   **Hosting:** Vercel

---

## 📂 Project Structure

```text
src/
├── app/                # Main application entry and routing
│   └── App.jsx
├── components/         # UI Components
│   ├── common/         # Reusable small components
│   │   ├── Button.jsx
│   │   └── Loader.jsx
│   ├── layout/         # Structural components
│   │   ├── Navbar.jsx
│   │   └── Footer.jsx
│   └── page/           # Feature-specific components
│       ├── Hero.jsx
│       ├── PhotoUploader.jsx
│       ├── ImagePreview.jsx
│       ├── ExamplePhotos.jsx
│       ├── VibeResult.jsx
│       ├── SongRecommendation.jsx
│       └── HowItWorks.jsx
├── lib/                # Services and API abstractions
│   └── vibeApi.js      # Analysis service (mock → real backend)
├── constants/          # Static data
│   └── examples.js     # Example photo metadata
├── utils/              # Helper functions
│   └── fileValidation.js
└── main.jsx            # Entry point
```

---

## 🧩 Component Details

### Layout & Common

#### `Navbar.jsx`

-   **Purpose:** Provides the top navigation bar.
-   **Features:** Contains the "Photo Vibe" logo and links to "How it Works" or "Try Example". Minimalist design to keep focus on the content.
-   **Props:** None.

#### `Footer.jsx`

-   **Purpose:** Displays copyright and simple links at the bottom of the page.
-   **Features:** Clean, unobtrusive design.
-   **Props:** None.

#### `Button.jsx`

-   **Purpose:** A reusable styled button component.
-   **Features:** Supports primary/secondary variants, loading states, and disabled states.
-   **Props:**
    -   `variant` ('primary' | 'secondary')
    -   `isLoading` (boolean)
    -   `onClick` (function)
    -   `children` (node)

#### `Loader.jsx`

-   **Purpose:** Visual feedback during the "Analyzing" state.
-   **Features:** A subtle, artistic spinner or progress indicator that matches the product's experimental vibe. Accounts for up to 15s backend processing time.
-   **Props:**
    -   `message` (string, e.g., "Finding your vibe...")

---

### Page Components

#### `Hero.jsx`

-   **Purpose:** The main landing area of the homepage.
-   **Features:** Displays the primary headline ("What does your photo sound like?"), supporting copy, and the primary "Find My Vibe" CTA.
-   **Props:**
    -   `onStart` (function) - triggers the upload flow.

#### `PhotoUploader.jsx`

-   **Purpose:** Handles file selection and drag-and-drop interactions.
-   **Features:**
    -   Drag-and-drop zone.
    -   File input trigger.
    -   Client-side validation (JPG/PNG/WEBP, max 10MB).
    -   Error messaging for invalid files.
-   **Props:**
    -   `onFileSelect` (function)
    -   `error` (string | null)

#### `ImagePreview.jsx`

-   **Purpose:** Shows the selected image before analysis.
-   **Features:**
    -   Displays the uploaded image.
    -   "Replace" and "Remove" buttons.
    -   "Find My Vibe" button to start analysis.
-   **Props:**
    -   `imageSrc` (string)
    -   `onReplace` (function)
    -   `onRemove` (function)
    -   `onAnalyze` (function)

#### `ExamplePhotos.jsx`

-   **Purpose:** Provides pre-selected images for users who don't have a photo ready.
-   **Features:** Grid of thumbnail images representing different moods (Rainy City, Golden Hour, etc.). Clicking one triggers the same flow as uploading.
-   **Props:**
    -   `onSelect` (function) - passes the selected example URL to the parent.

#### `VibeResult.jsx`

-   **Purpose:** The core result screen after analysis. Composes the left-column "feeling" summary with the right-column track list and player — it does not render individual song cards itself, but owns the selection state (`activeTrackId`) shared between `SongRow` and `NowPlayingPanel`.
-   **Layout:** Two-column grid (`380px | 1fr`) on desktop, stacking to a single column on narrow viewports. The left column is sticky while the right column scrolls.
-   **Features:**
    -   **Photo Frame:** The originally uploaded photo, displayed at a fixed aspect ratio inside a bordered frame. A separate container from the vibe description below it.
    -   **Vibe Card:** A bordered card, labeled "YOUR VIBE," containing:
        -   **Vibe Description:** The human-readable sentence generated by the AI (e.g., "A woman in a blue dress stands by a window with palm trees in the background.").
        -   **Mood Tags:** A horizontal, wrapping list of mood badges (currently 4 — TENDER, CALM, WARM, INTIMATE). No fixed count is enforced; no numeric vibe bars.
    -   **Retry Action:** A "Try Another Photo" button beneath the vibe card, resetting the app back to the upload state.
    -   **Now Playing Panel:** Rendered once at the top of the right column; reflects whichever track is currently selected (see `NowPlayingPanel.jsx`). Starts in a collapsed/empty state before any row is tapped.
    -   **Track List:** Renders one `SongRow` per recommendation (currently 5, not a fixed 3) inside a single bordered list container.
-   **Props:**
    -   `vibeData` (object):
        -   `description` (string)
        -   `moodTags` (array of strings)
        -   `imageSrc` (string)
    -   `recommendations` (array of song objects — see `SongRow` / `NowPlayingPanel` props)
    -   `activeTrackId` (string | number | null)
    -   `isPlaying` (boolean)
    -   `progress` (number, seconds elapsed)
    -   `onSelectTrack`, `onTogglePlay`, `onSeek`, `onRetry` (functions)

#### `SongRow.jsx`

-   **Purpose:** Displays a single track as a compact row inside the results list. Tapping a row selects that track and drives the shared `NowPlayingPanel` above the list — rows do not show artwork, reasoning, or playback controls themselves.
-   **Features:**
    -   **Index:** Two-digit track number (e.g. `01`), monospace.
    -   **Track Info:** Song title (bold) and artist name (subtle, italic), single line with ellipsis overflow.
    -   **Match Label:** A qualitative badge indicating match strength ("Strong Match", "Good Match", or "Possible Match"), right-aligned.
    -   **Active State:** The selected row is highlighted (accent background) and stays highlighted until another row is tapped.
    -   **Tap Behavior:** Tapping the active row toggles play/pause via the panel; tapping any other row selects that track, expands the panel if collapsed, and starts playback.
-   **Props:**
    -   `song` (object):
        -   `title` (string)
        -   `artist` (string)
        -   `matchLabel` (string)
    -   `index` (number) — position in the list, used for the row number
    -   `isActive` (boolean) — whether this row is the currently selected track
    -   `onSelect` (function) — called with the track's id/index on tap

#### `NowPlayingPanel.jsx`

-   **Purpose:** A single panel above the track list that shows details and playback controls for whichever track is currently selected. Collapsed (art + prompt text only) until a `SongRow` is tapped, then expands in place — the panel is shared state, not per-row.
-   **Features:**
    -   **Album Artwork:** Square image (aspect-ratio 1/1) with a bordered frame; hidden/placeholder until a track is selected.
    -   **Track Info:** Song title (bold) and artist name (subtle, italic).
    -   **Match Label:** Same qualitative badge as the row ("Strong Match", "Good Match", "Possible Match"), shown once expanded.
    -   **Reasoning Text:** A short, deterministic sentence explaining the connection (e.g., "Its mellow acoustic texture and slow tempo fit this photo."). Only rendered in the expanded state.
    -   **Play/Pause Button:** Toggles playback for the selected track. Uses a custom play/pause SVG icon (swap for Lucide `Play`/`Pause` in the React port).
    -   **Seek Bar:** Range input showing elapsed/total time, updates live during playback, draggable to scrub.
    -   **Listen Link:** Opens the track directly in Spotify via `externalUrl`. Opens in a new tab. Falls back gracefully if `externalUrl` is missing (link disabled with tooltip).
    -   **Expand/Collapse:** Animates open on first selection using a height-auto-safe transition (`grid-template-rows: 0fr → 1fr`); stays open while switching between tracks.
-   **Props:**
    -   `song` (object, nullable — `null` renders the collapsed/empty state):
        -   `title` (string)
        -   `artist` (string)
        -   `artwork` (string URL)
        -   `reason` (string)
        -   `matchLabel` (string)
        -   `externalUrl` (string)
        -   `duration` (number, seconds)
    -   `isPlaying` (boolean)
    -   `progress` (number, seconds elapsed)
    -   `onTogglePlay` (function)
    -   `onSeek` (function) — called with new elapsed-seconds value

#### `HowItWorks.jsx`

-   **Purpose:** Explains the process visually.
-   **Features:** Simple 3-step diagram: Photo → Vibe → Music.
-   **Props:** None.

---

## 📝 Coding Conventions

-   **Components:** Use PascalCase for filenames and component names.
-   **Functions:** Use camelCase for handlers and utilities.
-   **Styling:** Prefer Tailwind utility classes. Avoid custom CSS unless necessary for complex animations.
-   **State:** Keep state local to components where possible. Lift state up only when shared between siblings (e.g., `App.jsx`).
-   **External Links:** All Spotify links must use `target="_blank"` and `rel="noopener noreferrer"`.

---

## 🤝 Contributing

Please read `PRD.md` and `Architecture.md` before making changes. Follow the phases outlined in `Phases.md` to ensure we stay on track for the MVP.
```