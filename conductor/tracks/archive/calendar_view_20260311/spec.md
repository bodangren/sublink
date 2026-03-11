# Specification: Calendar View

## Overview
A visual calendar view that displays tasks, daily logs, project deadlines, and other scheduled items in a monthly calendar format. Provides at-a-glance scheduling for subcontractors to plan their work week.

## User Stories

### US-1: Monthly Calendar Overview
**As a** subcontractor  
**I want to** see a monthly calendar with all my scheduled items  
**So that** I can plan my work week visually

**Acceptance Criteria:**
- Display current month by default with navigation to previous/next months
- Show days with tasks, logs, and project deadlines with visual indicators
- Today's date is highlighted
- Tap a day to see all items scheduled for that day

### US-2: Daily Items List
**As a** subcontractor  
**I want to** tap a calendar day and see all items for that day  
**So that** I can quickly access details

**Acceptance Criteria:**
- Tapping a day shows a list of items (tasks, logs, project deadlines)
- Each item shows type icon, title, and time (if applicable)
- Tapping an item navigates to its detail page
- Empty days show "No items scheduled" message

### US-3: Visual Indicators
**As a** subcontractor  
**I want to** see color-coded indicators on calendar days  
**So that** I can quickly identify what types of items are scheduled

**Acceptance Criteria:**
- Tasks shown with one color indicator
- Daily logs shown with another color indicator
- Project deadlines shown with another color indicator
- Days with multiple item types show multiple indicators

### US-4: Quick Add from Calendar
**As a** subcontractor  
**I want to** quickly add a task or log from the calendar view  
**So that** I can schedule new items efficiently

**Acceptance Criteria:**
- "Add" button allows quick creation of task or daily log
- Pre-fills the date based on selected calendar day

## Technical Requirements

### Data Sources
- **Tasks:** `getTasks()` - use `createdAt` date
- **Daily Logs:** `getDailyLogs()` - use `date` field
- **Projects:** `getProjects()` - use `endDate` for deadline indicator

### Components
- `CalendarView.tsx` - Main calendar grid component
- `CalendarDay.tsx` - Individual day cell with indicators
- `DayDetail.tsx` - List of items for selected day

### Styling
- Follow rugged UX guidelines: large touch targets, high contrast
- Use existing CSS variables for consistency
- Mobile-first responsive design

## Out of Scope
- Drag-and-drop scheduling
- Recurring events
- External calendar sync (Google, Outlook)
- Time-based day view (hourly slots)
