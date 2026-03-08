# Implementation Plan: Data Backup & Restore

## Phase 1: Backup Utility Functions
- [ ] 1.1 Create `src/utils/dataBackup.ts` with backup data structures
- [ ] 1.2 Implement `exportAllData()` - gather all data from all stores
- [ ] 1.3 Implement checksum generation using Web Crypto API (SHA-256)
- [ ] 1.4 Implement `createBackup()` - package data with metadata
- [ ] 1.5 Implement `downloadBackup()` - trigger file download
- [ ] 1.6 Write unit tests for backup utilities

## Phase 2: Restore Utility Functions
- [ ] 2.1 Implement `parseBackupFile()` - read and validate JSON
- [ ] 2.2 Implement `verifyChecksum()` - validate data integrity
- [ ] 2.3 Implement `getBackupSummary()` - extract metadata for preview
- [ ] 2.4 Implement `restoreData()` - write data back to IndexedDB
- [ ] 2.5 Implement `mergeData()` - intelligent merge (keep newer records)
- [ ] 2.6 Write unit tests for restore utilities

## Phase 3: Settings Page & UI
- [ ] 3.1 Create `Settings.tsx` component with backup/restore section
- [ ] 3.2 Add export button with progress indicator
- [ ] 3.3 Add file input for restore
- [ ] 3.4 Create `RestorePreview.tsx` modal showing backup contents
- [ ] 3.5 Add restore options: replace all / merge
- [ ] 3.6 Show last backup timestamp (store in localStorage)
- [ ] 3.7 Write tests for Settings component

## Phase 4: Navigation & Routing
- [ ] 4.1 Add "Settings" link to main navigation
- [ ] 4.2 Add route: /settings
- [ ] 4.3 Update App.tsx with settings route
- [ ] 4.4 Write routing tests

## Phase 5: Integration
- [ ] 5.1 Add backup reminder to dashboard (if no backup in 7 days)
- [ ] 5.2 Store backup history in localStorage
- [ ] 5.3 Update dashboard tests

## Phase 6: Final Verification
- [ ] 6.1 Run full test suite
- [ ] 6.2 Run production build
- [ ] 6.3 Manual testing of backup/restore workflow
- [ ] 6.4 Test cross-browser restore (Chrome to Firefox)
- [ ] 6.5 Update README.md with backup feature
