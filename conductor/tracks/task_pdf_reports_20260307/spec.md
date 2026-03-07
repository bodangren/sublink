# Specification: Task PDF Reports

## Feature Description
Task PDF Reports enables subcontractors to export comprehensive PDF documentation of their photo-verified tasks. Reports include all task metadata, photos with watermarks, and GPS coordinates in a professional format suitable for sending to general contractors or project managers.

## User Stories

### US-1: Generate PDF Report
As a subcontractor, I want to generate a PDF report of my task with all photos, so I can send proof of work to the general contractor.

**Acceptance Criteria:**
- "Export PDF" button on task detail view
- PDF includes task title, description, contract reference
- PDF includes creation date
- PDF includes all photos in chronological order
- Each photo shows its capture time and GPS coordinates
- PDF downloads to device automatically

### US-2: Professional Report Format
As a subcontractor, I want my PDF reports to look professional, so I can present a professional image to GCs.

**Acceptance Criteria:**
- SubLink branding in header
- Clean, high-contrast layout
- Photos displayed at appropriate size
- Page breaks handled gracefully
- Report filename: "SubLink_[TaskTitle]_[Date].pdf"

### US-3: Offline PDF Generation
As a subcontractor, I want to generate PDFs without internet, so I can work in remote locations.

**Acceptance Criteria:**
- PDF generation works entirely in browser
- No external API calls required
- Generated PDF stored locally

## Technical Requirements

### PDF Structure
```
Page 1:
- Header: SubLink Logo/Name
- Task Title (large, bold)
- Description
- Contract Reference (if any)
- Created Date
- Photo Count

Subsequent Pages:
- Photos with captions
- Each photo: image + timestamp + GPS coordinates
- 1-2 photos per page depending on orientation
```

### PDF Library
- Use jsPDF for PDF generation
- Load images as base64 data URLs
- Handle landscape and portrait photos appropriately

### File Naming
- Format: `SubLink_[SanitizedTitle]_[YYYY-MM-DD].pdf`
- Sanitize title: remove special characters, limit length

## Non-Functional Requirements
- PDF generation < 5 seconds for tasks with 10 photos
- PDF file size optimized (compress images if needed)
- Works on mobile devices
- Touch targets minimum 44x44px
- High contrast for outdoor visibility

## Edge Cases
- Task with no photos (generate text-only report)
- Task with many photos (handle pagination)
- Very long task title (truncate in filename)
- Portrait vs landscape photo handling
- GPS unavailable for some photos
