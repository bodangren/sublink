# Implementation Plan: Time Tracker

## Phase 1: Database Schema
- [ ] Add `timeEntries` object store to IndexedDB schema (version 6)
- [ ] Add CRUD functions: saveTimeEntry, getTimeEntries, updateTimeEntry, deleteTimeEntry
- [ ] Add getTimeEntriesByProject function
- [ ] Export TimeEntry type

## Phase 2: Timer State Management
- [ ] Create useActiveTimer hook for localStorage-based timer state
- [ ] Functions: startTimer, stopTimer, getActiveTimer, clearActiveTimer
- [ ] Calculate elapsed time in real-time

## Phase 3: Core Components
- [ ] Create ActiveTimer component (shows running timer, stop button)
- [ ] Create TimeEntryForm component (manual entry + edit)
- [ ] Create TimeEntryList component (view entries, delete)
- [ ] Create TimeSummary component (dashboard widget)

## Phase 4: Integration
- [ ] Add routes: /time, /time/new, /time/edit/:id
- [ ] Add "Time" to bottom navigation
- [ ] Add TimeSummary to Dashboard
- [ ] Add quick "Start Timer" button to dashboard

## Phase 5: Testing
- [ ] Unit tests for useActiveTimer hook
- [ ] Unit tests for TimeEntryForm
- [ ] Unit tests for TimeEntryList
- [ ] Unit tests for ActiveTimer
- [ ] Integration test for timer flow

## Phase 6: Polish
- [ ] Ensure offline functionality works
- [ ] Verify timer persists across refresh
- [ ] Test large time entry lists performance

## File Structure
```
src/
├── hooks/
│   └── useActiveTimer.ts
├── components/
│   ├── ActiveTimer.tsx
│   ├── TimeEntryForm.tsx
│   ├── TimeEntryList.tsx
│   └── TimeSummary.tsx
└── db.ts (updated)
```

## Estimated Complexity
Medium - Timer state management and real-time updates require careful handling.
