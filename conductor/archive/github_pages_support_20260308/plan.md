# Implementation Plan

## Phase 1: Static deployment support
- [x] Add Vite Pages base-path support and router configuration for static GitHub Pages hosting.
- [x] Add GitHub Actions workflows for CI validation and Pages deployment.

## Phase 2: Documentation and verification
- [x] Update README and Conductor docs for the new deployment option and static-hosting limitations.
- [x] Repair failing time-entry tests so the CI workflow can validate the repo successfully.
- [x] Verify with `npm run build` and `npm run test:run`.
