# Specification: Digital Lien Waivers

## Overview
SubLink users (subcontractors) need a way to generate, sign, and export lien waivers directly from the job site. This feature provides a digital form to capture waiver details and a signature, then generates a standardized PDF for export.

## Requirements
- **Waiver Form:** Inputs for Project Name, Subcontractor Name, Payment Amount, and Date.
- **Digital Signature:** A touch-responsive signature pad to capture the user's signature.
- **Local Persistence:** Waivers and signatures must be stored in IndexedDB for offline access.
- **PDF Generation:** Generate a standardized lien waiver PDF including the captured details and signature image.
- **Export:** Options to download or share the generated PDF.

## Technical Details
- **Library for Signature:** `react-signature-canvas` (or vanilla canvas implementation).
- **Library for PDF:** `jspdf`.
- **Storage:** IndexedDB via `idb` library.
- **Accessibility:** High-contrast UI elements for outdoor use.
