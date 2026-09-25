# Photo Vibe
An interactive web experience that translates photographs into musical vibe profiles to discover matching songs. React + Vite + Tailwind CSS.

## Why This Exists
It solves the disconnect between visual aesthetics and music discovery by allowing users to answer "What does this photo sound like?" without needing technical knowledge. It is designed for casual photographers, music enthusiasts, and creators who want a playful, experimental bridge between their visual art and auditory expression.

## Architecture
Key directories and their purpose:
- `src/app/` — Pages and main application entry points (React Router or Vite structure)
- `src/components/` — Reusable UI elements (common/, page/, layout/)
- `src/lib/` — Service abstractions for AI analysis and music retrieval (e.g., `vibeApi.js`)
- `src/utils/` — Pure utility functions for validation and scoring
- `src/constants/` — Static data such as example photos and mood definitions

## Tech Stack
- Runtime: Browser-based (Client-side React)
- Framework: React 18 with Vite
- Styling: Tailwind CSS
- Icons: Lucide React
- Hosting: Vercel

## Commands
  npm run dev      # start local development server
  npm run build    # create production build
  npm run preview  # preview production build locally

## Coding Conventions
- JavaScript (ES6+) — prioritize readability and modern syntax
- Functional components only (React Hooks)
- PascalCase for components, camelCase for variables/functions
- Utility-first styling with Tailwind CSS; avoid custom CSS files unless necessary
- Keep components small and focused on a single responsibility

## Rules for This Agent
- Read `PRD.md`, `Architecture.md`, and `Phases.md`, `DESIGN-dell-1996.md` before starting any task
- Never expose API keys or secrets in frontend code; use environment variables for server-side logic if added later
- Ask before adding new npm dependencies; prefer native browser APIs or existing stack tools
- Never commit changes unless explicitly instructed by the user
- Follow the mock data contracts defined in the PRD strictly during MVP development


<!-- antislop:start -->
## antislop
For UI, copy, people, mobile layout, or code comments work, load the antislop skill for the task:
- Core filter, always on: `antislop`
Before starting, ask the user when antislop applies: during the work, or after it is done.
<!-- antislop:end -->