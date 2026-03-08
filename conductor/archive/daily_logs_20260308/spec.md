# Specification: Daily Construction Logs

## Overview
Daily construction logs are critical documentation for subcontractors. They provide legal protection, satisfy GC requirements, and create a paper trail for payment disputes. This feature enables on-site daily log creation with offline-first reliability.

## Problem Statement
Subcontractors currently use paper daily logs or clunky apps that require connectivity. This creates:
- Lost or illegible documentation
- Missing logs in areas with poor connectivity
- Difficulty compiling evidence for payment disputes
- No standardized format across jobs

## Goals
1. Enable rapid daily log creation on the job site
2. Support full offline functionality
3. Provide PDF export for GC submission
4. Link logs to existing tasks and photos
5. Create searchable log history

## Acceptance Criteria
- [ ] Users can create daily logs with date, project, weather, work performed, delays, personnel, equipment
- [ ] Logs are stored in IndexedDB and work offline
- [ ] Users can view, edit, and delete logs
- [ ] Logs can be exported as professional PDFs
- [ ] Log list shows recent logs with quick preview
- [ ] Dashboard widget shows today's log status

## Out of Scope
- Cloud sync (future track)
- Multi-user collaboration
- Template customization
- Automatic weather fetching (requires connectivity)

## Technical Notes
- New `dailyLogs` object store in IndexedDB (version 4)
- Reuse existing PDF generation patterns from task reports
- Follow established form patterns from COIForm/TaskForm
