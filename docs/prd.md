# PRD — Photo Vibe

## What to build

Photo Vibe is an interactive web experience that translates a photograph into a "musical vibe profile" to discover songs that match the image's atmosphere. It solves the disconnect between visual aesthetics and music discovery by providing a creative, experimental way to answer the question, "What does this photo sound like?" Success is defined by a seamless 30–60 second user journey from upload to recommendation, with high engagement in sharing or trying new photos.

## Target users

- **Primary:** Casual photographers, music enthusiasts, and social media creators who enjoy visual aesthetics and discovering new music without needing professional technical knowledge.
- **Secondary:** Photography students and content creators looking for creative inspiration or unique ways to present their work.
- **Gap:** Existing tools either focus solely on image editing or standard music recommendation based on listening history. None currently bridge the gap by interpreting visual signals (lighting, color, mood) into specific musical characteristics (energy, valence, tempo) for discovery.

## Features

### MVP
- [ ] **Homepage & Onboarding:** Clear value proposition ("What does your photo sound like?") with primary CTA "Find My Vibe" and optional example photos.
- [ ] **Photo Upload & Preview:** Support for JPG/PNG/WEBP (max 10MB) with drag-and-drop, preview, and replace functionality.
- [ ] **Vibe Analysis Engine (Mocked):** Structured output converting visual inputs into a Visual Profile, Emotion Profile, and Music Target Profile (Energy, Valence, Danceability, etc.).
- [ ] **Result Display:** Presentation of the uploaded photo, human-readable vibe description, mood tags, simplified music characteristic visualization, and top 3–5 song recommendations with reasoning.
- [ ] **Responsive UI:** Minimalist, artistic design using React/Vite/Tailwind that works seamlessly on mobile and desktop.

### Out of scope (v1)
- User accounts, login, or persistent photo storage.
- Real-time integration with live Vision AI or Music APIs (MVP uses mocked data).
- Music generation, audio editing, or playlist creation features.
- Complex personalization settings or social networking features.