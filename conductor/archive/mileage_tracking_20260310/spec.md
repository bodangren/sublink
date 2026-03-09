# Mileage Tracking - Track Travel for Tax Deductions

## Overview
Implement a comprehensive mileage tracking feature that allows subcontractors to record and manage miles driven for business purposes. This feature is critical for tax deductions and expense tracking, addressing a common pain point for solo operators and micro-crews who often miss out on valuable tax deductions.

## Problem Statement
Subcontractors frequently travel between job sites, suppliers, and client locations but rarely track this mileage systematically. This results in:
- Lost tax deductions worth thousands of dollars annually
- Difficulty calculating true project costs
- No historical record of travel patterns
- Manual, error-prone tracking methods (paper logs, mental notes)

## Proposed Solution
Add a dedicated mileage tracking module that integrates with the existing project structure, providing:
- Quick mileage entry with project association
- GPS-based location capture for accurate distance tracking
- Manual entry option for planned/future trips
- Comprehensive reporting for tax purposes
- Summary views by project and time period

## User Stories

### Story 1: Record Daily Travel
**As a** subcontractor
**I want to** quickly log my mileage for each job site visit
**So that** I can claim accurate tax deductions at year-end

**Acceptance Criteria:**
- One-tap mileage entry from dashboard
- Capture start location, end location, and date
- Associate with specific project
- Add optional purpose/notes
- Auto-capture current GPS location as starting point

### Story 2: View Mileage History
**As a** subcontractor
**I want to** see all my mileage entries in one place
**So that** I can review my travel history and verify accuracy

**Acceptance Criteria:**
- List view showing all mileage entries
- Filter by project
- Filter by date range
- Show total miles for filtered entries
- Click entry to view/edit details

### Story 3: Generate Tax Report
**As a** subcontractor
**I want to** export a mileage report for my tax preparer
**So that** I can easily claim my deductions

**Acceptance Criteria:**
- Generate PDF report with date range selection
- Include total miles and project breakdown
- Show standard mileage rate calculation (configurable)
- Professional formatting suitable for tax records
- Include all entry details (date, locations, purpose, miles)

### Story 4: Track Project Travel Costs
**As a** subcontractor
**I want to** see total mileage per project
**So that** I can understand true project costs

**Acceptance Criteria:**
- Mileage summary by project
- Show in project detail view
- Calculate estimated cost using standard rate
- Compare across projects

### Story 5: Edit Mileage Entries
**As a** subcontractor
**I want to** correct mistakes in my mileage entries
**So that** my records are accurate

**Acceptance Criteria:**
- Edit any field in existing entry
- Update project association
- Recalculate distance if locations change
- Preserve created/updated timestamps

## Technical Requirements

### Data Model
```typescript
interface MileageEntry {
  id: string
  projectId?: string
  projectName?: string
  date: string
  startLocation: string
  endLocation: string
  startCoords?: { lat: number; lng: number }
  endCoords?: { lat: number; lng: number }
  miles: number
  purpose?: string
  notes?: string
  isRoundTrip: boolean
  createdAt: number
  updatedAt: number
}
```

### Components
1. **MileageForm** - Create/edit mileage entries
2. **MileageList** - Display all entries with filtering
3. **MileageDetail** - View single entry details
4. **MileageSummary** - Aggregated statistics
5. **RecentMileage** - Dashboard widget

### Database
- Add `mileageEntries` store to IndexedDB
- Indexes: by-project, by-date

### PDF Generation
- Create `mileagePdf.ts` utility
- Include all entries in date range
- Format for tax documentation

### Routing
- `/mileage` - List all entries
- `/mileage/new` - Create new entry
- `/mileage/:id` - View entry details
- `/mileage/:id/edit` - Edit entry

## Offline-First Considerations
- All data stored in IndexedDB
- GPS coordinates captured when available
- Manual entry always available
- No network dependency for any feature

## UI/UX Requirements
- High-contrast, large touch targets (rugged UX)
- One-tap entry from dashboard
- Quick entry with minimal required fields
- Clear visual hierarchy
- Color-coded project associations

## Success Metrics
- Mileage entries created per user per week
- PDF reports generated
- Accuracy of tracked vs estimated mileage
- User feedback on tax season preparation

## Dependencies
- Existing project management structure
- IndexedDB infrastructure
- PDF generation utilities (can reuse pattern from invoice/estimate PDFs)

## Risks and Mitigations
| Risk | Mitigation |
|------|-----------|
| GPS accuracy issues | Allow manual distance override |
| Battery drain from GPS | Capture location once, not continuous tracking |
| User forgets to log | Dashboard reminders, quick entry button |
| Complex tax rules | Use standard IRS mileage rate, allow custom |

## Future Enhancements
- Automatic trip detection (background GPS)
- Integration with mapping services for route preview
- Multi-stop trip support
- Integration with expense tracking (fuel costs)
- Real-time cost calculation based on gas prices
