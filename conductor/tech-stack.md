# Technology Stack - SubLink

## Frontend
- **Framework:** React 19 (TypeScript)
- **Build Tool:** Vite
- **Styling:** Vanilla CSS (no external CSS libraries for maximum performance and customization)
- **State Management:** React Context API or Zustand (depending on complexity)
- **PWA Features:** Vite PWA Plugin for Service Workers and Manifest generation.

## Backend
- **Runtime:** Node.js (TypeScript)
- **API Framework:** Express
- **Authentication:** JWT (JSON Web Tokens) with local encryption for offline sessions.

## Database & Storage
- **Main DB:** SQLite (local-first storage for the backend)
- **Client Storage:** IndexedDB (via 'idb' library) for robust local data persistence.
- **Syncing:** Custom JSON-based sync protocol for resolving local/remote conflicts.

## Tools & Infrastructure
- **Testing:** Vitest for unit/integration testing.
- **Deployment:** Cloud Run (Dockerized) for the backend API.
- **Storage:** GCS (Google Cloud Storage) for photo artifacts (when synced).
