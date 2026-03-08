# Track: GitHub Pages deployment and Actions support

## Goal
Enable this repo to build and deploy the static SubLink frontend to GitHub Pages while preserving a working local-first UI and establishing GitHub Actions validation.

## Requirements
1. GitHub Actions must run the existing Vitest suite and production build on pushes to `main` and on pull requests.
2. GitHub Pages deployment must publish the static Vite build from GitHub Actions.
3. The router and asset paths must work from a repository subpath deployment such as `/sublink/`.
4. The app must remain usable as a local-first UI with IndexedDB-backed storage when deployed statically.
5. Project documentation must explain the Pages deployment path and any limitations compared with a future backend deployment.

## Acceptance Criteria
1. A clean repository checkout can run the CI workflow without manual edits.
2. A push to `main` can build and deploy the frontend to GitHub Pages.
3. The deployed application loads correctly from a repository subpath and client-side navigation works.
4. README and Conductor docs describe the new deployment option and the backend limitation accurately.
