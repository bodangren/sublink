# Specification: Time Tracker

## Problem Statement
Subcontractors need to track time spent on jobs for accurate billing. Currently, they must use separate apps or manual methods, creating friction and potential for errors.

## Solution
A built-in time tracker that works offline and integrates with the existing project/task system.

## User Stories

### US-1: Quick Timer Start
As a subcontractor, I want to quickly start a timer for a project so I can track my work without interrupting my task.

**Acceptance Criteria:**
- One-tap timer start from dashboard
- Select project when starting timer
- Timer shows elapsed time in real-time
- Timer persists across app refresh (stored in localStorage)

### US-2: Stop Timer and Save Entry
As a subcontractor, I want to stop the timer and have it automatically create a time entry.

**Acceptance Criteria:**
- One-tap stop from dashboard or timer page
- Automatic time entry creation with start/end times
- Optional: add notes before saving
- Entry linked to project

### US-3: Manual Time Entry
As a subcontractor, I want to manually enter time for work already completed.

**Acceptance Criteria:**
- Form with project selection, start time, end time, and notes
- Duration calculated automatically
- Validation: end time must be after start time

### US-4: View Time Entries
As a subcontractor, I want to view my time entries grouped by date or project.

**Acceptance Criteria:**
- List view showing all entries
- Filter by project
- Show total hours per day/project
- Edit/delete existing entries

### US-5: Dashboard Time Summary
As a subcontractor, I want to see my hours worked today on the dashboard.

**Acceptance Criteria:**
- Widget showing today's total hours
- Active timer indicator if timer is running
- Quick access to start/stop timer

## Data Model

```typescript
interface TimeEntry {
  id: string
  projectId: string
  taskId?: string
  startTime: number // Unix timestamp
  endTime: number // Unix timestamp
  duration: number // seconds
  notes?: string
  createdAt: number
  updatedAt: number
}

interface ActiveTimer {
  projectId: string
  taskId?: string
  startTime: number // Unix timestamp
  notes?: string
}
```

## UI Components

1. **ActiveTimer** - Shows running timer with stop button
2. **TimeEntryForm** - Manual entry form
3. **TimeEntryList** - List of entries with edit/delete
4. **TimeSummary** - Dashboard widget

## Navigation
- Add "Time" to bottom navigation (replace or alongside existing items)
- Or add as separate route accessible from dashboard

## Technical Notes
- Active timer stored in localStorage (survives refresh)
- Completed entries stored in IndexedDB
- Duration calculated in seconds for precision
- Display formatted as "Xh Ym"
