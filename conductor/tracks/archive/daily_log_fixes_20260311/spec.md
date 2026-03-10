# Daily Log Bug Fixes

## Overview
Fix two critical bugs in the daily log feature:
1. Photos not displayed after saving when editing a daily log
2. "Daily log not found" error when viewing saved logs

## Problem Analysis

### Bug 1: Photos Not Displayed After Saving
When editing an existing daily log, the `useDailyLogPhotoCapture` hook starts with an empty photos array. Existing photos are not loaded into the form. When the form is submitted, only newly captured photo IDs are saved via `getPhotoIds()`, overwriting the original `photoIds` array and losing references to existing photos.

**Root Cause**: `DailyLogForm.tsx` does not load existing photos when in edit mode.

### Bug 2: "Daily Log Not Found" Error
Investigation needed to determine root cause. Possible issues:
- Route parameter parsing in `useItemId()` hook
- Timing issues with data loading
- ID mismatch between route and database

## Functional Requirements

### FR-1: Photo Persistence in Edit Mode
- When editing a daily log with existing photos, the photos must be displayed in the form
- Newly captured photos must be added to the existing photos, not replace them
- Saving the log must preserve all photos (existing + newly captured)

### FR-2: Reliable Daily Log Viewing
- Viewing a daily log from the list must always show the correct log
- The "Daily log not found" error must not appear for valid logs

## Acceptance Criteria

1. **AC-1**: Given an existing daily log with photos, when editing that log, then existing photos are displayed in the form
2. **AC-2**: Given an existing daily log with photos, when adding new photos and saving, then all photos (existing + new) are preserved
3. **AC-3**: Given a saved daily log, when clicking View from the list, then the log details are displayed correctly
4. **AC-4**: Unit tests cover edit mode with existing photos

## Out of Scope
- Photo deletion functionality (separate feature)
- Photo reordering
- PDF export changes
