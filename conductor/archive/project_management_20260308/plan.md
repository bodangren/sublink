# Implementation Plan: Project Management

## Phase 1: Database Layer
**Files:** `src/db.ts`

1. Add `projects` store to SubLinkDB schema
2. Bump DB version to 5
3. Add project CRUD functions:
   - `saveProject`
   - `getProjects`
   - `getProject`
   - `updateProject`
   - `deleteProject`
4. Add `projectId` optional field to tasks, dailyLogs, waivers schemas
5. Add helper functions to get items by project

## Phase 2: Project Components
**Files:** `src/components/Project*.tsx`

1. Create `ProjectList.tsx`:
   - List all projects with status indicator
   - Sort by updatedAt desc
   - Link to detail and create

2. Create `ProjectForm.tsx`:
   - Form with all project fields
   - Edit mode support
   - Save/update to IndexedDB

3. Create `ProjectDetail.tsx`:
   - Project info header
   - Quick stats (logs, tasks, waivers count)
   - Recent activity list
   - Quick action buttons

## Phase 3: Integration
**Files:** `src/App.tsx`, existing form components

1. Add Project routes to App.tsx:
   - `/projects` - ProjectList
   - `/projects/new` - ProjectForm
   - `/projects/:id` - ProjectDetail
   - `/projects/edit/:id` - ProjectForm (edit)

2. Update `TaskForm.tsx`:
   - Add project dropdown
   - Load projects on mount
   - Save projectId with task

3. Update `DailyLogForm.tsx`:
   - Add project dropdown
   - Load projects on mount
   - Save projectId with log

4. Update `WaiverForm.tsx`:
   - Add project dropdown
   - Load projects on mount
   - Save projectId with waiver

5. Update `TaskList.tsx`:
   - Show project name for each task
   - Optional: Add project filter

6. Update `DailyLogList.tsx`:
   - Show project name for each log

## Phase 4: Navigation & Dashboard
**Files:** `src/App.tsx`, dashboard components

1. Add Projects to bottom nav (5 items max):
   - Home, Logs, Tasks, Projects, Compliance
   - Move Waivers under Projects or keep accessible from home

2. Add Dashboard widget for recent projects

## Phase 5: Tests
**Files:** `src/components/*.test.tsx`, `src/db.test.ts`

1. Add project DB tests
2. Add ProjectList tests
3. Add ProjectForm tests
4. Add ProjectDetail tests
5. Update existing tests for project dropdown

## Phase 6: Finalization
1. Run `npm run build` - ensure no errors
2. Run `npm run test` - all tests pass
3. Update README.md with new feature
4. Archive track
5. Commit with model attribution

## Estimated Effort
- Phase 1: 15 min
- Phase 2: 30 min
- Phase 3: 30 min
- Phase 4: 15 min
- Phase 5: 20 min
- Phase 6: 10 min
- **Total: ~2 hours**
