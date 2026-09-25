# Architecture

## App flow

Landing Page → Upload/Select Photo → Preview & "Find My Vibe" → Analyzing State (Mock) → Result Page (Vibe Profile + Song Recommendations) → Try Another Photo / Share

## Folder structure

src/
  app/        # Pages (Next.js App Router or React Router if Vite)
    page.jsx  # Homepage with upload and result states
  components/ # UI
    common/   # Button, Card, Loader
    page/     # PhotoUploader, ImagePreview, VibeResult, SongRecommendation
    layout/   # Navbar, Footer
  lib/        # Services & API abstractions
    vibeApi.js # Mock analysis service
    musicProvider.js # Abstracted music retrieval interface
  constants/  # Static content (example photos, mood tags)
  utils/      # Pure utility functions (file validation, similarity scoring)

## Tech stack

- **Framework:** React (with Vite for fast development and bundling)
- **Language:** JavaScript
- **Styling:** Tailwind CSS
- **Hosting:** Vercel (optimized for React/Vite deployments)