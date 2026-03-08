# Track: Data Backup & Restore - Protect Offline-First Data

## Overview
Enable users to export all their SubLink data as a JSON backup file and restore it later. This is critical for offline-first applications where data exists only in browser IndexedDB storage.

## Problem Statement
SubLink stores all data locally in IndexedDB. Users face significant risks:
- Clearing browser data deletes all business records
- Device loss or damage means permanent data loss
- No way to transfer data to a new device
- No recovery from accidental data corruption

Subcontractors cannot afford to lose their invoices, time entries, COIs, and project documentation.

## Goals
1. Allow users to export ALL data as a single JSON backup file
2. Allow users to restore data from a backup file
3. Provide clear UI for backup/restore operations
4. Include data integrity verification (checksums)
5. Support selective restore (choose what to restore)
6. Show backup timestamp and data summary

## Acceptance Criteria
- [ ] Users can export complete data backup as JSON file
- [ ] Backup includes all stores: projects, tasks, waivers, cois, invoices, time entries, daily logs
- [ ] Backup file includes metadata: version, timestamp, checksum, record counts
- [ ] Users can import/restore from backup file
- [ ] Restore validates file integrity before proceeding
- [ ] Restore shows preview of what will be restored
- [ ] Restore offers options: replace all / merge / cancel
- [ ] UI shows backup history (last backup date, size)
- [ ] All operations work offline (no network required)
- [ ] Tests pass with >80% coverage on new code

## Technical Requirements
- New utility functions for export/import in `src/utils/dataBackup.ts`
- Backup file format:
  ```json
  {
    "version": "1.0",
    "appVersion": "x.x.x",
    "exportedAt": "ISO timestamp",
    "checksum": "SHA-256 hash of data",
    "summary": { "projects": 5, "tasks": 42, ... },
    "data": {
      "projects": [...],
      "tasks": [...],
      ...
    }
  }
  ```
- Web Crypto API for checksum generation
- File download via Blob and URL.createObjectURL
- File upload via input type="file" and FileReader
- New Settings section in navigation for backup/restore

## Out of Scope
- Cloud backup (offline-first constraint)
- Encrypted backups (future enhancement)
- Automatic scheduled backups
- Backup to external storage (USB, etc.)

## Dependencies
- Existing db.ts with all data stores
- File download/upload browser APIs
