# Implementation Plan: Daily Log Photo Attachments

## Phase 1: Database Layer
- [x] 1.1 Update `DailyLog` interface in db.ts to include `photoIds?: string[]`
- [x] 1.2 Add `by-daily-log` index to photos object store (Skipped - using photoIds array approach instead)
- [x] 1.3 Increment database version (Skipped - no index changes needed)
- [x] 1.4 Create `getPhotosByDailyLog(logId)` function in db.ts
- [x] 1.5 Create `getPhotoCountByDailyLog(logId)` function in db.ts
- [x] 1.6 Update `saveDailyLog` and `updateDailyLog` to handle photoIds (Already supported - photoIds is optional field)
- [x] 1.7 Write tests for new database functions

## Phase 2: DailyLogForm Photo Integration
- [ ] 2.1 Import and use `usePhotoCapture` hook in DailyLogForm
- [ ] 2.2 Add file input and capture button to form UI
- [ ] 2.3 Add photo preview/count section above form submit
- [ ] 2.4 Update form submission to include photoIds array
- [ ] 2.5 Add photo capture button styling (rugged/outdoor theme)
- [ ] 2.6 Write tests for photo capture in form

## Phase 3: DailyLogDetail Photo Display
- [ ] 3.1 Import `PhotoGallery` component
- [ ] 3.2 Load photos using `getPhotosByDailyLog`
- [ ] 3.3 Add photo count to detail header
- [ ] 3.4 Add PhotoGallery section after notes
- [ ] 3.5 Handle empty photo state
- [ ] 3.6 Write tests for photo display in detail view

## Phase 4: PDF Photo Integration
- [ ] 4.1 Update `generateDailyLogPdf` signature to accept photos
- [ ] 4.2 Add photo rendering function to dailyLogPdf.ts
- [ ] 4.3 Render photo thumbnails in grid layout
- [ ] 4.4 Add photo metadata (timestamp, GPS) under each photo
- [ ] 4.5 Handle multi-page photo sections
- [ ] 4.6 Update DailyLogDetail to pass photos to PDF generator
- [ ] 4.7 Test PDF generation with various photo counts

## Phase 5: Data Backup Integration
- [ ] 5.1 Verify photos are already included in backup (they should be)
- [ ] 5.2 Update backup summary to show photo counts per daily log
- [ ] 5.3 Test backup/restore with daily log photos

## Phase 6: Dashboard Updates
- [ ] 6.1 Update TodayLogStatus to show photo count if log exists
- [ ] 6.2 Write tests for dashboard photo count display

## Phase 7: Final Verification
- [ ] 7.1 Create daily log with multiple photos
- [ ] 7.2 View daily log and verify photos display
- [ ] 7.3 Export PDF and verify photos render
- [ ] 7.4 Test offline functionality
- [ ] 7.5 Run full test suite
- [ ] 7.6 Run production build
- [ ] 7.7 Update README to mention photo attachments in daily logs
- [ ] 7.8 Archive track and update tracks.md

## Implementation Notes

### Reuse Existing Infrastructure
- **Photo Capture:** Use `usePhotoCapture` hook from TaskDetail
- **Photo Gallery:** Use existing `PhotoGallery` component
- **GPS/Watermarking:** Use existing `utils/gps.ts` and `utils/watermark.ts`
- **PDF Patterns:** Follow pattern from `taskPdf.ts` for photo rendering

### Key Differences from Task Photos
- Daily logs don't need a separate `DailyLogPhoto` type - can reuse `TaskPhoto`
- Just need to track which photos belong to which logs via `photoIds` array
- Photos table already has the infrastructure, just need the relationship

### Testing Strategy
- Mock photo capture in form tests
- Test photo loading in detail view
- Test PDF generation with/without photos
- Test database functions for photo-log relationships
