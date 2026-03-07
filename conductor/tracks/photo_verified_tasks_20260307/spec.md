# Specification: Photo-Verified Tasks

## Feature Description
Photo-Verified Tasks enables subcontractors to document work progress with geotagged, timestamped photos. Each photo serves as legal proof of work completed, watermarked with non-editable GPS coordinates and timestamps.

## User Stories

### US-1: Create a Task
As a subcontractor, I want to create a task with a description and optional contract line item reference, so I can organize my proof-of-work documentation.

**Acceptance Criteria:**
- Task form accepts: title, description, optional contract reference
- Task is saved to IndexedDB immediately
- Task appears in task list after creation
- Works completely offline

### US-2: Capture Photo Evidence
As a subcontractor, I want to capture photos for a task that automatically include GPS coordinates and timestamps, so I have indisputable proof of work.

**Acceptance Criteria:**
- Camera access via device camera
- Photo is watermarked with:
  - Current GPS coordinates (latitude/longitude)
  - Date and time of capture
  - Task reference
- Photo is stored in IndexedDB as base64
- Watermark is burned into image (not overlay)
- Graceful fallback if GPS unavailable

### US-3: View Task with Photos
As a subcontractor, I want to view a task and all its associated photos, so I can review my documentation.

**Acceptance Criteria:**
- Task detail view shows task info
- All photos displayed in chronological order
- Each photo shows watermark information
- Full-screen photo view on tap

### US-4: Manage Tasks
As a subcontractor, I want to view, edit, and delete my tasks, so I can keep my documentation organized.

**Acceptance Criteria:**
- Task list shows all tasks with photo count
- Tasks can be edited (title, description)
- Tasks can be deleted (with confirmation)
- Deleting a task deletes all associated photos

## Technical Requirements

### Database Schema
```typescript
interface Task {
  id: string
  title: string
  description: string
  contractReference?: string
  createdAt: number
  updatedAt: number
}

interface TaskPhoto {
  id: string
  taskId: string
  imageData: string // base64
  latitude?: number
  longitude?: number
  capturedAt: number
  watermarkData: string
}
```

### Photo Watermarking
- Canvas-based watermark rendering
- Watermark includes: GPS coords, timestamp, task title
- Watermark positioned at bottom of image
- Semi-transparent background for readability

### GPS Handling
- Request geolocation permission on first photo capture
- Cache last known location for faster subsequent captures
- Fallback to manual entry or "No GPS" indicator
- Handle permission denial gracefully

## Non-Functional Requirements
- Photo capture < 3 seconds on mid-range device
- Image storage optimized (max 2MB per photo)
- All operations work offline
- Touch targets minimum 44x44px
- High contrast UI for outdoor visibility

## Edge Cases
- GPS unavailable in basement/steel building
- Camera permission denied
- Storage quota exceeded
- Large photo files from high-res cameras
