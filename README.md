# SubLink

## Underserved Construction Niche Utility

SubLink is a local-first mobile Progressive Web App (PWA) designed for subcontractors in the construction industry. It streamlines compliance, proof-of-work, and financial documentation directly from the job site.

### Key Features
- **Information-Rich Dashboard:** At-a-glance overview of your operations with real-time stats, daily log status, COI expiration alerts, and recent activity feeds including estimates, invoices, payments, and mileage. Stay on top of your business without navigating through multiple screens.
- **Project Management:** Organize all your work by project. Create projects with client info, contract values, and dates. View project details with related tasks, daily logs, waivers, estimates, and mileage all in one place.
- **Time Tracker:** Track billable hours with a live timer. Start/stop with one tap, add manual entries, and view time grouped by date or project. Perfect for accurate billing and time management.
- **Mileage Tracking:** Track miles driven for each project with GPS location capture. Log business travel for tax deductions with the 2024 IRS standard mileage rate ($0.67/mile). View mileage summaries by project and month, and export professional PDF reports for tax documentation.
- **Invoicing:** Create professional invoices from time entries and expense line items, Add client details, apply taxes, and export PDFs. Track payment status (draft, pending, paid, overdue) to get paid faster.
- **Estimates/Quotes:** Create professional estimates for prospective work. Add line items with descriptions, quantities, and and rates. Export as PDFs with "Valid Until" date prominently displayed. Convert accepted estimates directly to invoices with one click. Track estimate status (draft, sent, accepted, declined, converted).
- **Payment Tracking:** Record payments received on invoices, including partial payments and multiple payment methods. View payment history and track outstanding balances. Dashboard shows recent payments at a glance.
- **Daily Construction Logs:** Create professional daily logs with weather, work performed, personnel, delays, and equipment. Attach geotagged photos with timestamps for visual documentation. Export as PDFs for GC submission with embedded photo galleries. Never miss documenting a day's work again.
- **Instant Lien Waivers:** Generate signed PDF lien waivers on-site. Capture signatures directly on your screen and export as standardized PDFs.
- **Compliance Vault:** Manage Certificates of Insurance (COIs) with color-coded expiration tracking. Stay compliant with automated visual alerts for expired and expiring-soon certificates.
- **Photo-Verified Tasks:** Geospatial/Timestamped photo evidence for proof of work. Capture photos with GPS watermarks for indisputable documentation. Export professional PDF reports for general contractors.
- **Data Backup & Restore:** Export all your data as a JSON backup file and restore it when needed. Protect against data loss from browser clears or device changes. Includes checksum verification for data integrity.
- **Offline-First:** Fully functional without an internet connection using IndexedDB for local storage.

### Tech Stack
- **Frontend:** React 19, TypeScript, Vite.
- **PWA:** `vite-plugin-pwa`.
- **Database:** IndexedDB in the browser for local-first storage. A future server-side SQLite sync layer is not required for the static GitHub Pages deployment.
- **Styling:** Vanilla CSS (High-Contrast "Rugged" Theme).

### Development
To start the development environment:
```bash
npm install
npm run dev
```

### Deployment
The app can now be deployed as a static frontend on GitHub Pages through GitHub Actions.

GitHub Pages notes:
- The deployed app remains usable because SubLink stores its data in browser IndexedDB.
- Data stays local to each browser/device. There is no shared backend or cross-device sync in the GitHub Pages deployment.
- Routes use hash-based URLs in the Pages build so deep links and refreshes work from the repository subpath.

Relevant commands:
```bash
npm run build
npm run build:pages
```

Relevant workflows:
- `.github/workflows/ci.yml`
- `.github/workflows/deploy-pages.yml`
