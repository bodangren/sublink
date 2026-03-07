# SubLink

## Underserved Construction Niche Utility

SubLink is a local-first mobile Progressive Web App (PWA) designed for subcontractors in the construction industry. It streamlines compliance, proof-of-work, and financial documentation directly from the job site.

### Key Features
- **Instant Lien Waivers:** Generate signed PDF lien waivers on-site. Capture signatures directly on your screen and export as standardized PDFs.
- **Compliance Vault:** Manage Certificates of Insurance (COIs) with color-coded expiration tracking. Stay compliant with automated visual alerts for expired and expiring-soon certificates.
- **Photo-Verified Tasks:** Geospatial/Timestamped photo evidence for proof of work. Capture photos with GPS watermarks for indisputable documentation.
- **Offline-First:** Fully functional without an internet connection using IndexedDB for local storage.

### Tech Stack
- **Frontend:** React 19, TypeScript, Vite.
- **PWA:** `vite-plugin-pwa`.
- **Database:** IndexedDB (client) / SQLite (server).
- **Styling:** Vanilla CSS (High-Contrast "Rugged" Theme).

### Development
To start the development environment:
```bash
npm install
npm run dev
```

### Deployment
The app is designed to be deployed as a PWA and a Dockerized Node.js backend on Cloud Run.
