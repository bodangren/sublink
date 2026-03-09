# Specification: Daily Log Photo Attachments

## Overview
This track addresses a missing feature identified in the original Daily Construction Logs specification. The original spec (daily_logs_20260308) explicitly listed "Link logs to existing tasks and photos" as Goal #4, but this functionality was never implemented.

## Problem Statement
The Daily Construction Logs feature claims to support photo attachments but currently has NO implementation:

**Evidence of Missing Implementation:**
1. `DailyLogForm.tsx` - No photo capture/selection UI
2. `DailyLogDetail.tsx` - No photo display section
3. `dailyLogPdf.ts` - No photo rendering in PDF export
4. `db.ts` DailyLog interface - No photoIds field
5. `DailyLog` type definition - No photo relationships

**What WAS Specified:**
- Original spec line 17: "Link logs to existing tasks and photos"
- Goal #4 from spec: "Link logs to existing tasks and photos"
- This was a core requirement, not a nice-to-have

## Gap Analysis

### Expected vs Actual

| Feature | Expected | Actual | Status |
|---------|----------|--------|--------|
| Photo capture in form | Yes | No | Missing |
| Photo gallery in detail view | Yes | No | Missing |
| Photos in PDF export | Yes | No | Missing |
| Database photo references | Yes | No | Missing |
| Photo count indicator | Yes | No | Missing |

### Existing Infrastructure (Can Reuse)
- Photo capture system exists in `usePhotoCapture` hook
- Photo storage in IndexedDB (`photos` object store)
- Photo watermarking utilities (`utils/watermark.ts`)
- GPS location utilities (`utils/gps.ts`)
- Photo gallery component (`PhotoGallery.tsx`)

## User Stories

### US-1: Attach Photos During Log Creation
As a subcontractor, I want to attach photos to my daily log while documenting work, so I have visual proof of site conditions.

**Acceptance Criteria:**
- Photo capture button on DailyLogForm
- Can attach multiple photos
- Photos are geotagged and watermarked (reuse existing)
- Photo count displayed before saving

### US-2: View Attached Photos in Log Detail
As a subcontractor, I want to see all photos attached to a daily log when reviewing it.

**Acceptance Criteria:**
- Photo gallery section in DailyLogDetail
- Shows all attached photos
- Click to view full-size
- Photo count in header

### US-3: Include Photos in PDF Export
As a subcontractor, I want photos included in the daily log PDF for GC submission.

**Acceptance Criteria:**
- Photos rendered in PDF (multi-page if needed)
- Photo metadata included (time, GPS)
- Professional layout with thumbnails

### US-4: Reuse Existing Task Photos
As a subcontractor, I want to attach photos that are already linked to tasks for the same project.

**Acceptance Criteria:**
- Can browse existing task photos
- Select photos to attach to log
- Photos remain linked to both task and log

## Technical Requirements

### Database Schema Changes
```typescript
// Add to DailyLog interface
photoIds?: string[]  // Array of photo IDs

// Add index to photos store
'by-daily-log': string  // Index for querying photos by log ID
```

### Component Changes

**DailyLogForm.tsx:**
- Integrate `usePhotoCapture` hook
- Add photo capture UI
- Store photoIds with log

**DailyLogDetail.tsx:**
- Add PhotoGallery component
- Load and display photos
- Update photo count display

**dailyLogPdf.ts:**
- Add photo rendering function
- Handle multi-page layouts
- Include photo metadata

### New Components

**DailyLogPhotoSelector.tsx (Optional):**
- Browse existing task photos by project
- Select photos to attach
- Preview before attaching

## Acceptance Criteria
- [ ] DailyLogForm has photo capture functionality
- [ ] DailyLogDetail displays attached photos
- [ ] PDF export includes photos
- [ ] Database stores photo-log relationships
- [ ] Can attach multiple photos per log
- [ ] Photos are watermarked with GPS/timestamp (reuse existing)
- [ ] All operations work offline
- [ ] Tests for photo attachment workflow
- [ ] README updated to reflect photo attachments

## Out of Scope
- Cloud sync (future track)
- Photo editing/cropping
- Video attachments
- Automatic photo capture

## Priority Rationale
This is marked **HIGH** priority because:
1. It was in the original spec but never delivered
2. Users may be expecting this functionality based on spec
3. Photo evidence is critical for construction documentation
4. Infrastructure exists - implementation is straightforward

## Estimated Effort
**Medium** - 2-3 hours
- Database changes: 30 min
- Form integration: 45 min
- Detail view integration: 30 min
- PDF integration: 45 min
- Testing: 30 min
