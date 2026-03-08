# Specification: Project Management

## Overview
SubLink currently lacks a central project management system. Tasks, daily logs, and waivers reference project names as free-text strings, leading to inconsistent naming and no way to organize or view all work for a specific project.

## User Stories

### US-1: Create Project
As a subcontractor, I want to create a project with client info, address, contract value, and dates so I can organize my work.

**Acceptance Criteria:**
- Form with fields: name, client, address, contract value, start date, end date (optional), notes
- Required: name
- Save to IndexedDB
- Visual feedback on save

### US-2: View Project List
As a subcontractor, I want to see all my projects in a list so I can quickly navigate to a specific project.

**Acceptance Criteria:**
- List all projects sorted by most recent activity
- Show project name, client, and status (active/completed based on dates)
- Tap to view project details

### US-3: View Project Details
As a subcontractor, I want to see all work related to a project so I can get a complete overview.

**Acceptance Criteria:**
- Show project info (client, address, value, dates)
- List related daily logs, tasks, and waivers
- Counts/summary of items
- Links to create new items for this project

### US-4: Link Tasks to Project
As a subcontractor, I want to assign tasks to a project so my photo evidence is organized by job.

**Acceptance Criteria:**
- Task form has project dropdown
- Tasks show project name in list/detail views
- Filter tasks by project

### US-5: Link Daily Logs to Project
As a subcontractor, I want to assign daily logs to a project so my documentation is organized.

**Acceptance Criteria:**
- Daily log form has project dropdown
- Logs show project name in list/detail views
- Filter logs by project

### US-6: Link Waivers to Project
As a subcontractor, I want to assign lien waivers to a project so I can track payments by job.

**Acceptance Criteria:**
- Waiver form has project dropdown
- Waivers show project name in list

### US-7: Edit/Delete Project
As a subcontractor, I want to edit or delete projects so I can correct mistakes or remove old entries.

**Acceptance Criteria:**
- Edit form with all fields pre-populated
- Delete with confirmation (doesn't delete related items, just unlinks them)
- Project name retained on related items if project is deleted

## Technical Design

### Database Schema (IndexedDB)
```typescript
projects: {
  key: string
  value: {
    id: string
    name: string
    client?: string
    address?: string
    contractValue?: string
    startDate?: string
    endDate?: string
    notes?: string
    createdAt: number
    updatedAt: number
  }
}
```

### API Functions
- `saveProject(project)` - Create new project
- `getProjects()` - Get all projects
- `getProject(id)` - Get single project
- `updateProject(id, updates)` - Update project
- `deleteProject(id)` - Delete project (soft - just removes project record)

### UI Components
- `ProjectList.tsx` - List all projects
- `ProjectForm.tsx` - Create/edit project
- `ProjectDetail.tsx` - Project overview with related items

### Navigation Changes
- Add "Projects" to bottom nav (replace one of less-used items)
- Or add Projects as a secondary nav from Home
