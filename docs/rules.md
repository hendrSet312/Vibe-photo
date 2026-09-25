# Rules

## Use

### Core Technologies & Patterns
- **React Functional Components**: Use hooks (`useState`, `useEffect`) for state management. Avoid class components.
- **Vite Build Tool**: Leverage Vite for fast HMR and optimized production builds.
- **Tailwind CSS**: Use utility-first classes for all styling. Prefer standard Tailwind spacing/sizing scales over arbitrary values where possible.
- **Lucide React**: Use this library exclusively for icons to ensure visual consistency.
- **Component Composition**: Break down UI into small, reusable components (e.g., `Button`, `Card`, `Badge`) and page-specific components (e.g., `PhotoUploader`, `VibeResult`).

### Code Style & Conventions
- **JavaScript (ES6+)**: Use modern syntax (arrow functions, destructuring, template literals).
- **Naming Conventions**:
  - Components: `PascalCase` (e.g., `SongRecommendation.jsx`).
  - Functions/Variables: `camelCase` (e.g., `handleUpload`, `vibeProfile`).
  - Constants: `UPPER_SNAKE_CASE` (e.g., `MAX_FILE_SIZE`).
- **File Structure**: Follow the `src/` structure defined in `Architecture.md`. Keep related files close together.
- **Props Handling**: Use destructuring for props in component arguments. Define default props where appropriate.
- **Error Handling**: Implement graceful error states for file uploads and analysis failures. Show user-friendly messages, not technical stack traces.

### Data & Logic
- **Abstraction Layers**: All external service calls (AI analysis, music retrieval) must go through service files in `src/lib/` (e.g., `vibeApi.js`).
- **Mock Data Contract**: Strictly adhere to the JSON structures defined in PRD Section 26 for mock responses during development.
- **Pure Utilities**: Place helper functions (e.g., file validation, similarity scoring) in `src/utils/` to keep them testable and side-effect free.

## Avoid

### Technical Restrictions
- **No Direct API Calls in UI**: Never fetch data or call AI models directly from components. Always use the service layer.
- **No Secret Exposure**: Never hardcode API keys or secrets in frontend code. They must remain server-side (even if mocked for MVP).
- **No Heavy State Libraries**: Avoid Redux, Zustand, or Context API for global state unless absolutely necessary. The MVP should rely on local component state.
- **No Unnecessary Dependencies**: Do not install libraries for tasks that can be done with native JS or existing tools (e.g., use native `fetch` instead of `axios`).

### Design & UX Constraints
- **No Corporate/SaaS Aesthetics**: Avoid dense tables, complex dashboards, or generic Bootstrap-like looks. Keep it artistic, minimal, and photographic.
- **No Scientific Claims**: Do not present vibe scores as objective facts. Use qualitative language (e.g., "Matches the mood" instead of "95% accurate").
- **No Complex User Flows**: Avoid multi-step wizards or mandatory account creation. The flow must be linear and quick (30–60 seconds).

### Development Discipline
- **No Refactoring Unrelated Code**: Stick to the current task. Do not "clean up" other files unless they are directly broken by your changes.
- **No Large Commits**: Keep changes small and focused on a single feature or fix.

## AI Boundaries

### Pre-Implementation Checks
- **Read Context First**: Always review `PRD.md`, `Architecture.md`, and `Rules.md` before writing code.
- **Check Phase Status**: Consult `Phases.md` to ensure you are working on the correct current phase. Do not jump ahead.

### Implementation Guidelines
- **No Unauthorized Packages**: Do not suggest or install new npm packages without explicit user approval.
- **Minimize Diff**: Make the smallest possible change to achieve the requirement. Avoid rewriting entire files if a few lines will suffice.
- **Follow Contracts**: Ensure all mock data and API responses strictly match the structures defined in the PRD (Sections 7–10, 26).
- **No Auto-Commits**: Never execute git commit or push commands unless explicitly instructed by the user.

### Quality Assurance
- **Responsive Check**: Ensure all UI changes work on both mobile and desktop viewports.
- **Accessibility**: Use semantic HTML elements and proper ARIA labels where necessary (e.g., for image previews and buttons).
- **Performance**: Keep bundle size small. Avoid large image assets in the codebase; use placeholders or external URLs for examples.